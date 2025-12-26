/**
 * 移动端按钮点击问题终极修复脚本
 * 确保所有移动端按钮都能正常工作
 */

(function() {
  'use strict';
  
  console.log('🔧 [移动端修复] 开始加载按钮点击修复脚本...');
  
  // ==================== 1. 确保switchView函数存在 ====================
  if (typeof window.switchView !== 'function') {
    window.switchView = function(viewName) {
      console.log('🔄 [移动端switchView] 切换视图:', viewName);
      
      // 所有可能的移动端视图
      const allViewIds = [
        'homeView', 'listView', 'raceView', 'statsView', 
        'pedigreeView', 'breedingView', 'healthView', 
        'trainingView', 'analysisView', 'qualificationView', 
        'dashboardView', 'moreView'
      ];
      
      // 隐藏所有视图
      allViewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.display = 'none';
        }
      });
      
      // 显示目标视图
      const targetView = document.getElementById(viewName + 'View') || document.getElementById(viewName);
      if (targetView) {
        targetView.style.display = 'block';
        
        // 更新底部导航栏状态
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
          item.classList.remove('active');
          const onclickAttr = item.getAttribute('onclick');
          if (onclickAttr && onclickAttr.includes(`'${viewName}'`)) {
            item.classList.add('active');
          }
        });
        
        console.log('✅ [移动端switchView] 视图切换成功:', viewName);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('mobileViewSwitched', { detail: { view: viewName } }));
        
        return true;
      } else {
        console.warn('⚠️ [移动端switchView] 视图不存在:', viewName);
        return false;
      }
    };
    console.log('✅ [移动端修复] switchView函数已创建');
  } else {
    console.log('✅ [移动端修复] switchView函数已存在');
  }
  
  // ==================== 2. 全局事件委托（最高优先级） ====================
  function setupMobileGlobalClickHandler() {
    console.log('🔧 [移动端修复] 设置全局点击处理器...');
    
    if (window._mobileGlobalClickHandlerAttached) {
      console.log('⚠️ [移动端修复] 全局点击处理器已存在，跳过');
      return;
    }
    
    function handleMobileGlobalClick(e) {
      let target = e.target;
      let maxDepth = 10;
      
      while (target && maxDepth-- > 0) {
        // 检查移动端导航按钮
        if (target.classList && target.classList.contains('mobile-nav-item')) {
          const onclickAttr = target.getAttribute('onclick');
          if (onclickAttr) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [移动端全局处理器] 点击导航按钮');
            try {
              // 提取视图名称
              const match = onclickAttr.match(/switchView\(['"]([^'"]+)['"]\)/);
              if (match && match[1]) {
                const viewName = match[1];
                if (typeof window.switchView === 'function') {
                  window.switchView(viewName);
                }
              } else {
                // 直接执行onclick
                eval(onclickAttr);
              }
            } catch (err) {
              console.error('❌ [移动端] 执行onclick失败:', err);
            }
            return false;
          }
        }
        
        // 检查移动端卡片
        if (target.classList && target.classList.contains('mobile-card')) {
          const view = target.dataset.view;
          const onclickAttr = target.getAttribute('onclick');
          
          if (view) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [移动端全局处理器] 点击卡片，切换视图:', view);
            if (typeof window.switchView === 'function') {
              window.switchView(view);
            }
            return false;
          } else if (onclickAttr) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [移动端全局处理器] 执行卡片onclick');
            try {
              eval(onclickAttr);
            } catch (err) {
              console.error('❌ [移动端] 执行onclick失败:', err);
            }
            return false;
          }
        }
        
        // 检查其他按钮
        if (target.id === 'btnGoCreate' || target.id === 'btnUserAvatar' || target.id === 'btnSettings') {
          const onclickAttr = target.getAttribute('onclick');
          if (onclickAttr) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [移动端全局处理器] 点击按钮:', target.id);
            try {
              eval(onclickAttr);
            } catch (err) {
              console.error('❌ [移动端] 执行onclick失败:', err);
            }
            return false;
          }
        }
        
        // 检查标签页按钮
        if (target.classList && target.classList.contains('mobile-tab')) {
          const onclickAttr = target.getAttribute('onclick');
          if (onclickAttr) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [移动端全局处理器] 点击标签页');
            try {
              eval(onclickAttr);
            } catch (err) {
              console.error('❌ [移动端] 执行onclick失败:', err);
            }
            return false;
          }
        }
        
        target = target.parentElement;
      }
    }
    
    // 绑定多种事件类型
    const events = ['click', 'touchstart', 'touchend', 'mousedown', 'mouseup'];
    events.forEach(eventType => {
      document.addEventListener(eventType, handleMobileGlobalClick, {
        capture: true,
        passive: false
      });
    });
    
    window._mobileGlobalClickHandlerAttached = true;
    console.log('✅ [移动端修复] 全局点击处理器已设置');
  }
  
  // ==================== 3. 强制修复所有按钮 ====================
  function forceFixMobileButtons() {
    console.log('🔧 [移动端修复] 强制修复所有按钮...');
    
    // 移除所有覆盖层
    document.querySelectorAll('.mobile-modal-overlay:not(.active), .loading-overlay, .overlay').forEach(el => {
      el.style.cssText += 'display: none !important; pointer-events: none !important; z-index: -1 !important;';
    });
    
    // 确保body可点击
    if (document.body) {
      document.body.style.pointerEvents = 'auto';
      document.body.style.cursor = 'default';
    }
    
    // 修复导航按钮
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.style.cssText = `
        pointer-events: auto !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
        z-index: 99999 !important;
        position: relative !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      `;
      item.removeAttribute('disabled');
      
      // 直接绑定onclick
      const onclickAttr = item.getAttribute('onclick');
      if (onclickAttr) {
        item.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [移动端直接绑定] 点击导航按钮');
          try {
            eval(onclickAttr);
          } catch (err) {
            console.error('❌ [移动端] 执行onclick失败:', err);
          }
          return false;
        };
      }
    });
    
    // 修复卡片
    document.querySelectorAll('.mobile-card').forEach(card => {
      card.style.cssText = `
        pointer-events: auto !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
        z-index: 100 !important;
        position: relative !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      `;
      
      const view = card.dataset.view;
      const onclickAttr = card.getAttribute('onclick');
      
      if (view) {
        card.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [移动端直接绑定] 点击卡片，切换视图:', view);
          if (typeof window.switchView === 'function') {
            window.switchView(view);
          }
          return false;
        };
      } else if (onclickAttr) {
        card.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [移动端直接绑定] 执行卡片onclick');
          try {
            eval(onclickAttr);
          } catch (err) {
            console.error('❌ [移动端] 执行onclick失败:', err);
          }
          return false;
        };
      }
    });
    
    // 修复其他按钮
    document.querySelectorAll('button, .btn, .btn-icon, .mobile-tab').forEach(btn => {
      btn.style.cssText += 'pointer-events: auto !important; cursor: pointer !important; touch-action: manipulation !important;';
      btn.removeAttribute('disabled');
      
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr && !btn.dataset.fixed) {
        btn.dataset.fixed = 'true';
        const originalOnclick = onclickAttr;
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [移动端直接绑定] 执行按钮onclick');
          try {
            eval(originalOnclick);
          } catch (err) {
            console.error('❌ [移动端] 执行onclick失败:', err);
          }
          return false;
        };
      }
    });
    
    console.log('✅ [移动端修复] 所有按钮已强制修复');
  }
  
  // ==================== 4. 初始化 ====================
  function init() {
    console.log('🔧 [移动端修复] 开始初始化...');
    
    // 立即设置全局点击处理器
    setupMobileGlobalClickHandler();
    
    // 等待DOM加载完成后修复按钮
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        forceFixMobileButtons();
      });
    } else {
      forceFixMobileButtons();
    }
    
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(function(mutations) {
      let shouldRefix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.classList && (
                node.classList.contains('mobile-nav-item') ||
                node.classList.contains('mobile-card') ||
                node.classList.contains('mobile-tab') ||
                node.classList.contains('btn') ||
                node.classList.contains('btn-icon')
              )) {
                shouldRefix = true;
              } else if (node.querySelector && (
                node.querySelector('.mobile-nav-item') ||
                node.querySelector('.mobile-card') ||
                node.querySelector('.mobile-tab') ||
                node.querySelector('.btn') ||
                node.querySelector('.btn-icon')
              )) {
                shouldRefix = true;
              }
            }
          });
        }
      });
      
      if (shouldRefix) {
        console.log('🔧 [移动端修复] 检测到新按钮，重新修复...');
        setTimeout(forceFixMobileButtons, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ [移动端修复] 初始化完成');
  }
  
  // 立即执行初始化
  init();
  
  // 暴露到window对象
  window.forceFixMobileButtons = forceFixMobileButtons;
  window.setupMobileGlobalClickHandler = setupMobileGlobalClickHandler;
  
  console.log('✅ [移动端修复] 按钮点击修复脚本已加载完成');
})();



















