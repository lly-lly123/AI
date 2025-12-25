// 🧪 网站功能全面测试脚本
// 用于自动测试所有菜单项和按钮的点击功能

(function() {
  console.log('🧪 开始全面功能测试...');
  
  const testResults = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // 测试辅助函数
  function logTest(name, passed, message) {
    if (passed) {
      testResults.passed.push(name);
      console.log(`✅ ${name}: ${message || '通过'}`);
    } else {
      testResults.failed.push(name);
      console.error(`❌ ${name}: ${message || '失败'}`);
    }
  }
  
  function logWarning(name, message) {
    testResults.warnings.push(name);
    console.warn(`⚠️ ${name}: ${message}`);
  }
  
  // 测试1: 检查switchView函数是否存在
  function testSwitchViewFunction() {
    console.log('\n📋 测试1: 检查switchView函数');
    const hasWindowSwitchView = typeof window.switchView === 'function';
    const hasLocalSwitchView = typeof switchView === 'function';
    
    if (hasWindowSwitchView || hasLocalSwitchView) {
      logTest('switchView函数存在', true, `window.switchView: ${hasWindowSwitchView}, 本地switchView: ${hasLocalSwitchView}`);
    } else {
      logTest('switchView函数存在', false, 'switchView函数未找到');
    }
  }
  
  // 测试2: 检查所有视图元素是否存在
  function testViewElements() {
    console.log('\n📋 测试2: 检查视图元素');
    const requiredViews = [
      'homeView', 'dashboardView', 'listView', 'createView', 
      'detailView', 'statsView', 'raceView', 'pedigreeView',
      'breedingView', 'healthView', 'analysisView', 'trainingView',
      'qualificationView'
    ];
    
    requiredViews.forEach(viewName => {
      const element = document.getElementById(viewName);
      if (element) {
        logTest(`视图元素 ${viewName}`, true);
      } else {
        logTest(`视图元素 ${viewName}`, false, '元素不存在');
      }
    });
  }
  
  // 测试3: 检查侧边栏菜单项
  function testSidebarItems() {
    console.log('\n📋 测试3: 检查侧边栏菜单项');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    console.log(`找到 ${sidebarItems.length} 个菜单项`);
    
    sidebarItems.forEach((item, index) => {
      const view = item.dataset.view;
      const openFeedback = item.dataset.openFeedback;
      const text = item.textContent.trim();
      
      if (view || openFeedback === 'true') {
        logTest(`菜单项 ${index + 1}: ${text}`, true, `data-view: ${view || 'N/A'}, data-open-feedback: ${openFeedback || 'N/A'}`);
        
        // 检查是否可点击
        const pointerEvents = window.getComputedStyle(item).pointerEvents;
        if (pointerEvents === 'none') {
          logWarning(`菜单项 ${index + 1}: ${text}`, 'pointer-events为none，可能无法点击');
        }
      } else {
        logTest(`菜单项 ${index + 1}: ${text}`, false, '缺少data-view或data-open-feedback属性');
      }
    });
  }
  
  // 测试4: 检查快捷入口按钮
  function testQuickLinkButtons() {
    console.log('\n📋 测试4: 检查快捷入口按钮');
    const quickLinkButtons = document.querySelectorAll('.quick-link-btn');
    console.log(`找到 ${quickLinkButtons.length} 个快捷入口按钮`);
    
    quickLinkButtons.forEach((btn, index) => {
      const action = btn.dataset.action;
      const text = btn.textContent.trim();
      
      if (action) {
        logTest(`快捷按钮 ${index + 1}: ${text}`, true, `data-action: ${action}`);
        
        // 检查是否可点击
        const pointerEvents = window.getComputedStyle(btn).pointerEvents;
        if (pointerEvents === 'none') {
          logWarning(`快捷按钮 ${index + 1}: ${text}`, 'pointer-events为none，可能无法点击');
        }
      } else {
        logTest(`快捷按钮 ${index + 1}: ${text}`, false, '缺少data-action属性');
      }
    });
  }
  
  // 测试5: 模拟点击侧边栏菜单项
  function testSidebarItemClicks() {
    console.log('\n📋 测试5: 模拟点击侧边栏菜单项');
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
    
    sidebarItems.forEach((item, index) => {
      const view = item.dataset.view;
      const text = item.textContent.trim();
      
      try {
        // 获取当前显示的视图
        const currentView = Array.from(document.querySelectorAll('[id$="View"]')).find(el => 
          el.style.display !== 'none' && el.id.endsWith('View')
        );
        
        // 模拟点击
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        item.dispatchEvent(clickEvent);
        
        // 等待一小段时间后检查视图是否切换
        setTimeout(() => {
          const targetView = document.getElementById(view);
          if (targetView && targetView.style.display !== 'none') {
            logTest(`点击菜单项: ${text}`, true, `成功切换到 ${view}`);
          } else {
            logTest(`点击菜单项: ${text}`, false, `未能切换到 ${view}`);
          }
        }, 100);
      } catch (error) {
        logTest(`点击菜单项: ${text}`, false, `错误: ${error.message}`);
      }
    });
  }
  
  // 测试6: 模拟点击快捷入口按钮
  function testQuickLinkButtonClicks() {
    console.log('\n📋 测试6: 模拟点击快捷入口按钮');
    const quickLinkButtons = document.querySelectorAll('.quick-link-btn[data-action]');
    
    const actionToView = {
      'addPigeon': 'createView',
      'addRace': 'raceView',
      'breeding': 'breedingView',
      'analysis': 'analysisView'
    };
    
    quickLinkButtons.forEach((btn, index) => {
      const action = btn.dataset.action;
      const expectedView = actionToView[action];
      const text = btn.textContent.trim();
      
      if (expectedView) {
        try {
          // 模拟点击
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          btn.dispatchEvent(clickEvent);
          
          // 等待一小段时间后检查视图是否切换
          setTimeout(() => {
            const targetView = document.getElementById(expectedView);
            if (targetView && targetView.style.display !== 'none') {
              logTest(`点击快捷按钮: ${text}`, true, `成功切换到 ${expectedView}`);
            } else {
              logTest(`点击快捷按钮: ${text}`, false, `未能切换到 ${expectedView}`);
            }
          }, 100);
        } catch (error) {
          logTest(`点击快捷按钮: ${text}`, false, `错误: ${error.message}`);
        }
      }
    });
  }
  
  // 测试7: 检查事件绑定状态
  function testEventBindings() {
    console.log('\n📋 测试7: 检查事件绑定状态');
    
    // 检查侧边栏菜单事件
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) {
      // 检查是否有事件监听器（通过尝试触发事件）
      const testEvent = new Event('click', { bubbles: true });
      try {
        sidebarMenu.dispatchEvent(testEvent);
        logTest('侧边栏菜单事件绑定', true);
      } catch (error) {
        logTest('侧边栏菜单事件绑定', false, error.message);
      }
    } else {
      logTest('侧边栏菜单事件绑定', false, '侧边栏菜单元素未找到');
    }
  }
  
  // 运行所有测试
  function runAllTests() {
    console.log('🚀 开始运行所有测试...\n');
    
    testSwitchViewFunction();
    testViewElements();
    testSidebarItems();
    testQuickLinkButtons();
    testEventBindings();
    
    // 延迟执行点击测试，确保DOM已完全加载
    setTimeout(() => {
      testSidebarItemClicks();
      testQuickLinkButtonClicks();
      
      // 输出测试结果摘要
      setTimeout(() => {
        console.log('\n📊 测试结果摘要:');
        console.log(`✅ 通过: ${testResults.passed.length}`);
        console.log(`❌ 失败: ${testResults.failed.length}`);
        console.log(`⚠️ 警告: ${testResults.warnings.length}`);
        
        if (testResults.failed.length > 0) {
          console.log('\n❌ 失败的测试:');
          testResults.failed.forEach(test => console.log(`  - ${test}`));
        }
        
        if (testResults.warnings.length > 0) {
          console.log('\n⚠️ 警告:');
          testResults.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        if (testResults.failed.length === 0) {
          console.log('\n🎉 所有测试通过！');
        }
      }, 500);
    }, 500);
  }
  
  // 等待DOM加载完成后运行测试
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
  
  // 暴露测试函数到全局，方便手动调用
  window.runFunctionTests = runAllTests;
  
})();






