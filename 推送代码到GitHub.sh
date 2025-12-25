#!/bin/bash

# 推送代码到GitHub脚本
# VPN已连接时使用此脚本

echo "🚀 开始推送代码到GitHub..."
echo ""

cd /Users/macbookair/Desktop/AI

# 方法1：尝试使用代理推送（Telescope默认HTTP代理端口1191）
echo "📡 方法1: 尝试使用代理推送..."
git config http.proxy http://127.0.0.1:1191
git config https.proxy http://127.0.0.1:1191

if git push -u origin main; then
    echo "✅ 推送成功！"
    git config --unset http.proxy
    git config --unset https.proxy
    exit 0
fi

# 方法2：如果方法1失败，尝试临时禁用SSL验证
echo ""
echo "📡 方法2: 尝试临时禁用SSL验证..."
git config --unset http.proxy
git config --unset https.proxy

if git -c http.sslVerify=false push -u origin main; then
    echo "✅ 推送成功！"
    exit 0
fi

# 方法3：尝试使用SSH方式（如果已配置SSH密钥）
echo ""
echo "📡 方法3: 尝试使用SSH方式..."
git remote set-url origin git@github.com:lly-lly123/AI.git

if git push -u origin main; then
    echo "✅ 推送成功！"
    exit 0
fi

# 如果所有方法都失败
echo ""
echo "❌ 所有推送方法都失败了"
echo ""
echo "请尝试以下手动操作："
echo "1. 检查VPN连接是否正常"
echo "2. 在终端中手动运行: git push -u origin main"
echo "3. 如果还是失败，可以尝试："
echo "   git -c http.sslVerify=false push -u origin main"
echo ""
exit 1