#!/bin/bash

# 🔍 网络连接诊断脚本

echo "🔍 开始诊断网络连接..."
echo ""

# 检查基本网络连接
echo "1️⃣ 检查基本网络连接..."
if ping -c 2 8.8.8.8 > /dev/null 2>&1; then
    echo "   ✅ 可以连接到互联网"
else
    echo "   ❌ 无法连接到互联网"
    echo "   💡 请检查网络设置"
    exit 1
fi
echo ""

# 检查DNS解析
echo "2️⃣ 检查DNS解析..."
if nslookup github.com > /dev/null 2>&1; then
    echo "   ✅ 可以解析github.com域名"
    GITHUB_IP=$(nslookup github.com 2>/dev/null | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
    echo "   📍 GitHub IP地址: $GITHUB_IP"
else
    echo "   ❌ 无法解析github.com域名"
    echo "   💡 可能是DNS问题，尝试使用8.8.8.8作为DNS服务器"
fi
echo ""

# 检查GitHub连接
echo "3️⃣ 检查GitHub连接..."
if curl -I --connect-timeout 5 https://github.com > /dev/null 2>&1; then
    echo "   ✅ 可以访问GitHub (HTTPS)"
else
    echo "   ❌ 无法访问GitHub (HTTPS)"
    echo "   💡 可能需要使用代理或VPN"
fi
echo ""

# 检查443端口
echo "4️⃣ 检查443端口连接..."
if nc -z -v -w 5 github.com 443 2>&1 | grep -q "succeeded"; then
    echo "   ✅ 443端口可以连接"
else
    echo "   ❌ 443端口无法连接"
    echo "   💡 可能是防火墙阻止了连接"
fi
echo ""

# 检查代理设置
echo "5️⃣ 检查代理设置..."
if [ -n "$http_proxy" ] || [ -n "$HTTP_PROXY" ]; then
    echo "   ✅ 检测到HTTP代理: ${http_proxy:-$HTTP_PROXY}"
else
    echo "   ⚠️  未检测到HTTP代理"
fi

if [ -n "$https_proxy" ] || [ -n "$HTTPS_PROXY" ]; then
    echo "   ✅ 检测到HTTPS代理: ${https_proxy:-$HTTPS_PROXY}"
else
    echo "   ⚠️  未检测到HTTPS代理"
fi

if [ -n "$all_proxy" ] || [ -n "$ALL_PROXY" ]; then
    echo "   ✅ 检测到全局代理: ${all_proxy:-$ALL_PROXY}"
fi
echo ""

# 检查Git代理配置
echo "6️⃣ 检查Git代理配置..."
GIT_HTTP_PROXY=$(git config --global http.proxy 2>/dev/null)
GIT_HTTPS_PROXY=$(git config --global https.proxy 2>/dev/null)

if [ -n "$GIT_HTTP_PROXY" ]; then
    echo "   ✅ Git HTTP代理: $GIT_HTTP_PROXY"
else
    echo "   ⚠️  未配置Git HTTP代理"
fi

if [ -n "$GIT_HTTPS_PROXY" ]; then
    echo "   ✅ Git HTTPS代理: $GIT_HTTPS_PROXY"
else
    echo "   ⚠️  未配置Git HTTPS代理"
fi
echo ""

echo "📋 诊断完成！"
echo ""
echo "💡 建议："
echo "   1. 如果无法连接GitHub，尝试使用VPN或代理"
echo "   2. 检查防火墙设置"
echo "   3. 稍后重试（代码已保存在本地，不会丢失）"
echo "   4. 如果使用代理，运行: ./配置Git代理.sh"




















