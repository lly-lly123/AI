#!/bin/bash

# ============================================================================
# Zeabur 一键部署脚本
# ============================================================================
# 功能：帮助您快速将项目部署到Zeabur
# 要求：需要先完成GitHub仓库设置和Supabase配置
# ============================================================================

set -e

echo "🚀 Zeabur 一键部署助手"
echo ""

# 检查Git仓库
if [ ! -d ".git" ]; then
  echo "❌ 未检测到Git仓库"
  echo ""
  echo "请先初始化Git仓库："
  echo "  git init"
  echo "  git add ."
  echo "  git commit -m 'Initial commit'"
  echo ""
  exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  检测到未提交的更改"
  echo ""
  read -p "是否现在提交所有更改？(y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    read -p "请输入提交信息（默认：Update for Zeabur deployment）: " commit_msg
    commit_msg=${commit_msg:-"Update for Zeabur deployment"}
    git commit -m "$commit_msg"
  else
    echo "❌ 请先提交或暂存更改"
    exit 1
  fi
fi

# 检查远程仓库
if [ -z "$(git remote -v)" ]; then
  echo "❌ 未配置GitHub远程仓库"
  echo ""
  echo "请先添加GitHub远程仓库："
  echo "  git remote add origin https://github.com/your-username/your-repo.git"
  echo ""
  exit 1
fi

# 显示当前Git状态
echo "📋 当前Git状态："
echo "  当前分支: $(git branch --show-current)"
echo "  远程仓库: $(git remote get-url origin)"
echo ""

# 检查必要的配置文件
echo "🔍 检查配置文件..."
missing_files=()

if [ ! -f "zeabur.json" ]; then
  missing_files+=("zeabur.json")
fi

if [ ! -f "Procfile" ]; then
  missing_files+=("Procfile")
fi

if [ ! -f "backend/package.json" ]; then
  missing_files+=("backend/package.json")
fi

if [ ${#missing_files[@]} -gt 0 ]; then
  echo "⚠️  缺少以下配置文件："
  for file in "${missing_files[@]}"; do
    echo "  - $file"
  done
  echo ""
  echo "正在创建缺失的文件..."
  
  if [[ " ${missing_files[@]} " =~ " zeabur.json " ]]; then
    echo "✅ zeabur.json 已存在（已自动创建）"
  fi
  
  if [[ " ${missing_files[@]} " =~ " Procfile " ]]; then
    echo "✅ Procfile 已存在（已自动创建）"
  fi
fi

echo ""
echo "✅ 配置文件检查完成"
echo ""

# 提示部署步骤
echo "📝 接下来的步骤："
echo ""
echo "1️⃣  推送代码到GitHub："
echo "   git push origin main"
echo ""
echo "2️⃣  登录Zeabur控制台："
echo "   https://zeabur.com"
echo ""
echo "3️⃣  创建新项目并连接GitHub仓库"
echo ""
echo "4️⃣  配置环境变量（在Zeabur控制台的Variables页面）："
echo "   - PORT=3000"
echo "   - NODE_ENV=production"
echo "   - SUPABASE_URL=你的Supabase_URL"
echo "   - SUPABASE_ANON_KEY=你的Supabase_Anon_Key"
echo "   - ZHIPU_API_KEY_EVO=你的智谱AI_Key（可选）"
echo "   - ZHIPU_API_KEY_ADMIN=你的智谱AI_Key（可选）"
echo "   - AI_MODEL=auto"
echo "   - API_KEY=your_api_key_here"
echo "   - LOG_LEVEL=info"
echo ""
echo "5️⃣  等待部署完成（约3-5分钟）"
echo ""
echo "📖 详细部署指南请查看：免费部署指南-Zeabur.md"
echo ""

# 询问是否现在推送
read -p "是否现在推送到GitHub？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "📤 正在推送到GitHub..."
  
  # 获取当前分支
  current_branch=$(git branch --show-current)
  
  # 推送代码
  if git push origin "$current_branch"; then
    echo ""
    echo "✅ 代码已成功推送到GitHub！"
    echo ""
    echo "🎉 下一步："
    echo "   1. 访问 https://zeabur.com"
    echo "   2. 创建新项目"
    echo "   3. 连接您的GitHub仓库"
    echo "   4. 配置环境变量"
    echo "   5. 等待部署完成"
    echo ""
  else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "   - GitHub仓库地址是否正确"
    echo "   - 是否有推送权限"
    echo "   - 网络连接是否正常"
    echo ""
    exit 1
  fi
else
  echo ""
  echo "💡 提示：稍后可以运行以下命令推送代码："
  echo "   git push origin $(git branch --show-current)"
  echo ""
fi

echo "✨ 脚本执行完成！"
echo ""



































