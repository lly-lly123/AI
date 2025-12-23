#!/bin/bash

# 通用后端一键启动脚本（可在仓库任意位置运行）
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"

echo "🚀 正在准备启动后端..."

# 确认目录存在
if [ ! -d "$BACKEND_DIR" ] || [ ! -f "$BACKEND_DIR/server.js" ]; then
  echo "❌ 未找到 backend 服务目录，请确认仓库结构。" >&2
  exit 1
fi

# 检查 Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未检测到 Node.js，请先安装后重试。" >&2
  exit 1
fi

cd "$BACKEND_DIR"

# 安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 正在安装依赖（npm install）..."
  npm install
fi

# 准备环境变量
if [ ! -f ".env" ] && [ -f "config.example.env" ]; then
  echo "⚙️  未检测到 .env，已从 config.example.env 生成默认配置。"
  cp config.example.env .env
fi

# 可选：运行配置检查
if [ -f "verify-config.js" ]; then
  echo "🔍 正在校验配置..."
  node verify-config.js || true
fi

echo ""
echo "✅ 环境就绪，启动服务中..."
echo "   后端地址: http://localhost:3000"
echo "   API 根路径: http://localhost:3000/api"
echo "   终止服务请使用 Ctrl+C"
echo ""

npm start




















