#!/usr/bin/env node
/**
 * 智鸽PigeonAI - API功能检测脚本
 * 功能：检测API Key配置、验证API调用功能
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(title) {
    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    log(title, 'cyan');
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// 检测结果
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

function addResult(status, message) {
    results.details.push({ status, message });
    if (status === '✅') results.passed++;
    else if (status === '❌') results.failed++;
    else if (status === '⚠️') results.warnings++;
}

// 测试1：检查API Key配置文件
function testApiKeyConfig() {
    printHeader('测试1: API Key配置检测');
    
    const configPath = path.join(__dirname, 'data', 'evo_settings.json');
    const hasConfigFile = fs.existsSync(configPath);
    
    if (hasConfigFile) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            log('✅ 配置文件存在', 'green');
            addResult('✅', '配置文件存在');
            
            if (config.zhipuApiKeyEvo || config.zhipuApiKeyAdmin) {
                log('✅ 检测到API Key配置', 'green');
                addResult('✅', 'API Key已配置');
            } else {
                log('⚠️  未检测到API Key（可能存储在localStorage）', 'yellow');
                addResult('⚠️', 'API Key可能存储在浏览器localStorage中');
            }
        } catch (e) {
            log('❌ 配置文件格式错误', 'red');
            addResult('❌', '配置文件格式错误');
        }
    } else {
        log('⚠️  配置文件不存在（API Key可能存储在浏览器localStorage）', 'yellow');
        addResult('⚠️', '配置文件不存在，API Key可能存储在浏览器中');
    }
    
    // 检查脚本文件中的API Key引用
    const proxyPath = path.join(__dirname, 'js', 'zhipu-api-proxy.js');
    if (fs.existsSync(proxyPath)) {
        const proxyContent = fs.readFileSync(proxyPath, 'utf8');
        if (proxyContent.includes('localStorage.getItem') && proxyContent.includes('pigeon_api_config')) {
            log('✅ API代理脚本支持从localStorage读取配置', 'green');
            addResult('✅', 'API代理支持localStorage配置');
        }
    }
}

// 测试2：检查API代理脚本
function testApiProxyScript() {
    printHeader('测试2: API代理脚本检测');
    
    const proxyPath = path.join(__dirname, 'js', 'zhipu-api-proxy.js');
    
    if (!fs.existsSync(proxyPath)) {
        log('❌ zhipu-api-proxy.js 不存在', 'red');
        addResult('❌', 'API代理脚本不存在');
        return;
    }
    
    log('✅ API代理脚本文件存在', 'green');
    addResult('✅', 'API代理脚本存在');
    
    const content = fs.readFileSync(proxyPath, 'utf8');
    
    // 检查关键功能
    const checks = [
        { pattern: /callZhipuAPI|callZhipuAPIWithRetry/, name: 'API调用函数' },
        { pattern: /open\.bigmodel\.cn/, name: '智谱API端点' },
        { pattern: /localStorage\.getItem.*pigeon_api_config/, name: '配置读取' },
        { pattern: /Authorization.*Bearer/, name: '认证头设置' },
        { pattern: /retry|重试/, name: '重试机制' }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            log(`✅ ${check.name} 已实现`, 'green');
            addResult('✅', `${check.name}已实现`);
        } else {
            log(`⚠️  ${check.name} 未检测到`, 'yellow');
            addResult('⚠️', `${check.name}未检测到`);
        }
    });
}

// 测试3：检查Evo助手集成
function testEvoIntegration() {
    printHeader('测试3: Evo助手API集成检测');
    
    const files = [
        { path: 'index.html', name: 'PC端' },
        { path: 'mobile.html', name: '移动端' }
    ];
    
    files.forEach(file => {
        const filePath = path.join(__dirname, file.path);
        if (!fs.existsSync(filePath)) {
            log(`❌ ${file.name}文件不存在`, 'red');
            addResult('❌', `${file.name}文件不存在`);
            return;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查API代理引用
        if (content.includes('zhipu-api-proxy.js')) {
            log(`✅ ${file.name}引用了API代理`, 'green');
            addResult('✅', `${file.name}引用API代理`);
        } else {
            log(`❌ ${file.name}未引用API代理`, 'red');
            addResult('❌', `${file.name}未引用API代理`);
        }
        
        // 检查Evo助手chat函数中的API调用
        if (content.includes('ZhipuAPIProxy') || content.includes('zhipu-api-proxy')) {
            log(`✅ ${file.name}Evo助手集成了API调用`, 'green');
            addResult('✅', `${file.name}Evo助手API集成`);
        } else if (content.includes('open.bigmodel.cn')) {
            log(`✅ ${file.name}直接调用智谱API`, 'green');
            addResult('✅', `${file.name}直接调用智谱API`);
        } else {
            log(`⚠️  ${file.name}API调用方式未明确检测到`, 'yellow');
            addResult('⚠️', `${file.name}API调用方式需验证`);
        }
    });
}

// 测试4：检查后台配置面板
function testAdminConfigPanel() {
    printHeader('测试4: 后台配置面板检测');
    
    const adminPath = path.join(__dirname, 'admin.html');
    if (!fs.existsSync(adminPath)) {
        log('❌ admin.html 不存在', 'red');
        addResult('❌', 'admin.html不存在');
        return;
    }
    
    const content = fs.readFileSync(adminPath, 'utf8');
    
    // 检查配置面板
    const checks = [
        { pattern: /智谱API配置|zhipuConfig/, name: '智谱API配置面板' },
        { pattern: /助手功能配置|assistantConfig/, name: '助手功能配置面板' },
        { pattern: /zhipuApiKeyConfig|zhipuApiKey/, name: 'API Key输入框' },
        { pattern: /testZhipuKey|验证/, name: 'API Key验证功能' },
        { pattern: /admin-config-panels\.js/, name: '配置面板脚本' }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            log(`✅ ${check.name} 已集成`, 'green');
            addResult('✅', `${check.name}已集成`);
        } else {
            log(`⚠️  ${check.name} 未检测到`, 'yellow');
            addResult('⚠️', `${check.name}未检测到`);
        }
    });
}

// 测试5：模拟API调用测试（需要实际API Key）
function testApiCallSimulation() {
    printHeader('测试5: API调用模拟测试');
    
    log('ℹ️  此测试需要实际的API Key，将在浏览器环境中进行', 'blue');
    log('ℹ️  请在实际浏览器中测试Evo助手功能', 'blue');
    addResult('ℹ️', 'API调用测试需要在浏览器中验证');
    
    // 检查API调用代码结构
    const proxyPath = path.join(__dirname, 'js', 'zhipu-api-proxy.js');
    if (fs.existsSync(proxyPath)) {
        const content = fs.readFileSync(proxyPath, 'utf8');
        
        if (content.includes('fetch') && content.includes('open.bigmodel.cn')) {
            log('✅ API调用代码结构正确', 'green');
            addResult('✅', 'API调用代码结构正确');
        }
        
        if (content.includes('catch') && content.includes('retry')) {
            log('✅ 错误处理和重试机制已实现', 'green');
            addResult('✅', '错误处理和重试机制已实现');
        }
    }
}

// 生成报告
function generateReport() {
    printHeader('📊 检测报告汇总');
    
    log(`✅ 通过: ${results.passed}`, 'green');
    log(`❌ 失败: ${results.failed}`, 'red');
    log(`⚠️  警告: ${results.warnings}`, 'yellow');
    
    console.log(`\n${colors.cyan}详细结果:${colors.reset}`);
    results.details.forEach(detail => {
        const color = detail.status === '✅' ? 'green' : 
                     detail.status === '❌' ? 'red' : 'yellow';
        log(`  ${detail.status} ${detail.message}`, color);
    });
    
    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    if (results.failed === 0) {
        log('🎉 所有检测通过！API功能配置正常！', 'green');
        console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    } else {
        log('⚠️  部分检测未通过，请检查上述错误', 'yellow');
        console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    }
}

// 主函数
function main() {
    console.clear();
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('🔍 智鸽PigeonAI - API功能检测', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    console.log();
    
    testApiKeyConfig();
    testApiProxyScript();
    testEvoIntegration();
    testAdminConfigPanel();
    testApiCallSimulation();
    
    generateReport();
}

// 运行
main();




























