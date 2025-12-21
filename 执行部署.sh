#!/bin/bash

# 执行部署脚本 - 使用npx，无需全局安装

set -e

echo "🚀 开始部署智鸽系统..."
echo "=================================="
echo ""

cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

echo "📁 项目目录: $PROJECT_DIR"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"
echo ""

# 安装后端依赖
echo "📦 步骤1: 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "正在安装依赖..."
    npm install --no-save 2>&1 | grep -E "(added|up to date|audit)" || true
else
    echo "✅ 依赖已安装"
fi
cd ..

echo ""
echo "🚀 步骤2: 准备部署到Vercel..."
echo ""

# 检查是否已登录Vercel
if [ -f ".vercel/project.json" ]; then
    echo "✅ 检测到Vercel项目配置"
    PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name":"[^"]*' | cut -d'"' -f4 || echo "pigeonai")
    echo "项目名称: $PROJECT_NAME"
else
    echo "⚠️  首次部署，需要登录Vercel"
    echo "请按照提示完成登录..."
fi

echo ""
echo "🚀 步骤3: 开始部署..."
echo "=================================="
echo ""

# 使用npx部署（无需全局安装Vercel CLI）
echo "正在使用Vercel部署..."
echo ""

# 部署命令
npx --yes vercel --prod --yes --name pigeonai 2>&1 | tee /tmp/vercel-deploy.log

echo ""
echo "=================================="
echo ""

# 检查部署结果
if [ -f "/tmp/vercel-deploy.log" ]; then
    DEPLOY_URL=$(grep -o 'https://[^[:space:]]*\.vercel\.app' /tmp/vercel-deploy.log | head -1)
    if [ -n "$DEPLOY_URL" ]; then
        echo "✅ 部署成功！"
        echo ""
        echo "🌐 访问地址:"
        echo "   主站: $DEPLOY_URL"
        echo "   后台: $DEPLOY_URL/admin.html"
        echo "   API: $DEPLOY_URL/api/health"
        echo ""
        echo "📊 查看部署状态: https://vercel.com/dashboard"
    else
        echo "⚠️  部署可能已完成，请查看上方输出获取访问地址"
    fi
fi

echo ""
echo "✅ 部署流程完成！"

