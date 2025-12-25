// 🎭 用户场景模拟测试脚本
// 模拟真实用户使用网站的各种场景

(function() {
  console.log('🎭 开始用户场景模拟测试...');
  
  const scenarios = [];
  let currentScenarioIndex = 0;
  
  // 场景定义
  const userScenarios = [
    {
      name: '场景1: 新用户首次访问',
      steps: [
        { action: 'wait', time: 500, desc: '等待页面加载' },
        { action: 'checkView', view: 'homeView', desc: '检查是否显示首页' },
        { action: 'click', selector: '.sidebar-item[data-view="dashboardView"]', desc: '点击数据概览' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'dashboardView', desc: '检查是否切换到数据概览' },
      ]
    },
    {
      name: '场景2: 查看鸽子列表',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="listView"]', desc: '点击鸽子管理' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'listView', desc: '检查是否显示鸽子列表' },
      ]
    },
    {
      name: '场景3: 使用快捷入口添加鸽子',
      steps: [
        { action: 'click', selector: '.quick-link-btn[data-action="addPigeon"]', desc: '点击新增鸽子快捷按钮' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'createView', desc: '检查是否显示创建表单' },
      ]
    },
    {
      name: '场景4: 查看统计分析',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="statsView"]', desc: '点击统计分析' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'statsView', desc: '检查是否显示统计分析' },
      ]
    },
    {
      name: '场景5: 查看比赛管理',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="raceView"]', desc: '点击比赛与成绩管理' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'raceView', desc: '检查是否显示比赛管理' },
      ]
    },
    {
      name: '场景6: 查看血统关系',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="pedigreeView"]', desc: '点击血统关系' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'pedigreeView', desc: '检查是否显示血统关系' },
      ]
    },
    {
      name: '场景7: 查看繁育配对',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="breedingView"]', desc: '点击繁育与配对' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'breedingView', desc: '检查是否显示繁育配对' },
      ]
    },
    {
      name: '场景8: 使用快捷入口查看配对评估',
      steps: [
        { action: 'click', selector: '.quick-link-btn[data-action="breeding"]', desc: '点击配对评估快捷按钮' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'breedingView', desc: '检查是否显示繁育配对' },
      ]
    },
    {
      name: '场景9: 查看健康管理',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="healthView"]', desc: '点击健康管理' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'healthView', desc: '检查是否显示健康管理' },
      ]
    },
    {
      name: '场景10: 查看智能分析',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="analysisView"]', desc: '点击智能分析中心' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'analysisView', desc: '检查是否显示智能分析' },
      ]
    },
    {
      name: '场景11: 使用快捷入口查看智能分析',
      steps: [
        { action: 'click', selector: '.quick-link-btn[data-action="analysis"]', desc: '点击智能分析快捷按钮' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'analysisView', desc: '检查是否显示智能分析' },
      ]
    },
    {
      name: '场景12: 查看训练模块',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="trainingView"]', desc: '点击训练模块' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'trainingView', desc: '检查是否显示训练模块' },
      ]
    },
    {
      name: '场景13: 查看能力综合分析',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="qualificationView"]', desc: '点击能力综合分析' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'qualificationView', desc: '检查是否显示能力综合分析' },
      ]
    },
    {
      name: '场景14: 返回首页',
      steps: [
        { action: 'click', selector: '.sidebar-item[data-view="homeView"]', desc: '点击首页' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'homeView', desc: '检查是否返回首页' },
      ]
    },
    {
      name: '场景15: 使用快捷入口录入成绩',
      steps: [
        { action: 'click', selector: '.quick-link-btn[data-action="addRace"]', desc: '点击录入成绩快捷按钮' },
        { action: 'wait', time: 300, desc: '等待视图切换' },
        { action: 'checkView', view: 'raceView', desc: '检查是否显示比赛管理' },
      ]
    },
  ];
  
  // 执行步骤
  function executeStep(scenario, stepIndex) {
    const step = scenario.steps[stepIndex];
    if (!step) {
      console.log(`✅ 场景完成: ${scenario.name}`);
      runNextScenario();
      return;
    }
    
    console.log(`  📍 步骤 ${stepIndex + 1}: ${step.desc}`);
    
    switch (step.action) {
      case 'wait':
        setTimeout(() => {
          executeStep(scenario, stepIndex + 1);
        }, step.time);
        break;
        
      case 'click':
        const element = document.querySelector(step.selector);
        if (element) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          element.dispatchEvent(clickEvent);
          setTimeout(() => {
            executeStep(scenario, stepIndex + 1);
          }, 200);
        } else {
          console.error(`  ❌ 元素未找到: ${step.selector}`);
          executeStep(scenario, stepIndex + 1);
        }
        break;
        
      case 'checkView':
        setTimeout(() => {
          const viewElement = document.getElementById(step.view);
          if (viewElement && viewElement.style.display !== 'none') {
            console.log(`  ✅ 视图检查通过: ${step.view}`);
          } else {
            console.error(`  ❌ 视图检查失败: ${step.view} 未显示`);
          }
          executeStep(scenario, stepIndex + 1);
        }, 100);
        break;
        
      default:
        console.warn(`  ⚠️ 未知操作: ${step.action}`);
        executeStep(scenario, stepIndex + 1);
    }
  }
  
  // 运行场景
  function runScenario(scenario) {
    console.log(`\n🎬 开始场景: ${scenario.name}`);
    executeStep(scenario, 0);
  }
  
  // 运行下一个场景
  function runNextScenario() {
    currentScenarioIndex++;
    if (currentScenarioIndex < userScenarios.length) {
      setTimeout(() => {
        runScenario(userScenarios[currentScenarioIndex]);
      }, 500);
    } else {
      console.log('\n🎉 所有用户场景测试完成！');
      console.log(`总共测试了 ${userScenarios.length} 个场景`);
    }
  }
  
  // 开始测试
  function startTests() {
    console.log(`准备测试 ${userScenarios.length} 个用户场景...\n`);
    if (userScenarios.length > 0) {
      runScenario(userScenarios[0]);
    }
  }
  
  // 等待DOM加载完成后开始测试
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(startTests, 1000);
    });
  } else {
    setTimeout(startTests, 1000);
  }
  
  // 暴露到全局，方便手动调用
  window.runUserScenarioTests = startTests;
  
})();
