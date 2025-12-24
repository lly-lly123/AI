#!/bin/bash

# 推送代码到 GitHub 仓库
# 使用方法：./推送代码到GitHub.sh

echo "🚀 开始推送代码到 GitHub..."
echo ""

cd "$(dirname "$0")"

# 检查是否有未提交的更改
if [ -n "$(git status -s)" ]; then
    echo "⚠️  检测到未提交的更改，正在添加..."
    git add -A
    git commit -m "自动提交更改 - $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 显示当前状态
echo "📊 当前 Git 状态："
git status -sb
echo ""

# 尝试推送
echo "📤 正在推送到 GitHub..."
if git push -u origin main; then
    echo ""
    echo "✅ 推送成功！"
    echo "📝 提交信息："
    git log --oneline -3
else
    echo ""
    echo "❌ 推送失败，可能的原因："
    echo "   1. 网络连接问题"
    echo "   2. GitHub 访问受限"
    echo "   3. 需要配置代理"
    echo ""
    echo "💡 建议："
    echo "   - 检查网络连接"
    echo "   - 稍后重试"
    echo "   - 或使用 VPN/代理"
    echo ""
    echo "📋 本地提交记录（已准备好推送）："
    git log --oneline -5
fi


