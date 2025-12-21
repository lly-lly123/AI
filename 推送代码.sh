#!/bin/bash
# 推送代码到GitHub的脚本

cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"

echo "🚀 开始推送到GitHub..."
echo ""

# 检查网络连接
echo "检查GitHub连接..."
if ping -c 1 github.com > /dev/null 2>&1; then
    echo "✅ 网络连接正常"
else
    echo "❌ 无法连接到GitHub，请检查网络"
    exit 1
fi

echo ""
echo "执行推送..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "🌐 访问地址: https://github.com/Ily-lly123/PigeonAI"
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "如果提示认证失败，请："
    echo "1. 访问: https://github.com/settings/tokens"
    echo "2. 创建新的 Personal Access Token"
    echo "3. 勾选 'repo' 权限"
    echo "4. 推送时，密码处输入token（不是账户密码）"
fi

