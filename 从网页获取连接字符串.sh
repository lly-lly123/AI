#!/bin/bash

# ============================================================================
# 从Supabase网页获取连接字符串的说明
# ============================================================================

echo ""
echo "============================================================================"
echo "📋 如何从Supabase网页获取数据库连接字符串"
echo "============================================================================"
echo ""

echo "方法1：从数据库设置页面获取（推荐）"
echo ""
echo "1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/database"
echo "2. 向下滚动找到 'Connection string' 部分"
echo "3. 点击 'URI' 标签"
echo "4. 复制完整的连接字符串"
echo ""

echo "方法2：如果找不到Connection string，可以："
echo ""
echo "1. 访问: https://supabase.com/dashboard/project/pigeonai"
echo "2. 查看项目概览页面，通常会显示数据库连接信息"
echo "3. 或者点击左侧 'Database' 查看连接信息"
echo ""

echo "方法3：手动构建（如果知道密码）"
echo ""
echo "Project URL: https://xhuzkfhwyvqtrkdzfgnb.supabase.co"
echo "项目引用: xhuzkfhwyvqtrkdzfgnb"
echo ""
echo "连接字符串格式可能是："
echo "  postgresql://postgres:[密码]@db.xhuzkfhwyvqtrkdzfgnb.supabase.co:5432/postgres"
echo "  或"
echo "  postgresql://postgres:[密码]@xhuzkfhwyvqtrkdzfgnb.supabase.co:5432/postgres"
echo "  或"
echo "  postgresql://postgres:[密码]@aws-0-[区域].pooler.supabase.com:6543/postgres"
echo ""

echo "============================================================================"
echo "💡 建议：直接在网页上复制连接字符串最准确"
echo "============================================================================"
echo ""
















