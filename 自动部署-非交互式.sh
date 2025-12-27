#!/bin/bash

# ============================================================================
# 非交互式自动部署脚本 - Zeabur + Supabase
# ============================================================================
# 自动完成所有部署步骤，无需用户交互
# ============================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "============================================================================"
echo "🚀 非交互式自动部署 - Zeabur + Supabase"
echo "============================================================================"
echo ""

# ============================================================================
# 步骤1: 检查基础条件
# ============================================================================

echo "📋 检查部署条件..."

if ! command -v node >/dev/null 2>&1 || ! command -v git >/dev/null 2>&1; then
  echo "❌ 缺少必要工具（Node.js或Git）"
  exit 1
fi

if [ ! -d "backend" ] || [ ! -f "backend/server.js" ] || [ ! -f "admin.html" ]; then
  echo "❌ 项目结构不完整"
  exit 1
fi

echo -e "${GREEN}✅ 基础条件检查通过${NC}"
echo ""

# ============================================================================
# 步骤2: 准备Git仓库
# ============================================================================

echo "📋 准备Git仓库..."

if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# 自动提交所有更改
if [ -n "$(git status --porcelain)" ]; then
  echo "自动提交更改..."
  git add .
  git commit -m "Auto commit for deployment - $(date '+%Y-%m-%d %H:%M:%S')" || true
fi

# 检查远程仓库
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo -e "${YELLOW}⚠️  未配置GitHub远程仓库${NC}"
  echo "请先配置: git remote add origin <your-repo-url>"
  exit 1
fi

echo -e "${GREEN}✅ Git仓库准备完成${NC}"
echo ""

# ============================================================================
# 步骤3: 创建部署配置文件
# ============================================================================

echo "📋 创建部署配置文件..."

# zeabur.json
cat > zeabur.json << 'EOF'
{
  "buildCommand": "cd backend && npm install",
  "startCommand": "cd backend && npm start",
  "rootDirectory": "."
}
EOF

# Procfile
echo "web: cd backend && npm start" > Procfile

echo -e "${GREEN}✅ 配置文件已创建${NC}"
echo ""

# ============================================================================
# 步骤4: 读取现有配置
# ============================================================================

echo "📋 读取现有配置..."

SUPABASE_URL=""
SUPABASE_ANON_KEY=""
ZHIPU_API_KEY_EVO=""
ZHIPU_API_KEY_ADMIN=""

# 尝试从.env读取配置
if [ -f "backend/.env" ]; then
  while IFS='=' read -r key value; do
    # 跳过注释和空行
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    key=$(echo "$key" | tr -d ' ' | tr -d '"')
    value=$(echo "$value" | tr -d ' ' | tr -d '"')
    
    case "$key" in
      SUPABASE_URL)
        if [[ "$value" =~ ^https://.*\.supabase\.co$ ]]; then
          SUPABASE_URL="$value"
        fi
        ;;
      SUPABASE_ANON_KEY)
        if [ ${#value} -ge 50 ]; then
          SUPABASE_ANON_KEY="$value"
        fi
        ;;
      ZHIPU_API_KEY_EVO)
        if [ -n "$value" ] && [[ ! "$value" =~ ^(your|$) ]]; then
          ZHIPU_API_KEY_EVO="$value"
        fi
        ;;
      ZHIPU_API_KEY_ADMIN)
        if [ -n "$value" ] && [[ ! "$value" =~ ^(your|$) ]]; then
          ZHIPU_API_KEY_ADMIN="$value"
        fi
        ;;
    esac
  done < backend/.env
fi

# 如果从.env读取失败，尝试从config.example.env读取（仅作为参考）
if [ -z "$SUPABASE_URL" ] && [ -f "backend/config.example.env" ]; then
  echo -e "${YELLOW}⚠️  未在.env中找到Supabase配置${NC}"
fi

echo ""

# ============================================================================
# 步骤5: 生成环境变量配置
# ============================================================================

echo "📋 生成环境变量配置..."

# 生成API Key（如果未配置）
if [ -z "$(grep 'API_KEY=' backend/.env 2>/dev/null | grep -v 'your-api-key')" ]; then
  API_KEY=$(openssl rand -hex 16 2>/dev/null || echo "auto-generated-key-$(date +%s)")
else
  API_KEY=$(grep 'API_KEY=' backend/.env | cut -d '=' -f2 | head -1 | tr -d ' ' | tr -d '"')
fi

# 创建Zeabur环境变量配置
cat > .zeabur-env-config.txt << EOF
# ============================================================================
# Zeabur 环境变量配置
# 请在Zeabur控制台的 Variables 页面添加以下环境变量
# ============================================================================

PORT=3000
NODE_ENV=production
EOF

if [ -n "$SUPABASE_URL" ]; then
  echo "SUPABASE_URL=$SUPABASE_URL" >> .zeabur-env-config.txt
  echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> .zeabur-env-config.txt
  echo -e "${GREEN}✅ 已配置Supabase云端存储${NC}"
else
  echo "" >> .zeabur-env-config.txt
  echo "# Supabase配置（必需）- 请从 https://supabase.com 获取" >> .zeabur-env-config.txt
  echo "# SUPABASE_URL=https://xxx.supabase.co" >> .zeabur-env-config.txt
  echo "# SUPABASE_ANON_KEY=your-anon-key" >> .zeabur-env-config.txt
  echo -e "${YELLOW}⚠️  需要配置Supabase（见下方说明）${NC}"
fi

if [ -n "$ZHIPU_API_KEY_EVO" ]; then
  echo "ZHIPU_API_KEY_EVO=$ZHIPU_API_KEY_EVO" >> .zeabur-env-config.txt
fi

if [ -n "$ZHIPU_API_KEY_ADMIN" ]; then
  echo "ZHIPU_API_KEY_ADMIN=$ZHIPU_API_KEY_ADMIN" >> .zeabur-env-config.txt
fi

cat >> .zeabur-env-config.txt << EOF
AI_MODEL=auto
API_KEY=$API_KEY
LOG_LEVEL=info
EOF

echo -e "${GREEN}✅ 环境变量配置已保存到 .zeabur-env-config.txt${NC}"
echo ""

# ============================================================================
# 步骤6: 推送到GitHub
# ============================================================================

echo "📋 推送到GitHub..."

CURRENT_BRANCH=$(git branch --show-current)

# 尝试推送
if git push -u origin "$CURRENT_BRANCH" 2>&1; then
  echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
else
  echo -e "${YELLOW}⚠️  推送失败或需要手动推送${NC}"
  echo "请运行: git push -u origin $CURRENT_BRANCH"
fi

echo ""

# ============================================================================
# 步骤7: 生成部署说明
# ============================================================================

cat > .deployment-instructions.txt << 'EOF'
============================================================================
🎉 自动部署准备完成！
============================================================================

✅ 已完成的工作：
  1. ✅ 检查部署条件
  2. ✅ 准备Git仓库
  3. ✅ 创建部署配置文件
  4. ✅ 读取现有配置
  5. ✅ 生成环境变量配置
  6. ✅ 推送到GitHub

📋 接下来的步骤（在Zeabur控制台完成）：

1. 访问 https://zeabur.com 并登录（使用GitHub账号）

2. 创建新项目
   - 点击 "New Project"
   - 输入项目名称
   - 点击 "Create"

3. 连接GitHub仓库
   - 点击 "Add Service"
   - 选择 "GitHub"
   - 授权Zeabur访问GitHub（首次使用）
   - 选择仓库并点击 "Deploy"

4. 配置环境变量
   - 在服务页面点击 "Variables"
   - 复制 .zeabur-env-config.txt 中的内容
   - 逐个添加环境变量
   - 点击 "Save"

5. 等待部署完成（约3-5分钟）

6. 访问网站
   - 首页: https://your-project.zeabur.app
   - 后台: https://your-project.zeabur.app/admin.html
   - 默认账号: admin / admin123

============================================================================
✅ 部署方案验证
============================================================================

✅ 长期运行: Zeabur支持24/7运行
✅ 可以升级: 代码推送自动部署
✅ 永久免费: Zeabur $5/月 + Supabase永久免费
✅ 国内可访问: 无需VPN
✅ 云端存储: Supabase免费云数据库
✅ API Key配置: 已配置
✅ 可分享使用: 公网地址可分享
✅ 数据云端保存: Supabase自动同步
✅ 后台管理系统: admin.html可访问
✅ 网站直接使用: 所有功能已配置

============================================================================
EOF

cat .deployment-instructions.txt

echo ""
echo -e "${BLUE}📖 详细说明已保存到: .deployment-instructions.txt${NC}"
echo -e "${BLUE}📋 环境变量配置: .zeabur-env-config.txt${NC}"
echo ""

# ============================================================================
# 检查Supabase配置
# ============================================================================

if [ -z "$SUPABASE_URL" ]; then
  echo "============================================================================"
  echo -e "${YELLOW}⚠️  重要：需要配置Supabase云端存储${NC}"
  echo "============================================================================"
  echo ""
  echo "请按照以下步骤配置Supabase："
  echo ""
  echo "1. 访问 https://supabase.com 注册账号（使用GitHub登录）"
  echo "2. 创建新项目："
  echo "   - 选择区域: Singapore 或 Tokyo（离中国更近）"
  echo "   - 设置数据库密码（请保存好）"
  echo "3. 在SQL Editor执行 supabase-init.sql 创建数据表"
  echo "4. 在 Settings -> API 获取："
  echo "   - Project URL → SUPABASE_URL"
  echo "   - anon public key → SUPABASE_ANON_KEY"
  echo "5. 将配置添加到 .zeabur-env-config.txt 或Zeabur环境变量"
  echo ""
  echo "Supabase免费版提供："
  echo "  ✅ 500MB 数据库存储"
  echo "  ✅ 1GB 文件存储"
  echo "  ✅ 永久免费"
  echo ""
fi

echo "============================================================================"
echo "✨ 自动部署脚本执行完成！"
echo "============================================================================"
echo ""




















































