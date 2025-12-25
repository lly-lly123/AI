#!/bin/bash

# Railway 部署检查脚本
# 用于检查项目状态和部署准备情况

echo "=========================================="
echo "🚀 Railway 部署检查脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查当前目录
echo "📁 1. 检查项目目录..."
CURRENT_DIR=$(pwd)
echo "   当前目录: $CURRENT_DIR"

if [[ ! -d "backend" ]]; then
    echo -e "   ${RED}❌ 未找到 backend 目录${NC}"
    exit 1
else
    echo -e "   ${GREEN}✅ backend 目录存在${NC}"
fi

# 2. 检查 Git 状态
echo ""
echo "📦 2. 检查 Git 状态..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Git 仓库已初始化${NC}"
    
    # 检查远程仓库
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    if [ -n "$REMOTE_URL" ]; then
        echo "   远程仓库: $REMOTE_URL"
    else
        echo -e "   ${YELLOW}⚠️  未配置远程仓库${NC}"
    fi
    
    # 检查未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "   ${YELLOW}⚠️  有未提交的更改${NC}"
        echo "   未提交的文件:"
        git status --short | head -5
        if [ $(git status --short | wc -l) -gt 5 ]; then
            echo "   ... (还有更多文件)"
        fi
    else
        echo -e "   ${GREEN}✅ 所有更改已提交${NC}"
    fi
    
    # 检查分支
    CURRENT_BRANCH=$(git branch --show-current)
    echo "   当前分支: $CURRENT_BRANCH"
else
    echo -e "   ${RED}❌ 未找到 Git 仓库${NC}"
fi

# 3. 检查 Node.js
echo ""
echo "🟢 3. 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "   ${GREEN}✅ Node.js 已安装: $NODE_VERSION${NC}"
else
    echo -e "   ${RED}❌ Node.js 未安装${NC}"
fi

# 4. 检查后端配置
echo ""
echo "⚙️  4. 检查后端配置..."
if [ -f "backend/package.json" ]; then
    echo -e "   ${GREEN}✅ package.json 存在${NC}"
else
    echo -e "   ${RED}❌ package.json 不存在${NC}"
fi

if [ -f "backend/server.js" ]; then
    echo -e "   ${GREEN}✅ server.js 存在${NC}"
else
    echo -e "   ${RED}❌ server.js 不存在${NC}"
fi

if [ -f "backend/config.example.env" ]; then
    echo -e "   ${GREEN}✅ config.example.env 存在${NC}"
else
    echo -e "   ${YELLOW}⚠️  config.example.env 不存在${NC}"
fi

# 5. 检查依赖
echo ""
echo "📚 5. 检查依赖..."
if [ -d "backend/node_modules" ]; then
    echo -e "   ${GREEN}✅ node_modules 目录存在${NC}"
else
    echo -e "   ${YELLOW}⚠️  node_modules 不存在，需要运行 npm install${NC}"
fi

# 6. 检查环境变量文件
echo ""
echo "🔐 6. 检查环境变量..."
if [ -f "backend/.env" ]; then
    echo -e "   ${GREEN}✅ .env 文件存在${NC}"
    echo "   环境变量（隐藏敏感信息）:"
    grep -E "^[A-Z_]+=" backend/.env | sed 's/=.*/=***/' | head -5
else
    echo -e "   ${YELLOW}⚠️  .env 文件不存在（Railway 会使用网页配置的环境变量）${NC}"
fi

# 7. 检查 Railway CLI
echo ""
echo "🚂 7. 检查 Railway CLI..."
if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway --version 2>/dev/null || echo "已安装")
    echo -e "   ${GREEN}✅ Railway CLI 已安装${NC}"
else
    echo -e "   ${YELLOW}⚠️  Railway CLI 未安装（可以使用网页操作）${NC}"
fi

# 8. 总结
echo ""
echo "=========================================="
echo "📋 检查总结"
echo "=========================================="
echo ""
echo "✅ 准备就绪的项目应该："
echo "   1. ✅ backend 目录存在"
echo "   2. ✅ Git 仓库已连接"
echo "   3. ✅ Node.js 已安装"
echo "   4. ✅ package.json 和 server.js 存在"
echo ""
echo "🌐 Railway 部署步骤："
echo "   1. 在 Railway 网页创建项目"
echo "   2. 连接 GitHub 仓库: lly-lly123/AI"
echo "   3. 设置 Root Directory: backend"
echo "   4. 添加环境变量（NODE_ENV, ZHIPU_API_KEY_EVO 等）"
echo "   5. Railway 会自动部署"
echo ""
echo "📝 下一步操作："
echo "   1. 如果需要提交代码: git add . && git commit -m '部署' && git push"
echo "   2. 访问 https://railway.app 检查部署状态"
echo "   3. 在 Railway 网页配置环境变量"
echo "   4. 获取网站访问地址并测试"
echo ""



































