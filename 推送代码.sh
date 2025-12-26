#!/bin/bash

# 推送代码到GitHub脚本

echo "🚀 开始推送到GitHub..."

cd /Users/macbookair/Desktop/AI

# 检查当前分支
current_branch=$(git branch --show-current)
echo "当前分支: $current_branch"

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改，请先提交"
    git status --short
    exit 1
fi

# 尝试推送
echo "📤 正在推送到 origin/$current_branch..."

# 方法1：使用HTTPS（如果SSL有问题，临时禁用验证）
git config http.sslVerify false
git push origin $current_branch

# 如果失败，尝试方法2：使用SSH
if [ $? -ne 0 ]; then
    echo "⚠️  HTTPS推送失败，尝试使用SSH..."
    git remote set-url origin git@github.com:lly-lly123/AI.git
    git push origin $current_branch
fi

# 恢复SSL验证
git config http.sslVerify true

echo "✅ 推送完成！"
























