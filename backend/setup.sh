#!/bin/bash

echo "=========================================="
echo "信鸽系统后台服务 - 快速设置"
echo "=========================================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js (>=14.0.0)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 创建.env文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建.env配置文件..."
    cp config.example.env .env
    echo "✅ .env文件已创建，请根据需要修改配置"
else
    echo "✅ .env文件已存在"
fi

# 创建logs目录
if [ ! -d logs ]; then
    echo "📁 创建logs目录..."
    mkdir -p logs
    echo "✅ logs目录已创建"
else
    echo "✅ logs目录已存在"
fi

# 安装依赖
if [ ! -d node_modules ]; then
    echo "📦 安装依赖包..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装完成"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "=========================================="
echo "✅ 设置完成！"
echo "=========================================="
echo ""
echo "启动服务："
echo "  开发模式: npm run dev"
echo "  生产模式: npm start"
echo ""
echo "服务将在 http://localhost:3000 启动"
echo ""






