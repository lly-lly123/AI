#!/bin/bash
# 自动推送代码到GitHub

cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"

echo "🚀 开始推送代码到GitHub..."
echo ""

# 添加所有文件
echo "📝 添加文件..."
git add . 2>&1

# 提交
echo "💾 提交更改..."
git commit -m "准备部署：上传所有文件" 2>&1 || echo "（没有新文件需要提交）"

# 检查远程仓库
if ! git remote | grep -q origin; then
    echo "🔗 添加远程仓库..."
    git remote add origin https://github.com/Ily-lly123/PigeonAI.git
fi

echo ""
echo "📤 推送到GitHub..."
echo "⚠️  会提示输入用户名和Token"
echo "   用户名：Ily-lly123"
echo "   密码：粘贴你的GitHub Token（不是账户密码）"
echo ""
echo "如果没有Token，访问：https://github.com/settings/tokens"
echo ""

# 推送
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo "🌐 访问：https://github.com/Ily-lly123/PigeonAI"
    echo ""
    echo "现在可以回到Vercel，点击PigeonAI的Import按钮部署了！"
else
    echo ""
    echo "❌ 推送失败"
    echo "请检查Token是否正确，或查看上面的错误信息"
fi

