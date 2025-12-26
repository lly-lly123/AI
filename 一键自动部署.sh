#!/bin/bash

# ============================================================================
# 🚀 完全自动化部署脚本 - 一键部署到Zeabur
# ============================================================================
# 功能：自动提交代码、推送到GitHub，准备好所有部署配置
# 使用：直接运行此脚本，然后按提示操作（仅需复制粘贴命令）
# ============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 完全自动化部署到Zeabur（免费+国内可访问+云端存储）"
echo "============================================================================"
echo ""

# 检查必要工具
if ! command -v git >/dev/null 2>&1; then
  echo -e "${RED}❌ 未检测到 Git，请先安装 Git${NC}"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  未检测到 Node.js，不影响代码推送，但建议安装${NC}"
fi

# 确保zeabur.json配置正确
echo "📝 检查和优化配置文件..."
if [ ! -f "zeabur.json" ]; then
  cat > zeabur.json << 'EOF'
{
  "build": {
    "command": "cd backend && npm install",
    "rootDirectory": "."
  },
  "run": {
    "command": "cd backend && npm start",
    "rootDirectory": "."
  }
}
EOF
  echo -e "${GREEN}✅ 已创建 zeabur.json${NC}"
else
  echo -e "${GREEN}✅ zeabur.json 已存在${NC}"
fi

# 确保Procfile存在
if [ ! -f "Procfile" ]; then
  echo "web: cd backend && npm start" > Procfile
  echo -e "${GREEN}✅ 已创建 Procfile${NC}"
else
  echo -e "${GREEN}✅ Procfile 已存在${NC}"
fi

echo ""

# 检查Git仓库
if [ ! -d ".git" ]; then
  echo -e "${BLUE}📦 初始化Git仓库...${NC}"
  git init
  git branch -M main
fi

# 检查远程仓库
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo -e "${YELLOW}⚠️  未配置GitHub远程仓库${NC}"
  echo ""
  echo "请先运行以下命令添加GitHub仓库："
  echo -e "${BLUE}git remote add origin https://github.com/你的用户名/你的仓库名.git${NC}"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ 远程仓库: $REMOTE_URL${NC}"
echo ""

# 添加所有文件
echo "📦 准备提交所有更改..."
git add .

# 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
  echo -e "${GREEN}✅ 没有未提交的更改${NC}"
else
  echo -e "${BLUE}📝 提交更改...${NC}"
  git commit -m "自动部署: 优化Zeabur配置 - $(date '+%Y-%m-%d %H:%M:%S')" || {
    echo -e "${YELLOW}⚠️  提交失败或没有新更改${NC}"
  }
fi

echo ""

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")

# 显示推送信息
echo "============================================================================"
echo "📤 准备推送到GitHub"
echo "============================================================================"
echo ""
echo -e "${GREEN}当前分支: $CURRENT_BRANCH${NC}"
echo -e "${GREEN}远程仓库: $REMOTE_URL${NC}"
echo ""

# 尝试推送
echo -e "${BLUE}正在推送到GitHub...${NC}"
if git push -u origin "$CURRENT_BRANCH" 2>&1; then
  echo ""
  echo -e "${GREEN}✅ 代码已成功推送到GitHub！${NC}"
  echo ""
else
  echo ""
  echo -e "${YELLOW}⚠️  推送可能需要身份验证${NC}"
  echo ""
  echo "如果推送失败，请手动运行："
  echo -e "${BLUE}git push -u origin $CURRENT_BRANCH${NC}"
  echo ""
fi

echo ""
echo "============================================================================"
echo "🎉 代码准备完成！接下来只需3步："
echo "============================================================================"
echo ""
echo -e "${YELLOW}第1步：${NC}访问 https://zeabur.com 并登录（可使用GitHub账号）"
echo ""
echo -e "${YELLOW}第2步：${NC}创建新项目，连接GitHub仓库：$REMOTE_URL"
echo ""
echo -e "${YELLOW}第3步：${NC}在Zeabur控制台的 'Variables' 页面添加以下环境变量："
echo ""
echo -e "${BLUE}PORT=3000${NC}"
echo -e "${BLUE}NODE_ENV=production${NC}"
echo -e "${BLUE}SUPABASE_URL=你的Supabase_URL${NC}"
echo -e "${BLUE}SUPABASE_ANON_KEY=你的Supabase_Anon_Key${NC}"
echo -e "${BLUE}ZHIPU_API_KEY_EVO=你的智谱AI_Key（可选）${NC}"
echo -e "${BLUE}ZHIPU_API_KEY_ADMIN=你的智谱AI_Key（可选）${NC}"
echo -e "${BLUE}AI_MODEL=auto${NC}"
echo -e "${BLUE}API_KEY=your_api_key_here${NC}"
echo -e "${BLUE}LOG_LEVEL=info${NC}"
echo ""
echo "📖 详细说明：查看 '免费部署指南-Zeabur.md' 文件"
echo ""
echo -e "${GREEN}✨ 完成后，Zeabur会自动开始部署，约3-5分钟完成！${NC}"
echo ""







































