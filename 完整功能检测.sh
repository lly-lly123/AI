#!/usr/bin/env bash
# ==========================================
# 智鸽PigeonAI - 完整功能检测脚本
# 整合所有检测功能，提供完整报告
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="${1:-http://localhost:8000}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 智鸽PigeonAI - 完整功能检测"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 运行网站功能检测
echo "📋 步骤1: 运行网站功能检测..."
echo ""
"${SCRIPT_DIR}/网站功能检测.sh" "$BASE_URL"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 运行API功能检测（如果Node.js可用）
if command -v node &> /dev/null; then
    echo "📋 步骤2: 运行API功能检测..."
    echo ""
    node "${SCRIPT_DIR}/API功能检测.js"
else
    echo "⚠️  Node.js未安装，跳过API功能检测"
    echo "   提示: 安装Node.js后可运行更详细的API检测"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 完整检测已完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""








































