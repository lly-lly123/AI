#!/bin/bash

# 后端服务启动脚本

echo "🚀 启动后端服务..."
echo ""

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在backend目录下运行此脚本"
    echo "   当前目录: $(pwd)"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 检测到依赖未安装，正在安装..."
    npm install
    echo ""
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件，从config.example.env创建..."
    if [ -f "config.example.env" ]; then
        cp config.example.env .env
        echo "✅ 已创建.env文件"
    fi
    echo ""
fi

# 启动服务
echo "✅ 启动后端服务..."
echo "   服务地址: http://localhost:3000"
echo "   API地址: http://localhost:3000/api"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm start


# 后端服务启动脚本

echo "🚀 启动后端服务..."
echo ""

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在backend目录下运行此脚本"
    echo "   当前目录: $(pwd)"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 检测到依赖未安装，正在安装..."
    npm install
    echo ""
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件，从config.example.env创建..."
    if [ -f "config.example.env" ]; then
        cp config.example.env .env
        echo "✅ 已创建.env文件"
    fi
    echo ""
fi

# 启动服务
echo "✅ 启动后端服务..."
echo "   服务地址: http://localhost:3000"
echo "   API地址: http://localhost:3000/api"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm start


# 后端服务启动脚本

echo "🚀 启动后端服务..."
echo ""

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "❌ 错误：请在backend目录下运行此脚本"
    echo "   当前目录: $(pwd)"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 检测到依赖未安装，正在安装..."
    npm install
    echo ""
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到.env文件，从config.example.env创建..."
    if [ -f "config.example.env" ]; then
        cp config.example.env .env
        echo "✅ 已创建.env文件"
    fi
    echo ""
fi

# 启动服务
echo "✅ 启动后端服务..."
echo "   服务地址: http://localhost:3000"
echo "   API地址: http://localhost:3000/api"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm start

