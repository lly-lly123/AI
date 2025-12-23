#!/bin/bash

# ============================================================================
# 完全自动化执行Supabase SQL（使用API）
# ============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 完全自动化执行Supabase SQL"
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

echo "📋 需要Supabase配置信息"
echo ""
echo "请提供以下信息（可以从Supabase网页获取）："
echo ""

echo "获取数据库连接字符串的方法："
echo "1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/database"
echo "2. 找到 'Connection string' 部分"
echo "3. 选择 'URI' 标签"
echo "4. 复制连接字符串"
echo ""
echo "或者提供以下信息自动构建："
echo ""

read -p "Supabase Project URL (例如: https://xxxxx.supabase.co，直接回车跳过): " SUPABASE_URL

if [ -n "$SUPABASE_URL" ]; then
  read -p "数据库密码 (创建项目时设置的密码): " DB_PASSWORD
  
  if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 需要数据库密码"
    exit 1
  fi
  
  # 从URL提取项目引用
  PROJECT_REF=$(echo "$SUPABASE_URL" | sed -n 's|https://\([^.]*\)\.supabase\.co|\1|p')
  if [ -z "$PROJECT_REF" ]; then
    echo "❌ 无法从URL提取项目引用"
    exit 1
  fi
  
  # 构建数据库连接字符串
  DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
  echo "✅ 已构建连接字符串"
else
  read -p "请输入完整的数据库连接字符串: " DB_URL
  
  if [ -z "$DB_URL" ]; then
    echo "❌ 未提供连接字符串"
    exit 1
  fi
fi

echo ""
echo "🔄 正在连接数据库并执行SQL..."
echo ""

# 使用Node.js执行SQL
node execute-sql.js "$DB_URL" 2>&1

echo ""
echo "============================================================================"
echo "✨ 完成！"
echo "============================================================================"
echo ""

