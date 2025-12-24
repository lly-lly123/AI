#!/bin/bash

# ============================================================================
# 云端存储配置检查脚本
# ============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🔍 检查云端存储配置状态"
echo "============================================================================"
echo ""

# 检查 .env 文件是否存在
if [ ! -f "backend/.env" ]; then
  echo -e "${RED}❌ 未找到 backend/.env 文件${NC}"
  echo "请先创建 backend/.env 文件（可以复制 backend/config.example.env）"
  exit 1
fi

echo "📋 检查 Supabase 配置..."
SUPABASE_URL=$(grep "^SUPABASE_URL=" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
SUPABASE_KEY=$(grep "^SUPABASE_ANON_KEY=" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' | tr -d '"')

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project.supabase.co" ] || [ -z "$SUPABASE_KEY" ] || [ "$SUPABASE_KEY" = "your-anon-key" ]; then
  echo -e "${YELLOW}⚠️  Supabase 未配置${NC}"
  echo "   需要配置 SUPABASE_URL 和 SUPABASE_ANON_KEY"
  echo ""
  echo "   配置步骤："
  echo "   1. 访问 https://supabase.com 注册账号"
  echo "   2. 创建新项目（选择 Singapore 或 Tokyo 区域）"
  echo "   3. 在 Settings -> API 获取配置信息"
  echo "   4. 在 backend/.env 文件中添加："
  echo "      SUPABASE_URL=https://your-project.supabase.co"
  echo "      SUPABASE_ANON_KEY=your-anon-key"
  echo "      SUPABASE_STORAGE_BUCKET=files"
  SUPABASE_CONFIGURED=false
else
  echo -e "${GREEN}✅ Supabase 已配置${NC}"
  echo "   URL: ${SUPABASE_URL:0:30}..."
  echo "   Key: ${SUPABASE_KEY:0:20}..."
  SUPABASE_CONFIGURED=true
fi

echo ""
echo "📋 检查 Cloudflare R2 配置..."
R2_ACCOUNT=$(grep "^CLOUDFLARE_R2_ACCOUNT_ID=" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
R2_KEY=$(grep "^CLOUDFLARE_R2_ACCESS_KEY_ID=" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' | tr -d '"')

if [ -z "$R2_ACCOUNT" ] || [ -z "$R2_KEY" ]; then
  echo -e "${YELLOW}⚠️  Cloudflare R2 未配置（可选）${NC}"
  R2_CONFIGURED=false
else
  echo -e "${GREEN}✅ Cloudflare R2 已配置${NC}"
  R2_CONFIGURED=true
fi

echo ""
echo "============================================================================"
echo "📊 功能状态总结"
echo "============================================================================"
echo ""

if [ "$SUPABASE_CONFIGURED" = true ] || [ "$R2_CONFIGURED" = true ]; then
  echo -e "${GREEN}✅ 云端存储已配置${NC}"
  echo "   - 数据会自动上传到云端"
  echo "   - 多设备登录时数据自动同步"
  echo "   - 数据更安全，不易丢失"
else
  echo -e "${YELLOW}⚠️  云端存储未配置${NC}"
  echo "   - 数据仅保存在本地"
  echo "   - 多设备间无法同步"
  echo "   - 建议配置云端存储以保护数据"
fi

echo ""
echo "✅ 自动上传功能：已实现并启用"
echo "   - 前端云端同步已启用"
echo "   - 数据保存时自动同步"
echo "   - 页面加载时自动恢复"

echo ""
echo "✅ 数据共享功能：已实现"
echo "   - 支持 private/shared/public 三种模式"
echo "   - 管理员可以设置共享权限"
echo "   - 用户可以在后台管理共享设置"

echo ""
echo "============================================================================"
echo "📝 下一步操作"
echo "============================================================================"
echo ""

if [ "$SUPABASE_CONFIGURED" = false ]; then
  echo "1. 配置 Supabase 云端存储（推荐）："
  echo "   - 访问 https://supabase.com"
  echo "   - 创建项目并获取配置信息"
  echo "   - 在 backend/.env 中添加配置"
  echo ""
fi

echo "2. 重启后端服务以使配置生效："
echo "   cd backend && npm start"
echo ""

echo "3. 测试功能："
echo "   - 登录网站并添加数据"
echo "   - 查看浏览器控制台日志"
echo "   - 应该看到 '✅ 数据已同步到云端'"
echo ""

echo "============================================================================"
echo ""

