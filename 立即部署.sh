#!/bin/bash

# 立即部署脚本 - 自动完成所有部署步骤

set -e

echo "🚀 开始立即部署智鸽系统..."
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

# 检查Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel@latest
fi

# 检查是否已登录Vercel
echo "🔐 检查Vercel登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  未登录Vercel，请先登录..."
    echo "正在打开浏览器登录..."
    vercel login
fi

# 部署到Vercel
echo "🚀 开始部署到Vercel..."
echo "项目名称: pigeonai"
echo ""

# 设置环境变量（如果存在）
if [ -n "$SUPABASE_URL" ]; then
    echo "配置Supabase环境变量..."
    echo "$SUPABASE_URL" | vercel env add SUPABASE_URL production 2>/dev/null || echo "环境变量已存在或配置失败"
fi

if [ -n "$SUPABASE_ANON_KEY" ]; then
    echo "$SUPABASE_ANON_KEY" | vercel env add SUPABASE_ANON_KEY production 2>/dev/null || echo "环境变量已存在或配置失败"
fi

# 部署
echo ""
echo "开始部署..."
vercel --prod --yes --name pigeonai

echo ""
echo "=================================="
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址: https://pigeonai.vercel.app"
echo "📊 查看部署状态: https://vercel.com/dashboard"
echo ""

