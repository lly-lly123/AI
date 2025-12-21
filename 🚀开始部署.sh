#!/bin/bash

# 开始部署脚本 - 自动化部署流程

set -e

echo "🚀 开始部署智鸽系统到Vercel..."
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

# 检查后端依赖
echo "📦 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install --silent 2>&1 | tail -3
fi
cd ..

echo ""
echo "🚀 开始部署到Vercel..."
echo ""

# 检查是否已登录
if npx vercel whoami &>/dev/null 2>&1; then
    USER=$(npx vercel whoami 2>&1 | head -1)
    echo "✅ 已登录Vercel: $USER"
    echo ""
    echo "开始部署..."
    DEPLOY_OUTPUT=$(npx vercel --prod --yes 2>&1)
    echo "$DEPLOY_OUTPUT"
    
    # 提取部署URL
    URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)
    
    if [ -n "$URL" ]; then
        echo ""
        echo "=================================="
        echo "✅ 部署成功！"
        echo ""
        echo "🌐 访问地址:"
        echo "   主站: $URL"
        echo "   后台: $URL/admin.html"
        echo "   API: $URL/api/health"
        echo ""
        echo "$URL" > .deploy-url.txt
        echo "部署地址已保存到 .deploy-url.txt"
    fi
else
    echo "⚠️  需要先登录Vercel"
    echo ""
    echo "正在打开浏览器登录..."
    echo ""
    
    # 尝试打开浏览器
    open "https://vercel.com/login" 2>/dev/null || echo "请手动访问: https://vercel.com/login"
    
    echo "请按照以下步骤完成登录："
    echo "1. 在浏览器中使用GitHub账号登录Vercel"
    echo "2. 登录完成后，返回终端"
    echo "3. 运行: npx vercel login"
    echo "4. 然后运行: npx vercel --prod --yes"
    echo ""
    echo "或者，您也可以："
    echo "1. 访问: https://vercel.com/new"
    echo "2. 点击 'Upload'"
    echo "3. 选择整个项目文件夹"
    echo "4. 点击 'Deploy'"
fi

echo ""
echo "=================================="

