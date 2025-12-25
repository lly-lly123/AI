/**
 * 按钮点击问题终极修复脚本
 * 确保所有按钮都能正常工作，无论CSP或其他问题
 */

(function() {
  'use strict';
  
  console.log('🔧 [终极修复] 开始加载按钮点击修复脚本...');
  
  // ==================== 1. 确保switchView函数存在 ====================
  if (typeof window.switchView !== 'function') {
    window.switchView = function(viewName) {
      console.log('🔄 [switchView] 切换视图:', viewName);
      
      // 所有可能的视图ID
      const allViewIds = [
        'homeView', 'dashboardView', 'listView', 'pedigreeView', 
        'statsView', 'raceView', 'breedingView', 'healthView', 
        'analysisView', 'trainingView', 'qualificationView', 
        'createView', 'detailView'
      ];
      
      // 隐藏所有视图
      allViewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.display = 'none';
        }
      });
      
      // 显示目标视图
      const targetView = document.getElementById(viewName);
      if (targetView) {
        targetView.style.display = '';
        
        // 更新侧边栏激活状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
          item.classList.toggle('active', item.dataset.view === viewName);
        });
        
        console.log('✅ [switchView] 视图切换成功:', viewName);
        
        // 触发自定义事件，让其他脚本知道视图已切换
        window.dispatchEvent(new CustomEvent('viewSwitched', { detail: { view: viewName } }));
        
        return true;
      } else {
        console.warn('⚠️ [switchView] 视图不存在:', viewName);
        return false;
      }
    };
    console.log('✅ [终极修复] switchView函数已创建');
  } else {
    console.log('✅ [终极修复] switchView函数已存在');
  }
  
  // ==================== 2. 全局事件委托（最高优先级） ====================
  function setupGlobalClickHandler() {
    console.log('🔧 [终极修复] 设置全局点击处理器...');
    
    // 移除所有旧的事件监听器（通过标记）
    if (window._globalClickHandlerAttached) {
      console.log('⚠️ [终极修复] 全局点击处理器已存在，跳过');
      return;
    }
    
    function handleGlobalClick(e) {
      // 查找点击的元素及其父元素
      let target = e.target;
      let maxDepth = 10;
      
      while (target && maxDepth-- > 0) {
        // 检查是否是侧边栏按钮
        if (target.classList && target.classList.contains('sidebar-item')) {
          const view = target.dataset.view;
          const openFeedback = target.dataset.openFeedback;
          
          if (view) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [全局处理器] 点击侧边栏按钮:', view);
            if (typeof window.switchView === 'function') {
              window.switchView(view);
            }
            return false;
          } else if (openFeedback === 'true') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [全局处理器] 点击反馈按钮');
            const feedbackModal = document.getElementById('feedbackModal');
            if (feedbackModal) {
              feedbackModal.style.display = 'flex';
            }
            return false;
          }
        }
        
        // 检查是否是其他重要按钮
        if (target.id === 'btnGoCreate') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [全局处理器] 点击新增鸽子按钮');
          if (typeof window.switchView === 'function') {
            window.switchView('createView');
          }
          return false;
        }
        
        if (target.id === 'btnUserAvatar') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [全局处理器] 点击账户按钮');
          const userInfoModal = document.getElementById('userInfoModal');
          if (userInfoModal) {
            userInfoModal.style.display = 'flex';
          }
          return false;
        }
        
        if (target.id === 'btnSettings') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [全局处理器] 点击设置按钮');
          const settingsModal = document.getElementById('settingsModal');
          if (settingsModal) {
            settingsModal.style.display = 'flex';
          }
          return false;
        }
        
        // 检查快捷入口按钮
        if (target.classList && target.classList.contains('quick-link-btn')) {
          const action = target.dataset.action;
          if (action) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [全局处理器] 点击快捷入口:', action);
            
            if (action === 'addPigeon' && typeof window.switchView === 'function') {
              window.switchView('createView');
            } else if (action === 'addRace' && typeof window.switchView === 'function') {
              window.switchView('raceView');
            } else if (action === 'breeding' && typeof window.switchView === 'function') {
              window.switchView('breedingView');
            } else if (action === 'analysis' && typeof window.switchView === 'function') {
              window.switchView('analysisView');
            }
            return false;
          }
        }
        
        target = target.parentElement;
      }
    }
    
    // 绑定多种事件类型，使用capture模式确保优先执行
    const events = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
    events.forEach(eventType => {
      document.addEventListener(eventType, handleGlobalClick, {
        capture: true,
        passive: false
      });
    });
    
    window._globalClickHandlerAttached = true;
    console.log('✅ [终极修复] 全局点击处理器已设置');
  }
  
  // ==================== 3. 强制修复所有按钮 ====================
  function forceFixAllButtons() {
    console.log('🔧 [终极修复] 强制修复所有按钮...');
    
    // 移除所有覆盖层
    document.querySelectorAll('.sidebar-overlay:not(.active), .loading-overlay, .modal-backdrop:not(.active), .overlay').forEach(el => {
      el.style.cssText += 'display: none !important; pointer-events: none !important; z-index: -1 !important;';
    });
    
    // 确保body和html可点击
    if (document.body) {
      document.body.style.pointerEvents = 'auto';
      document.body.style.cursor = 'default';
    }
    if (document.documentElement) {
      document.documentElement.style.pointerEvents = 'auto';
    }
    
    // 修复所有侧边栏按钮
    document.querySelectorAll('.sidebar-item').forEach((item, index) => {
      // 设置样式确保可点击
      item.style.cssText = `
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 99999 !important;
        position: relative !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      `;
      item.removeAttribute('disabled');
      
      // 直接绑定onclick（作为最后保障）
      const view = item.dataset.view;
      const openFeedback = item.dataset.openFeedback;
      
      if (view) {
        item.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [直接绑定] 点击侧边栏按钮:', view);
          if (typeof window.switchView === 'function') {
            window.switchView(view);
          }
          return false;
        };
      } else if (openFeedback === 'true') {
        item.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [直接绑定] 点击反馈按钮');
          const feedbackModal = document.getElementById('feedbackModal');
          if (feedbackModal) {
            feedbackModal.style.display = 'flex';
          }
          return false;
        };
      }
    });
    
    // 修复其他重要按钮
    const btnGoCreate = document.getElementById('btnGoCreate');
    if (btnGoCreate) {
      btnGoCreate.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      btnGoCreate.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 [直接绑定] 点击新增鸽子按钮');
        if (typeof window.switchView === 'function') {
          window.switchView('createView');
        }
        return false;
      };
    }
    
    const btnUserAvatar = document.getElementById('btnUserAvatar');
    if (btnUserAvatar) {
      btnUserAvatar.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      btnUserAvatar.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 [直接绑定] 点击账户按钮');
        const userInfoModal = document.getElementById('userInfoModal');
        if (userInfoModal) {
          userInfoModal.style.display = 'flex';
        }
        return false;
      };
    }
    
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) {
      btnSettings.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      btnSettings.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 [直接绑定] 点击设置按钮');
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
          settingsModal.style.display = 'flex';
        }
        return false;
      };
    }
    
    // 修复快捷入口按钮
    document.querySelectorAll('.quick-link-btn').forEach(btn => {
      btn.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      const action = btn.dataset.action;
      if (action) {
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 [直接绑定] 点击快捷入口:', action);
          
          if (action === 'addPigeon' && typeof window.switchView === 'function') {
            window.switchView('createView');
          } else if (action === 'addRace' && typeof window.switchView === 'function') {
            window.switchView('raceView');
          } else if (action === 'breeding' && typeof window.switchView === 'function') {
            window.switchView('breedingView');
          } else if (action === 'analysis' && typeof window.switchView === 'function') {
            window.switchView('analysisView');
          }
          return false;
        };
      }
    });
    
    console.log('✅ [终极修复] 所有按钮已强制修复');
  }
  
  // ==================== 4. 初始化 ====================
  function init() {
    console.log('🔧 [终极修复] 开始初始化...');
    
    // 立即设置全局点击处理器
    setupGlobalClickHandler();
    
    // 等待DOM加载完成后修复按钮
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        forceFixAllButtons();
      });
    } else {
      forceFixAllButtons();
    }
    
    // 使用MutationObserver监听DOM变化，确保新添加的按钮也能被修复
    const observer = new MutationObserver(function(mutations) {
      let shouldRefix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              if (node.classList && (
                node.classList.contains('sidebar-item') ||
                node.classList.contains('quick-link-btn') ||
                node.id === 'btnGoCreate' ||
                node.id === 'btnUserAvatar' ||
                node.id === 'btnSettings'
              )) {
                shouldRefix = true;
              } else if (node.querySelector && (
                node.querySelector('.sidebar-item') ||
                node.querySelector('.quick-link-btn') ||
                node.querySelector('#btnGoCreate') ||
                node.querySelector('#btnUserAvatar') ||
                node.querySelector('#btnSettings')
              )) {
                shouldRefix = true;
              }
            }
          });
        }
      });
      
      if (shouldRefix) {
        console.log('🔧 [终极修复] 检测到新按钮，重新修复...');
        setTimeout(forceFixAllButtons, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ [终极修复] 初始化完成');
  }
  
  // 立即执行初始化
  init();
  
  // 暴露到window对象，方便调试
  window.forceFixAllButtons = forceFixAllButtons;
  window.setupGlobalClickHandler = setupGlobalClickHandler;
  
  console.log('✅ [终极修复] 按钮点击修复脚本已加载完成');
})();



