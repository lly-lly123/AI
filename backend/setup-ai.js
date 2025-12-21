#!/usr/bin/env node

/**
 * AI配置助手脚本
 * 帮助用户快速配置AI API Key
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_FILE = path.join(__dirname, '.env');
const EXAMPLE_ENV_FILE = path.join(__dirname, 'config.example.env');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

function loadEnvFile() {
  let envContent = '';
  
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  } else if (fs.existsSync(EXAMPLE_ENV_FILE)) {
    envContent = fs.readFileSync(EXAMPLE_ENV_FILE, 'utf8');
  }
  
  return envContent;
}

function updateEnvFile(content, key, value) {
  // 检查是否已存在该配置
  const lines = content.split('\n');
  let found = false;
  let updated = false;
  
  const newLines = lines.map(line => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      updated = true;
      return `${key}=${value}`;
    }
    return line;
  });
  
  if (!found) {
    // 如果不存在，添加到AI配置区域
    let aiSectionIndex = -1;
    for (let i = 0; i < newLines.length; i++) {
      if (newLines[i].includes('# AI配置')) {
        aiSectionIndex = i;
        break;
      }
    }
    
    if (aiSectionIndex >= 0) {
      // 在AI配置区域后添加
      newLines.splice(aiSectionIndex + 1, 0, `${key}=${value}`);
    } else {
      // 如果找不到AI配置区域，添加到文件末尾
      newLines.push(`\n# AI配置`);
      newLines.push(`${key}=${value}`);
    }
    updated = true;
  }
  
  return {
    content: newLines.join('\n'),
    updated
  };
}

async function main() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║      Evo智能助手 - AI配置工具                ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  log('');
  
  log('欢迎使用AI配置助手！', 'bright');
  log('本工具将帮助您配置AI服务的API Key。', 'yellow');
  log('');
  
  const rl = createReadlineInterface();
  
  try {
    // 选择AI服务提供商
    log('请选择要配置的AI服务：', 'bright');
    log('1. 智谱AI (推荐，国内可访问，免费额度)', 'green');
    log('2. 通义千问 (阿里云，国内可访问)', 'green');
    log('3. Hugging Face (需要VPN)', 'yellow');
    log('4. 跳过配置', 'yellow');
    log('');
    
    const choice = await question(rl, '请输入选项 (1-4): ');
    
    if (choice === '4') {
      log('\n已跳过配置。', 'yellow');
      log('提示：您可以稍后手动编辑 .env 文件来配置API Key。', 'yellow');
      rl.close();
      return;
    }
    
    let apiKeyName = '';
    let serviceName = '';
    let getKeyUrl = '';
    
    switch (choice) {
      case '1':
        apiKeyName = 'ZHIPU_API_KEY';
        serviceName = '智谱AI';
        getKeyUrl = 'https://open.bigmodel.cn/';
        break;
      case '2':
        apiKeyName = 'QWEN_API_KEY';
        serviceName = '通义千问';
        getKeyUrl = 'https://dashscope.aliyun.com/';
        break;
      case '3':
        apiKeyName = 'HUGGING_FACE_API_KEY';
        serviceName = 'Hugging Face';
        getKeyUrl = 'https://huggingface.co/settings/tokens';
        break;
      default:
        log('无效的选项！', 'red');
        rl.close();
        return;
    }
    
    log('');
    log(`您选择了：${serviceName}`, 'bright');
    log('');
    log('获取API Key步骤：', 'yellow');
    log(`1. 访问：${getKeyUrl}`, 'cyan');
    log('2. 注册/登录账号', 'cyan');
    log('3. 进入API管理页面', 'cyan');
    log('4. 创建并复制API Key', 'cyan');
    log('');
    
    const hasKey = await question(rl, '您是否已经获取了API Key？(y/n): ');
    
    if (hasKey.toLowerCase() !== 'y' && hasKey.toLowerCase() !== 'yes') {
      log('');
      log('请先获取API Key，然后重新运行此脚本。', 'yellow');
      log(`访问：${getKeyUrl}`, 'cyan');
      rl.close();
      return;
    }
    
    log('');
    const apiKey = await question(rl, `请输入您的 ${serviceName} API Key: `);
    
    if (!apiKey || apiKey.trim().length < 10) {
      log('API Key格式不正确，请检查后重试。', 'red');
      rl.close();
      return;
    }
    
    // 加载现有.env文件
    let envContent = loadEnvFile();
    
    // 更新.env文件
    const result = updateEnvFile(envContent, apiKeyName, apiKey.trim());
    
    // 保存文件
    fs.writeFileSync(ENV_FILE, result.content, 'utf8');
    
    log('');
    log('✅ 配置成功！', 'green');
    log(`API Key已保存到：${ENV_FILE}`, 'green');
    log('');
    log('下一步：', 'bright');
    log('1. 重启后端服务使配置生效', 'yellow');
    log('2. 运行测试脚本验证配置：node test-ai.js', 'yellow');
    log('3. 打开助手测试AI功能', 'yellow');
    log('');
    
  } catch (error) {
    log(`\n❌ 配置失败：${error.message}`, 'red');
    log('请检查错误信息并重试。', 'yellow');
  } finally {
    rl.close();
  }
}

// 运行主函数
main().catch(console.error);






























