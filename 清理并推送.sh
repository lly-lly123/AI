#!/bin/bash
# 清理并推送代码到GitHub的脚本

cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"

echo "🔍 步骤1: 检查当前状态..."
git status --short | head -10

echo ""
echo "🧹 步骤2: 清理不需要的文件..."

# 移除压缩文件（如果还在跟踪中）
git rm --cached *.tar.gz 2>/dev/null || true
git rm --cached *.zip 2>/dev/null || true

# 确保 node_modules 不被跟踪
git rm -r --cached backend/node_modules 2>/dev/null || true
git rm -r --cached node_modules 2>/dev/null || true

echo ""
echo "📝 步骤3: 添加所有更改..."
git add .gitignore
git add -u  # 添加所有已跟踪的文件的更改
git add .   # 添加新文件

echo ""
echo "📊 步骤4: 查看准备提交的文件..."
git status --short | wc -l
echo "个文件准备提交"

echo ""
echo "💾 步骤5: 提交更改..."
git commit -m "清理无用文件，更新配置，准备部署" || {
    echo "⚠️  提交失败，可能没有更改需要提交"
    echo "继续执行推送..."
}

echo ""
echo "🚀 步骤6: 推送到GitHub..."
echo "请输入GitHub仓库地址（如果还没设置远程仓库）："
echo "例如: https://github.com/用户名/仓库名.git"
echo ""
echo "如果已经设置，将直接推送..."
echo ""

# 检查是否设置了远程仓库
if git remote -v | grep -q "origin"; then
    echo "✅ 检测到远程仓库，开始推送..."
    git push -u origin main 2>&1 || git push 2>&1
else
    echo "⚠️  未检测到远程仓库，请先设置："
    echo "git remote add origin https://github.com/你的用户名/仓库名.git"
    echo "然后运行: git push -u origin main"
fi

echo ""
echo "✅ 完成！"

