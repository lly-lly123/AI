#!/bin/bash
# 打包项目用于Vercel部署

cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"

echo "📦 正在打包项目..."
echo ""

# 创建zip文件，排除不需要的文件
zip -r pigeonai.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*backend/node_modules*" \
  -x "*backend/core-admin/node_modules*" \
  -x "*logs*" \
  -x "*backend/logs/*" \
  -x "*.log" \
  -x "*data/*.json" \
  -x "*.DS_Store" \
  -x "*.zip" \
  > /dev/null 2>&1

if [ -f "pigeonai.zip" ]; then
    SIZE=$(du -h pigeonai.zip | cut -f1)
    echo "✅ 打包完成！"
    echo "📁 文件：pigeonai.zip"
    echo "📊 大小：$SIZE"
    echo ""
    echo "🚀 下一步："
    echo "1. 访问 https://vercel.com"
    echo "2. 登录账号"
    echo "3. 创建新项目"
    echo "4. 上传 pigeonai.zip 文件"
    echo "5. 点击部署"
else
    echo "❌ 打包失败"
    exit 1
fi

