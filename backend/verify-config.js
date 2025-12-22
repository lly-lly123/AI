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

// 检查智谱AI - Evo智能助手
if (config.ai.zhipuApiKey) {
  const key = config.ai.zhipuApiKey;
  console.log('✅ 智谱AI - Evo智能助手 (名称：智鸽)');
  console.log(`   环境变量: ZHIPU_API_KEY_EVO`);
  console.log(`   API Key: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  console.log(`   状态: 已配置，可以使用`);
} else {
  console.log('❌ 智谱AI - Evo智能助手 (名称：智鸽)');
  console.log('   环境变量: ZHIPU_API_KEY_EVO');
  console.log('   状态: 未配置');
}

console.log('');

// 检查智谱AI - 中枢管家
if (config.ai.zhipuApiKeyAdmin) {
  const key = config.ai.zhipuApiKeyAdmin;
  console.log('✅ 智谱AI - 中枢管家 (名称：智鸽·中枢管家)');
  console.log(`   环境变量: ZHIPU_API_KEY_ADMIN`);
  console.log(`   API Key: ${key.substring(0, 20)}...${key.substring(key.length - 10)}`);
  console.log(`   状态: 已配置，可以使用`);
} else {
  console.log('❌ 智谱AI - 中枢管家 (名称：智鸽·中枢管家)');
  console.log('   环境变量: ZHIPU_API_KEY_ADMIN');
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

if (config.ai.zhipuApiKey || config.ai.zhipuApiKeyAdmin) {
  console.log('🎉 配置完成！智谱AI已配置，助手可以使用AI功能了！\n');
  if (config.ai.zhipuApiKey && config.ai.zhipuApiKeyAdmin) {
    console.log('✅ 两个API Key都已配置，功能完整！\n');
  } else if (config.ai.zhipuApiKey) {
    console.log('⚠️  提示：建议同时配置 ZHIPU_API_KEY_ADMIN 用于中枢管家\n');
  } else if (config.ai.zhipuApiKeyAdmin) {
    console.log('⚠️  提示：建议同时配置 ZHIPU_API_KEY_EVO 用于Evo智能助手\n');
  }
  console.log('下一步：');
  console.log('1. 重启后端服务（如果正在运行）');
  console.log('2. 打开 admin.html 测试助手功能');
  console.log('3. 发送"你好"测试AI回复\n');
} else {
  console.log('⚠️  提示：建议配置智谱AI以获得更好的AI体验\n');
  console.log('   需要配置：');
  console.log('   - ZHIPU_API_KEY_EVO (Evo智能助手使用)');
  console.log('   - ZHIPU_API_KEY_ADMIN (中枢管家使用)\n');
}


































