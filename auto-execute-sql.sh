#!/bin/bash

# ============================================================================
# 自动执行Supabase SQL脚本（使用Node.js）
# ============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 自动执行Supabase SQL"
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

# 检查SQL文件
SQL_FILE="${PROJECT_DIR}/supabase-init.sql"
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ SQL文件不存在: $SQL_FILE"
  exit 1
fi

echo "📋 请提供Supabase数据库连接字符串"
echo ""
echo "获取方式："
echo "1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/database"
echo "2. 找到 'Connection string' 部分"
echo "3. 选择 'URI' 标签"
echo "4. 复制连接字符串"
echo ""

read -p "请输入数据库连接字符串（直接回车跳过，稍后手动执行）: " DB_URL

if [ -z "$DB_URL" ]; then
  echo ""
  echo "⚠️  已跳过，您可以稍后手动执行："
  echo "   node execute-sql.js \"<连接字符串>\""
  echo ""
  exit 0
fi

# 执行SQL
echo ""
echo "🔄 正在执行SQL..."
echo ""

node execute-sql.js "$DB_URL"

echo ""
echo "============================================================================"
echo "✨ 完成！"
echo "============================================================================"
echo ""













