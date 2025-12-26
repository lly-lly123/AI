#!/bin/bash

# ============================================================================
# Supabase SQL执行脚本
# ============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 Supabase SQL执行脚本"
echo "============================================================================"
echo ""

# 检查参数
if [ $# -lt 2 ]; then
  echo "用法: $0 <SUPABASE_URL> <SUPABASE_SERVICE_ROLE_KEY>"
  echo ""
  echo "获取方式："
  echo "1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/api"
  echo "2. 复制 Project URL → SUPABASE_URL"
  echo "3. 复制 service_role key → SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  exit 1
fi

SUPABASE_URL="$1"
SUPABASE_KEY="$2"
SQL_FILE="${PROJECT_DIR}/supabase-init.sql"

# 检查SQL文件
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ 未找到SQL文件: $SQL_FILE"
  exit 1
fi

echo "📋 准备执行SQL..."
echo "   Project URL: $SUPABASE_URL"
echo "   SQL文件: $SQL_FILE"
echo ""

# 读取SQL文件
SQL_CONTENT=$(cat "$SQL_FILE")

# 使用Supabase REST API执行SQL
# 注意：需要使用service_role key来执行SQL
echo "🔄 正在执行SQL..."

# 将SQL内容编码为JSON
SQL_JSON=$(echo "$SQL_CONTENT" | jq -Rs . 2>/dev/null || echo "\"$(echo "$SQL_CONTENT" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')\"")

# 调用Supabase REST API
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": ${SQL_JSON}}" 2>&1)

# 检查响应
if echo "$RESPONSE" | grep -q "error\|Error\|ERROR"; then
  echo "❌ SQL执行失败"
  echo "$RESPONSE"
  echo ""
  echo "提示：可能需要使用service_role key而不是anon key"
  exit 1
else
  echo "✅ SQL执行成功！"
  echo "$RESPONSE"
fi

echo ""
echo "============================================================================"
echo "✨ 完成！"
echo "============================================================================"
echo ""















































