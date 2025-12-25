#!/bin/bash

# ==========================================
# Evo助手和管家AI功能测试脚本
# ==========================================

echo "🧪 Evo助手和管家AI功能测试"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取后端API地址
read -p "请输入后端API地址（默认: http://localhost:3000）: " API_URL
API_URL=${API_URL:-http://localhost:3000}

echo ""
echo "📋 测试配置："
echo "API地址: $API_URL"
echo ""

# 检查是否已登录
echo "🔐 步骤1：检查登录状态"
echo "=================================="

# 尝试从localStorage获取token（需要用户手动提供）
read -p "请输入您的认证Token（从浏览器localStorage获取auth_token，或按回车跳过）: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ 未提供Token，将测试未登录状态${NC}"
    echo ""
    echo "💡 提示：要测试完整功能，需要："
    echo "1. 在浏览器中登录系统"
    echo "2. 打开开发者工具（F12）"
    echo "3. 在Console中运行：localStorage.getItem('auth_token')"
    echo "4. 复制返回的token值"
    echo ""
    read -p "是否继续测试？（y/n）: " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 0
    fi
fi

echo ""

# 测试1：检查Evo API端点
echo "🔍 测试1：检查Evo API端点"
echo "=================================="

echo "正在测试: GET $API_URL/api/evo/model-info"
MODEL_INFO_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/api/evo/model-info" 2>/dev/null)
HTTP_CODE=$(echo "$MODEL_INFO_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$MODEL_INFO_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Evo API端点可访问${NC}"
    echo "响应内容:"
    echo "$RESPONSE_BODY" | head -20
else
    echo -e "${RED}❌ Evo API端点访问失败 (HTTP $HTTP_CODE)${NC}"
    echo "响应内容:"
    echo "$RESPONSE_BODY"
fi

echo ""

# 测试2：测试Evo聊天功能（如果提供了token）
if [ -n "$AUTH_TOKEN" ]; then
    echo "💬 测试2：测试Evo智能回答功能"
    echo "=================================="
    
    TEST_QUESTION="你好，请介绍一下你自己"
    echo "测试问题: $TEST_QUESTION"
    echo ""
    
    echo "正在调用: POST $API_URL/api/evo/chat"
    CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/evo/chat" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{\"question\": \"$TEST_QUESTION\", \"history\": [], \"context\": {}}" 2>/dev/null)
    
    HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$CHAT_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Evo聊天功能正常${NC}"
        echo ""
        echo "AI回复:"
        echo "$RESPONSE_BODY" | grep -o '"text":"[^"]*"' | head -1 | sed 's/"text":"\(.*\)"/\1/'
        echo ""
        echo "完整响应:"
        echo "$RESPONSE_BODY" | head -30
    else
        echo -e "${RED}❌ Evo聊天功能失败 (HTTP $HTTP_CODE)${NC}"
        echo "响应内容:"
        echo "$RESPONSE_BODY"
    fi
else
    echo -e "${YELLOW}⚠️ 跳过聊天测试（需要Token）${NC}"
fi

echo ""

# 测试3：检查AI服务配置
echo "🔧 测试3：检查AI服务配置"
echo "=================================="

echo "检查后端AI服务配置..."
echo ""

# 检查智谱API配置
echo "📋 智谱AI配置检查："
if [ -f "backend/.env" ]; then
    if grep -q "ZHIPU_API_KEY" backend/.env; then
        echo -e "${GREEN}✅ 智谱API Key已配置${NC}"
    else
        echo -e "${YELLOW}⚠️ 智谱API Key未配置${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ 未找到.env文件${NC}"
fi

echo ""

# 测试4：检查前端Evo助手代码
echo "📱 测试4：检查前端Evo助手代码"
echo "=================================="

echo "检查前端文件中的Evo助手代码..."

if grep -q "evo.*chat\|chatWithBackendAPI" index.html mobile.html admin.html 2>/dev/null; then
    echo -e "${GREEN}✅ 前端Evo助手代码已集成${NC}"
    echo ""
    echo "找到的Evo相关代码："
    grep -l "evo.*chat\|chatWithBackendAPI" index.html mobile.html admin.html 2>/dev/null | head -5
else
    echo -e "${YELLOW}⚠️ 未找到Evo助手相关代码${NC}"
fi

echo ""

# 测试5：检查zhipu-api-proxy
echo "🔌 测试5：检查智谱API代理"
echo "=================================="

if [ -f "js/zhipu-api-proxy.js" ]; then
    echo -e "${GREEN}✅ 智谱API代理文件存在${NC}"
    echo ""
    echo "检查API代理功能..."
    if grep -q "callZhipuAPI\|ZhipuAPIProxy" js/zhipu-api-proxy.js; then
        echo -e "${GREEN}✅ API代理功能已实现${NC}"
    else
        echo -e "${YELLOW}⚠️ API代理功能可能不完整${NC}"
    fi
else
    echo -e "${RED}❌ 智谱API代理文件不存在${NC}"
fi

echo ""

# 总结
echo "=================================="
echo "📊 测试总结"
echo "=================================="
echo ""
echo "✅ 已完成的检查："
echo "  1. Evo API端点可访问性"
if [ -n "$AUTH_TOKEN" ]; then
    echo "  2. Evo聊天功能"
fi
echo "  3. AI服务配置"
echo "  4. 前端Evo助手代码"
echo "  5. 智谱API代理"
echo ""
echo "📝 下一步操作："
echo "  1. 在浏览器中打开网站"
echo "  2. 登录系统"
echo "  3. 点击右下角的Evo助手图标（🕊️）"
echo "  4. 输入问题测试AI回答"
echo ""
echo "💡 如果AI无法回答，请检查："
echo "  1. 智谱API Key是否已配置"
echo "  2. 后端服务是否正常运行"
echo "  3. 网络连接是否正常"
echo ""

