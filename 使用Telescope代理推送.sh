#!/bin/bash

# 🚀 使用Telescope代理推送代码到GitHub
# Telescope代理端口：HTTP:1191, SOCKS5:1190

cd /Users/macbookair/Desktop/AI

echo "🔧 配置Git使用Telescope代理..."
echo "   HTTP端口: 1191"
echo "   SOCKS5端口: 1190"
echo ""

# 配置Git代理（使用HTTP端口）
git config --global http.proxy http://127.0.0.1:1191
git config --global https.proxy http://127.0.0.1:1191

echo "✅ Git代理已配置"
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

# 推送代码
echo "📤 正在推送代码到GitHub（通过Telescope代理）..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "📊 当前状态："
    git status
    echo ""
    echo "💡 提示：如果不再需要代理，可以清除代理设置："
    echo "   git config --global --unset http.proxy"
    echo "   git config --global --unset https.proxy"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "💡 请检查："
    echo "   1. Telescope是否已连接（显示'已连接'）"
    echo "   2. 是否处于全局模式"
    echo "   3. 代理端口是否正确（HTTP:1191）"
    echo ""
    echo "   可以尝试："
    echo "   - 重启Telescope"
    echo "   - 检查Telescope连接状态"
    echo "   - 运行网络诊断: ./网络连接诊断.sh"
fi

































