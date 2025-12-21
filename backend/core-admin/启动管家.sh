#!/bin/bash

# 智鸽·中枢管家启动脚本

echo "🤖 启动智鸽·中枢管家..."

cd "$(dirname "$0")"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo "🚀 启动服务..."
node src/index.js








