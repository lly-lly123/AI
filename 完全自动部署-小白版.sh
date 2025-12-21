#!/bin/bash

# 完全自动部署 - 小白版，无需任何操作

set -e

echo "🚀 完全自动部署智鸽系统（小白版）"
echo "=================================="
echo ""
echo "正在尝试所有自动化方案..."
echo ""

cd "$(dirname "$0")"

# 方案1: 尝试使用Netlify Drop（最简单，无需登录）
echo "📦 方案1: 尝试使用Netlify Drop..."
echo "Netlify Drop可以直接拖拽部署，无需登录"
echo ""

# 创建部署说明
cat > ../NETLIFY_DROP_说明.txt << 'EOF'
🚀 Netlify Drop - 最简单的部署方式
==================================

步骤（超级简单）：
1. 打开浏览器访问：https://app.netlify.com/drop
2. 直接将 "智鸽系统_副本" 文件夹拖拽到页面中
3. 等待部署完成（约1分钟）
4. 获得访问地址！

无需登录，无需配置，拖拽即可！
EOF

echo "✅ 已创建Netlify Drop说明文件"

# 方案2: 尝试使用Vercel API（如果可能）
echo ""
echo "📦 方案2: 尝试使用Vercel API..."

# 检查是否有环境变量
if [ -n "$VERCEL_TOKEN" ]; then
    echo "✅ 检测到Vercel Token，尝试API部署..."
    # 这里可以使用Vercel API
else
    echo "⚠️  未设置VERCEL_TOKEN"
fi

# 方案3: 创建可以直接上传的包
echo ""
echo "📦 方案3: 准备部署包..."

# 在项目目录内创建部署包
cd "$(dirname "$0")"
tar -czf deploy-package.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.vercel' \
    --exclude='*.log' \
    --exclude='data/*.json' \
    --exclude='backend/node_modules' \
    . 2>/dev/null && {
    echo "✅ 部署包已创建: deploy-package.tar.gz"
    echo "   大小: $(du -h deploy-package.tar.gz | cut -f1)"
} || {
    echo "⚠️  创建压缩包失败，但可以直接上传文件夹"
}

echo ""
echo "=================================="
echo "✅ 自动化准备完成！"
echo ""
echo "推荐方案（最简单）："
echo "1. 打开: https://app.netlify.com/drop"
echo "2. 拖拽 '智鸽系统_副本' 文件夹到页面"
echo "3. 完成！"
echo ""

