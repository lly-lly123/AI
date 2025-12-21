#!/bin/bash
# 直接部署到Vercel

cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"

echo "🚀 开始部署到Vercel..."
echo ""
echo "这将打开浏览器让你登录Vercel"
echo "登录后会自动部署"
echo ""
echo "按回车继续，或 Ctrl+C 取消..."
read

# 删除旧的.vercel目录（如果有）
rm -rf .vercel

# 使用npx直接部署（不需要安装）
npx --yes vercel --prod

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址会显示在上面"

