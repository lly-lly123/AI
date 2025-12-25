#!/bin/bash

# ============================================================================
# 存储服务配置检查脚本
# ============================================================================
# 功能：检查 Supabase 或 Cloudflare R2 配置是否正确
# ============================================================================

set -e

echo "🔍 检查存储服务配置..."
echo ""

# 检查 Supabase 配置
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
  echo "✅ Supabase 配置已设置"
  echo "   URL: $SUPABASE_URL"
  echo "   Key: ${SUPABASE_ANON_KEY:0:20}..."
  
  # 测试连接
  echo "   正在测试连接..."
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")
  
  if [ "$response" = "200" ] || [ "$response" = "404" ]; then
    echo "   ✅ Supabase 连接成功"
  else
    echo "   ⚠️  Supabase 连接失败（HTTP $response）"
    echo "   请检查 URL 和 Key 是否正确"
  fi
else
  echo "❌ Supabase 配置未设置"
  echo "   需要设置：SUPABASE_URL 和 SUPABASE_ANON_KEY"
fi

echo ""

# 检查 Cloudflare R2 配置
if [ -n "$CLOUDFLARE_R2_ACCOUNT_ID" ] && [ -n "$CLOUDFLARE_R2_ACCESS_KEY_ID" ]; then
  echo "✅ Cloudflare R2 配置已设置"
  echo "   Account ID: $CLOUDFLARE_R2_ACCOUNT_ID"
  echo "   Access Key: ${CLOUDFLARE_R2_ACCESS_KEY_ID:0:10}..."
  
  if [ -n "$CLOUDFLARE_R2_SECRET_ACCESS_KEY" ]; then
    echo "   ✅ Secret Key 已设置"
  else
    echo "   ⚠️  Secret Key 未设置"
  fi
  
  if [ -n "$CLOUDFLARE_R2_BUCKET_NAME" ]; then
    echo "   Bucket: $CLOUDFLARE_R2_BUCKET_NAME"
  else
    echo "   ⚠️  Bucket 名称未设置"
  fi
else
  echo "❌ Cloudflare R2 配置未设置"
  echo "   需要设置：CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID 等"
fi

echo ""
echo "📋 配置检查完成"
echo ""
echo "💡 提示："
echo "   - 如果配置未设置，请访问："
echo "     Supabase: https://supabase.com"
echo "     Cloudflare R2: https://dash.cloudflare.com/ → R2"
























