#!/bin/bash

# 快速部署脚本 - 使用npx，无需全局安装

set -e

echo "🚀 快速部署智鸽系统..."
echo "=================================="

cd "$(dirname "$0")"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装Node.js"
    exit 1
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# 使用npx部署（无需全局安装）
echo "🚀 使用Vercel部署..."
echo ""

# 检查是否已登录
if [ ! -f ".vercel/project.json" ]; then
    echo "首次部署，需要登录Vercel..."
    echo "请按照提示完成登录..."
    npx vercel login
fi

# 部署
echo ""
echo "开始部署到Vercel..."
npx vercel --prod --yes

echo ""
echo "=================================="
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址将在部署完成后显示"
echo "📊 查看部署状态: https://vercel.com/dashboard"
echo ""

