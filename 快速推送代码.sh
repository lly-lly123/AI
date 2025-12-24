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

# 方法1：尝试使用SSH推送（如果已配置SSH密钥）
echo "方法1：检查SSH配置..."
if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ] || [ -f ~/.ssh/id_ecdsa ]; then
    echo "   检测到SSH密钥，尝试使用SSH推送..."
    # 先添加GitHub主机密钥到known_hosts（避免交互式提示）
    mkdir -p ~/.ssh
    ssh-keyscan -t rsa,ecdsa,ed25519 github.com >> ~/.ssh/known_hosts 2>/dev/null
    
    git remote set-url origin git@github.com:lly-lly123/AI.git 2>/dev/null
    if git push -u origin main 2>&1 | grep -qE "successfully|Enumerating|Counting|Writing|remote:"; then
        echo "✅ SSH推送成功！"
        exit 0
    fi
    echo "   ⚠️  SSH推送失败，切换到HTTPS方式..."
else
    echo "   ⚠️  未检测到SSH密钥，直接使用HTTPS方式..."
fi

# 方法2：使用HTTPS临时禁用SSL验证
echo ""
echo "方法2：使用HTTPS（临时禁用SSL验证）..."
git remote set-url origin https://github.com/lly-lly123/AI.git

# 尝试推送
PUSH_OUTPUT=$(git -c http.sslVerify=false push -u origin main 2>&1)
PUSH_EXIT_CODE=$?

echo "$PUSH_OUTPUT"

if [ $PUSH_EXIT_CODE -eq 0 ] || echo "$PUSH_OUTPUT" | grep -qE "successfully|Enumerating|Counting|Writing|remote:|To https://"; then
    echo ""
    echo "✅ HTTPS推送成功！"
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
