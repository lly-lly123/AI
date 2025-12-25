// 功能测试脚本 - 模拟用户使用场景
// 在浏览器控制台运行此脚本进行测试

(function() {
  console.log('🧪 开始功能测试...');
  
  const testResults = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // 测试函数
  function test(name, fn) {
    try {
      const result = fn();
      if (result === true || result === undefined) {
        testResults.passed.push(name);
        console.log(`✅ ${name}`);
      } else {
        testResults.failed.push(name);
        console.error(`❌ ${name}: ${result}`);
      }
    } catch (error) {
      testResults.failed.push(name);
      console.error(`❌ ${name}: ${error.message}`);
    }
  }
  
  // 测试1: 检查所有视图元素是否存在
  console.log('\n📋 测试1: 检查视图元素');
  const requiredViews = [
    'homeView', 'dashboardView', 'listView', 'pedigreeView', 
    'statsView', 'raceView', 'breedingView', 'healthView', 
    'analysisView', 'trainingView', 'qualificationView'
  ];
  
  requiredViews.forEach(viewName => {
    test(`视图元素 ${viewName} 存在`, () => {
      const element = document.getElementById(viewName);
      return element !== null;
    });
  });
  
  // 测试2: 检查switchView函数
  console.log('\n📋 测试2: 检查switchView函数');
  test('switchView函数已定义', () => {
    return typeof window.switchView === 'function' || typeof switchView === 'function';
  });
  
  // 测试3: 检查侧边栏菜单项
  console.log('\n📋 测试3: 检查侧边栏菜单项');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  test(`侧边栏菜单项数量: ${sidebarItems.length}`, () => {
    return sidebarItems.length >= 10;
  });
  
  sidebarItems.forEach((item, index) => {
    const view = item.dataset.view;
    const openFeedback = item.dataset.openFeedback;
    test(`菜单项 ${index + 1} (${item.textContent.trim()}) 有data-view或data-open-feedback`, () => {
      return view !== undefined || openFeedback === 'true';
    });
  });
  
  // 测试4: 测试视图切换功能
  console.log('\n📋 测试4: 测试视图切换功能');
  const switchViewFunc = window.switchView || switchView;
  
  if (typeof switchViewFunc === 'function') {
    requiredViews.forEach(viewName => {
      test(`切换到 ${viewName}`, () => {
        try {
          switchViewFunc(viewName);
          const element = document.getElementById(viewName);
          if (!element) return `视图元素 ${viewName} 不存在`;
          
          // 检查视图是否显示
          const isVisible = element.style.display !== 'none' && 
                           window.getComputedStyle(element).display !== 'none';
          return isVisible || `视图 ${viewName} 未显示`;
        } catch (error) {
          return error.message;
        }
      });
      
      // 短暂延迟，让视图切换完成
      setTimeout(() => {}, 100);
    });
  }
  
  // 测试5: 测试侧边栏点击事件
  console.log('\n📋 测试5: 测试侧边栏点击事件');
  sidebarItems.forEach((item, index) => {
    if (item.dataset.view) {
      test(`点击菜单项 ${index + 1} (${item.textContent.trim()})`, () => {
        try {
          // 模拟点击
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          item.dispatchEvent(clickEvent);
          
          // 检查视图是否切换
          const viewName = item.dataset.view;
          const element = document.getElementById(viewName);
          if (!element) return `视图元素 ${viewName} 不存在`;
          
          return true; // 如果没抛出错误，认为成功
        } catch (error) {
          return error.message;
        }
      });
    }
  });
  
  // 测试6: 检查数据加载函数
  console.log('\n📋 测试6: 检查数据加载函数');
  const requiredFunctions = [
    'refreshDashboard', 'refreshList', 'refreshPedigreeView',
    'renderStatsViewTable', 'loadRaces', 'fillBreedingSelects',
    'renderHealthOverview', 'runFullAnalysis', 'loadTrainingRecords',
    'loadQualificationRecords'
  ];
  
  requiredFunctions.forEach(funcName => {
    test(`函数 ${funcName} 存在`, () => {
      return typeof window[funcName] === 'function';
    });
  });
  
  // 测试7: 检查快捷入口按钮
  console.log('\n📋 测试7: 检查快捷入口按钮');
  const quickLinks = document.querySelectorAll('.quick-link-btn');
  test(`快捷入口按钮数量: ${quickLinks.length}`, () => {
    return quickLinks.length > 0;
  });
  
  // 测试8: 检查表单元素
  console.log('\n📋 测试8: 检查表单元素');
  const forms = document.querySelectorAll('form');
  test(`表单数量: ${forms.length}`, () => {
    return forms.length > 0;
  });
  
  // 输出测试结果
  console.log('\n📊 测试结果汇总:');
  console.log(`✅ 通过: ${testResults.passed.length}`);
  console.log(`❌ 失败: ${testResults.failed.length}`);
  console.log(`⚠️ 警告: ${testResults.warnings.length}`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.failed.forEach(test => {
      console.log(`  - ${test}`);
    });
  }
  
  if (testResults.passed.length > 0) {
    console.log('\n✅ 通过的测试:');
    testResults.passed.slice(0, 10).forEach(test => {
      console.log(`  - ${test}`);
    });
    if (testResults.passed.length > 10) {
      console.log(`  ... 还有 ${testResults.passed.length - 10} 个测试通过`);
    }
  }
  
  // 返回测试结果
  return testResults;
})();

