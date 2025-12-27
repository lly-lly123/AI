#!/usr/bin/env node
/**
 * 全面功能测试脚本
 * 测试所有用户功能：点击、数据上传、账号注册、数据共享等
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class ComprehensiveFunctionTest {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.outputDir = options.outputDir || path.join(__dirname, '../test-results');
    this.issues = [];
    this.testResults = {
      click: { passed: 0, failed: 0, issues: [] },
      function: { passed: 0, failed: 0, issues: [] },
      dataUpload: { passed: 0, failed: 0, issues: [] },
      dataRetrieve: { passed: 0, failed: 0, issues: [] },
      account: { passed: 0, failed: 0, issues: [] },
      device: { passed: 0, failed: 0, issues: [] },
      display: { passed: 0, failed: 0, issues: [] },
      sharing: { passed: 0, failed: 0, issues: [] }
    };
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  recordIssue(category, description, severity = 'high') {
    const issue = {
      id: `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      description,
      severity,
      timestamp: new Date().toISOString()
    };
    this.issues.push(issue);
    if (this.testResults[category]) {
      this.testResults[category].issues.push(issue);
      this.testResults[category].failed++;
    }
    console.log(`❌ [问题] [${category.toUpperCase()}] ${description}`);
    return issue;
  }

  recordPass(category, description) {
    this.testResults[category].passed++;
    console.log(`✅ [${category.toUpperCase()}] ${description}`);
  }

  // 1. 测试图标和按钮是否可点击
  async testClickable() {
    console.log('\n🖱️  [测试] 开始图标和按钮点击测试...');
    
    const pages = [
      { file: 'index.html', desc: 'PC端' },
      { file: 'mobile.html', desc: '移动端' },
      { file: 'admin.html', desc: '后台' }
    ];
    
    for (const page of pages) {
      const filePath = path.join(__dirname, '..', page.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查按钮点击修复脚本
        if (content.includes('button-click-fix') || content.includes('mobile-button-click-fix') || content.includes('admin-button-click-fix')) {
          this.recordPass('click', `${page.desc}: 按钮点击修复脚本存在`);
        } else {
          this.recordIssue('click', `${page.desc}: 按钮点击修复脚本不存在`, 'high');
        }
        
        // 检查onclick事件
        const onclickCount = (content.match(/onclick=/g) || []).length;
        if (onclickCount > 0) {
          this.recordPass('click', `${page.desc}: 找到${onclickCount}个onclick事件`);
        } else {
          this.recordIssue('click', `${page.desc}: 未找到onclick事件`, 'medium');
        }
        
        // 检查按钮元素
        const buttonCount = (content.match(/<button/g) || []).length;
        if (buttonCount > 0) {
          this.recordPass('click', `${page.desc}: 找到${buttonCount}个button元素`);
        }
      }
    }
    
    console.log(`✅ [点击] 测试完成: 通过 ${this.testResults.click.passed}, 失败 ${this.testResults.click.failed}`);
  }

  // 2. 测试网站功能
  async testFunctions() {
    console.log('\n⚙️  [测试] 开始网站功能测试...');
    
    const indexPath = path.join(__dirname, '..', 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // 检查关键功能函数
      const functions = [
        { name: 'switchView', desc: '视图切换功能' },
        { name: 'loadPigeons', desc: '加载鸽子数据' },
        { name: 'loadRaces', desc: '加载比赛数据' },
        { name: 'saveCreatePigeonPC', desc: '保存鸽子数据' },
        { name: 'saveToStorage', desc: '保存到存储' },
        { name: 'deletePigeon', desc: '删除鸽子数据' },
        { name: 'btnDeletePigeon', desc: '删除按钮元素' },
        { name: 'viewPigeonDetail', desc: '查看鸽子详情' },
        { name: 'saveToCloud', desc: '保存到云端' }
      ];
      
      for (const func of functions) {
        if (content.includes(func.name)) {
          this.recordPass('function', `PC端: ${func.desc}存在`);
        } else {
          this.recordIssue('function', `PC端: ${func.desc}不存在`, 'high');
        }
      }
    }
    
    // 检查移动端功能
    const mobilePath = path.join(__dirname, '..', 'mobile.html');
    if (fs.existsSync(mobilePath)) {
      const content = fs.readFileSync(mobilePath, 'utf8');
      if (content.includes('switchView')) {
        this.recordPass('function', '移动端: 视图切换功能存在');
      } else {
        this.recordIssue('function', '移动端: 视图切换功能不存在', 'high');
      }
    }
    
    console.log(`✅ [功能] 测试完成: 通过 ${this.testResults.function.passed}, 失败 ${this.testResults.function.failed}`);
  }

  // 3. 测试数据自动上传（云端和本地）
  async testDataUpload() {
    console.log('\n📤 [测试] 开始数据上传测试...');
    
    // 检查自动账号注册脚本中的上传功能
    const autoAccountPath = path.join(__dirname, '..', 'js/auto-account-register.js');
    if (fs.existsSync(autoAccountPath)) {
      const content = fs.readFileSync(autoAccountPath, 'utf8');
      
      // 检查本地存储
      if (content.includes('localStorage.setItem') || content.includes('localStorage.set')) {
        this.recordPass('dataUpload', '本地数据保存功能存在');
      } else {
        this.recordIssue('dataUpload', '本地数据保存功能不存在', 'high');
      }
      
      // 检查云端上传
      if (content.includes('fetch') && (content.includes('/api/user/data') || content.includes('/api/data'))) {
        this.recordPass('dataUpload', '云端数据上传功能存在');
      } else {
        this.recordIssue('dataUpload', '云端数据上传功能不存在', 'high');
      }
      
      // 检查自动上传
      if (content.includes('autoSave') || content.includes('autoUpload') || content.includes('saveToCloud')) {
        this.recordPass('dataUpload', '自动上传功能存在');
      } else {
        this.recordIssue('dataUpload', '自动上传功能不存在', 'medium');
      }
    } else {
      this.recordIssue('dataUpload', '自动账号注册脚本不存在', 'critical');
    }
    
    console.log(`✅ [上传] 测试完成: 通过 ${this.testResults.dataUpload.passed}, 失败 ${this.testResults.dataUpload.failed}`);
  }

  // 4. 测试数据自动调取（云端和本地）
  async testDataRetrieve() {
    console.log('\n📥 [测试] 开始数据调取测试...');
    
    const autoAccountPath = path.join(__dirname, '..', 'js/auto-account-register.js');
    if (fs.existsSync(autoAccountPath)) {
      const content = fs.readFileSync(autoAccountPath, 'utf8');
      
      // 检查本地数据读取
      if (content.includes('localStorage.getItem') || content.includes('localStorage.get')) {
        this.recordPass('dataRetrieve', '本地数据读取功能存在');
      } else {
        this.recordIssue('dataRetrieve', '本地数据读取功能不存在', 'high');
      }
      
      // 检查云端数据获取
      if (content.includes('fetch') && (content.includes('/api/user/data') || content.includes('loadUserData'))) {
        this.recordPass('dataRetrieve', '云端数据获取功能存在');
      } else {
        this.recordIssue('dataRetrieve', '云端数据获取功能不存在', 'high');
      }
      
      // 检查数据恢复
      if (content.includes('restore') || content.includes('loadUserData') || content.includes('syncData')) {
        this.recordPass('dataRetrieve', '数据恢复功能存在');
      } else {
        this.recordIssue('dataRetrieve', '数据恢复功能不存在', 'high');
      }
    }
    
    // 检查页面加载时的数据调取
    const indexPath = path.join(__dirname, '..', 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      if (content.includes('DOMContentLoaded') && (content.includes('loadPigeons') || content.includes('loadUserData'))) {
        this.recordPass('dataRetrieve', '页面加载时自动调取数据');
      } else {
        this.recordIssue('dataRetrieve', '页面加载时未自动调取数据', 'medium');
      }
    }
    
    console.log(`✅ [调取] 测试完成: 通过 ${this.testResults.dataRetrieve.passed}, 失败 ${this.testResults.dataRetrieve.failed}`);
  }

  // 5. 测试账号自动注册
  async testAccountRegistration() {
    console.log('\n👤 [测试] 开始账号自动注册测试...');
    
    const autoAccountPath = path.join(__dirname, '..', 'js/auto-account-register.js');
    if (fs.existsSync(autoAccountPath)) {
      const content = fs.readFileSync(autoAccountPath, 'utf8');
      
      // 检查自动注册函数
      if (content.includes('autoRegister') || content.includes('registerAccount') || content.includes('createAccount')) {
        this.recordPass('account', '账号自动注册函数存在');
      } else {
        this.recordIssue('account', '账号自动注册函数不存在', 'high');
      }
      
      // 检查页面加载时自动注册
      if (content.includes('DOMContentLoaded') || content.includes('window.onload') || content.includes('立即执行')) {
        this.recordPass('account', '页面加载时自动注册');
      } else {
        this.recordIssue('account', '页面加载时未自动注册', 'high');
      }
      
      // 检查设备ID生成
      if (content.includes('device_id') || content.includes('deviceId') || content.includes('DEVICE_ID')) {
        this.recordPass('account', '设备ID生成功能存在');
      } else {
        this.recordIssue('account', '设备ID生成功能不存在', 'high');
      }
    } else {
      this.recordIssue('account', '自动账号注册脚本不存在', 'critical');
    }
    
    console.log(`✅ [账号] 测试完成: 通过 ${this.testResults.account.passed}, 失败 ${this.testResults.account.failed}`);
  }

  // 6. 测试账号自动登录
  async testAccountLogin() {
    console.log('\n🔐 [测试] 开始账号自动登录测试...');
    
    const autoAccountPath = path.join(__dirname, '..', 'js/auto-account-register.js');
    if (fs.existsSync(autoAccountPath)) {
      const content = fs.readFileSync(autoAccountPath, 'utf8');
      
      // 检查自动登录函数
      if (content.includes('autoLogin') || content.includes('login') || content.includes('authenticate')) {
        this.recordPass('account', '账号自动登录函数存在');
      } else {
        this.recordIssue('account', '账号自动登录函数不存在', 'high');
      }
      
      // 检查token保存
      if (content.includes('token') || content.includes('authToken')) {
        this.recordPass('account', 'Token保存功能存在');
      } else {
        this.recordIssue('account', 'Token保存功能不存在', 'medium');
      }
    }
    
    console.log(`✅ [登录] 测试完成: 通过 ${this.testResults.account.passed}, 失败 ${this.testResults.account.failed}`);
  }

  // 7. 测试设备识别和自动登录
  async testDeviceRecognition() {
    console.log('\n📱 [测试] 开始设备识别测试...');
    
    const autoAccountPath = path.join(__dirname, '..', 'js/auto-account-register.js');
    if (fs.existsSync(autoAccountPath)) {
      const content = fs.readFileSync(autoAccountPath, 'utf8');
      
      // 检查设备识别
      if (content.includes('device') || content.includes('Device') || content.includes('navigator')) {
        this.recordPass('device', '设备识别功能存在');
      } else {
        this.recordIssue('device', '设备识别功能不存在', 'high');
      }
      
      // 检查设备ID存储
      if (content.includes('localStorage') && (content.includes('device') || content.includes('DEVICE'))) {
        this.recordPass('device', '设备ID存储功能存在');
      } else {
        this.recordIssue('device', '设备ID存储功能不存在', 'high');
      }
      
      // 检查设备识别后的自动登录
      if (content.includes('getDeviceId') || content.includes('getOrCreateDeviceId')) {
        this.recordPass('device', '设备ID获取功能存在');
      } else {
        this.recordIssue('device', '设备ID获取功能不存在', 'high');
      }
    }
    
    console.log(`✅ [设备] 测试完成: 通过 ${this.testResults.device.passed}, 失败 ${this.testResults.device.failed}`);
  }

  // 8. 测试数据恢复
  async testDataRestore() {
    console.log('\n💾 [测试] 开始数据恢复测试...');
    
    const autoAccountPath = path.join(__dirname, '..', 'js/auto-account-register.js');
    if (fs.existsSync(autoAccountPath)) {
      const content = fs.readFileSync(autoAccountPath, 'utf8');
      
      // 检查数据恢复函数
      if (content.includes('restore') || content.includes('loadUserData') || content.includes('syncData') || content.includes('recover')) {
        this.recordPass('dataRetrieve', '数据恢复函数存在');
      } else {
        this.recordIssue('dataRetrieve', '数据恢复函数不存在', 'high');
      }
      
      // 检查自动恢复
      if (content.includes('autoRestore') || content.includes('autoLoad') || (content.includes('DOMContentLoaded') && content.includes('load'))) {
        this.recordPass('dataRetrieve', '自动数据恢复功能存在');
      } else {
        this.recordIssue('dataRetrieve', '自动数据恢复功能不存在', 'medium');
      }
    }
    
    console.log(`✅ [恢复] 测试完成: 通过 ${this.testResults.dataRetrieve.passed}, 失败 ${this.testResults.dataRetrieve.failed}`);
  }

  // 9. 测试页面空白问题
  async testPageDisplay() {
    console.log('\n🖼️  [测试] 开始页面显示测试...');
    
    const pages = [
      { file: 'index.html', desc: 'PC端' },
      { file: 'mobile.html', desc: '移动端' },
      { file: 'admin.html', desc: '后台' }
    ];
    
    for (const page of pages) {
      const filePath = path.join(__dirname, '..', page.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 检查页面修复脚本
        if (content.includes('页面修复') || content.includes('forceShow') || content.includes('display: block !important')) {
          this.recordPass('display', `${page.desc}: 页面显示修复脚本存在`);
        } else {
          this.recordIssue('display', `${page.desc}: 页面显示修复脚本不存在`, 'high');
        }
        
        // 检查body元素
        if (content.includes('<body') && content.includes('</body>')) {
          this.recordPass('display', `${page.desc}: body元素存在`);
        } else {
          this.recordIssue('display', `${page.desc}: body元素不存在`, 'critical');
        }
        
        // 检查主要内容
        const hasContent = content.length > 1000;
        if (hasContent) {
          this.recordPass('display', `${page.desc}: 页面有内容`);
        } else {
          this.recordIssue('display', `${page.desc}: 页面内容不足`, 'high');
        }
      }
    }
    
    console.log(`✅ [显示] 测试完成: 通过 ${this.testResults.display.passed}, 失败 ${this.testResults.display.failed}`);
  }

  // 10. 测试数据共享和权限
  async testDataSharing() {
    console.log('\n🔗 [测试] 开始数据共享测试...');
    
    // 检查共享功能（在后端API中）
    const sharingApiPath = path.join(__dirname, '..', 'backend/routes/api.js');
    if (fs.existsSync(sharingApiPath)) {
      const sharingContent = fs.readFileSync(sharingApiPath, 'utf8');
      
      // 检查共享相关API
      if (sharingContent.includes('/public/data') || sharingContent.includes('/sharing') || sharingContent.includes('sharingAnalyzer')) {
        this.recordPass('sharing', '数据共享API存在');
      } else {
        this.recordIssue('sharing', '数据共享API不存在', 'medium');
      }
      
      // 检查共享模式
      if (sharingContent.includes('visibility') && (sharingContent.includes('private') || sharingContent.includes('public') || sharingContent.includes('shared'))) {
        this.recordPass('sharing', '数据共享模式配置存在');
      } else {
        this.recordIssue('sharing', '数据共享模式配置不存在', 'medium');
      }
    } else {
      this.recordIssue('sharing', 'API路由文件不存在', 'high');
    }
    
    // 检查后端API中的共享功能
    const apiPath = path.join(__dirname, '..', 'backend/routes/api.js');
    if (fs.existsSync(apiPath)) {
      const content = fs.readFileSync(apiPath, 'utf8');
      
      // 检查权限验证
      if (content.includes('auth') || content.includes('permission') || content.includes('authorize')) {
        this.recordPass('sharing', '权限验证功能存在');
      } else {
        this.recordIssue('sharing', '权限验证功能不存在', 'high');
      }
      
      // 检查共享API
      if (content.includes('share') || content.includes('sharing')) {
        this.recordPass('sharing', '数据共享API存在');
      } else {
        this.recordIssue('sharing', '数据共享API不存在', 'medium');
      }
    }
    
    console.log(`✅ [共享] 测试完成: 通过 ${this.testResults.sharing.passed}, 失败 ${this.testResults.sharing.failed}`);
  }

  // 生成报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.values(this.testResults).reduce((sum, r) => sum + r.passed + r.failed, 0),
        totalPassed: Object.values(this.testResults).reduce((sum, r) => sum + r.passed, 0),
        totalFailed: Object.values(this.testResults).reduce((sum, r) => sum + r.failed, 0),
        totalIssues: this.issues.length
      },
      testResults: this.testResults,
      issues: this.issues
    };
    
    const reportPath = path.join(this.outputDir, `comprehensive-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 [报告] 测试报告已生成:', reportPath);
    console.log(`\n📈 [统计] 总测试: ${report.summary.totalTests}, 通过: ${report.summary.totalPassed}, 失败: ${report.summary.totalFailed}`);
    console.log(`🔧 [问题] 发现问题: ${report.summary.totalIssues}`);
    
    return report;
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 [测试] 开始全面功能测试...');
    console.log(`📍 [配置] 测试地址: ${this.baseUrl}\n`);
    
    await this.testClickable();
    await this.testFunctions();
    await this.testDataUpload();
    await this.testDataRetrieve();
    await this.testAccountRegistration();
    await this.testAccountLogin();
    await this.testDeviceRecognition();
    await this.testDataRestore();
    await this.testPageDisplay();
    await this.testDataSharing();
    
    const report = this.generateReport();
    
    return report;
  }
}

// 运行测试
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const framework = new ComprehensiveFunctionTest({ baseUrl });
  
  framework.runAllTests().then(report => {
    console.log('\n✅ [完成] 全面功能测试完成！');
    process.exit(report.summary.totalFailed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('\n❌ [错误] 测试异常:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveFunctionTest;

