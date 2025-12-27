#!/bin/bash

# ============================================================================
# AI服务配置检查脚本
# 用于检查智谱API Key是否正确配置
# ============================================================================

echo "🔍 检查AI服务配置..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查本地.env文件
if [ -f "backend/.env" ]; then
    echo "📁 检查本地 .env 文件..."
    
    # 检查ZHIPU_API_KEY_EVO
    if grep -q "ZHIPU_API_KEY_EVO" backend/.env; then
        EVO_KEY=$(grep "ZHIPU_API_KEY_EVO" backend/.env | cut -d '=' -f2 | tr -d ' ')
        if [ -n "$EVO_KEY" ] && [ "$EVO_KEY" != "" ]; then
            echo -e "${GREEN}✅ ZHIPU_API_KEY_EVO 已配置${NC}"
            echo "   值: ${EVO_KEY:0:20}...${EVO_KEY: -10}"
        else
            echo -e "${YELLOW}⚠️  ZHIPU_API_KEY_EVO 已设置但值为空${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ZHIPU_API_KEY_EVO 未配置${NC}"
    fi
    
    # 检查ZHIPU_API_KEY_ADMIN
    if grep -q "ZHIPU_API_KEY_ADMIN" backend/.env; then
        ADMIN_KEY=$(grep "ZHIPU_API_KEY_ADMIN" backend/.env | cut -d '=' -f2 | tr -d ' ')
        if [ -n "$ADMIN_KEY" ] && [ "$ADMIN_KEY" != "" ]; then
            echo -e "${GREEN}✅ ZHIPU_API_KEY_ADMIN 已配置${NC}"
            echo "   值: ${ADMIN_KEY:0:20}...${ADMIN_KEY: -10}"
        else
            echo -e "${YELLOW}⚠️  ZHIPU_API_KEY_ADMIN 已设置但值为空${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ZHIPU_API_KEY_ADMIN 未配置${NC}"
    fi
    
    # 检查ZHIPU_API_KEY（兼容配置）
    if grep -q "^ZHIPU_API_KEY=" backend/.env; then
        KEY=$(grep "^ZHIPU_API_KEY=" backend/.env | cut -d '=' -f2 | tr -d ' ')
        if [ -n "$KEY" ] && [ "$KEY" != "" ]; then
            echo -e "${GREEN}✅ ZHIPU_API_KEY 已配置（兼容配置）${NC}"
            echo "   值: ${KEY:0:20}...${KEY: -10}"
            echo -e "${YELLOW}   提示：建议使用 ZHIPU_API_KEY_EVO 和 ZHIPU_API_KEY_ADMIN 分别配置${NC}"
        fi
    fi
    
    echo ""
fi

# 检查环境变量
echo "🌍 检查系统环境变量..."

if [ -n "$ZHIPU_API_KEY_EVO" ]; then
    echo -e "${GREEN}✅ ZHIPU_API_KEY_EVO 环境变量已设置${NC}"
    echo "   值: ${ZHIPU_API_KEY_EVO:0:20}...${ZHIPU_API_KEY_EVO: -10}"
else
    echo -e "${YELLOW}⚠️  ZHIPU_API_KEY_EVO 环境变量未设置${NC}"
fi

if [ -n "$ZHIPU_API_KEY_ADMIN" ]; then
    echo -e "${GREEN}✅ ZHIPU_API_KEY_ADMIN 环境变量已设置${NC}"
    echo "   值: ${ZHIPU_API_KEY_ADMIN:0:20}...${ZHIPU_API_KEY_ADMIN: -10}"
else
    echo -e "${YELLOW}⚠️  ZHIPU_API_KEY_ADMIN 环境变量未设置${NC}"
fi

if [ -n "$ZHIPU_API_KEY" ]; then
    echo -e "${GREEN}✅ ZHIPU_API_KEY 环境变量已设置（兼容配置）${NC}"
    echo "   值: ${ZHIPU_API_KEY:0:20}...${ZHIPU_API_KEY: -10}"
fi

echo ""

# 检查后端服务是否运行
echo "🔌 检查后端服务..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务正在运行${NC}"
    
    # 测试AI模型信息接口
    echo ""
    echo "🧪 测试AI服务..."
    MODEL_INFO=$(curl -s http://localhost:3000/api/evo/model-info 2>/dev/null)
    
    if [ -n "$MODEL_INFO" ]; then
        echo -e "${GREEN}✅ AI服务接口可访问${NC}"
        echo "   响应: $MODEL_INFO" | head -c 200
        echo "..."
        
        # 检查是否使用了智谱AI
        if echo "$MODEL_INFO" | grep -q "智谱AI\|ZhipuAI"; then
            echo -e "${GREEN}✅ 已使用智谱AI服务${NC}"
        else
            echo -e "${YELLOW}⚠️  未使用智谱AI服务（可能使用了其他AI服务或本地逻辑）${NC}"
        fi
    else
        echo -e "${RED}❌ AI服务接口不可访问${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  后端服务未运行（请先启动后端服务）${NC}"
    echo "   运行命令: cd backend && npm start"
fi

echo ""
echo "============================================================================"
echo "📋 配置建议："
echo ""
echo "1. 如果使用Zeabur部署："
echo "   - 在Zeabur控制台添加环境变量"
echo "   - 变量名：ZHIPU_API_KEY_EVO 和 ZHIPU_API_KEY_ADMIN"
echo "   - 保存后会自动重新部署"
echo ""
echo "2. 如果本地开发："
echo "   - 在 backend/.env 文件中添加："
echo "     ZHIPU_API_KEY_EVO=你的API_Key"
echo "     ZHIPU_API_KEY_ADMIN=你的API_Key"
echo "   - 重启后端服务"
echo ""
echo "3. 获取API Key："
echo "   - 访问：https://open.bigmodel.cn/"
echo "   - 注册/登录后创建API Key"
echo ""
echo "============================================================================"
echo ""
echo "📖 详细配置说明请查看：AI服务配置完整指南.md"
echo ""








































