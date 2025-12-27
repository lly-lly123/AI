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
    console.log('🔧 [移动端修复] 设置全局点击处理器（支持PC和移动端）...');
    
    if (window._mobileGlobalClickHandlerAttached) {
      console.log('⚠️ [移动端修复] 全局点击处理器已存在，跳过');
      return;
    }
    
    function handleMobileGlobalClick(e) {
      // 阻止默认行为，确保点击事件正常处理
      if (e.type === 'touchstart' || e.type === 'touchend') {
        // 触摸事件需要特殊处理
      }
      
      let target = e.target;
      let maxDepth = 15; // 增加搜索深度，确保能找到按钮元素
      
      while (target && maxDepth-- > 0 && target !== document.body) {
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
        
        // 检查所有带onclick属性的元素（通用处理）
        const onclickAttr = target.getAttribute('onclick');
        if (onclickAttr && (target.tagName === 'BUTTON' || target.classList.contains('btn') || target.classList.contains('btn-icon') || target.classList.contains('mobile-tab') || target.classList.contains('mobile-nav-item') || target.classList.contains('mobile-card'))) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [移动端全局处理器] 点击元素:', target.tagName, target.className, target.id);
          try {
            // 提取switchView调用
            const switchViewMatch = onclickAttr.match(/switchView\(['"]([^'"]+)['"]\)/);
            if (switchViewMatch && switchViewMatch[1] && typeof window.switchView === 'function') {
              window.switchView(switchViewMatch[1]);
            } else {
              // 直接执行onclick
              eval(onclickAttr);
            }
          } catch (err) {
            console.error('❌ [移动端] 执行onclick失败:', err, 'onclick:', onclickAttr);
          }
          return false;
        }
        
        // 检查其他按钮（通过ID或类名）
        if (target.id === 'btnGoCreate' || target.id === 'btnUserAvatar' || target.id === 'btnSettings' || target.classList.contains('mobile-tab')) {
          const onclickAttr2 = target.getAttribute('onclick');
          if (onclickAttr2) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [移动端全局处理器] 点击按钮:', target.id || target.className);
            try {
              eval(onclickAttr2);
            } catch (err) {
              console.error('❌ [移动端] 执行onclick失败:', err);
            }
            return false;
          }
        }
        
        target = target.parentElement;
      }
    }
    
    // 绑定多种事件类型（PC和移动端都支持）
    const events = ['click', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'pointerdown', 'pointerup'];
    events.forEach(eventType => {
      document.addEventListener(eventType, handleMobileGlobalClick, {
        capture: true,
        passive: false
      });
    });
    
    // 额外绑定到body，确保捕获所有点击
    if (document.body) {
      events.forEach(eventType => {
        document.body.addEventListener(eventType, handleMobileGlobalClick, {
          capture: true,
          passive: false
        });
      });
    }
    
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
    
    // 修复其他按钮（包括所有可能的按钮类型）
    const buttonSelectors = 'button, .btn, .btn-icon, .btn-primary, .mobile-tab, .mobile-nav-item, [onclick], [data-action], [role="button"]';
    document.querySelectorAll(buttonSelectors).forEach(btn => {
      // 强制设置样式，确保可点击
      btn.style.setProperty('pointer-events', 'auto', 'important');
      btn.style.setProperty('cursor', 'pointer', 'important');
      btn.style.setProperty('touch-action', 'manipulation', 'important');
      btn.style.setProperty('user-select', 'none', 'important');
      btn.style.setProperty('-webkit-user-select', 'none', 'important');
      btn.style.setProperty('z-index', '10', 'important');
      btn.removeAttribute('disabled');
      btn.removeAttribute('aria-disabled');
      
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr && !btn.dataset.fixed) {
        btn.dataset.fixed = 'true';
        const originalOnclick = onclickAttr;
        
        // 绑定多种事件类型
        const handleClick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [移动端直接绑定] 执行按钮onclick:', btn.tagName, btn.className);
          try {
            eval(originalOnclick);
          } catch (err) {
            console.error('❌ [移动端] 执行onclick失败:', err, 'onclick:', originalOnclick);
          }
          return false;
        };
        
        // 绑定click和touch事件
        btn.addEventListener('click', handleClick, { capture: true, passive: false });
        btn.addEventListener('touchend', handleClick, { capture: true, passive: false });
        btn.onclick = handleClick;
      }
    });
    
    console.log('✅ [移动端修复] 所有按钮已强制修复');
  }
  
  // ==================== 4. 初始化 ====================
  function init() {
    console.log('🔧 [移动端修复] 开始初始化（支持PC和移动端）...');
    
    // 立即设置全局点击处理器（不等待DOM）
    setupMobileGlobalClickHandler();
    
    // 立即修复按钮（如果DOM已存在）
    if (document.body) {
      forceFixMobileButtons();
    }
    
    // 等待DOM加载完成后修复按钮
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🔧 [移动端修复] DOMContentLoaded，修复按钮');
        forceFixMobileButtons();
        // 延迟再次修复，确保所有动态内容都已加载
        setTimeout(forceFixMobileButtons, 500);
        setTimeout(forceFixMobileButtons, 1000);
        setTimeout(forceFixMobileButtons, 2000);
      });
    } else {
      forceFixMobileButtons();
      // 延迟再次修复
      setTimeout(forceFixMobileButtons, 500);
      setTimeout(forceFixMobileButtons, 1000);
      setTimeout(forceFixMobileButtons, 2000);
    }
    
    // 使用MutationObserver监听DOM变化（更全面的监听）
    if (document.body) {
      const observer = new MutationObserver(function(mutations) {
        let shouldRefix = false;
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) {
                // 检查节点本身
                if (node.classList && (
                  node.classList.contains('mobile-nav-item') ||
                  node.classList.contains('mobile-card') ||
                  node.classList.contains('mobile-tab') ||
                  node.classList.contains('btn') ||
                  node.classList.contains('btn-icon') ||
                  node.classList.contains('btn-primary') ||
                  node.tagName === 'BUTTON' ||
                  node.hasAttribute('onclick')
                )) {
                  shouldRefix = true;
                } 
                // 检查子节点
                else if (node.querySelector) {
                  const hasButton = node.querySelector('.mobile-nav-item, .mobile-card, .mobile-tab, .btn, .btn-icon, button, [onclick]');
                  if (hasButton) {
                    shouldRefix = true;
                  }
                }
              }
            });
          }
          // 检查属性变化（如onclick被添加）
          if (mutation.type === 'attributes' && (mutation.attributeName === 'onclick' || mutation.attributeName === 'class')) {
            shouldRefix = true;
          }
        });
        
        if (shouldRefix) {
          console.log('🔧 [移动端修复] 检测到新按钮或属性变化，重新修复...');
          setTimeout(forceFixMobileButtons, 50);
          setTimeout(forceFixMobileButtons, 200);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['onclick', 'class', 'style']
      });
    }
    
    console.log('✅ [移动端修复] 初始化完成');
  }
  
  // ==================== 5. 视图切换后自动修复 ====================
  // 监听视图切换，确保新显示的视图中的按钮也被修复
  function setupViewSwitchListener() {
    // 监听自定义事件
    window.addEventListener('mobileViewSwitched', function(e) {
      const viewName = e.detail?.view;
      console.log('🔧 [移动端修复] 检测到视图切换:', viewName, '，重新修复按钮');
      // 延迟修复，确保DOM已更新
      setTimeout(forceFixMobileButtons, 100);
      setTimeout(forceFixMobileButtons, 300);
    });
    
    // 重写switchView函数（如果存在），在视图切换后自动修复
    if (typeof window.switchView === 'function') {
      const originalSwitchView = window.switchView;
      window.switchView = function(viewName) {
        const result = originalSwitchView.apply(this, arguments);
        // 视图切换后，延迟修复按钮
        setTimeout(() => {
          console.log('🔧 [移动端修复] switchView调用后，修复按钮');
          forceFixMobileButtons();
        }, 100);
        setTimeout(() => {
          forceFixMobileButtons();
        }, 500);
        return result;
      };
      console.log('✅ [移动端修复] 已增强switchView函数，视图切换后自动修复按钮');
    }
  }
  
  // ==================== 6. 专门修复moreView中的卡片 ====================
  function fixMoreViewCards() {
    const moreView = document.getElementById('moreView');
    if (!moreView) {
      return;
    }
    
    const cards = moreView.querySelectorAll('.mobile-card');
    if (cards.length === 0) {
      return;
    }
    
    console.log(`🔧 [移动端修复] 专门修复moreView中的${cards.length}个卡片`);
    
    cards.forEach((card, index) => {
      const title = card.querySelector('.mobile-card-title')?.textContent?.trim() || `卡片${index + 1}`;
      
      // 强制设置样式
      card.style.cssText = `
        pointer-events: auto !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
        z-index: 100 !important;
        position: relative !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -webkit-tap-highlight-color: rgba(37, 99, 235, 0.5) !important;
      `;
      
      // 获取onclick属性
      const onclickAttr = card.getAttribute('onclick');
      
      if (onclickAttr) {
        // 移除旧的事件监听器（通过标记避免重复绑定）
        if (card.dataset.fixed) {
          return; // 已经修复过，跳过
        }
        card.dataset.fixed = 'true';
        
        // 创建点击处理函数
        const handleCardClick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log(`🔘 [移动端修复] 卡片被点击: ${title}`);
          
          try {
            // 提取switchView调用
            const match = onclickAttr.match(/switchView\(['"]([^'"]+)['"]\)/);
            if (match && match[1] && typeof window.switchView === 'function') {
              const viewName = match[1];
              console.log(`🔄 [移动端修复] 切换到视图: ${viewName}`);
              window.switchView(viewName);
            } else {
              // 直接执行onclick
              eval(onclickAttr);
            }
          } catch (err) {
            console.error(`❌ [移动端修复] 执行卡片onclick失败: ${title}`, err);
          }
          
          return false;
        };
        
        // 绑定多种事件类型
        card.addEventListener('click', handleCardClick, { capture: true, passive: false });
        card.addEventListener('touchend', handleCardClick, { capture: true, passive: false });
        card.addEventListener('touchstart', function(e) {
          e.preventDefault();
        }, { capture: true, passive: false });
        
        // 也绑定到onclick属性
        card.onclick = handleCardClick;
        
        console.log(`✅ [移动端修复] 卡片已修复: ${title}`);
      }
    });
  }
  
  // 增强forceFixMobileButtons函数，包含moreView专门修复
  const originalForceFix = forceFixMobileButtons;
  forceFixMobileButtons = function() {
    originalForceFix();
    fixMoreViewCards();
  };
  
  // 立即执行初始化
  init();
  
  // 设置视图切换监听
  setTimeout(setupViewSwitchListener, 500);
  
  // 暴露到window对象
  window.forceFixMobileButtons = forceFixMobileButtons;
  window.setupMobileGlobalClickHandler = setupMobileGlobalClickHandler;
  window.fixMoreViewCards = fixMoreViewCards;
  
  console.log('✅ [移动端修复] 按钮点击修复脚本已加载完成');
})();



















