#!/bin/bash

# ==========================================
# 超大容量永久免费云存储配置脚本
# ==========================================

echo "🚀 开始配置超大容量永久免费云存储..."
echo ""

# 检查当前目录
if [ ! -f "backend/package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

echo "📋 配置选项："
echo "1. Cloudflare R2（永久免费10GB，推荐）"
echo "2. MinIO自托管（完全免费，容量无限制）"
echo "3. 组合方案（R2 + MinIO，最大容量和可靠性）"
echo ""
read -p "请选择配置方案 (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "📝 配置 Cloudflare R2..."
        echo ""
        echo "请按照以下步骤获取配置信息："
        echo "1. 访问 https://dash.cloudflare.com/"
        echo "2. 登录或注册账号"
        echo "3. 进入 R2 → Create bucket"
        echo "4. 创建存储桶并获取API凭证"
        echo ""
        read -p "请输入 Cloudflare R2 Account ID: " R2_ACCOUNT_ID
        read -p "请输入 Cloudflare R2 Access Key ID: " R2_ACCESS_KEY_ID
        read -p "请输入 Cloudflare R2 Secret Access Key: " R2_SECRET_KEY
        read -p "请输入 Cloudflare R2 Bucket Name (默认: pigeonai): " R2_BUCKET
        R2_BUCKET=${R2_BUCKET:-pigeonai}
        
        echo ""
        echo "✅ Cloudflare R2 配置信息："
        echo "CLOUDFLARE_R2_ACCOUNT_ID=$R2_ACCOUNT_ID"
        echo "CLOUDFLARE_R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID"
        echo "CLOUDFLARE_R2_SECRET_ACCESS_KEY=$R2_SECRET_KEY"
        echo "CLOUDFLARE_R2_BUCKET_NAME=$R2_BUCKET"
        echo "CLOUDFLARE_R2_ENDPOINT=https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com"
        echo ""
        echo "📝 请将这些环境变量添加到 Zeabur 环境变量中"
        ;;
    2)
        echo ""
        echo "📝 配置 MinIO 自托管..."
        echo ""
        echo "请按照以下步骤部署 MinIO："
        echo "1. 在 Zeabur 项目中添加新服务"
        echo "2. 选择 Docker 镜像: minio/minio:latest"
        echo "3. 命令: server /data --console-address \":9001\""
        echo "4. 设置环境变量:"
        echo "   MINIO_ROOT_USER=minioadmin"
        echo "   MINIO_ROOT_PASSWORD=你的强密码"
        echo ""
        read -p "请输入 MinIO Endpoint (例如: http://minio-service.zeabur.app:9000): " MINIO_ENDPOINT
        read -p "请输入 MinIO Access Key (默认: minioadmin): " MINIO_ACCESS_KEY
        MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
        read -p "请输入 MinIO Secret Key: " MINIO_SECRET_KEY
        read -p "请输入 MinIO Bucket (默认: pigeonai): " MINIO_BUCKET
        MINIO_BUCKET=${MINIO_BUCKET:-pigeonai}
        
        echo ""
        echo "✅ MinIO 配置信息："
        echo "MINIO_ENDPOINT=$MINIO_ENDPOINT"
        echo "MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY"
        echo "MINIO_SECRET_KEY=$MINIO_SECRET_KEY"
        echo "MINIO_BUCKET=$MINIO_BUCKET"
        echo "MINIO_USE_SSL=false"
        echo ""
        echo "📝 请将这些环境变量添加到 Zeabur 环境变量中"
        ;;
    3)
        echo ""
        echo "📝 配置组合方案（R2 + MinIO）..."
        echo ""
        echo "=== Cloudflare R2 配置 ==="
        read -p "请输入 Cloudflare R2 Account ID: " R2_ACCOUNT_ID
        read -p "请输入 Cloudflare R2 Access Key ID: " R2_ACCESS_KEY_ID
        read -p "请输入 Cloudflare R2 Secret Access Key: " R2_SECRET_KEY
        read -p "请输入 Cloudflare R2 Bucket Name (默认: pigeonai-backup): " R2_BUCKET
        R2_BUCKET=${R2_BUCKET:-pigeonai-backup}
        
        echo ""
        echo "=== MinIO 配置 ==="
        read -p "请输入 MinIO Endpoint: " MINIO_ENDPOINT
        read -p "请输入 MinIO Access Key (默认: minioadmin): " MINIO_ACCESS_KEY
        MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
        read -p "请输入 MinIO Secret Key: " MINIO_SECRET_KEY
        read -p "请输入 MinIO Bucket (默认: pigeonai): " MINIO_BUCKET
        MINIO_BUCKET=${MINIO_BUCKET:-pigeonai}
        
        echo ""
        echo "✅ 组合方案配置信息："
        echo ""
        echo "# Cloudflare R2 (备份存储)"
        echo "CLOUDFLARE_R2_ACCOUNT_ID=$R2_ACCOUNT_ID"
        echo "CLOUDFLARE_R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID"
        echo "CLOUDFLARE_R2_SECRET_ACCESS_KEY=$R2_SECRET_KEY"
        echo "CLOUDFLARE_R2_BUCKET_NAME=$R2_BUCKET"
        echo "CLOUDFLARE_R2_ENDPOINT=https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com"
        echo ""
        echo "# MinIO (主存储)"
        echo "MINIO_ENDPOINT=$MINIO_ENDPOINT"
        echo "MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY"
        echo "MINIO_SECRET_KEY=$MINIO_SECRET_KEY"
        echo "MINIO_BUCKET=$MINIO_BUCKET"
        echo "MINIO_USE_SSL=false"
        echo ""
        echo "📝 请将这些环境变量添加到 Zeabur 环境变量中"
        ;;
    *)
        echo "❌ 无效的选择"
        exit 1
        ;;
esac

echo ""
echo "📦 检查依赖包..."
cd backend

# 检查是否需要安装 AWS SDK（用于 Cloudflare R2）
if [ "$choice" = "1" ] || [ "$choice" = "3" ]; then
    if ! grep -q "@aws-sdk/client-s3" package.json; then
        echo "📥 安装 AWS SDK (用于 Cloudflare R2)..."
        npm install @aws-sdk/client-s3 --save
    else
        echo "✅ AWS SDK 已安装"
    fi
fi

# 检查是否需要安装 MinIO SDK
if [ "$choice" = "2" ] || [ "$choice" = "3" ]; then
    if ! grep -q "minio" package.json; then
        echo "📥 安装 MinIO SDK..."
        npm install minio --save
    else
        echo "✅ MinIO SDK 已安装"
    fi
fi

cd ..

echo ""
echo "✅ 配置完成！"
echo ""
echo "📋 下一步操作："
echo "1. 将上述环境变量添加到 Zeabur 环境变量中"
echo "2. 重启 Zeabur 服务"
echo "3. 查看日志确认存储服务已初始化"
echo ""
echo "📖 详细配置说明请查看：超大容量永久免费云存储配置指南.md"
































