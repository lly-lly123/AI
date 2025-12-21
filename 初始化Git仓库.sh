#!/bin/bash

# 初始化Git仓库并准备推送到GitHub

echo "🚀 初始化Git仓库..."

# 检查是否已经是Git仓库
if [ -d ".git" ]; then
    echo "⚠️  已经是Git仓库，跳过初始化"
else
    echo "初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加所有文件
echo "添加文件到Git..."
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo "⚠️  没有更改需要提交"
else
    echo "提交更改..."
    git commit -m "Initial commit: PigeonAI系统 - 完全自动部署版本"
fi

echo ""
echo "✅ Git仓库初始化完成！"
echo ""
echo "下一步操作："
echo "1. 在GitHub创建新仓库: https://github.com/new"
echo "2. 仓库名称: pigeonai"
echo "3. 运行以下命令推送代码:"
echo ""
echo "   git remote add origin https://github.com/你的用户名/pigeonai.git"
echo "   git push -u origin main"
echo ""
echo "4. 配置GitHub Secrets（参考 完全自动部署指南.md）"
echo "5. 系统将自动部署！"


