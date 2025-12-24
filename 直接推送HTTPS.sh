#!/bin/bash

# 🚀 直接使用HTTPS推送代码（绕过SSL验证）

cd /Users/macbookair/Desktop/AI

echo "🚀 使用HTTPS方式推送代码到GitHub..."
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "自动提交更改 - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ 更改已提交"
    echo ""
fi

# 设置HTTPS远程地址
echo "🔧 配置HTTPS远程地址..."
git remote set-url origin https://github.com/lly-lly123/AI.git

# 使用HTTPS推送（临时禁用SSL验证）
echo "📤 正在推送代码..."
echo ""

git -c http.sslVerify=false push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📊 当前状态："
    git status
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "💡 可能的原因："
    echo "   1. 网络连接问题"
    echo "   2. GitHub访问受限"
    echo "   3. 需要配置代理或VPN"
    echo ""
    echo "✅ 重要：代码已保存在本地，不会丢失！"
fi

