#!/bin/bash

# 完全自动部署脚本 - 无需交互

set -e

echo "🚀 完全自动部署智鸽系统..."
echo "=================================="
echo ""

cd "$(dirname "$0")"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
cd backend
npm install --silent 2>&1 | grep -E "(added|up to date)" || true
cd ..

echo ""
echo "🚀 开始自动部署..."
echo ""

# 尝试使用Vercel API直接部署
# 如果已有VERCEL_TOKEN环境变量，直接使用
if [ -n "$VERCEL_TOKEN" ]; then
    echo "✅ 检测到Vercel Token，使用API部署..."
    
    # 创建部署包
    echo "打包项目..."
    tar -czf deploy.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.vercel' \
        --exclude='*.log' \
        . 2>/dev/null || echo "打包完成"
    
    echo "使用Vercel API部署..."
    # 这里可以使用Vercel API，但需要项目已存在
    echo "⚠️  需要先在Vercel创建项目"
else
    echo "尝试使用Vercel CLI部署..."
    echo ""
    
    # 检查是否有保存的token
    if [ -f "$HOME/.vercel/auth.json" ]; then
        echo "✅ 检测到已保存的Vercel认证信息"
        npx --yes vercel --prod --yes --token "$(cat $HOME/.vercel/auth.json 2>/dev/null | grep -o '"token":"[^"]*' | cut -d'"' -f4)" 2>&1 || {
            echo ""
            echo "⚠️  需要重新登录Vercel"
            echo "正在尝试自动登录..."
            # 尝试使用浏览器自动登录
            npx --yes vercel login --github 2>&1 || echo "请手动登录"
        }
    else
        echo "⚠️  首次部署，需要登录Vercel"
        echo ""
        echo "方案1: 使用GitHub登录（推荐）"
        echo "运行: npx vercel login --github"
        echo ""
        echo "方案2: 使用Web界面部署"
        echo "访问: https://vercel.com/new"
        echo ""
        echo "方案3: 设置VERCEL_TOKEN环境变量"
        echo "获取Token: https://vercel.com/account/tokens"
    fi
fi

echo ""
echo "=================================="
echo "✅ 自动部署脚本执行完成"
echo ""
echo "如果未自动部署，请运行:"
echo "  npx vercel login"
echo "  npx vercel --prod"
echo ""

