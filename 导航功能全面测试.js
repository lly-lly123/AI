/**
 * 导航功能全面测试脚本
 * 用于验证所有侧边栏菜单点击和视图切换功能
 */

console.log('🧪 开始导航功能全面测试...');

// 测试配置
const TEST_CONFIG = {
  rounds: 4, // 进行4轮测试
  delayBetweenRounds: 1000, // 每轮之间的延迟（毫秒）
  delayBetweenTests: 500, // 每个测试之间的延迟（毫秒）
};

// 测试结果
let testResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: []
};

// 所有需要测试的视图
const VIEWS_TO_TEST = [
  { view: 'homeView', name: '首页' },
  { view: 'dashboardView', name: '数据概览' },
  { view: 'listView', name: '鸽子管理' },
  { view: 'pedigreeView', name: '血统关系' },
  { view: 'statsView', name: '统计分析' },
  { view: 'raceView', name: '比赛与成绩管理' },
  { view: 'breedingView', name: '繁育与配对' },
  { view: 'healthView', name: '健康管理' },
  { view: 'analysisView', name: '智能分析中心' },
  { view: 'trainingView', name: '训练模块' },
  { view: 'qualificationView', name: '能力综合分析' },
];

// 测试函数：检查视图元素是否存在
function testViewElementExists(viewName) {
  const element = document.getElementById(viewName);
  if (element) {
    console.log(`✅ 视图元素存在: ${viewName}`);
    return true;
  } else {
    console.error(`❌ 视图元素不存在: ${viewName}`);
    testResults.errors.push(`视图元素不存在: ${viewName}`);
    return false;
  }
}

// 测试函数：检查侧边栏菜单项是否存在
function testSidebarItemExists(viewName) {
  const sidebarItem = document.querySelector(`.sidebar-item[data-view="${viewName}"]`);
  if (sidebarItem) {
    console.log(`✅ 侧边栏菜单项存在: ${viewName}`);
    return true;
  } else {
    console.error(`❌ 侧边栏菜单项不存在: ${viewName}`);
    testResults.errors.push(`侧边栏菜单项不存在: ${viewName}`);
    return false;
  }
}

// 测试函数：检查switchView函数是否存在
function testSwitchViewFunction() {
  if (typeof window.switchView === 'function') {
    console.log('✅ switchView函数存在');
    return true;
  } else {
    console.error('❌ switchView函数不存在');
    testResults.errors.push('switchView函数不存在');
    return false;
  }
}

// 测试函数：检查views对象是否存在
function testViewsObject() {
  if (window.views && typeof window.views === 'object') {
    console.log('✅ views对象存在');
    return true;
  } else {
    console.error('❌ views对象不存在');
    testResults.errors.push('views对象不存在');
    return false;
  }
}

// 测试函数：模拟点击侧边栏菜单项
function testSidebarItemClick(viewName, viewDisplayName) {
  return new Promise((resolve) => {
    testResults.totalTests++;
    
    const sidebarItem = document.querySelector(`.sidebar-item[data-view="${viewName}"]`);
    if (!sidebarItem) {
      console.error(`❌ 无法找到侧边栏菜单项: ${viewName}`);
      testResults.failedTests++;
      testResults.errors.push(`无法找到侧边栏菜单项: ${viewName}`);
      resolve(false);
      return;
    }
    
    // 记录当前视图
    const currentView = Array.from(document.querySelectorAll('[id$="View"]')).find(
      el => el.style.display !== 'none' && el.id.endsWith('View')
    );
    
    console.log(`🔘 测试点击: ${viewDisplayName} (${viewName})`);
    
    // 创建并触发点击事件
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    sidebarItem.dispatchEvent(clickEvent);
    
    // 等待视图切换完成
    setTimeout(() => {
      const targetView = document.getElementById(viewName);
      if (!targetView) {
        console.error(`❌ 目标视图不存在: ${viewName}`);
        testResults.failedTests++;
        testResults.errors.push(`目标视图不存在: ${viewName}`);
        resolve(false);
        return;
      }
      
      // 检查视图是否显示
      const isVisible = targetView.style.display !== 'none' && 
                       window.getComputedStyle(targetView).display !== 'none';
      
      // 检查侧边栏菜单项是否激活
      const isActive = sidebarItem.classList.contains('active');
      
      if (isVisible && isActive) {
        console.log(`✅ 测试通过: ${viewDisplayName} - 视图已显示且菜单项已激活`);
        testResults.passedTests++;
        resolve(true);
      } else {
        console.error(`❌ 测试失败: ${viewDisplayName} - 视图显示: ${isVisible}, 菜单项激活: ${isActive}`);
        testResults.failedTests++;
        testResults.errors.push(`视图切换失败: ${viewDisplayName} - 视图显示: ${isVisible}, 菜单项激活: ${isActive}`);
        resolve(false);
      }
    }, 300);
  });
}

// 执行单轮测试
async function runSingleRound(roundNumber) {
  console.log(`\n🔄 ========== 第 ${roundNumber} 轮测试 ==========`);
  
  // 1. 基础检查
  console.log('\n📋 步骤1: 基础检查');
  testSwitchViewFunction();
  testViewsObject();
  
  // 2. 检查所有视图元素
  console.log('\n📋 步骤2: 检查视图元素');
  VIEWS_TO_TEST.forEach(({ view }) => {
    testViewElementExists(view.view);
  });
  
  // 3. 检查所有侧边栏菜单项
  console.log('\n📋 步骤3: 检查侧边栏菜单项');
  VIEWS_TO_TEST.forEach(({ view }) => {
    testSidebarItemExists(view.view);
  });
  
  // 4. 测试每个视图的切换
  console.log('\n📋 步骤4: 测试视图切换');
  for (const { view, name } of VIEWS_TO_TEST) {
    await testSidebarItemClick(view, name);
    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenTests));
  }
  
  console.log(`\n✅ 第 ${roundNumber} 轮测试完成`);
}

// 执行所有测试
async function runAllTests() {
  console.log('🚀 开始执行全面测试...\n');
  console.log(`配置: ${TEST_CONFIG.rounds} 轮测试，每轮间隔 ${TEST_CONFIG.delayBetweenRounds}ms\n`);
  
  for (let round = 1; round <= TEST_CONFIG.rounds; round++) {
    await runSingleRound(round);
    
    if (round < TEST_CONFIG.rounds) {
      console.log(`\n⏳ 等待 ${TEST_CONFIG.delayBetweenRounds}ms 后开始下一轮...\n`);
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delayBetweenRounds));
    }
  }
  
  // 输出测试结果
  console.log('\n\n📊 ========== 测试结果汇总 ==========');
  console.log(`总测试数: ${testResults.totalTests}`);
  console.log(`通过: ${testResults.passedTests}`);
  console.log(`失败: ${testResults.failedTests}`);
  console.log(`通过率: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(2)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 错误列表:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (testResults.failedTests === 0) {
    console.log('\n🎉 所有测试通过！导航功能正常！');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查上述错误');
  }
  
  return testResults;
}

// 如果是在浏览器环境中，自动运行测试
if (typeof window !== 'undefined') {
  // 等待页面完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        runAllTests().then(results => {
          window.testResults = results;
        });
      }, 2000);
    });
  } else {
    setTimeout(() => {
      runAllTests().then(results => {
        window.testResults = results;
      });
    }, 2000);
  }
}

// 导出测试函数（如果是在Node.js环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    runSingleRound,
    testSidebarItemClick,
    testViewElementExists,
    testSidebarItemExists,
    testSwitchViewFunction,
    testViewsObject
  };
}

