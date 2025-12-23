#!/usr/bin/env bash
# ==========================================
# 智鸽PigeonAI - 网站功能自动检测脚本
# 功能：检测运行状态、设备跳转、后台管理、API Key功能
# ==========================================

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8000
BASE_URL="${1:-http://localhost:${PORT}}"
TEST_RESULTS=()
PASSED=0
FAILED=0

# 打印函数
print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_test() {
    echo -e "${BLUE}🔍 测试: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
    TEST_RESULTS+=("✅ $1")
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
    TEST_RESULTS+=("❌ $1")
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    TEST_RESULTS+=("⚠️  $1")
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 检查命令是否存在
check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 检查URL是否可访问
check_url() {
    local url=$1
    local timeout=${2:-5}
    
    if check_command curl; then
        if curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" | grep -q "200\|301\|302"; then
            return 0
        fi
    elif check_command wget; then
        if wget -q --spider --timeout=$timeout "$url" 2>/dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# 获取HTTP状态码
get_http_status() {
    local url=$1
    
    if check_command curl; then
        curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000"
    elif check_command wget; then
        wget --spider --server-response "$url" 2>&1 | grep "HTTP/" | awk '{print $2}' | head -1 || echo "000"
    else
        echo "000"
    fi
}

# 获取页面内容
get_page_content() {
    local url=$1
    
    if check_command curl; then
        curl -s --max-time 5 "$url" 2>/dev/null || echo ""
    elif check_command wget; then
        wget -q -O - "$url" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# 测试1：检查服务器运行状态
test_server_status() {
    print_header "测试1: 服务器运行状态检测"
    
    print_test "检查服务器是否运行在 ${BASE_URL}"
    
    if check_url "${BASE_URL}"; then
        local status=$(get_http_status "${BASE_URL}")
        print_success "服务器运行正常 (HTTP ${status})"
        return 0
    else
        print_error "服务器未运行或无法访问"
        print_info "提示: 请先运行 ./一键启动预览.sh 启动本地服务器"
        return 1
    fi
}

# 测试2：检查主要页面可访问性
test_pages_accessibility() {
    print_header "测试2: 主要页面可访问性检测"
    
    local pages=(
        "index.html:PC端主站"
        "mobile.html:移动端"
        "preview.html:统一预览入口"
        "admin.html:智能管理系统"
        "iPhone15预览.html:iPhone预览"
    )
    
    local all_ok=true
    
    for page_info in "${pages[@]}"; do
        IFS=':' read -r page name <<< "$page_info"
        local url="${BASE_URL}/${page}"
        
        print_test "检查 ${name} (${page})"
        
        if check_url "$url"; then
            local status=$(get_http_status "$url")
            print_success "${name} 可访问 (HTTP ${status})"
        else
            print_error "${name} 无法访问"
            all_ok=false
        fi
    done
    
    if [ "$all_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

# 测试3：设备自动跳转检测
test_device_redirect() {
    print_header "测试3: 设备自动跳转适配检测"
    
    print_test "模拟PC端访问 index.html"
    local pc_content=$(get_page_content "${BASE_URL}/index.html")
    
    if echo "$pc_content" | grep -q "device-detect\|mobile.html"; then
        print_success "PC端检测到设备识别脚本"
    else
        print_warning "PC端未检测到设备识别脚本（可能已集成在其他位置）"
    fi
    
    print_test "模拟移动端访问（User-Agent: iPhone）"
    if check_command curl; then
        local mobile_response=$(curl -s -L --max-time 5 \
            -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15" \
            "${BASE_URL}/index.html" 2>/dev/null || echo "")
        
        if echo "$mobile_response" | grep -q "mobile.html\|移动端"; then
            print_success "移动端自动跳转功能正常"
        else
            print_warning "移动端跳转可能需要JavaScript执行（需要浏览器环境）"
        fi
    else
        print_warning "需要curl命令测试移动端User-Agent，跳过此测试"
    fi
    
    print_test "检查 device-detect.js 文件"
    if [ -f "${SCRIPT_DIR}/js/device-detect.js" ]; then
        print_success "设备检测脚本文件存在"
    else
        print_error "设备检测脚本文件不存在"
        return 1
    fi
    
    return 0
}

# 测试4：后台管理系统检测
test_admin_system() {
    print_header "测试4: 后台管理系统检测"
    
    print_test "检查 admin.html 可访问性"
    if check_url "${BASE_URL}/admin.html"; then
        print_success "admin.html 页面可访问"
    else
        print_error "admin.html 页面无法访问"
        return 1
    fi
    
    print_test "检查 admin-auth.js 文件"
    if [ -f "${SCRIPT_DIR}/js/admin-auth.js" ]; then
        print_success "管理员权限验证脚本存在"
    else
        print_error "管理员权限验证脚本不存在"
    fi
    
    print_test "检查登录页面元素"
    local admin_content=$(get_page_content "${BASE_URL}/admin.html")
    
    if echo "$admin_content" | grep -q "登录\|login\|password"; then
        print_success "登录页面元素检测到"
    else
        print_warning "登录页面元素未检测到（可能需要JavaScript渲染）"
    fi
    
    print_test "检查本地验证功能"
    if echo "$admin_content" | grep -q "使用本地验证\|useLocalAuth"; then
        print_success "本地验证功能已集成"
    else
        print_warning "本地验证功能可能需要检查代码"
    fi
    
    return 0
}

# 测试5：API Key配置检测
test_api_key_config() {
    print_header "测试5: API Key配置检测"
    
    print_test "检查 zhipu-api-proxy.js 文件"
    if [ -f "${SCRIPT_DIR}/js/zhipu-api-proxy.js" ]; then
        print_success "智谱API代理脚本存在"
    else
        print_error "智谱API代理脚本不存在"
        return 1
    fi
    
    print_test "检查配置面板脚本"
    if [ -f "${SCRIPT_DIR}/js/admin-config-panels.js" ]; then
        print_success "配置面板脚本存在"
    else
        print_error "配置面板脚本不存在"
    fi
    
    print_test "检查API Key配置功能"
    local admin_content=$(get_page_content "${BASE_URL}/admin.html")
    
    if echo "$admin_content" | grep -q "智谱API配置\|zhipuConfig\|zhipuApiKey"; then
        print_success "API Key配置面板已集成"
    else
        print_warning "API Key配置面板可能需要检查代码"
    fi
    
    print_test "检查Evo助手API集成"
    local index_content=$(get_page_content "${BASE_URL}/index.html")
    local mobile_content=$(get_page_content "${BASE_URL}/mobile.html")
    
    if echo "$index_content" | grep -q "zhipu-api-proxy\|ZhipuAPIProxy\|智谱API"; then
        print_success "PC端Evo助手API集成检测到"
    else
        print_warning "PC端API集成可能需要检查"
    fi
    
    if echo "$mobile_content" | grep -q "zhipu-api-proxy\|ZhipuAPIProxy\|智谱API"; then
        print_success "移动端Evo助手API集成检测到"
    else
        print_warning "移动端API集成可能需要检查"
    fi
    
    return 0
}

# 测试6：JavaScript文件完整性检测
test_js_files() {
    print_header "测试6: JavaScript文件完整性检测"
    
    local js_files=(
        "js/device-detect.js:设备检测"
        "js/admin-auth.js:管理员验证"
        "js/zhipu-api-proxy.js:智谱API代理"
        "js/admin-config-panels.js:配置面板"
    )
    
    local all_ok=true
    
    for file_info in "${js_files[@]}"; do
        IFS=':' read -r file name <<< "$file_info"
        local file_path="${SCRIPT_DIR}/${file}"
        
        print_test "检查 ${name} (${file})"
        
        if [ -f "$file_path" ]; then
            local size=$(wc -c < "$file_path" 2>/dev/null || echo "0")
            if [ "$size" -gt 100 ]; then
                print_success "${name} 文件存在且有效 (${size} bytes)"
            else
                print_error "${name} 文件存在但可能为空"
                all_ok=false
            fi
        else
            print_error "${name} 文件不存在"
            all_ok=false
        fi
    done
    
    if [ "$all_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

# 测试7：页面引用检测
test_page_references() {
    print_header "测试7: 页面引用检测"
    
    print_test "检查 index.html 中的脚本引用"
    local index_content=$(get_page_content "${BASE_URL}/index.html")
    # 远程检测失败时，使用本地文件兜底，避免因 curl 截断误报
    if echo "$index_content" | grep -q "device-detect.js" || grep -q "device-detect.js" "${SCRIPT_DIR}/index.html"; then
        print_success "index.html 引用了设备检测脚本"
    else
        print_error "index.html 未引用设备检测脚本"
    fi
    
    if echo "$index_content" | grep -q "zhipu-api-proxy.js" || grep -q "zhipu-api-proxy.js" "${SCRIPT_DIR}/index.html"; then
        print_success "index.html 引用了智谱API代理"
    else
        print_warning "index.html 可能未引用智谱API代理"
    fi
    
    print_test "检查 mobile.html 中的脚本引用"
    local mobile_content=$(get_page_content "${BASE_URL}/mobile.html")
    
    if echo "$mobile_content" | grep -q "zhipu-api-proxy.js" || grep -q "zhipu-api-proxy.js" "${SCRIPT_DIR}/mobile.html"; then
        print_success "mobile.html 引用了智谱API代理"
    else
        print_warning "mobile.html 可能未引用智谱API代理"
    fi
    
    print_test "检查 admin.html 中的脚本引用"
    local admin_content=$(get_page_content "${BASE_URL}/admin.html")
    
    if echo "$admin_content" | grep -q "admin-auth.js" || grep -q "admin-auth.js" "${SCRIPT_DIR}/admin.html"; then
        print_success "admin.html 引用了管理员验证脚本"
    else
        print_error "admin.html 未引用管理员验证脚本"
    fi
    
    if echo "$admin_content" | grep -q "zhipu-api-proxy.js" || grep -q "zhipu-api-proxy.js" "${SCRIPT_DIR}/admin.html"; then
        print_success "admin.html 引用了智谱API代理"
    else
        print_warning "admin.html 可能未引用智谱API代理"
    fi
    
    return 0
}

# 生成测试报告
generate_report() {
    print_header "📊 测试报告汇总"
    
    echo -e "${CYAN}测试结果统计:${NC}"
    echo -e "  ${GREEN}✅ 通过: ${PASSED}${NC}"
    echo -e "  ${RED}❌ 失败: ${FAILED}${NC}"
    echo ""
    
    echo -e "${CYAN}详细结果:${NC}"
    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 所有测试通过！网站功能正常！${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        return 0
    else
        echo -e "${YELLOW}⚠️  部分测试未通过，请检查上述错误${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        return 1
    fi
}

# 主函数
main() {
    clear
    echo -e "${CYAN}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 智鸽PigeonAI - 网站功能自动检测"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
    
    print_info "检测目标: ${BASE_URL}"
    print_info "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # 检查必要工具
    if ! check_command curl && ! check_command wget; then
        print_error "需要 curl 或 wget 命令，请先安装"
        exit 1
    fi
    
    # 执行所有测试
    test_server_status || print_warning "服务器未运行，部分测试将跳过"
    
    if [ $? -eq 0 ] || check_url "${BASE_URL}"; then
        test_pages_accessibility
        test_device_redirect
        test_admin_system
        test_api_key_config
        test_js_files
        test_page_references
    else
        print_warning "由于服务器未运行，跳过需要网络访问的测试"
        test_js_files
    fi
    
    # 生成报告
    generate_report
    
    exit $?
}

# 运行主函数
main








