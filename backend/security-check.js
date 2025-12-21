#!/usr/bin/env node

/**
 * API Key 安全检查工具
 * 检查配置的安全性，防止API Key泄露
 */

const fs = require('fs');
const path = require('path');

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

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function checkFilePermissions(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const mode = stats.mode.toString(8);
    return mode.slice(-3);
  } catch {
    return null;
  }
}

function checkGitIgnore() {
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (!checkFileExists(gitignorePath)) {
    return { exists: false, containsEnv: false };
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  return {
    exists: true,
    containsEnv: content.includes('.env')
  };
}

function checkSourceCodeForApiKeys() {
  const dangerousPatterns = [
    /ZHIPU_API_KEY\s*=\s*['"][^'"]+['"]/,
    /QWEN_API_KEY\s*=\s*['"][^'"]+['"]/,
    /HUGGING_FACE_API_KEY\s*=\s*['"][^'"]+['"]/,
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
    /d5122a7786c843eb89dc6a54a205013b/i // 您的API Key模式
  ];
  
  const filesToCheck = [
    'server.js',
    'services/aiService.js',
    'config/config.js',
    'routes/api.js'
  ];
  
  const issues = [];
  
  filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (checkFileExists(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      dangerousPatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          issues.push({
            file: file,
            pattern: index === dangerousPatterns.length - 1 ? 'API Key硬编码' : 'API Key模式匹配'
          });
        }
      });
    }
  });
  
  return issues;
}

function checkEnvFileSecurity() {
  const envPath = path.join(__dirname, '.env');
  
  if (!checkFileExists(envPath)) {
    return {
      exists: false,
      permissions: null,
      secure: false,
      message: '.env文件不存在'
    };
  }
  
  const permissions = checkFilePermissions(envPath);
  const isSecure = permissions === '600' || permissions === '400';
  
  return {
    exists: true,
    permissions: permissions,
    secure: isSecure,
    message: isSecure 
      ? '文件权限安全' 
      : `文件权限不安全（当前：${permissions}，建议：600）`
  };
}

function main() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║      API Key 安全检查工具                    ║', 'cyan');
  log('╚════════════════════════════════════════════════╝', 'cyan');
  log('');
  
  let allSecure = true;
  
  // 1. 检查 .gitignore
  log('1. 检查 Git 忽略配置...', 'bright');
  const gitignore = checkGitIgnore();
  if (!gitignore.exists) {
    log('   ❌ .gitignore 文件不存在', 'red');
    allSecure = false;
  } else if (!gitignore.containsEnv) {
    log('   ❌ .gitignore 未包含 .env', 'red');
    allSecure = false;
  } else {
    log('   ✅ .gitignore 配置正确', 'green');
  }
  log('');
  
  // 2. 检查 .env 文件权限
  log('2. 检查 .env 文件安全...', 'bright');
  const envSecurity = checkEnvFileSecurity();
  if (!envSecurity.exists) {
    log('   ⚠️  .env 文件不存在', 'yellow');
    log('   💡 提示：如果尚未配置API Key，这是正常的', 'yellow');
  } else {
    if (envSecurity.secure) {
      log('   ✅ ' + envSecurity.message, 'green');
    } else {
      log('   ⚠️  ' + envSecurity.message, 'yellow');
      log('   💡 建议运行：chmod 600 .env', 'yellow');
    }
  }
  log('');
  
  // 3. 检查源代码中是否有硬编码的API Key
  log('3. 检查源代码安全性...', 'bright');
  const codeIssues = checkSourceCodeForApiKeys();
  if (codeIssues.length > 0) {
    log('   ❌ 发现潜在的安全问题：', 'red');
    codeIssues.forEach(issue => {
      log(`      - ${issue.file}: ${issue.pattern}`, 'red');
    });
    log('   ⚠️  警告：源代码中可能包含API Key！', 'red');
    allSecure = false;
  } else {
    log('   ✅ 源代码中未发现硬编码的API Key', 'green');
  }
  log('');
  
  // 4. 检查日志文件
  log('4. 检查日志文件...', 'bright');
  const logsPath = path.join(__dirname, 'logs');
  if (checkFileExists(logsPath)) {
    const logFiles = fs.readdirSync(logsPath).filter(f => f.endsWith('.log'));
    let logIssues = 0;
    
    logFiles.forEach(logFile => {
      const logPath = path.join(logsPath, logFile);
      try {
        const content = fs.readFileSync(logPath, 'utf8');
        if (content.includes('d5122a7786c843eb89dc6a54a205013b')) {
          log(`   ⚠️  ${logFile} 可能包含API Key`, 'yellow');
          logIssues++;
        }
      } catch {
        // 忽略读取错误
      }
    });
    
    if (logIssues === 0) {
      log('   ✅ 日志文件中未发现API Key', 'green');
    } else {
      log(`   ⚠️  发现 ${logIssues} 个日志文件可能包含API Key`, 'yellow');
      log('   💡 建议：定期清理日志文件', 'yellow');
    }
  } else {
    log('   ✅ 日志目录不存在或为空', 'green');
  }
  log('');
  
  // 总结
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  if (allSecure && envSecurity.exists && envSecurity.secure) {
    log('✅ 安全检查通过！配置安全。', 'green');
  } else {
    log('⚠️  发现一些安全问题，请查看上述建议。', 'yellow');
  }
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('');
  
  // 安全建议
  log('📋 安全建议：', 'bright');
  log('1. 设置 .env 文件权限：chmod 600 .env', 'cyan');
  log('2. 确保 .env 在 .gitignore 中', 'cyan');
  log('3. 不要将 .env 文件分享给他人', 'cyan');
  log('4. 定期更换API Key', 'cyan');
  log('5. 监控API使用情况', 'cyan');
  log('');
}

main();






























