#!/usr/bin/env node

/**
 * 验证AI配置脚本
 */

require('dotenv').config();
const config = require('./config/config');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║      AI配置验证                                ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('✅ .env 文件已加载\n');

console.log('AI服务配置状态：');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 检查智谱AI
if (config.ai.zhipuApiKey) {
  const key = config.ai.zhipuApiKey;
  console.log('✅ 智谱AI (ZhipuAI)');
  console.log(`   API Key: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  console.log(`   状态: 已配置，可以使用`);
} else {
  console.log('❌ 智谱AI (ZhipuAI)');
  console.log('   状态: 未配置');
}

console.log('');

// 检查通义千问
if (config.ai.qwenApiKey) {
  const key = config.ai.qwenApiKey;
  console.log('✅ 通义千问 (Qwen)');
  console.log(`   API Key: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  console.log(`   状态: 已配置，可以使用`);
} else {
  console.log('⚪ 通义千问 (Qwen)');
  console.log('   状态: 未配置（可选）');
}

console.log('');

// 检查Hugging Face
if (config.ai.huggingFaceApiKey) {
  const key = config.ai.huggingFaceApiKey;
  console.log('✅ Hugging Face');
  console.log(`   API Key: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  console.log(`   状态: 已配置，可以使用（需要VPN）`);
} else {
  console.log('⚪ Hugging Face');
  console.log('   状态: 未配置（可选，需要VPN）');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 检查当前使用的服务
const aiService = require('./services/aiService');
const modelInfo = aiService.getModelInfo();

console.log('当前使用的AI服务：');
console.log(`   提供商: ${modelInfo.provider}`);
console.log(`   模型: ${modelInfo.name}`);
console.log(`   需要API Key: ${modelInfo.requiresApiKey ? '是' : '否'}\n`);

if (config.ai.zhipuApiKey) {
  console.log('🎉 配置完成！智谱AI已配置，助手可以使用AI功能了！\n');
  console.log('下一步：');
  console.log('1. 重启后端服务（如果正在运行）');
  console.log('2. 打开 admin.html 测试助手功能');
  console.log('3. 发送"你好"测试AI回复\n');
} else {
  console.log('⚠️  提示：建议配置智谱AI以获得更好的AI体验\n');
}































