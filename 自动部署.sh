#!/bin/bash

# 智鸽系统自动部署脚本
# 此脚本将自动完成所有部署步骤

echo "🚀 开始部署智鸽系统..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未安装npm，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
cd backend
npm install
cd ..

# 检查Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录Vercel..."
    vercel login
fi

# 检查环境变量
echo "🔍 检查环境变量..."
if [ -z "$SUPABASE_URL" ]; then
    echo "⚠️  未设置SUPABASE_URL环境变量"
    echo "请输入Supabase URL:"
    read SUPABASE_URL
    export SUPABASE_URL
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️  未设置SUPABASE_ANON_KEY环境变量"
    echo "请输入Supabase Anon Key:"
    read SUPABASE_ANON_KEY
    export SUPABASE_ANON_KEY
fi

# 设置环境变量到Vercel
echo "⚙️  配置Vercel环境变量..."
vercel env add SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"

# 部署到Vercel
echo "🚀 部署到Vercel..."
vercel --prod --yes

echo "✅ 部署完成！"
echo "🌐 访问地址: https://pigeonai.vercel.app"

