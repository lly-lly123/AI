/**
 * 全面按钮点击问题诊断脚本
 * 检查所有可能导致按钮无法点击的问题
 */

(function() {
  'use strict';
  
  console.log('🔍 开始全面按钮点击问题诊断...\n');
  
  const issues = [];
  const warnings = [];
  const info = [];
  
  // 检查1: 检查全局CSS是否阻止点击
  function checkGlobalCSS() {
    console.log('📋 检查1: 全局CSS样式');
    
    const body = document.body;
    const html = document.documentElement;
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.querySelector('.sidebar');
    
    // 检查body和html的pointer-events
    const bodyPointerEvents = window.getComputedStyle(body).pointerEvents;
    const htmlPointerEvents = window.getComputedStyle(html).pointerEvents;
    
    if (bodyPointerEvents === 'none') {
      issues.push('❌ body元素的pointer-events为none，会阻止所有点击');
    }
    if (htmlPointerEvents === 'none') {
      issues.push('❌ html元素的pointer-events为none，会阻止所有点击');
    }
    
    if (mainContent) {
      const mainPointerEvents = window.getComputedStyle(mainContent).pointerEvents;
      if (mainPointerEvents === 'none') {
        issues.push('❌ .main-content的pointer-events为none，会阻止主内容区点击');
      }
    }
    
    if (sidebar) {
      const sidebarPointerEvents = window.getComputedStyle(sidebar).pointerEvents;
      if (sidebarPointerEvents === 'none') {
        issues.push('❌ .sidebar的pointer-events为none，会阻止侧边栏点击');
      }
    }
    
    console.log(`  body pointer-events: ${bodyPointerEvents}`);
    console.log(`  html pointer-events: ${htmlPointerEvents}`);
    if (mainContent) console.log(`  .main-content pointer-events: ${window.getComputedStyle(mainContent).pointerEvents}`);
    if (sidebar) console.log(`  .sidebar pointer-events: ${window.getComputedStyle(sidebar).pointerEvents}`);
  }
  
  // 检查2: 检查是否有覆盖层遮挡
  function checkOverlays() {
    console.log('\n📋 检查2: 覆盖层检查');
    
    const allElements = document.querySelectorAll('*');
    const overlays = [];
    
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const zIndex = parseInt(style.zIndex);
      const position = style.position;
      const pointerEvents = style.pointerEvents;
      
      // 检查高z-index且可能遮挡的元素
      if ((position === 'fixed' || position === 'absolute') && 
          zIndex > 1000 && 
          pointerEvents !== 'none' &&
          el.offsetWidth > 100 &&
          el.offsetHeight > 100) {
        overlays.push({
          element: el,
          zIndex: zIndex,
          tag: el.tagName,
          class: el.className,
          id: el.id,
          pointerEvents: pointerEvents
        });
      }
    });
    
    if (overlays.length > 0) {
      console.log(`  ⚠️ 发现 ${overlays.length} 个可能遮挡的高z-index元素:`);
      overlays.forEach(overlay => {
        console.log(`    - ${overlay.tag}${overlay.id ? '#' + overlay.id : ''}${overlay.class ? '.' + overlay.class.split(' ')[0] : ''} (z-index: ${overlay.zIndex}, pointer-events: ${overlay.pointerEvents})`);
        if (overlay.pointerEvents !== 'none' && overlay.zIndex > 5000) {
          warnings.push(`⚠️ 高z-index元素可能遮挡按钮: ${overlay.tag}${overlay.id ? '#' + overlay.id : ''} (z-index: ${overlay.zIndex})`);
        }
      });
    } else {
      console.log('  ✅ 未发现明显的覆盖层');
    }
  }
  
  // 检查3: 检查所有按钮的pointer-events
  function checkButtonPointerEvents() {
    console.log('\n📋 检查3: 按钮pointer-events检查');
    
    const buttons = document.querySelectorAll('button, .btn, .sidebar-item, .quick-link-btn, [role="button"]');
    let disabledCount = 0;
    let enabledCount = 0;
    
    buttons.forEach((btn, index) => {
      const pointerEvents = window.getComputedStyle(btn).pointerEvents;
      const cursor = window.getComputedStyle(btn).cursor;
      const display = window.getComputedStyle(btn).display;
      const visibility = window.getComputedStyle(btn).visibility;
      const opacity = window.getComputedStyle(btn).opacity;
      
      if (pointerEvents === 'none') {
        disabledCount++;
        const btnText = btn.textContent.trim().substring(0, 30);
        issues.push(`❌ 按钮pointer-events为none: "${btnText}" (${btn.tagName}${btn.className ? '.' + btn.className.split(' ')[0] : ''})`);
      } else {
        enabledCount++;
      }
      
      if (display === 'none') {
        warnings.push(`⚠️ 按钮被隐藏: ${btn.textContent.trim().substring(0, 30)}`);
      }
      if (visibility === 'hidden') {
        warnings.push(`⚠️ 按钮visibility为hidden: ${btn.textContent.trim().substring(0, 30)}`);
      }
      if (parseFloat(opacity) < 0.1) {
        warnings.push(`⚠️ 按钮透明度极低: ${btn.textContent.trim().substring(0, 30)}`);
      }
    });
    
    console.log(`  总按钮数: ${buttons.length}`);
    console.log(`  可点击: ${enabledCount}`);
    console.log(`  不可点击 (pointer-events: none): ${disabledCount}`);
    
    if (disabledCount > 0) {
      issues.push(`❌ 发现 ${disabledCount} 个按钮的pointer-events为none`);
    }
  }
  
  // 检查4: 检查事件绑定
  function checkEventBindings() {
    console.log('\n📋 检查4: 事件绑定检查');
    
    // 检查侧边栏菜单项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    console.log(`  侧边栏菜单项数量: ${sidebarItems.length}`);
    
    sidebarItems.forEach((item, index) => {
      const hasView = item.dataset.view || item.dataset.openFeedback;
      const bound = item.dataset.bound === 'true';
      const pointerEvents = window.getComputedStyle(item).pointerEvents;
      
      if (!hasView) {
        warnings.push(`⚠️ 侧边栏菜单项缺少data-view或data-open-feedback: ${item.textContent.trim()}`);
      }
      
      if (!bound && pointerEvents !== 'none') {
        warnings.push(`⚠️ 侧边栏菜单项可能未绑定事件: ${item.textContent.trim()}`);
      }
    });
    
    // 检查快捷入口按钮
    const quickLinks = document.querySelectorAll('.quick-link-btn');
    console.log(`  快捷入口按钮数量: ${quickLinks.length}`);
    
    quickLinks.forEach((btn, index) => {
      const action = btn.dataset.action;
      const bound = btn.dataset.bound === 'true';
      const pointerEvents = window.getComputedStyle(btn).pointerEvents;
      
      if (!action) {
        warnings.push(`⚠️ 快捷入口按钮缺少data-action: ${btn.textContent.trim()}`);
      }
      
      if (!bound && pointerEvents !== 'none') {
        warnings.push(`⚠️ 快捷入口按钮可能未绑定事件: ${btn.textContent.trim()}`);
      }
    });
    
    // 检查switchView函数
    if (typeof window.switchView !== 'function') {
      issues.push('❌ window.switchView函数不存在');
    } else {
      info.push('✅ window.switchView函数存在');
    }
    
    // 检查views对象
    if (!window.views || typeof window.views !== 'object') {
      issues.push('❌ window.views对象不存在');
    } else {
      info.push('✅ window.views对象存在');
    }
  }
  
  // 检查5: 检查是否有JavaScript错误
  function checkJavaScriptErrors() {
    console.log('\n📋 检查5: JavaScript错误检查');
    
    // 检查控制台错误（需要用户查看）
    console.log('  ℹ️ 请检查浏览器控制台是否有JavaScript错误');
    
    // 尝试执行一些关键函数
    try {
      if (typeof window.switchView === 'function') {
        console.log('  ✅ switchView函数可调用');
      }
    } catch (error) {
      issues.push(`❌ switchView函数调用出错: ${error.message}`);
    }
  }
  
  // 检查6: 检查所有视图元素
  function checkViewElements() {
    console.log('\n📋 检查6: 视图元素检查');
    
    const requiredViews = [
      'homeView', 'dashboardView', 'listView', 'pedigreeView',
      'statsView', 'raceView', 'breedingView', 'healthView',
      'analysisView', 'trainingView', 'qualificationView'
    ];
    
    requiredViews.forEach(viewName => {
      const element = document.getElementById(viewName);
      if (!element) {
        issues.push(`❌ 视图元素不存在: ${viewName}`);
      } else {
        const display = window.getComputedStyle(element).display;
        const pointerEvents = window.getComputedStyle(element).pointerEvents;
        if (pointerEvents === 'none') {
          warnings.push(`⚠️ 视图元素pointer-events为none: ${viewName}`);
        }
      }
    });
  }
  
  // 检查7: 测试实际点击
  function testActualClicks() {
    console.log('\n📋 检查7: 实际点击测试');
    
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
    let clickableCount = 0;
    let unclickableCount = 0;
    
    sidebarItems.forEach((item, index) => {
      // 检查元素是否可见和可点击
      const style = window.getComputedStyle(item);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' &&
                       parseFloat(style.opacity) > 0.1;
      const isClickable = style.pointerEvents !== 'none' &&
                         style.cursor === 'pointer' ||
                         style.cursor === 'default';
      
      if (isVisible && isClickable) {
        clickableCount++;
      } else {
        unclickableCount++;
        const view = item.dataset.view;
        issues.push(`❌ 侧边栏菜单项不可点击: ${item.textContent.trim()} (${view})`);
      }
    });
    
    console.log(`  可点击: ${clickableCount}`);
    console.log(`  不可点击: ${unclickableCount}`);
  }
  
  // 运行所有检查
  function runAllChecks() {
    checkGlobalCSS();
    checkOverlays();
    checkButtonPointerEvents();
    checkEventBindings();
    checkJavaScriptErrors();
    checkViewElements();
    testActualClicks();
    
    // 输出结果
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 诊断结果汇总');
    console.log('='.repeat(60));
    
    if (info.length > 0) {
      console.log('\n✅ 正常项目:');
      info.forEach(item => console.log(`  ${item}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (issues.length > 0) {
      console.log('\n❌ 发现的问题:');
      issues.forEach(issue => console.log(`  ${issue}`));
    } else {
      console.log('\n✅ 未发现明显问题');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`总计: ${issues.length} 个问题, ${warnings.length} 个警告`);
    console.log('='.repeat(60));
    
    // 保存结果到全局
    window.diagnosisResults = {
      issues: issues,
      warnings: warnings,
      info: info
    };
    
    return {
      issues: issues,
      warnings: warnings,
      info: info
    };
  }
  
  // 等待页面加载完成后运行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllChecks, 1000);
    });
  } else {
    setTimeout(runAllChecks, 1000);
  }
  
  // 暴露到全局
  window.runButtonDiagnosis = runAllChecks;
  
})();

