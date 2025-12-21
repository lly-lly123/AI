#!/bin/bash

# API Key 安全配置脚本
# 设置正确的文件权限，保护API Key

echo "🔐 配置API Key安全保护..."
echo ""

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在"
    echo "💡 提示: 如果尚未配置API Key，请先运行 node setup-ai.js"
    exit 1
fi

# 设置 .env 文件权限（只有所有者可读）
echo "1. 设置 .env 文件权限..."
chmod 600 .env
if [ $? -eq 0 ]; then
    echo "   ✅ .env 文件权限已设置为 600 (rw-------)"
else
    echo "   ❌ 设置权限失败"
    exit 1
fi

# 设置当前目录权限
echo "2. 设置目录权限..."
chmod 700 .
if [ $? -eq 0 ]; then
    echo "   ✅ 目录权限已设置"
else
    echo "   ⚠️  目录权限设置失败（可能没有权限）"
fi

# 验证权限
echo ""
echo "3. 验证文件权限..."
ls -la .env | awk '{print "   文件: " $9 " | 权限: " $1 " | 所有者: " $3 ":" $4}'

echo ""
echo "✅ 安全配置完成！"
echo ""
echo "📋 当前配置："
echo "   - .env 文件权限: 600 (只有所有者可读)"
echo "   - 其他用户无法访问您的API Key"
echo ""
echo "💡 安全提示："
echo "   - 不要将 .env 文件分享给他人"
echo "   - 不要将 .env 文件上传到网盘"
echo "   - 定期更换API Key"
echo "   - 运行 node security-check.js 进行安全检查"
echo ""






























