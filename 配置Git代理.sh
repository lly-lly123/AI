#!/bin/bash

# 🔧 配置Git代理脚本

echo "🔧 Git代理配置工具"
echo ""

# 检查当前代理设置
echo "当前Git代理设置："
git config --global --get http.proxy 2>/dev/null && echo "   HTTP代理: $(git config --global http.proxy)" || echo "   HTTP代理: 未设置"
git config --global --get https.proxy 2>/dev/null && echo "   HTTPS代理: $(git config --global https.proxy)" || echo "   HTTPS代理: 未设置"
echo ""

# 选择操作
echo "请选择操作："
echo "1. 设置HTTP/HTTPS代理"
echo "2. 清除代理设置"
echo "3. 使用环境变量中的代理"
echo "4. 退出"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        read -p "请输入HTTP代理地址 (例如: http://127.0.0.1:7890): " http_proxy_url
        read -p "请输入HTTPS代理地址 (直接回车使用HTTP代理): " https_proxy_url
        
        if [ -n "$http_proxy_url" ]; then
            git config --global http.proxy "$http_proxy_url"
            echo "✅ HTTP代理已设置: $http_proxy_url"
        fi
        
        if [ -z "$https_proxy_url" ]; then
            https_proxy_url="$http_proxy_url"
        fi
        
        if [ -n "$https_proxy_url" ]; then
            git config --global https.proxy "$https_proxy_url"
            echo "✅ HTTPS代理已设置: $https_proxy_url"
        fi
        
        echo ""
        echo "📤 现在可以尝试推送代码："
        echo "   git push -u origin main"
        ;;
    2)
        git config --global --unset http.proxy 2>/dev/null
        git config --global --unset https.proxy 2>/dev/null
        echo "✅ 代理设置已清除"
        ;;
    3)
        if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ]; then
            PROXY_URL="${http_proxy:-$HTTP_PROXY}"
            git config --global http.proxy "$PROXY_URL"
            git config --global https.proxy "$PROXY_URL"
            echo "✅ 已使用环境变量中的代理: $PROXY_URL"
        else
            echo "❌ 未找到环境变量中的代理设置"
        fi
        ;;
    4)
        echo "退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac














