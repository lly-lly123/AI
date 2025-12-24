#!/bin/bash

# 🔧 解决Git推送SSL错误脚本
# 错误：LibreSSL SSL_connect : SSL_ERROR_SYSCALL in connection to github.com:443

echo "🔍 检查当前Git状态..."
cd /Users/macbookair/Desktop/AI
git status --short | head -5
echo ""

echo "📊 本地提交状态："
git log --oneline origin/main..HEAD 2>/dev/null | head -5
echo ""

echo "🔧 尝试解决方案..."
echo ""

# 方案1：先提交未暂存的更改
echo "方案1：检查是否有未提交的更改..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  发现未提交的更改，建议先提交："
    echo "   git add ."
    echo "   git commit -m '自动提交更改'"
    echo ""
    read -p "是否现在提交所有更改？(y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "自动提交更改"
        echo "✅ 更改已提交"
    fi
fi
echo ""

# 方案2：尝试使用SSH（如果已配置）
echo "方案2：尝试切换到SSH连接..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ SSH密钥已配置，切换到SSH..."
    git remote set-url origin git@github.com:lly-lly123/AI.git
    echo "🔄 尝试使用SSH推送..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo "✅ 推送成功！"
        exit 0
    fi
else
    echo "⚠️  SSH密钥未配置或未生效"
    echo "   可以运行以下命令配置SSH："
    echo "   ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo "   cat ~/.ssh/id_ed25519.pub"
    echo "   然后将公钥添加到GitHub: https://github.com/settings/keys"
fi
echo ""

# 方案3：临时禁用SSL验证（仅用于推送）
echo "方案3：临时禁用SSL验证推送..."
read -p "是否尝试临时禁用SSL验证推送？(y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git -c http.sslVerify=false push -u origin main
    if [ $? -eq 0 ]; then
        echo "✅ 推送成功！"
        echo "⚠️  注意：已临时禁用SSL验证，建议稍后配置SSH或修复网络问题"
        exit 0
    else
        echo "❌ 推送仍然失败"
    fi
fi
echo ""

# 方案4：检查网络连接
echo "方案4：检查网络连接..."
if ping -c 1 github.com > /dev/null 2>&1; then
    echo "✅ 可以ping通GitHub"
else
    echo "❌ 无法ping通GitHub，可能是网络问题"
    echo "   建议："
    echo "   1. 检查网络连接"
    echo "   2. 尝试使用VPN/代理"
    echo "   3. 稍后重试"
fi
echo ""

# 方案5：配置代理（如果有）
echo "方案5：检查代理配置..."
if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ]; then
    echo "✅ 检测到代理环境变量"
    echo "   当前代理：$http_proxy$HTTP_PROXY"
    echo "   尝试使用代理推送..."
    git push -u origin main
else
    echo "⚠️  未检测到代理配置"
    echo "   如果使用代理，可以设置："
    echo "   export http_proxy=http://proxy.example.com:8080"
    echo "   export https_proxy=http://proxy.example.com:8080"
fi
echo ""

echo "📋 总结："
echo "   如果所有方案都失败，建议："
echo "   1. 检查网络连接和防火墙设置"
echo "   2. 配置SSH密钥（最安全的方法）"
echo "   3. 使用VPN或代理"
echo "   4. 稍后网络恢复时再推送"
echo ""
echo "✅ 重要：代码已保存在本地仓库，不会丢失！"

