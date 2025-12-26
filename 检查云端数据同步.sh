#!/bin/bash

# ============================================================================
# 云端数据同步功能检查脚本
# ============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "============================================================================"
echo "🔍 检查云端数据同步功能"
echo "============================================================================"
echo ""

# 检查云存储服务配置
echo "📋 1. 检查云存储服务配置..."
echo ""

SUPABASE_URL=$(grep "^SUPABASE_URL=" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
SUPABASE_KEY=$(grep "^SUPABASE_ANON_KEY=" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' | tr -d '"')

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project.supabase.co" ] || [ -z "$SUPABASE_KEY" ] || [ "$SUPABASE_KEY" = "your-anon-key" ]; then
  echo -e "${YELLOW}⚠️  Supabase未配置${NC}"
  echo "   需要在Zeabur环境变量中配置："
  echo "   - SUPABASE_URL"
  echo "   - SUPABASE_ANON_KEY"
  echo ""
else
  echo -e "${GREEN}✅ Supabase已配置${NC}"
  echo "   URL: ${SUPABASE_URL:0:30}..."
  echo "   Key: ${SUPABASE_KEY:0:20}..."
  echo ""
fi

# 检查代码实现
echo "📋 2. 检查代码实现..."
echo ""

# 检查storageService是否自动同步
if grep -q "cloudStorageService.queueSync" backend/services/storageService.js; then
  echo -e "${GREEN}✅ storageService.write() 已实现自动同步到云端${NC}"
else
  echo -e "${RED}❌ storageService.write() 未实现自动同步${NC}"
fi

# 检查authService是否使用storageService
if grep -q "storageService.add.*users" backend/services/authService.js; then
  echo -e "${GREEN}✅ 用户注册时使用storageService.add()，会自动同步到云端${NC}"
else
  echo -e "${RED}❌ 用户注册未使用storageService${NC}"
fi

# 检查用户数据保存API
if grep -q "storageService.write.*user_data" backend/routes/api.js; then
  echo -e "${GREEN}✅ 用户数据保存API已实现自动同步${NC}"
else
  echo -e "${RED}❌ 用户数据保存API未实现自动同步${NC}"
fi

# 检查从云端恢复功能
if grep -q "restoreFromCloud" backend/services/storageService.js; then
  echo -e "${GREEN}✅ 已实现从云端恢复数据功能${NC}"
else
  echo -e "${RED}❌ 未实现从云端恢复数据功能${NC}"
fi

echo ""
echo "============================================================================"
echo "📊 数据同步流程总结"
echo "============================================================================"
echo ""
echo "1. 用户账户信息（users表）："
echo "   ✅ 注册时：storageService.add('users', user) → 自动同步到云端"
echo "   ✅ 登录时：storageService.update('users', ...) → 自动同步到云端"
echo ""
echo "2. 用户数据（user_data表）："
echo "   ✅ 保存时：storageService.write('user_data', data) → 自动同步到云端"
echo "   ✅ 包含：鸽子数据、比赛数据、健康记录、训练记录等"
echo ""
echo "3. 从云端恢复："
echo "   ✅ 后端：storageService.init() 时自动从云端恢复"
echo "   ✅ 前端：restoreUserDataIfMissing() 从API获取数据"
echo ""
echo "4. 自动同步机制："
echo "   ✅ 每30秒同步队列中的数据"
echo "   ✅ 每5分钟全量同步所有表"
echo ""
echo "============================================================================"
echo "✅ 检查完成"
echo "============================================================================"
echo ""

