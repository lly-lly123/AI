#!/bin/bash

# 通过浏览器完成部署 - 使用Vercel API

cd "$(dirname "$0")"

echo "🚀 准备通过API部署..."
echo ""

# 检查是否有Vercel token
if [ -f ~/.vercel/auth.json ]; then
    echo "✅ 检测到Vercel认证信息"
    TOKEN=$(cat ~/.vercel/auth.json 2>/dev/null | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
    
    if [ -n "$TOKEN" ]; then
        echo "使用Token部署..."
        # 这里可以使用Vercel API
    fi
fi

echo ""
echo "由于您已在浏览器登录，请完成以下操作："
echo ""
echo "1. 在浏览器中访问: https://vercel.com/new"
echo "2. 点击 'Upload' 或 'Browse'"
echo "3. 选择项目文件夹: $(pwd)"
echo "4. 点击 'Deploy'"
echo ""
echo "或者，我可以帮您创建一个可以直接上传的压缩包..."
echo ""

read -p "是否创建部署压缩包？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在创建部署包..."
    tar -czf ../pigeonai-deploy.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.vercel' \
        --exclude='*.log' \
        --exclude='data' \
        . 2>/dev/null
    
    echo "✅ 部署包已创建: ../pigeonai-deploy.tar.gz"
    echo "您可以直接上传这个文件到Vercel"
fi

