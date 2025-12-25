/**
 * 四轮全面功能检查脚本
 * 确保所有导航和功能模块正常工作
 */

(function() {
  'use strict';
  
  console.log('🔍 开始四轮全面功能检查...\n');
  
  const testResults = {
    rounds: [],
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0
  };
  
  // 所有需要测试的视图
  const ALL_VIEWS = [
    'homeView', 'dashboardView', 'listView', 'pedigreeView',
    'statsView', 'raceView', 'breedingView', 'healthView',
    'analysisView', 'trainingView', 'qualificationView'
  ];
  
  // 测试单个视图切换
  function testViewSwitch(viewName, roundNumber) {
    return new Promise((resolve) => {
      testResults.totalTests++;
      
      const sidebarItem = document.querySelector(`.sidebar-item[data-view="${viewName}"]`);
      if (!sidebarItem) {
        console.error(`  ❌ [第${roundNumber}轮] 侧边栏菜单项不存在: ${viewName}`);
        testResults.totalFailed++;
        resolve(false);
        return;
      }
      
      const viewElement = document.getElementById(viewName);
      if (!viewElement) {
        console.error(`  ❌ [第${roundNumber}轮] 视图元素不存在: ${viewName}`);
        testResults.totalFailed++;
        resolve(false);
        return;
      }
      
      // 模拟点击
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      
      sidebarItem.dispatchEvent(clickEvent);
      
      // 等待视图切换
      setTimeout(() => {
        const isVisible = viewElement.style.display !== 'none' && 
                         window.getComputedStyle(viewElement).display !== 'none';
        const isActive = sidebarItem.classList.contains('active');
        
        if (isVisible && isActive) {
          console.log(`  ✅ [第${roundNumber}轮] ${viewName} - 切换成功`);
          testResults.totalPassed++;
          resolve(true);
        } else {
          console.error(`  ❌ [第${roundNumber}轮] ${viewName} - 切换失败 (显示: ${isVisible}, 激活: ${isActive})`);
          testResults.totalFailed++;
          resolve(false);
        }
      }, 300);
    });
  }
  
  // 检查基础功能
  function checkBasicFunctions(roundNumber) {
    console.log(`\n📋 [第${roundNumber}轮] 基础功能检查:`);
    
    let passed = 0;
    let failed = 0;
    
    // 检查switchView函数
    testResults.totalTests++;
    if (typeof window.switchView === 'function') {
      console.log(`  ✅ switchView函数存在`);
      testResults.totalPassed++;
      passed++;
    } else {
      console.error(`  ❌ switchView函数不存在`);
      testResults.totalFailed++;
      failed++;
    }
    
    // 检查views对象
    testResults.totalTests++;
    if (window.views && typeof window.views === 'object') {
      console.log(`  ✅ views对象存在`);
      testResults.totalPassed++;
      passed++;
    } else {
      console.error(`  ❌ views对象不存在`);
      testResults.totalFailed++;
      failed++;
    }
    
    // 检查所有视图元素
    ALL_VIEWS.forEach(viewName => {
      testResults.totalTests++;
      const element = document.getElementById(viewName);
      if (element) {
        console.log(`  ✅ 视图元素存在: ${viewName}`);
        testResults.totalPassed++;
        passed++;
      } else {
        console.error(`  ❌ 视图元素不存在: ${viewName}`);
        testResults.totalFailed++;
        failed++;
      }
    });
    
    // 检查所有侧边栏菜单项
    ALL_VIEWS.forEach(viewName => {
      testResults.totalTests++;
      const item = document.querySelector(`.sidebar-item[data-view="${viewName}"]`);
      if (item) {
        console.log(`  ✅ 侧边栏菜单项存在: ${viewName}`);
        testResults.totalPassed++;
        passed++;
      } else {
        console.error(`  ❌ 侧边栏菜单项不存在: ${viewName}`);
        testResults.totalFailed++;
        failed++;
      }
    });
    
    return { passed, failed };
  }
  
  // 执行单轮测试
  async function runSingleRound(roundNumber) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 第 ${roundNumber} 轮测试开始`);
    console.log('='.repeat(60));
    
    const roundResult = {
      round: roundNumber,
      startTime: Date.now(),
      basicCheck: null,
      viewSwitches: [],
      passed: 0,
      failed: 0
    };
    
    // 1. 基础功能检查
    roundResult.basicCheck = checkBasicFunctions(roundNumber);
    roundResult.passed += roundResult.basicCheck.passed;
    roundResult.failed += roundResult.basicCheck.failed;
    
    // 2. 测试所有视图切换
    console.log(`\n📋 [第${roundNumber}轮] 视图切换测试:`);
    for (const viewName of ALL_VIEWS) {
      const result = await testViewSwitch(viewName, roundNumber);
      roundResult.viewSwitches.push({ view: viewName, passed: result });
      if (result) {
        roundResult.passed++;
      } else {
        roundResult.failed++;
      }
      // 短暂延迟，避免过快切换
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    roundResult.endTime = Date.now();
    roundResult.duration = roundResult.endTime - roundResult.startTime;
    
    console.log(`\n📊 [第${roundNumber}轮] 测试结果:`);
    console.log(`  通过: ${roundResult.passed}`);
    console.log(`  失败: ${roundResult.failed}`);
    console.log(`  耗时: ${roundResult.duration}ms`);
    
    testResults.rounds.push(roundResult);
    
    return roundResult;
  }
  
  // 执行所有测试
  async function runAllRounds() {
    console.log('🚀 开始执行四轮全面功能检查...\n');
    
    for (let round = 1; round <= 4; round++) {
      await runSingleRound(round);
      
      if (round < 4) {
        console.log(`\n⏳ 等待1秒后开始第 ${round + 1} 轮测试...\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 输出最终结果
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 最终测试结果汇总');
    console.log('='.repeat(60));
    console.log(`总测试数: ${testResults.totalTests}`);
    console.log(`总通过数: ${testResults.totalPassed}`);
    console.log(`总失败数: ${testResults.totalFailed}`);
    console.log(`通过率: ${((testResults.totalPassed / testResults.totalTests) * 100).toFixed(2)}%`);
    
    // 每轮详细结果
    console.log(`\n📋 各轮测试详情:`);
    testResults.rounds.forEach((round, index) => {
      console.log(`\n第 ${round.round} 轮:`);
      console.log(`  通过: ${round.passed}, 失败: ${round.failed}, 耗时: ${round.duration}ms`);
      
      // 找出失败的视图切换
      const failedViews = round.viewSwitches.filter(v => !v.passed);
      if (failedViews.length > 0) {
        console.log(`  失败的视图: ${failedViews.map(v => v.view).join(', ')}`);
      }
    });
    
    // 统计每个视图的成功率
    console.log(`\n📊 各视图切换成功率:`);
    ALL_VIEWS.forEach(viewName => {
      const results = testResults.rounds.flatMap(r => 
        r.viewSwitches.filter(v => v.view === viewName)
      );
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      const rate = ((passed / total) * 100).toFixed(1);
      const status = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
      console.log(`  ${status} ${viewName}: ${passed}/${total} (${rate}%)`);
    });
    
    if (testResults.totalFailed === 0) {
      console.log(`\n🎉 所有测试通过！功能正常！`);
    } else {
      console.log(`\n⚠️ 部分测试失败，请检查上述错误`);
    }
    
    // 保存结果到全局
    window.testResults = testResults;
    
    return testResults;
  }
  
  // 等待页面加载完成后运行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        runAllRounds();
      }, 2000);
    });
  } else {
    setTimeout(() => {
      runAllRounds();
    }, 2000);
  }
  
  // 暴露到全局
  window.runFourRoundTests = runAllRounds;
  
})();

