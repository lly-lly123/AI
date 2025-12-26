#!/bin/bash

# ==========================================
# MinIO一键配置脚本（新手友好版）
# ==========================================

echo "🚀 MinIO一键配置脚本（新手友好版）"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1：获取MinIO服务信息
echo "📋 步骤1：配置MinIO服务信息"
echo ""

read -p "请输入MinIO服务地址（从Zeabur的Networking页面获取，例如: http://minio-xxxxx.zeabur.app:9000）: " MINIO_ENDPOINT

if [ -z "$MINIO_ENDPOINT" ]; then
    echo -e "${RED}❌ 错误：服务地址不能为空${NC}"
    exit 1
fi

echo ""
read -p "请输入MinIO用户名（从Zeabur的Instructions页面获取，通常是minioadmin）: " MINIO_ACCESS_KEY
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}

echo ""
read -p "请输入MinIO密码（从Zeabur的Instructions页面获取）: " MINIO_SECRET_KEY

if [ -z "$MINIO_SECRET_KEY" ]; then
    echo -e "${RED}❌ 错误：密码不能为空${NC}"
    exit 1
fi

echo ""
read -p "请输入存储桶名称（默认: pigeonai）: " MINIO_BUCKET
MINIO_BUCKET=${MINIO_BUCKET:-pigeonai}

echo ""
echo -e "${GREEN}✅ 配置信息已收集${NC}"
echo ""

# 步骤2：显示配置信息
echo "📝 配置信息汇总："
echo "=================================="
echo "MinIO Endpoint: $MINIO_ENDPOINT"
echo "MinIO Access Key: $MINIO_ACCESS_KEY"
echo "MinIO Secret Key: ${MINIO_SECRET_KEY:0:3}***（已隐藏）"
echo "MinIO Bucket: $MINIO_BUCKET"
echo "=================================="
echo ""

# 步骤3：生成环境变量配置
echo "📋 步骤2：生成环境变量配置"
echo ""

ENV_CONFIG="
# ==========================================
# MinIO配置（文件存储）
# ==========================================
MINIO_ENDPOINT=$MINIO_ENDPOINT
MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
MINIO_SECRET_KEY=$MINIO_SECRET_KEY
MINIO_BUCKET=$MINIO_BUCKET
MINIO_USE_SSL=false
"

echo "$ENV_CONFIG" > minio-env-config.txt

echo -e "${GREEN}✅ 环境变量配置已保存到: minio-env-config.txt${NC}"
echo ""

# 步骤4：显示下一步操作
echo "📋 步骤3：在Zeabur中配置环境变量"
echo ""
echo "请按照以下步骤操作："
echo ""
echo "1. 打开Zeabur控制台：https://zeabur.com"
echo "2. 进入您的主应用服务（不是MinIO服务）"
echo "3. 点击 'Variable' 或 '环境变量' 标签"
echo "4. 点击 'Add Variable' 或 '添加变量'"
echo "5. 逐个添加以下环境变量："
echo ""
echo "$ENV_CONFIG"
echo ""

# 步骤5：提供复制命令
echo "💡 提示："
echo "=================================="
echo "您可以直接复制上面的环境变量配置"
echo "或者使用以下命令查看配置文件："
echo ""
echo "  cat minio-env-config.txt"
echo ""
echo "=================================="
echo ""

# 步骤6：测试连接（可选）
read -p "是否要测试MinIO连接？(y/n，默认n): " TEST_CONNECTION
TEST_CONNECTION=${TEST_CONNECTION:-n}

if [ "$TEST_CONNECTION" = "y" ] || [ "$TEST_CONNECTION" = "Y" ]; then
    echo ""
    echo "🧪 测试MinIO连接..."
    echo ""
    
    # 检查是否安装了curl
    if ! command -v curl &> /dev/null; then
        echo -e "${YELLOW}⚠️ 未安装curl，跳过连接测试${NC}"
    else
        # 测试连接
        echo "正在测试连接到: $MINIO_ENDPOINT"
        if curl -s --max-time 5 "$MINIO_ENDPOINT" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MinIO服务连接成功！${NC}"
        else
            echo -e "${YELLOW}⚠️ 无法连接到MinIO服务，请检查：${NC}"
            echo "  1. 服务地址是否正确"
            echo "  2. MinIO服务是否正在运行"
            echo "  3. 网络连接是否正常"
        fi
    fi
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ 配置完成！${NC}"
echo "=================================="
echo ""
echo "📝 下一步操作："
echo "1. 在Zeabur主服务中添加环境变量（见上面的配置）"
echo "2. 重启主服务"
echo "3. 查看日志确认MinIO已初始化"
echo ""
echo "📖 详细说明请查看：MinIO部署完整步骤.md"
echo ""



























