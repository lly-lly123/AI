#!/bin/bash

# 🚀 快速推送代码到GitHub
# 自动尝试多种方法解决SSL连接问题

cd /Users/macbookair/Desktop/AI

echo "🚀 开始推送代码到GitHub..."
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "自动提交更改 - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ 更改已提交"
    echo ""
fi

# 方法1：尝试使用SSH推送
echo "方法1：尝试使用SSH推送..."
git remote set-url origin git@github.com:lly-lly123/AI.git 2>/dev/null
if git push -u origin main 2>&1 | grep -q "successfully"; then
    echo "✅ 推送成功！"
    exit 0
fi

# 方法2：使用HTTPS临时禁用SSL验证
echo ""
echo "方法2：使用HTTPS（临时禁用SSL验证）..."
git remote set-url origin https://github.com/lly-lly123/AI.git
if git -c http.sslVerify=false push -u origin main 2>&1; then
    echo "✅ 推送成功！"
    exit 0
fi

# 如果都失败了
echo ""
echo "❌ 推送失败"
echo ""
echo "💡 建议："
echo "   1. 检查网络连接"
echo "   2. 运行完整修复脚本: ./解决Git推送SSL错误.sh"
echo "   3. 配置SSH密钥（最安全的方法）"
echo "   4. 稍后重试（代码已保存在本地，不会丢失）"
