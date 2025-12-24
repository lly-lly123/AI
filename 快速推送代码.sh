#!/bin/bash

# ============================================================================
# 快速推送代码到GitHub
# ============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 推送代码到GitHub"
echo "============================================================================"
echo ""

# 检查Git状态
echo "📋 检查Git状态..."
CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠️  检测到未提交的更改${NC}"
  read -p "是否提交所有更改？(y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "自动提交更改 - $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${GREEN}✅ 更改已提交${NC}"
  fi
fi

# 检查远程仓库
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo -e "${RED}❌ 未配置远程仓库${NC}"
  exit 1
fi

echo "远程仓库: $REMOTE_URL"
echo ""

# 尝试推送
echo "📤 推送代码到GitHub..."
echo ""

# 方法1：正常推送
if git push -u origin "$CURRENT_BRANCH" 2>&1; then
  echo ""
  echo -e "${GREEN}✅ 代码已成功推送到GitHub${NC}"
  echo ""
  echo "下一步："
  echo "1. 访问 https://zeabur.com"
  echo "2. 连接GitHub仓库并部署"
  echo "3. 配置环境变量（见 .zeabur-env-config.txt）"
  exit 0
fi

echo ""
echo -e "${YELLOW}⚠️  正常推送失败，尝试其他方法...${NC}"
echo ""

# 方法2：使用SSH（如果已配置）
if [[ "$REMOTE_URL" == *"git@"* ]]; then
  echo "尝试使用SSH推送..."
  if git push -u origin "$CURRENT_BRANCH" 2>&1; then
    echo -e "${GREEN}✅ 代码已成功推送${NC}"
    exit 0
  fi
fi

# 方法3：临时禁用SSL验证
echo "尝试临时禁用SSL验证推送..."
if git -c http.sslVerify=false push -u origin "$CURRENT_BRANCH" 2>&1; then
  echo ""
  echo -e "${GREEN}✅ 代码已成功推送${NC}"
  echo ""
  echo "下一步："
  echo "1. 访问 https://zeabur.com"
  echo "2. 连接GitHub仓库并部署"
  echo "3. 配置环境变量（见 .zeabur-env-config.txt）"
  exit 0
fi

echo ""
echo -e "${RED}❌ 所有推送方法都失败了${NC}"
echo ""
echo "请手动执行以下命令："
echo "  cd $PROJECT_DIR"
echo "  git push -u origin $CURRENT_BRANCH"
echo ""
echo "或者检查网络连接和Git配置"

