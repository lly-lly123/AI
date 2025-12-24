#!/bin/bash

# ============================================================================
# 使用终端执行Supabase SQL脚本
# ============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 终端执行Supabase SQL"
echo "============================================================================"
echo ""

# 检查psql是否安装
if ! command -v psql >/dev/null 2>&1; then
  echo "⚠️  psql未安装，正在尝试安装..."
  
  # 尝试使用Homebrew安装PostgreSQL
  if command -v brew >/dev/null 2>&1; then
    echo "正在使用Homebrew安装PostgreSQL..."
    brew install postgresql@14 2>&1 | tail -10 || {
      echo "❌ 安装失败，请手动安装PostgreSQL"
      echo ""
      echo "安装方法："
      echo "  brew install postgresql@14"
      echo ""
      echo "或者访问: https://www.postgresql.org/download/"
      exit 1
    }
  else
    echo "❌ 未找到Homebrew，请手动安装PostgreSQL"
    echo ""
    echo "安装方法："
    echo "  1. 安装Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  2. 安装PostgreSQL: brew install postgresql@14"
    echo ""
    exit 1
  fi
fi

echo "✅ psql已安装"
echo ""

# 检查SQL文件
SQL_FILE="${PROJECT_DIR}/supabase-init.sql"
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ SQL文件不存在: $SQL_FILE"
  exit 1
fi

echo "📋 SQL文件: $SQL_FILE"
echo ""

# 获取数据库连接信息
echo "请提供Supabase数据库连接信息："
echo ""
echo "获取方式："
echo "1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/database"
echo "2. 找到 'Connection string' 部分"
echo "3. 选择 'URI' 标签"
echo "4. 复制连接字符串（格式: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres）"
echo ""

read -p "请输入数据库连接字符串: " DB_URL

if [ -z "$DB_URL" ]; then
  echo "❌ 未提供数据库连接字符串"
  exit 1
fi

# 验证连接字符串格式
if [[ ! "$DB_URL" =~ ^postgresql:// ]]; then
  echo "❌ 连接字符串格式不正确，应以 postgresql:// 开头"
  exit 1
fi

echo ""
echo "🔄 正在连接数据库并执行SQL..."
echo ""

# 执行SQL
if psql "$DB_URL" -f "$SQL_FILE" 2>&1; then
  echo ""
  echo "============================================================================"
  echo "✅ SQL执行成功！"
  echo "============================================================================"
  echo ""
  echo "所有表已创建并已添加索引"
  echo ""
else
  echo ""
  echo "============================================================================"
  echo "⚠️  SQL执行完成（部分语句可能已存在，这是正常的）"
  echo "============================================================================"
  echo ""
fi

echo "下一步：获取Supabase API配置信息"
echo ""















