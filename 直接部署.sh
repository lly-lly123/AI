#!/bin/bash

# 直接部署脚本 - 非交互式

cd "$(dirname "$0")"

echo "🚀 智鸽系统直接部署"
echo "=================================="
echo ""

# 检查依赖
echo "📦 检查依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install --silent
fi
cd ..

echo ""
echo "🚀 开始部署到Vercel..."
echo ""
echo "如果未登录，将提示您登录"
echo "=================================="
echo ""

# 直接部署
npx --yes vercel --prod --yes

echo ""
echo "✅ 部署完成！"
echo "访问地址请查看上方输出"

