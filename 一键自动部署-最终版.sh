#!/bin/bash

# 一键自动部署最终版 - 尝试所有自动化方案

set -e

echo "🚀 一键自动部署智鸽系统（最终版）"
echo "=================================="
echo ""

cd "$(dirname "$0")"

# 检查环境
echo "📋 检查环境..."
echo "Node.js: $(node --version)"
echo "项目目录: $(pwd)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install --silent
fi
cd ..
echo "✅ 依赖安装完成"
echo ""

# 方案1: 尝试使用Vercel CLI（如果已登录）
echo "🚀 方案1: 尝试使用Vercel CLI部署..."
if npx vercel whoami &>/dev/null; then
    echo "✅ 已登录Vercel，开始部署..."
    DEPLOY_OUTPUT=$(npx vercel --prod --yes 2>&1)
    echo "$DEPLOY_OUTPUT"
    
    # 提取URL
    URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)
    if [ -n "$URL" ]; then
        echo ""
        echo "✅ 部署成功！"
        echo "🌐 访问地址: $URL"
        exit 0
    fi
else
    echo "⚠️  未登录Vercel"
fi

echo ""

# 方案2: 检查是否有GitHub仓库
echo "🚀 方案2: 检查GitHub集成..."
if [ -d ".git" ] && git remote get-url origin &>/dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ 检测到Git仓库: $REMOTE_URL"
    echo ""
    echo "💡 建议使用GitHub + Vercel自动部署："
    echo "1. 访问: https://vercel.com/new"
    echo "2. 导入GitHub仓库"
    echo "3. 自动部署完成"
else
    echo "⚠️  未检测到Git仓库"
fi

echo ""

# 方案3: 提供Web界面部署方案
echo "🚀 方案3: Web界面部署（最简单）"
echo ""
echo "请访问以下链接完成部署："
echo "👉 https://vercel.com/new"
echo ""
echo "操作步骤："
echo "1. 登录Vercel账号（使用GitHub）"
echo "2. 点击 'Add New Project'"
echo "3. 选择 'Upload'"
echo "4. 选择整个项目文件夹"
echo "5. 点击 'Deploy'"
echo ""

# 方案4: 提供命令行部署方案
echo "🚀 方案4: 命令行部署"
echo ""
echo "运行以下命令："
echo ""
echo "  # 1. 登录Vercel"
echo "  npx vercel login"
echo ""
echo "  # 2. 部署"
echo "  npx vercel --prod --yes"
echo ""

echo "=================================="
echo "✅ 所有自动化方案已尝试"
echo ""
echo "推荐使用方案3（Web界面），最简单快捷！"
echo ""

