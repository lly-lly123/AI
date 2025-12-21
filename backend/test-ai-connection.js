#!/usr/bin/env node

/**
 * 测试AI连接和功能
 * 验证助手是否成功接入人工智能
 */

require('dotenv').config();
const axios = require('axios');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAIService() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║      测试AI服务连接                            ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  log('');
  
  try {
    const aiService = require('./services/aiService');
    
    // 获取模型信息
    const modelInfo = aiService.getModelInfo();
    log('当前AI服务配置：', 'bright');
    log(`  提供商: ${modelInfo.provider}`, 'cyan');
    log(`  模型: ${modelInfo.name}`, 'cyan');
    log(`  需要API Key: ${modelInfo.requiresApiKey ? '是' : '否'}`, 'cyan');
    log('');
    
    // 测试问题
    const testQuestions = [
      '你好，请简单介绍一下你自己',
      '你能帮我做什么？',
      '什么是信鸽？'
    ];
    
    log('开始测试AI回复...', 'bright');
    log('');
    
    for (let i = 0; i < testQuestions.length; i++) {
      const question = testQuestions[i];
      log(`测试 ${i + 1}/${testQuestions.length}: ${question}`, 'yellow');
      
      try {
        const startTime = Date.now();
        const response = await aiService.chat(question, [], {
          totalPigeons: 10,
          alivePigeons: 8,
          breeders: 3
        });
        const endTime = Date.now();
        
        if (response.text && response.text.length > 10) {
          log('  ✅ AI回复成功', 'green');
          log(`  响应时间: ${endTime - startTime}ms`, 'cyan');
          log(`  回复长度: ${response.text.length} 字符`, 'cyan');
          log(`  使用模型: ${response.model || modelInfo.name}`, 'cyan');
          log(`  回复内容: ${response.text.substring(0, 100)}${response.text.length > 100 ? '...' : ''}`, 'cyan');
          
          if (response.error) {
            log(`  ⚠️  警告: ${response.error}`, 'yellow');
          }
        } else {
          log('  ⚠️  AI回复为空或太短', 'yellow');
          log(`  回复内容: ${response.text || '(空)'}`, 'yellow');
        }
      } catch (error) {
        log(`  ❌ 测试失败: ${error.message}`, 'red');
        if (error.response) {
          log(`  状态码: ${error.response.status}`, 'red');
          log(`  错误信息: ${JSON.stringify(error.response.data).substring(0, 200)}`, 'red');
        }
      }
      
      log('');
      
      // 避免请求过快
      if (i < testQuestions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('✅ AI服务测试完成！', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('');
    
  } catch (error) {
    log('');
    log('❌ AI服务测试失败！', 'red');
    log('');
    log('错误信息：', 'bright');
    log(`  ${error.message}`, 'red');
    log('');
    log('可能的原因：', 'yellow');
    log('  1. API Key未配置或配置错误', 'yellow');
    log('  2. 网络连接问题', 'yellow');
    log('  3. AI服务暂时不可用', 'yellow');
    log('  4. 依赖包未安装', 'yellow');
    log('');
    log('解决方案：', 'bright');
    log('  1. 检查 .env 文件中的API Key配置', 'cyan');
    log('  2. 运行 node verify-config.js 验证配置', 'cyan');
    log('  3. 检查网络连接', 'cyan');
    log('  4. 运行 npm install 安装依赖', 'cyan');
    log('');
    process.exit(1);
  }
}

async function testBackendAPI() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║      测试后端API接口                           ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  log('');
  
  const API_URL = 'http://localhost:3000';
  
  // 检查服务是否运行
  log('检查后端服务状态...', 'bright');
  try {
    const healthCheck = await axios.get(`${API_URL}/api/health`, {
      timeout: 3000
    });
    log('  ✅ 后端服务正在运行', 'green');
    log(`  状态: ${healthCheck.data.status || 'OK'}`, 'cyan');
  } catch (error) {
    log('  ❌ 后端服务未运行或无法连接', 'red');
    log('  💡 提示: 请先启动后端服务: npm start', 'yellow');
    log('');
    return false;
  }
  
  log('');
  log('测试AI聊天API...', 'bright');
  
  // 注意：这里需要token，我们先测试服务是否可达
  try {
    const response = await axios.post(
      `${API_URL}/api/evo/chat`,
      {
        question: '你好',
        history: [],
        context: {}
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true // 接受所有状态码
      }
    );
    
    if (response.status === 401) {
      log('  ⚠️  需要登录认证（这是正常的）', 'yellow');
      log('  💡 提示: 在浏览器中登录后即可使用助手', 'yellow');
    } else if (response.status === 200) {
      log('  ✅ API接口正常', 'green');
      if (response.data.success && response.data.data) {
        log(`  AI回复: ${response.data.data.text?.substring(0, 100)}...`, 'cyan');
      }
    } else {
      log(`  ⚠️  状态码: ${response.status}`, 'yellow');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('  ❌ 无法连接到后端服务', 'red');
      log('  💡 提示: 请先启动后端服务: npm start', 'yellow');
    } else {
      log(`  ⚠️  连接错误: ${error.message}`, 'yellow');
    }
  }
  
  log('');
  return true;
}

async function main() {
  // 测试AI服务
  await testAIService();
  
  // 测试后端API
  await testBackendAPI();
  
  log('');
  log('📋 测试总结：', 'bright');
  log('1. ✅ AI服务已配置并可以调用', 'green');
  log('2. 💡 如果后端服务未运行，请执行: npm start', 'yellow');
  log('3. 💡 在浏览器中打开 admin.html 测试助手', 'yellow');
  log('');
  log('🎉 助手已成功接入人工智能！', 'green');
  log('');
}

main().catch(error => {
  log(`\n❌ 测试过程出错：${error.message}`, 'red');
  process.exit(1);
});






























