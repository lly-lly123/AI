#!/usr/bin/env node

/**
 * AI服务测试脚本
 * 验证AI配置是否正确
 */

require('dotenv').config();
const aiService = require('./services/aiService');

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

async function testAI() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║      Evo智能助手 - AI服务测试                 ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  log('');
  
  log('正在测试AI服务连接...', 'yellow');
  log('');
  
  try {
    // 获取模型信息
    const modelInfo = aiService.getModelInfo();
    log('当前AI服务配置：', 'bright');
    log(`  服务提供商：${modelInfo.provider}`, 'cyan');
    log(`  模型名称：${modelInfo.name}`, 'cyan');
    log(`  需要API Key：${modelInfo.requiresApiKey ? '是' : '否'}`, 'cyan');
    log('');
    
    // 测试连接
    log('发送测试消息...', 'yellow');
    const testQuestion = '你好，请简单介绍一下你自己';
    
    log(`问题：${testQuestion}`, 'cyan');
    log('');
    
    const startTime = Date.now();
    const response = await aiService.chat(testQuestion, [], {
      totalPigeons: 10,
      alivePigeons: 8,
      breeders: 3
    });
    const endTime = Date.now();
    
    log('✅ AI服务响应成功！', 'green');
    log('');
    log('响应内容：', 'bright');
    log(`  ${response.text}`, 'cyan');
    log('');
    log(`响应时间：${endTime - startTime}ms`, 'yellow');
    log(`使用模型：${response.model || modelInfo.name}`, 'yellow');
    log(`服务提供商：${response.provider || modelInfo.provider}`, 'yellow');
    
    if (response.error) {
      log('');
      log('⚠️  警告：', 'yellow');
      log(`  ${response.error}`, 'yellow');
    }
    
    log('');
    log('🎉 AI服务配置正确，可以正常使用！', 'green');
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
    log('');
    log('解决方案：', 'bright');
    log('  1. 检查 .env 文件中的API Key配置', 'cyan');
    log('  2. 运行 node setup-ai.js 重新配置', 'cyan');
    log('  3. 查看 logs/app.log 获取详细错误信息', 'cyan');
    log('');
    process.exit(1);
  }
}

// 运行测试
testAI().catch(error => {
  log(`\n❌ 测试过程出错：${error.message}`, 'red');
  process.exit(1);
});






























