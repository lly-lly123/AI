#!/usr/bin/env bash
# ==========================================
# 智鸽PigeonAI - 一键启动预览脚本
# 功能：自动启动本地服务器并打开浏览器，模拟真实网络访问场景
# ==========================================

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8000
LOCAL_URL="http://localhost:${PORT}"
REMOTE_URL=""  # 如果已部署，可以设置远程URL，例如：https://your-domain.vercel.app

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查端口是否被占用
check_port() {
    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 检查Python是否可用
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        return 0
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        return 0
    else
        return 1
    fi
}

# 启动本地服务器
start_local_server() {
    print_info "正在启动本地服务器..."
    
    if ! check_python; then
        print_error "未找到Python，无法启动本地服务器"
        print_info "请安装Python 3或使用已部署的远程URL"
        return 1
    fi
    
    if check_port; then
        print_warning "端口 ${PORT} 已被占用，可能已有服务器在运行"
        print_info "尝试使用现有服务器..."
        return 0
    fi
    
    # 启动Python HTTP服务器（后台运行）
    cd "$SCRIPT_DIR"
    $PYTHON_CMD -m http.server ${PORT} > /dev/null 2>&1 &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 2
    
    # 检查服务器是否成功启动
    if check_port; then
        print_success "本地服务器已启动 (PID: ${SERVER_PID})"
        print_info "服务器地址: ${LOCAL_URL}"
        echo $SERVER_PID > /tmp/pigeonai_server.pid
        return 0
    else
        print_error "服务器启动失败"
        return 1
    fi
}

# 打开浏览器
open_browser() {
    local url=$1
    print_info "正在打开浏览器访问: ${url}"
    
    # macOS使用open命令打开浏览器
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url"
        print_success "浏览器已打开"
    # Linux使用xdg-open
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$url" 2>/dev/null || sensible-browser "$url" 2>/dev/null || \
        print_warning "请手动在浏览器中打开: ${url}"
    # Windows使用start命令
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start "$url"
        print_success "浏览器已打开"
    else
        print_warning "无法自动打开浏览器，请手动访问: ${url}"
    fi
}

# 打开多个页面（PC端、移动端、预览）
open_all_pages() {
    local base_url=$1
    
    print_info "正在打开所有页面..."
    
    # 1. PC端主站
    print_info "打开PC端主站..."
    open_browser "${base_url}/index.html"
    sleep 1
    
    # 2. 移动端
    print_info "打开移动端..."
    open_browser "${base_url}/mobile.html"
    sleep 1
    
    # 3. iPhone 15 Pro Max预览
    print_info "打开iPhone 15 Pro Max预览..."
    open_browser "${base_url}/iPhone15预览.html"
    sleep 1
    
    # 4. 智能管理系统（后台）
    print_info "打开智能管理系统..."
    open_browser "${base_url}/admin.html"
    
    print_success "所有页面已打开"
}

# 显示服务器信息
show_server_info() {
    local url=$1
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "服务器运行中！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 访问地址："
    echo "   PC端主站:     ${url}/index.html"
    echo "   移动端:       ${url}/mobile.html"
    echo "   iPhone预览:   ${url}/iPhone15预览.html"
    echo "   智能管理:     ${url}/admin.html"
    echo ""
    echo "💡 提示："
    echo "   - 按 Ctrl+C 停止服务器"
    echo "   - 浏览器会自动打开所有页面"
    echo "   - 修改代码后刷新浏览器即可看到更新"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 清理函数（退出时调用）
cleanup() {
    if [ -f /tmp/pigeonai_server.pid ]; then
        SERVER_PID=$(cat /tmp/pigeonai_server.pid)
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            print_info "正在停止服务器 (PID: ${SERVER_PID})..."
            kill $SERVER_PID 2>/dev/null || true
            rm -f /tmp/pigeonai_server.pid
            print_success "服务器已停止"
        fi
    fi
}

# 注册清理函数
trap cleanup EXIT INT TERM

# 主函数
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 智鸽PigeonAI - 一键启动预览"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 检查是否使用远程URL
    if [ -n "$REMOTE_URL" ]; then
        print_info "使用已部署的远程URL: ${REMOTE_URL}"
        open_all_pages "$REMOTE_URL"
        show_server_info "$REMOTE_URL"
        print_info "按任意键退出..."
        read -n 1 -s
        exit 0
    fi
    
    # 启动本地服务器
    if start_local_server; then
        # 等待服务器完全启动
        sleep 1
        
        # 打开所有页面
        open_all_pages "$LOCAL_URL"
        
        # 显示服务器信息
        show_server_info "$LOCAL_URL"
        
        # 保持服务器运行
        print_info "服务器正在运行中，按 Ctrl+C 停止..."
        wait
    else
        print_error "无法启动服务器"
        print_info "请检查："
        print_info "  1. Python是否已安装"
        print_info "  2. 端口 ${PORT} 是否被占用"
        print_info "  3. 或设置 REMOTE_URL 使用已部署的URL"
        exit 1
    fi
}

# 运行主函数
main















































































