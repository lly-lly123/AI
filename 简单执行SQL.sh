#!/bin/bash

# ============================================================================
# 简单执行SQL脚本（只需要Project URL和密码）
# ============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 简单执行Supabase SQL"
echo "============================================================================"
echo ""

# 检查Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未检测到Node.js"
  exit 1
fi

# 检查pg模块
if [ ! -d "node_modules/pg" ]; then
  echo "📦 正在安装PostgreSQL客户端模块..."
  npm install pg --save-dev >/dev/null 2>&1
fi

echo "✅ 环境准备完成"
echo ""

echo "请提供以下信息（从Supabase网页获取）："
echo ""
echo "1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/api"
echo "2. 复制 'Project URL'（例如: https://xxxxx.supabase.co）"
echo "3. 提供数据库密码（创建项目时设置的密码）"
echo ""

read -p "Project URL (例如: https://xxxxx.supabase.co): " PROJECT_URL

if [ -z "$PROJECT_URL" ]; then
  echo "❌ 未提供Project URL"
  exit 1
fi

# 从URL提取项目引用
PROJECT_REF=$(echo "$PROJECT_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co|\1|p')

if [ -z "$PROJECT_REF" ]; then
  echo "❌ 无法从URL提取项目引用，请检查URL格式"
  echo "   正确格式: https://xxxxx.supabase.co"
  exit 1
fi

echo "✅ 项目引用: $PROJECT_REF"
echo ""

read -p "数据库密码: " DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ 未提供数据库密码"
  exit 1
fi

# 构建连接字符串（尝试两种格式）
# 格式1: db.[项目引用].supabase.co
DB_URL1="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
# 格式2: [项目引用].supabase.co（直接使用项目URL）
DB_URL2="postgresql://postgres:${DB_PASSWORD}@${PROJECT_REF}.supabase.co:5432/postgres"

echo "尝试连接格式1: db.${PROJECT_REF}.supabase.co"
DB_URL="$DB_URL1"

echo ""
echo "🔄 正在连接数据库并执行SQL..."
echo ""

# 执行SQL
node execute-sql.js "$DB_URL"

echo ""
echo "============================================================================"
echo "✨ 完成！"
echo "============================================================================"
echo ""

