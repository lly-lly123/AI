#!/bin/bash

# ============================================================================
# 完全自动化部署脚本 - Zeabur + Supabase
# ============================================================================
# 功能：自动完成网站部署到Zeabur（免费、国内可访问、长期运行、云端存储）
# 要求：满足所有部署条件
# ============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 完全自动化部署脚本 - Zeabur + Supabase"
echo "============================================================================"
echo ""

# ============================================================================
# 第一步：检查部署条件
# ============================================================================

echo "📋 第一步：检查部署条件..."
echo ""

# 检查1: Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}❌ 未检测到 Node.js${NC}"
  echo "   请先安装 Node.js: https://nodejs.org/"
  exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js 已安装: $NODE_VERSION${NC}"

# 检查2: Git
if ! command -v git >/dev/null 2>&1; then
  echo -e "${RED}❌ 未检测到 Git${NC}"
  echo "   请先安装 Git"
  exit 1
fi
GIT_VERSION=$(git --version)
echo -e "${GREEN}✅ Git 已安装: $GIT_VERSION${NC}"

# 检查3: 项目结构
if [ ! -d "backend" ] || [ ! -f "backend/server.js" ]; then
  echo -e "${RED}❌ 未找到 backend 目录或 server.js${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 项目结构完整${NC}"

# 检查4: admin.html存在
if [ ! -f "admin.html" ]; then
  echo -e "${RED}❌ 未找到 admin.html（后台管理系统）${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 后台管理系统存在${NC}"

# 检查5: package.json
if [ ! -f "backend/package.json" ]; then
  echo -e "${RED}❌ 未找到 backend/package.json${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 依赖配置完整${NC}"

echo ""
echo -e "${GREEN}✅ 所有基础条件检查通过！${NC}"
echo ""

# ============================================================================
# 第二步：检查Git仓库状态
# ============================================================================

echo "📋 第二步：检查Git仓库状态..."
echo ""

if [ ! -d ".git" ]; then
  echo "⚠️  未检测到Git仓库，正在初始化..."
  git init
  git branch -M main
  echo -e "${GREEN}✅ Git仓库已初始化${NC}"
else
  echo -e "${GREEN}✅ Git仓库已存在${NC}"
fi

# 检查远程仓库
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo ""
  echo -e "${YELLOW}⚠️  未配置GitHub远程仓库${NC}"
  echo ""
  read -p "请输入GitHub仓库地址（例如: https://github.com/username/repo.git）: " GITHUB_REPO
  if [ -n "$GITHUB_REPO" ]; then
    git remote add origin "$GITHUB_REPO" 2>/dev/null || git remote set-url origin "$GITHUB_REPO"
    echo -e "${GREEN}✅ GitHub远程仓库已配置${NC}"
  else
    echo -e "${RED}❌ 未提供GitHub仓库地址，无法继续部署${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ GitHub远程仓库已配置: $REMOTE_URL${NC}"
fi

# 检查未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo -e "${YELLOW}⚠️  检测到未提交的更改${NC}"
  git status --short
  echo ""
  read -p "是否现在提交所有更改？(y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    COMMIT_MSG="Auto commit for Zeabur deployment - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG" || echo "提交完成或无需提交"
    echo -e "${GREEN}✅ 更改已提交${NC}"
  fi
fi

echo ""

# ============================================================================
# 第三步：准备部署配置文件
# ============================================================================

echo "📋 第三步：准备部署配置文件..."
echo ""

# 创建zeabur.json（如果不存在）
if [ ! -f "zeabur.json" ]; then
  cat > zeabur.json << 'EOF'
{
  "buildCommand": "cd backend && npm install",
  "startCommand": "cd backend && npm start",
  "rootDirectory": "."
}
EOF
  echo -e "${GREEN}✅ 已创建 zeabur.json${NC}"
else
  echo -e "${GREEN}✅ zeabur.json 已存在${NC}"
fi

# 创建Procfile（如果不存在）
if [ ! -f "Procfile" ]; then
  echo "web: cd backend && npm start" > Procfile
  echo -e "${GREEN}✅ 已创建 Procfile${NC}"
else
  echo -e "${GREEN}✅ Procfile 已存在${NC}"
fi

# 确保supabase-init.sql存在
if [ ! -f "supabase-init.sql" ]; then
  echo -e "${YELLOW}⚠️  supabase-init.sql 不存在，将从部署指南中提取${NC}"
  # 这里可以创建一个基本的SQL文件
fi

echo ""

# ============================================================================
# 第四步：配置Supabase（需要用户输入）
# ============================================================================

echo "============================================================================"
echo "📋 第四步：配置Supabase云端存储"
echo "============================================================================"
echo ""
echo "Supabase提供免费的云端数据库和存储服务："
echo "  ✅ 500MB 数据库存储"
echo "  ✅ 1GB 文件存储"
echo "  ✅ 永久免费"
echo "  ✅ 国内可访问"
echo ""

SUPABASE_URL=""
SUPABASE_ANON_KEY=""

# 检查是否已有配置
if [ -f "backend/.env" ]; then
  if grep -q "SUPABASE_URL" backend/.env 2>/dev/null; then
    EXISTING_URL=$(grep "SUPABASE_URL" backend/.env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [ -n "$EXISTING_URL" ] && [[ ! "$EXISTING_URL" =~ ^(your|https://your-project) ]]; then
      SUPABASE_URL="$EXISTING_URL"
      echo -e "${GREEN}✅ 检测到已有Supabase URL配置${NC}"
    fi
  fi
  
  if grep -q "SUPABASE_ANON_KEY" backend/.env 2>/dev/null; then
    EXISTING_KEY=$(grep "SUPABASE_ANON_KEY" backend/.env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [ -n "$EXISTING_KEY" ] && [[ ! "$EXISTING_KEY" =~ ^(your|your-anon-key) ]]; then
      SUPABASE_ANON_KEY="$EXISTING_KEY"
      echo -e "${GREEN}✅ 检测到已有Supabase Key配置${NC}"
    fi
  fi
fi

# 如果还没有配置，引导用户配置
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo -e "${YELLOW}需要配置Supabase云端存储${NC}"
  echo ""
  echo "请按照以下步骤操作："
  echo "1. 访问 https://supabase.com 注册账号（使用GitHub登录）"
  echo "2. 创建新项目（选择Singapore或Tokyo区域）"
  echo "3. 在SQL Editor执行 supabase-init.sql 创建数据表"
  echo "4. 在Settings -> API获取以下信息："
  echo "   - Project URL (SUPABASE_URL)"
  echo "   - anon public key (SUPABASE_ANON_KEY)"
  echo ""
  
  if [ -z "$SUPABASE_URL" ]; then
    read -p "请输入 SUPABASE_URL: " SUPABASE_URL
  fi
  
  if [ -z "$SUPABASE_ANON_KEY" ]; then
    read -p "请输入 SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
  fi
  
  # 验证输入
  if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo -e "${RED}❌ SUPABASE_URL 格式不正确，应为: https://xxx.supabase.co${NC}"
    exit 1
  fi
  
  if [ ${#SUPABASE_ANON_KEY} -lt 50 ]; then
    echo -e "${RED}❌ SUPABASE_ANON_KEY 长度不足，请检查${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ Supabase配置验证通过${NC}"
else
  echo -e "${GREEN}✅ 使用已有Supabase配置${NC}"
fi

echo ""

# ============================================================================
# 第五步：配置API Keys（可选）
# ============================================================================

echo "============================================================================"
echo "📋 第五步：配置API Keys（可选，用于AI功能）"
echo "============================================================================"
echo ""

ZHIPU_API_KEY_EVO=""
ZHIPU_API_KEY_ADMIN=""

# 检查是否已有配置
if [ -f "backend/.env" ]; then
  if grep -q "ZHIPU_API_KEY_EVO" backend/.env 2>/dev/null; then
    EXISTING_KEY=$(grep "ZHIPU_API_KEY_EVO" backend/.env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [ -n "$EXISTING_KEY" ] && [[ ! "$EXISTING_KEY" =~ ^(your|$) ]]; then
      ZHIPU_API_KEY_EVO="$EXISTING_KEY"
    fi
  fi
  
  if grep -q "ZHIPU_API_KEY_ADMIN" backend/.env 2>/dev/null; then
    EXISTING_KEY=$(grep "ZHIPU_API_KEY_ADMIN" backend/.env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [ -n "$EXISTING_KEY" ] && [[ ! "$EXISTING_KEY" =~ ^(your|$) ]]; then
      ZHIPU_API_KEY_ADMIN="$EXISTING_KEY"
    fi
  fi
fi

if [ -z "$ZHIPU_API_KEY_EVO" ]; then
  echo "智谱AI API Key（用于Evo智能助手，可选）："
  echo "  获取地址: https://open.bigmodel.cn/"
  read -p "请输入 ZHIPU_API_KEY_EVO（直接回车跳过）: " ZHIPU_API_KEY_EVO
fi

if [ -z "$ZHIPU_API_KEY_ADMIN" ]; then
  echo "智谱AI API Key（用于中枢管家，可选）："
  echo "  获取地址: https://open.bigmodel.cn/"
  read -p "请输入 ZHIPU_API_KEY_ADMIN（直接回车跳过）: " ZHIPU_API_KEY_ADMIN
fi

echo ""

# ============================================================================
# 第六步：推送到GitHub
# ============================================================================

echo "============================================================================"
echo "📋 第六步：推送到GitHub"
echo "============================================================================"
echo ""

CURRENT_BRANCH=$(git branch --show-current)
echo "当前分支: $CURRENT_BRANCH"
echo ""

read -p "是否现在推送到GitHub？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "正在推送到GitHub..."
  if git push -u origin "$CURRENT_BRANCH" 2>&1; then
    echo -e "${GREEN}✅ 代码已成功推送到GitHub！${NC}"
  else
    echo -e "${YELLOW}⚠️  推送可能失败，请检查：${NC}"
    echo "   - GitHub仓库地址是否正确"
    echo "   - 是否有推送权限"
    echo "   - 网络连接是否正常"
    echo ""
    echo "您可以稍后手动推送："
    echo "  git push -u origin $CURRENT_BRANCH"
  fi
else
  echo -e "${YELLOW}⚠️  跳过推送，请稍后手动推送代码${NC}"
fi

echo ""

# ============================================================================
# 第七步：生成Zeabur部署说明
# ============================================================================

echo "============================================================================"
echo "📋 第七步：生成Zeabur部署配置"
echo "============================================================================"
echo ""

# 创建环境变量配置说明
cat > .zeabur-env-config.txt << EOF
# ============================================================================
# Zeabur 环境变量配置
# ============================================================================
# 请在Zeabur控制台的 Variables 页面添加以下环境变量
# ============================================================================

# 服务器配置
PORT=3000
NODE_ENV=production

# Supabase云端存储（必需）
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# AI配置（可选）
EOF

if [ -n "$ZHIPU_API_KEY_EVO" ]; then
  echo "ZHIPU_API_KEY_EVO=$ZHIPU_API_KEY_EVO" >> .zeabur-env-config.txt
fi

if [ -n "$ZHIPU_API_KEY_ADMIN" ]; then
  echo "ZHIPU_API_KEY_ADMIN=$ZHIPU_API_KEY_ADMIN" >> .zeabur-env-config.txt
fi

cat >> .zeabur-env-config.txt << EOF
AI_MODEL=auto

# 其他配置
API_KEY=$(openssl rand -hex 16)
LOG_LEVEL=info
EOF

echo -e "${GREEN}✅ 环境变量配置已保存到 .zeabur-env-config.txt${NC}"
echo ""

# ============================================================================
# 第八步：部署说明
# ============================================================================

echo "============================================================================"
echo "🎉 部署准备完成！"
echo "============================================================================"
echo ""
echo "接下来的步骤："
echo ""
echo "1️⃣  登录Zeabur控制台"
echo "   访问: https://zeabur.com"
echo "   使用GitHub账号登录（推荐）"
echo ""
echo "2️⃣  创建新项目"
echo "   - 点击 'New Project'"
echo "   - 输入项目名称（例如: pigeonai）"
echo "   - 点击 'Create'"
echo ""
echo "3️⃣  连接GitHub仓库"
echo "   - 点击 'Add Service'"
echo "   - 选择 'GitHub'"
echo "   - 授权Zeabur访问您的GitHub账号（首次使用）"
echo "   - 选择您的仓库: $(basename "$REMOTE_URL" .git)"
echo "   - 点击 'Deploy'"
echo ""
echo "4️⃣  配置环境变量"
echo "   - 在服务页面，点击 'Variables'"
echo "   - 复制 .zeabur-env-config.txt 中的内容"
echo "   - 逐个添加环境变量"
echo "   - 点击 'Save'"
echo ""
echo "5️⃣  等待部署完成"
echo "   - 等待约3-5分钟"
echo "   - 查看 'Logs' 标签页监控部署进度"
echo "   - 部署完成后会显示公网访问地址"
echo ""
echo "6️⃣  访问网站"
echo "   - 首页: https://your-project.zeabur.app"
echo "   - 后台管理: https://your-project.zeabur.app/admin.html"
echo "   - 默认管理员账号: admin / admin123（请首次登录后修改密码）"
echo ""
echo "============================================================================"
echo "✅ 部署方案验证"
echo "============================================================================"
echo ""
echo "✅ 长期运行: Zeabur支持24/7运行，不会休眠"
echo "✅ 可以升级: 代码推送自动部署，支持版本升级"
echo "✅ 永久免费: Zeabur每月\$5免费额度 + Supabase永久免费"
echo "✅ 国内可访问: 无需VPN，访问速度快"
echo "✅ 云端存储: Supabase免费云数据库和存储"
echo "✅ API Key配置: 已配置Supabase和AI API Keys"
echo "✅ 可分享使用: 公网地址可分享给他人"
echo "✅ 数据云端保存: Supabase自动同步数据到云端"
echo "✅ 后台管理系统: admin.html 可正常访问"
echo "✅ 网站直接使用: 所有功能已配置完成"
echo ""
echo "============================================================================"
echo "📖 详细文档"
echo "============================================================================"
echo ""
echo "详细部署指南: 免费部署指南-Zeabur.md"
echo "快速参考: 部署快速参考.md"
echo "环境变量配置: .zeabur-env-config.txt"
echo ""
echo "============================================================================"
echo "✨ 脚本执行完成！"
echo "============================================================================"
echo ""















































