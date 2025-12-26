#!/bin/bash

# ============================================================================
# 🚀 超大容量存储方案一键部署脚本
# ============================================================================
# 方案：MinIO（开源）+ TeraBox（1TB）+ Cloudflare R2（10GB）+ Supabase（1GB）
# 总容量：1TB+ 永久免费
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
echo "🚀 超大容量存储方案一键部署（1TB+ 永久免费）"
echo "============================================================================"
echo ""
echo "📦 存储方案："
echo "   - MinIO（开源，无限制）"
echo "   - TeraBox（1TB永久免费）"
echo "   - Cloudflare R2（10GB永久免费）"
echo "   - Supabase（1GB永久免费）"
echo ""
echo "📊 总容量：1TB+ 永久免费"
echo ""

# 检查必要工具
if ! command -v git >/dev/null 2>&1; then
  echo -e "${RED}❌ 未检测到 Git，请先安装 Git${NC}"
  exit 1
fi

# 确保配置文件存在
echo "📝 检查和更新配置文件..."

# 检查zeabur.json
if [ ! -f "zeabur.json" ]; then
  cat > zeabur.json << 'EOF'
{
  "buildCommand": "cd backend && npm install",
  "startCommand": "cd backend && npm start",
  "rootDirectory": "."
}
EOF
  echo -e "${GREEN}✅ 已创建 zeabur.json${NC}"
fi

# 检查Procfile
if [ ! -f "Procfile" ]; then
  echo "web: cd backend && npm start" > Procfile
  echo -e "${GREEN}✅ 已创建 Procfile${NC}"
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
  git commit -m "部署: 超大容量存储方案（1TB+永久免费） - $(date '+%Y-%m-%d %H:%M:%S')" || {
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
echo "🎉 代码准备完成！接下来配置超大容量存储："
echo "============================================================================"
echo ""
echo -e "${YELLOW}第1步：${NC}部署MinIO到Zeabur（开源存储）"
echo "   1. 访问 https://zeabur.com"
echo "   2. 在项目中添加新服务"
echo "   3. 选择 Docker镜像：minio/minio:latest"
echo "   4. 命令：server /data --console-address \":9001\""
echo ""
echo -e "${YELLOW}第2步：${NC}注册TeraBox（1TB永久免费）"
echo "   1. 访问 https://www.terabox.com/"
echo "   2. 注册账号获得1TB免费空间"
echo ""
echo -e "${YELLOW}第3步：${NC}注册Cloudflare R2（10GB永久免费）"
echo "   1. 访问 https://dash.cloudflare.com/"
echo "   2. 进入 R2 → Create bucket"
echo "   3. 获取API凭证"
echo ""
echo -e "${YELLOW}第4步：${NC}在Zeabur配置环境变量"
echo ""
echo -e "${BLUE}MinIO配置：${NC}"
echo "   MINIO_ENDPOINT=http://your-minio-service.zeabur.app:9000"
echo "   MINIO_ACCESS_KEY=minioadmin"
echo "   MINIO_SECRET_KEY=你的密码"
echo "   MINIO_BUCKET=pigeonai"
echo ""
echo -e "${BLUE}TeraBox配置：${NC}"
echo "   TERABOX_ACCESS_TOKEN=你的token"
echo "   TERABOX_REFRESH_TOKEN=你的refresh_token"
echo ""
echo -e "${BLUE}Cloudflare R2配置：${NC}"
echo "   CLOUDFLARE_R2_ACCOUNT_ID=你的AccountID"
echo "   CLOUDFLARE_R2_ACCESS_KEY_ID=你的AccessKey"
echo "   CLOUDFLARE_R2_SECRET_ACCESS_KEY=你的SecretKey"
echo "   CLOUDFLARE_R2_BUCKET_NAME=pigeonai"
echo ""
echo -e "${BLUE}Supabase配置：${NC}"
echo "   SUPABASE_URL=https://your-project.supabase.co"
echo "   SUPABASE_ANON_KEY=your-anon-key"
echo ""
echo "📖 详细说明：查看 '最终部署方案检查报告.md' 文件"
echo ""
echo -e "${GREEN}✨ 完成后，您将拥有1TB+永久免费存储空间！${NC}"
echo ""

















































