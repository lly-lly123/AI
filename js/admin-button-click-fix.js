/**
 * 后台按钮点击问题终极修复脚本
 * 确保所有后台按钮都能正常工作
 */

(function() {
  'use strict';
  
  console.log('🔧 [后台修复] 开始加载按钮点击修复脚本...');
  
  // ==================== 1. 创建switchTab函数（后台使用data-tab） ====================
  if (typeof window.switchTab !== 'function') {
    window.switchTab = function(tabName) {
      console.log('🔄 [后台switchTab] 切换标签页:', tabName);
      
      // 隐藏所有内容区域
      document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
      });
      
      // 显示目标内容区域
      const targetSection = document.getElementById(tabName);
      if (targetSection) {
        targetSection.style.display = 'block';
        
        // 更新侧边栏激活状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
          item.classList.toggle('active', item.dataset.tab === tabName);
        });
        
        console.log('✅ [后台switchTab] 标签页切换成功:', tabName);
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('adminTabSwitched', { detail: { tab: tabName } }));
        
        return true;
      } else {
        console.warn('⚠️ [后台switchTab] 标签页不存在:', tabName);
        return false;
      }
    };
    console.log('✅ [后台修复] switchTab函数已创建');
  } else {
    console.log('✅ [后台修复] switchTab函数已存在');
  }
  
  // ==================== 2. 全局事件委托（最高优先级） ====================
  function setupAdminGlobalClickHandler() {
    console.log('🔧 [后台修复] 设置全局点击处理器...');
    
    if (window._adminGlobalClickHandlerAttached) {
      console.log('⚠️ [后台修复] 全局点击处理器已存在，跳过');
      return;
    }
    
    function handleAdminGlobalClick(e) {
      let target = e.target;
      let maxDepth = 10;
      
      while (target && maxDepth-- > 0) {
        // 检查侧边栏按钮（使用data-tab）
        if (target.classList && target.classList.contains('sidebar-item')) {
          const tab = target.dataset.tab;
          
          if (tab) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [后台全局处理器] 点击侧边栏按钮:', tab);
            if (typeof window.switchTab === 'function') {
              window.switchTab(tab);
            }
            return false;
          }
        }
        
        // 检查快捷入口按钮
        if (target.classList && target.classList.contains('quick-link-btn')) {
          const action = target.dataset.action;
          if (action) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [后台全局处理器] 点击快捷入口:', action);
            
            if (action === 'addPigeon' && typeof window.switchTab === 'function') {
              window.switchTab('createView');
            } else if (action === 'addRace' && typeof window.switchTab === 'function') {
              window.switchTab('raceView');
            } else if (action === 'breeding' && typeof window.switchTab === 'function') {
              window.switchTab('breedingView');
            } else if (action === 'analysis' && typeof window.switchTab === 'function') {
              window.switchTab('analysisView');
            }
            return false;
          }
        }
        
        // 检查顶部按钮
        if (target.id === 'btnUserAvatar') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [后台全局处理器] 点击账户按钮');
          const onclickAttr = target.getAttribute('onclick');
          if (onclickAttr) {
            try {
              eval(onclickAttr);
            } catch (err) {
              console.error('❌ [后台] 执行onclick失败:', err);
            }
          }
          return false;
        }
        
        if (target.id === 'btnSettings') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [后台全局处理器] 点击设置按钮');
          const onclickAttr = target.getAttribute('onclick');
          if (onclickAttr) {
            try {
              eval(onclickAttr);
            } catch (err) {
              console.error('❌ [后台] 执行onclick失败:', err);
            }
          }
          return false;
        }
        
        // 检查其他按钮（有onclick属性的）
        if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
          const onclickAttr = target.getAttribute('onclick');
          if (onclickAttr && !target.dataset.handled) {
            // 对于模态框关闭按钮等，不阻止
            if (target.classList.contains('modal-close') || 
                target.classList.contains('announcement-modal-close')) {
              return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🔘 [后台全局处理器] 执行按钮onclick');
            try {
              eval(onclickAttr);
            } catch (err) {
              console.error('❌ [后台] 执行onclick失败:', err);
            }
            return false;
          }
        }
        
        target = target.parentElement;
      }
    }
    
    // 绑定多种事件类型
    const events = ['click', 'mousedown', 'mouseup'];
    events.forEach(eventType => {
      document.addEventListener(eventType, handleAdminGlobalClick, {
        capture: true,
        passive: false
      });
    });
    
    window._adminGlobalClickHandlerAttached = true;
    console.log('✅ [后台修复] 全局点击处理器已设置');
  }
  
  // ==================== 3. 强制修复所有按钮 ====================
  function forceFixAdminButtons() {
    console.log('🔧 [后台修复] 强制修复所有按钮...');
    
    // 移除所有覆盖层
    document.querySelectorAll('.sidebar-overlay:not(.active), .loading-overlay, .modal-backdrop:not(.active), .overlay').forEach(el => {
      el.style.cssText += 'display: none !important; pointer-events: none !important; z-index: -1 !important;';
    });
    
    // 确保body可点击
    if (document.body) {
      document.body.style.pointerEvents = 'auto';
      document.body.style.cursor = 'default';
    }
    
    // 修复侧边栏按钮
    document.querySelectorAll('.sidebar-item').forEach((item, index) => {
      item.style.cssText = `
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 99999 !important;
        position: relative !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      `;
      item.removeAttribute('disabled');
      
      const tab = item.dataset.tab;
      if (tab) {
        item.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [后台直接绑定] 点击侧边栏按钮:', tab);
          if (typeof window.switchTab === 'function') {
            window.switchTab(tab);
          }
          return false;
        };
      }
    });
    
    // 修复快捷入口按钮
    document.querySelectorAll('.quick-link-btn').forEach(btn => {
      btn.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      const action = btn.dataset.action;
      if (action) {
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [后台直接绑定] 点击快捷入口:', action);
          
          if (action === 'addPigeon' && typeof window.switchTab === 'function') {
            window.switchTab('createView');
          } else if (action === 'addRace' && typeof window.switchTab === 'function') {
            window.switchTab('raceView');
          } else if (action === 'breeding' && typeof window.switchTab === 'function') {
            window.switchTab('breedingView');
          } else if (action === 'analysis' && typeof window.switchTab === 'function') {
            window.switchTab('analysisView');
          }
          return false;
        };
      }
    });
    
    // 修复顶部按钮
    const btnUserAvatar = document.getElementById('btnUserAvatar');
    if (btnUserAvatar) {
      btnUserAvatar.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      const onclickAttr = btnUserAvatar.getAttribute('onclick');
      if (onclickAttr) {
        btnUserAvatar.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 [后台直接绑定] 点击账户按钮');
          try {
            eval(onclickAttr);
          } catch (err) {
            console.error('❌ [后台] 执行onclick失败:', err);
          }
          return false;
        };
      }
    }
    
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) {
      btnSettings.style.cssText = 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      const onclickAttr = btnSettings.getAttribute('onclick');
      if (onclickAttr) {
        btnSettings.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 [后台直接绑定] 点击设置按钮');
          try {
            eval(onclickAttr);
          } catch (err) {
            console.error('❌ [后台] 执行onclick失败:', err);
          }
          return false;
        };
      }
    }
    
    // 修复其他按钮（有onclick属性的）
    document.querySelectorAll('button[onclick], .btn[onclick]').forEach(btn => {
      // 跳过已经处理的按钮和特殊按钮
      if (btn.dataset.fixed === 'true' || 
          btn.classList.contains('modal-close') || 
          btn.classList.contains('announcement-modal-close')) {
        return;
      }
      
      btn.style.cssText += 'pointer-events: auto !important; cursor: pointer !important; z-index: 99999 !important;';
      btn.removeAttribute('disabled');
      
      const onclickAttr = btn.getAttribute('onclick');
      if (onclickAttr) {
        btn.dataset.fixed = 'true';
        const originalOnclick = onclickAttr;
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('🔘 [后台直接绑定] 执行按钮onclick');
          try {
            eval(originalOnclick);
          } catch (err) {
            console.error('❌ [后台] 执行onclick失败:', err);
          }
          return false;
        };
      }
    });
    
    console.log('✅ [后台修复] 所有按钮已强制修复');
  }
  
  // ==================== 4. 初始化 ====================
  function init() {
    console.log('🔧 [后台修复] 开始初始化...');
    
    // 立即设置全局点击处理器
    setupAdminGlobalClickHandler();
    
    // 等待DOM加载完成后修复按钮
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        forceFixAdminButtons();
      });
    } else {
      forceFixAdminButtons();
    }
    
    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(function(mutations) {
      let shouldRefix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              if (node.classList && (
                node.classList.contains('sidebar-item') ||
                node.classList.contains('quick-link-btn') ||
                node.classList.contains('btn') ||
                (node.tagName === 'BUTTON' && node.getAttribute('onclick'))
              )) {
                shouldRefix = true;
              } else if (node.querySelector && (
                node.querySelector('.sidebar-item') ||
                node.querySelector('.quick-link-btn') ||
                node.querySelector('.btn[onclick]') ||
                node.querySelector('button[onclick]')
              )) {
                shouldRefix = true;
              }
            }
          });
        }
      });
      
      if (shouldRefix) {
        console.log('🔧 [后台修复] 检测到新按钮，重新修复...');
        setTimeout(forceFixAdminButtons, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ [后台修复] 初始化完成');
  }
  
  // 立即执行初始化
  init();
  
  // 暴露到window对象
  window.forceFixAdminButtons = forceFixAdminButtons;
  window.setupAdminGlobalClickHandler = setupAdminGlobalClickHandler;
  
  console.log('✅ [后台修复] 按钮点击修复脚本已加载完成');
})();



















