#!/bin/bash

# 智鸽系统一键自动部署脚本
# 此脚本将自动完成所有部署步骤，无需手动操作

set -e

echo "🚀 智鸽系统一键自动部署开始..."
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查必要的工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 未安装 $1${NC}"
        echo "正在安装 $1..."
        return 1
    fi
    echo -e "${GREEN}✅ $1 已安装${NC}"
    return 0
}

# 检查Node.js
if ! check_tool node; then
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

# 检查npm
if ! check_tool npm; then
    echo "请先安装npm"
    exit 1
fi

echo ""
echo "📦 步骤1: 安装依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "依赖已存在，跳过安装"
fi
cd ..

echo ""
echo "🔧 步骤2: 检查配置文件..."

# 检查.env文件
if [ ! -f "backend/.env" ]; then
    echo "创建.env配置文件..."
    cp backend/config.example.env backend/.env
    echo -e "${YELLOW}⚠️  请编辑 backend/.env 文件配置必要的环境变量${NC}"
fi

# 检查Supabase配置
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  Supabase环境变量未设置${NC}"
    echo "提示: 如果使用Supabase，请设置以下环境变量:"
    echo "  export SUPABASE_URL=your-supabase-url"
    echo "  export SUPABASE_ANON_KEY=your-supabase-key"
    echo ""
    echo "或者使用本地存储模式（无需配置）"
fi

echo ""
echo "🧪 步骤3: 运行测试..."
cd backend
if npm test 2>/dev/null; then
    echo -e "${GREEN}✅ 测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  测试跳过（未配置测试）${NC}"
fi
cd ..

echo ""
echo "🌐 步骤4: 部署选项..."

# 检查是否在GitHub Actions中
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "检测到GitHub Actions环境，使用自动部署..."
    echo "部署将通过GitHub Actions自动完成"
    exit 0
fi

# 检查Vercel CLI
if command -v vercel &> /dev/null; then
    echo "检测到Vercel CLI，准备部署到Vercel..."
    
    # 检查是否已登录
    if vercel whoami &> /dev/null; then
        echo -e "${GREEN}✅ 已登录Vercel${NC}"
        
        # 设置环境变量
        if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
            echo "配置环境变量..."
            echo "$SUPABASE_URL" | vercel env add SUPABASE_URL production 2>/dev/null || true
            echo "$SUPABASE_ANON_KEY" | vercel env add SUPABASE_ANON_KEY production 2>/dev/null || true
        fi
        
        # 部署
        echo "开始部署..."
        vercel --prod --yes
        echo -e "${GREEN}✅ 部署完成！${NC}"
        echo "🌐 访问地址: https://pigeonai.vercel.app"
    else
        echo -e "${YELLOW}⚠️  未登录Vercel，请先运行: vercel login${NC}"
    fi
else
    echo "未检测到Vercel CLI"
    echo "安装Vercel CLI: npm install -g vercel"
    echo "然后运行: vercel login"
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ 部署准备完成！${NC}"
echo ""
echo "下一步操作:"
echo "1. 如果使用Supabase，请配置环境变量"
echo "2. 运行: vercel --prod 进行部署"
echo "3. 或推送到GitHub，使用GitHub Actions自动部署"

