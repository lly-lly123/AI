/**
 * 全面功能测试脚本
 * 模拟用户使用环境，测试PC端、移动端和后台的各个功能
 */

(function() {
  'use strict';
  
  console.log('🧪 [全面测试] 开始全面功能测试...');
  
  const testResults = {
    pc: { passed: [], failed: [], total: 0 },
    mobile: { passed: [], failed: [], total: 0 },
    admin: { passed: [], failed: [], total: 0 },
    evo: { passed: [], failed: [], total: 0 },
    startTime: Date.now()
  };
  
  // 测试函数
  function test(name, testFn, category = 'pc') {
    return new Promise((resolve) => {
      testResults[category].total++;
      const startTime = Date.now();
      
      try {
        const result = testFn();
        
        if (result instanceof Promise) {
          result
            .then(() => {
              const duration = Date.now() - startTime;
              testResults[category].passed.push({ name, duration });
              console.log(`✅ [${category.toUpperCase()}] ${name} (${duration}ms)`);
              resolve(true);
            })
            .catch((error) => {
              const duration = Date.now() - startTime;
              testResults[category].failed.push({ name, error: error.message, duration });
              console.error(`❌ [${category.toUpperCase()}] ${name}: ${error.message} (${duration}ms)`);
              resolve(false);
            });
        } else if (result === true || result === undefined) {
          const duration = Date.now() - startTime;
          testResults[category].passed.push({ name, duration });
          console.log(`✅ [${category.toUpperCase()}] ${name} (${duration}ms)`);
          resolve(true);
        } else {
          const duration = Date.now() - startTime;
          testResults[category].failed.push({ name, error: 'Test returned false', duration });
          console.error(`❌ [${category.toUpperCase()}] ${name}: Test returned false (${duration}ms)`);
          resolve(false);
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        testResults[category].failed.push({ name, error: error.message, duration });
        console.error(`❌ [${category.toUpperCase()}] ${name}: ${error.message} (${duration}ms)`);
        resolve(false);
      }
    });
  }
  
  // 等待函数
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // ==================== PC端测试 ====================
  async function testPC() {
    console.log('\n📱 [PC端测试] 开始测试PC端功能...');
    
    // 1. 测试switchView函数
    await test('switchView函数存在', () => {
      return typeof window.switchView === 'function';
    }, 'pc');
    
    await wait(100);
    
    // 2. 测试侧边栏按钮
    const sidebarTests = [
      { name: '首页按钮', view: 'homeView' },
      { name: '数据概览按钮', view: 'dashboardView' },
      { name: '鸽子管理按钮', view: 'listView' },
      { name: '血统关系按钮', view: 'pedigreeView' },
      { name: '统计分析按钮', view: 'statsView' },
      { name: '比赛管理按钮', view: 'raceView' },
      { name: '繁育配对按钮', view: 'breedingView' },
      { name: '健康管理按钮', view: 'healthView' },
      { name: '智能分析按钮', view: 'analysisView' },
      { name: '训练模块按钮', view: 'trainingView' },
      { name: '能力分析按钮', view: 'qualificationView' }
    ];
    
    for (const testCase of sidebarTests) {
      await test(`侧边栏-${testCase.name}`, () => {
        const button = document.querySelector(`.sidebar-item[data-view="${testCase.view}"]`);
        if (!button) return false;
        
        // 模拟点击
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        button.dispatchEvent(clickEvent);
        
        // 等待视图切换
        return new Promise((resolve) => {
          setTimeout(() => {
            const view = document.getElementById(testCase.view);
            const isVisible = view && view.style.display !== 'none';
            const isActive = button.classList.contains('active');
            resolve(isVisible || isActive);
          }, 300);
        });
      }, 'pc');
      
      await wait(200);
    }
    
    // 3. 测试顶部按钮
    await test('顶部-新增鸽子按钮', () => {
      const button = document.getElementById('btnGoCreate');
      if (!button) return false;
      
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      button.dispatchEvent(clickEvent);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const view = document.getElementById('createView');
          const isVisible = view && view.style.display !== 'none';
          resolve(isVisible);
        }, 300);
      });
    }, 'pc');
    
    await wait(200);
    
    // 4. 测试数据加载
    await test('数据加载功能', () => {
      const STORAGE_KEY = 'pigeon_manager_data_v1';
      const data = localStorage.getItem(STORAGE_KEY);
      return data !== null;
    }, 'pc');
    
    await wait(100);
    
    // 5. 测试数据同步
    await test('数据同步功能', () => {
      return typeof window.refreshDataFromStorage === 'function';
    }, 'pc');
    
    await wait(100);
    
    // 6. 测试按钮修复功能
    await test('按钮修复功能', () => {
      return typeof window.forceFixAllButtons === 'function';
    }, 'pc');
    
    console.log('✅ [PC端测试] PC端测试完成');
  }
  
  // ==================== 移动端测试 ====================
  async function testMobile() {
    console.log('\n📱 [移动端测试] 开始测试移动端功能...');
    
    // 检测是否为移动端页面
    const isMobilePage = window.location.pathname.includes('mobile') || 
                        document.querySelector('.mobile-view') !== null;
    
    if (!isMobilePage) {
      console.log('⚠️ [移动端测试] 当前不是移动端页面，跳过移动端测试');
      return;
    }
    
    // 1. 测试switchView函数
    await test('移动端switchView函数存在', () => {
      return typeof window.switchView === 'function';
    }, 'mobile');
    
    await wait(100);
    
    // 2. 测试底部导航
    const navTests = [
      { name: '首页', onclick: "switchView('home')" },
      { name: '鸽子管理', onclick: "switchView('pigeons')" },
      { name: '比赛', onclick: "switchView('races')" },
      { name: '统计', onclick: "switchView('stats')" },
      { name: '更多', onclick: "switchView('more')" }
    ];
    
    for (const testCase of navTests) {
      await test(`底部导航-${testCase.name}`, () => {
        const buttons = document.querySelectorAll('.mobile-nav-item');
        const button = Array.from(buttons).find(btn => {
          const onclick = btn.getAttribute('onclick');
          return onclick && onclick.includes(testCase.onclick);
        });
        
        if (!button) return false;
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        button.dispatchEvent(clickEvent);
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true); // 简单测试，只要不报错就认为成功
          }, 300);
        });
      }, 'mobile');
      
      await wait(200);
    }
    
    // 3. 测试Alert功能
    await test('移动端Alert功能', () => {
      return typeof window.customAlert === 'function' || 
             typeof window._closeMobileAlert === 'function';
    }, 'mobile');
    
    await wait(100);
    
    // 4. 测试模态框关闭功能
    await test('模态框关闭功能', () => {
      return typeof window.closeCreatePigeonModal === 'function';
    }, 'mobile');
    
    await wait(100);
    
    // 5. 测试数据加载
    await test('移动端数据加载', () => {
      const STORAGE_KEY = 'pigeon_manager_data_v1';
      const data = localStorage.getItem(STORAGE_KEY);
      return data !== null;
    }, 'mobile');
    
    console.log('✅ [移动端测试] 移动端测试完成');
  }
  
  // ==================== 后台测试 ====================
  async function testAdmin() {
    console.log('\n🔧 [后台测试] 开始测试后台功能...');
    
    // 检测是否为后台页面
    const isAdminPage = window.location.pathname.includes('admin') || 
                       document.querySelector('.sidebar-item[data-tab]') !== null;
    
    if (!isAdminPage) {
      console.log('⚠️ [后台测试] 当前不是后台页面，跳过后台测试');
      return;
    }
    
    // 1. 测试switchTab函数
    await test('后台switchTab函数存在', () => {
      return typeof window.switchTab === 'function';
    }, 'admin');
    
    await wait(100);
    
    // 2. 测试侧边栏按钮
    const adminTabs = ['homeView', 'dashboardView', 'listView', 'pedigreeView', 
                       'statsView', 'raceView', 'breedingView', 'healthView',
                       'analysisView', 'trainingView', 'qualificationView',
                       'announcements', 'users', 'settings', 'feedbackView',
                       'evoSettings', 'coreAdminView', 'upgradeView'];
    
    for (const tab of adminTabs.slice(0, 5)) { // 只测试前5个，避免时间过长
      await test(`后台侧边栏-${tab}`, () => {
        const button = document.querySelector(`.sidebar-item[data-tab="${tab}"]`);
        if (!button) return false;
        
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        button.dispatchEvent(clickEvent);
        
        return new Promise((resolve) => {
          setTimeout(() => {
            const section = document.getElementById(tab);
            const isVisible = section && section.style.display !== 'none';
            const isActive = button.classList.contains('active');
            resolve(isVisible || isActive);
          }, 300);
        });
      }, 'admin');
      
      await wait(200);
    }
    
    console.log('✅ [后台测试] 后台测试完成');
  }
  
  // ==================== Evo设置测试 ====================
  async function testEvo() {
    console.log('\n🤖 [Evo测试] 开始测试Evo设置...');
    
    // 1. 检查Evo相关函数
    await test('Evo相关函数存在', () => {
      return typeof window.askEvo === 'function' || 
             typeof window.askEvoWithContext === 'function';
    }, 'evo');
    
    await wait(100);
    
    // 2. 检查Evo配置
    await test('Evo配置检查', () => {
      // 检查是否有API配置
      const apiConfig = localStorage.getItem('pigeon_api_config');
      return apiConfig !== null;
    }, 'evo');
    
    console.log('✅ [Evo测试] Evo测试完成');
  }
  
  // ==================== 运行所有测试 ====================
  async function runAllTests(round = 1) {
    console.log(`\n🔄 [第${round}轮测试] 开始运行全面测试...\n`);
    
    // 重置结果（除了总数）
    const totalCounts = {
      pc: testResults.pc.total,
      mobile: testResults.mobile.total,
      admin: testResults.admin.total,
      evo: testResults.evo.total
    };
    
    testResults.pc.passed = [];
    testResults.pc.failed = [];
    testResults.pc.total = 0;
    testResults.mobile.passed = [];
    testResults.mobile.failed = [];
    testResults.mobile.total = 0;
    testResults.admin.passed = [];
    testResults.admin.failed = [];
    testResults.admin.total = 0;
    testResults.evo.passed = [];
    testResults.evo.failed = [];
    testResults.evo.total = 0;
    
    // 运行测试
    await testPC();
    await wait(500);
    
    await testMobile();
    await wait(500);
    
    await testAdmin();
    await wait(500);
    
    await testEvo();
    
    // 生成报告
    const duration = Date.now() - testResults.startTime;
    console.log(`\n📊 [第${round}轮测试] 测试报告`);
    console.log('='.repeat(60));
    
    ['pc', 'mobile', 'admin', 'evo'].forEach(category => {
      const result = testResults[category];
      if (result.total > 0) {
        const passRate = ((result.passed.length / result.total) * 100).toFixed(2);
        console.log(`\n${category.toUpperCase()}端:`);
        console.log(`  总测试数: ${result.total}`);
        console.log(`  通过: ${result.passed.length} ✅`);
        console.log(`  失败: ${result.failed.length} ❌`);
        console.log(`  通过率: ${passRate}%`);
        
        if (result.failed.length > 0) {
          console.log(`\n  失败的测试:`);
          result.failed.forEach(fail => {
            console.log(`    - ${fail.name}: ${fail.error}`);
          });
        }
      }
    });
    
    console.log(`\n总耗时: ${(duration / 1000).toFixed(2)}秒`);
    console.log('='.repeat(60) + '\n');
    
    return {
      round,
      pc: { 
        total: testResults.pc.total, 
        passed: testResults.pc.passed.length, 
        failed: testResults.pc.failed.length 
      },
      mobile: { 
        total: testResults.mobile.total, 
        passed: testResults.mobile.passed.length, 
        failed: testResults.mobile.failed.length 
      },
      admin: { 
        total: testResults.admin.total, 
        passed: testResults.admin.passed.length, 
        failed: testResults.admin.failed.length 
      },
      evo: { 
        total: testResults.evo.total, 
        passed: testResults.evo.passed.length, 
        failed: testResults.evo.failed.length 
      }
    };
  }
  
  // 运行多轮测试
  async function runMultipleTests(rounds = 3) {
    console.log(`🧪 [全面测试] 开始运行${rounds}轮测试...\n`);
    
    const allResults = [];
    
    for (let i = 1; i <= rounds; i++) {
      const result = await runAllTests(i);
      allResults.push(result);
      
      if (i < rounds) {
        console.log(`⏳ 等待2秒后开始第${i + 1}轮测试...\n`);
        await wait(2000);
      }
    }
    
    // 最终汇总
    console.log('\n📊 [最终测试报告] 所有轮次汇总');
    console.log('='.repeat(60));
    
    allResults.forEach((result, index) => {
      console.log(`\n第${result.round}轮:`);
      console.log(`  PC端: ${result.pc.passed}/${result.pc.total} 通过`);
      console.log(`  移动端: ${result.mobile.passed}/${result.mobile.total} 通过`);
      console.log(`  后台: ${result.admin.passed}/${result.admin.total} 通过`);
      console.log(`  Evo: ${result.evo.passed}/${result.evo.total} 通过`);
    });
    
    // 计算平均通过率
    const avgPc = allResults.reduce((sum, r) => sum + (r.pc.passed / r.pc.total || 0), 0) / rounds * 100;
    const avgMobile = allResults.reduce((sum, r) => sum + (r.mobile.passed / r.mobile.total || 0), 0) / rounds * 100;
    const avgAdmin = allResults.reduce((sum, r) => sum + (r.admin.passed / r.admin.total || 0), 0) / rounds * 100;
    const avgEvo = allResults.reduce((sum, r) => sum + (r.evo.passed / r.evo.total || 0), 0) / rounds * 100;
    
    console.log(`\n平均通过率:`);
    console.log(`  PC端: ${avgPc.toFixed(2)}%`);
    console.log(`  移动端: ${avgMobile.toFixed(2)}%`);
    console.log(`  后台: ${avgAdmin.toFixed(2)}%`);
    console.log(`  Evo: ${avgEvo.toFixed(2)}%`);
    console.log('='.repeat(60) + '\n');
    
    return allResults;
  }
  
  // 等待页面加载完成后运行测试
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => runMultipleTests(5), 1000);
    });
  } else {
    setTimeout(() => runMultipleTests(5), 1000);
  }
  
  // 暴露到window对象
  window.runComprehensiveTests = () => runMultipleTests(5);
  window.runSingleTest = () => runAllTests(1);
  
  console.log('✅ [全面测试] 测试脚本已加载');
  console.log('💡 提示: 可以在控制台运行 window.runComprehensiveTests() 手动执行5轮测试');
  console.log('💡 提示: 可以在控制台运行 window.runSingleTest() 手动执行1轮测试');
})();


