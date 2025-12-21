#!/bin/bash

# 自动部署完整版脚本 - 包含登录流程

set -e

echo "🚀 智鸽系统自动部署（完整版）"
echo "=================================="
echo ""

cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)

echo "📁 项目目录: $PROJECT_DIR"
echo "✅ Node.js版本: $(node --version)"
echo ""

# 步骤1: 安装依赖
echo "📦 步骤1: 检查并安装依赖..."
cd backend
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "正在安装依赖..."
    npm install 2>&1 | tail -5
else
    echo "✅ 依赖已安装"
fi
cd ..
echo ""

# 步骤2: 登录Vercel
echo "🔐 步骤2: 检查Vercel登录状态..."
echo ""

# 检查是否已登录
if npx vercel whoami &>/dev/null; then
    USER=$(npx vercel whoami 2>/dev/null | head -1)
    echo "✅ 已登录Vercel: $USER"
else
    echo "⚠️  未登录Vercel，需要先登录"
    echo ""
    echo "请按照以下步骤登录："
    echo "1. 脚本将打开浏览器"
    echo "2. 使用GitHub账号登录Vercel"
    echo "3. 登录完成后返回终端"
    echo ""
    read -p "按回车键开始登录..." 
    npx vercel login
fi

echo ""

# 步骤3: 部署
echo "🚀 步骤3: 开始部署到Vercel..."
echo "=================================="
echo ""

# 部署命令
echo "正在部署..."
echo "项目名称: pigeonai"
echo ""

# 使用npx部署
DEPLOY_OUTPUT=$(npx vercel --prod --yes 2>&1)
echo "$DEPLOY_OUTPUT"

# 提取部署URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)

echo ""
echo "=================================="
echo ""

if [ -n "$DEPLOY_URL" ]; then
    echo "✅ 部署成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   主站: $DEPLOY_URL"
    echo "   后台: $DEPLOY_URL/admin.html"
    echo "   API健康检查: $DEPLOY_URL/api/health"
    echo ""
    echo "📊 管理面板: https://vercel.com/dashboard"
    echo ""
    
    # 保存部署信息
    echo "$DEPLOY_URL" > .deploy-url.txt
    echo "部署信息已保存到 .deploy-url.txt"
else
    echo "⚠️  请查看上方输出获取部署地址"
    echo "或访问: https://vercel.com/dashboard"
fi

echo ""
echo "✅ 部署流程完成！"

