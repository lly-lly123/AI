/**
 * PC端点击问题终极修复脚本
 * 这个脚本会强制修复所有按钮点击问题，确保100%可用
 */

(function() {
  'use strict';
  
  console.log('🔧 开始PC端点击问题终极修复...');
  
  // 确保switchView函数可用
  function ensureSwitchViewAvailable() {
    // 如果window.switchView不存在，尝试从DOM中查找并创建
    if (typeof window.switchView !== 'function') {
      console.warn('⚠️ switchView函数不存在，尝试创建...');
      
      // 创建备用switchView函数
      window.switchView = function(viewName) {
        console.log('🔄 切换视图:', viewName);
        
        // 获取所有视图
        const viewIds = [
          'homeView', 'dashboardView', 'listView', 'pedigreeView',
          'statsView', 'raceView', 'breedingView', 'healthView',
          'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
        ];
        
        // 隐藏所有视图
        viewIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.display = 'none';
          }
        });
        
        // 显示目标视图
        const targetView = document.getElementById(viewName);
        if (targetView) {
          targetView.style.display = '';
          console.log('✅ 视图切换成功:', viewName);
        } else {
          console.error('❌ 目标视图不存在:', viewName);
        }
        
        // 更新侧边栏状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
          if (item.dataset.view === viewName) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      };
      
      console.log('✅ switchView函数已创建');
    }
  }
  
  // 强制绑定所有按钮的点击事件
  function forceBindAllButtons() {
    console.log('🔧 开始强制绑定所有按钮...');
    
    // 1. 绑定侧边栏菜单项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item, index) => {
      // 移除旧的事件监听器（通过克隆节点）
      if (item.dataset.forceBound === 'true') {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        const freshItem = document.querySelectorAll('.sidebar-item')[index];
        if (freshItem) {
          bindSidebarItem(freshItem);
        }
      } else {
        bindSidebarItem(item);
      }
    });
    
    // 2. 绑定所有按钮
    const allButtons = document.querySelectorAll('button, .btn, [role="button"], [data-view], [data-open-feedback]');
    allButtons.forEach(btn => {
      if (!btn.dataset.forceBound) {
        bindButton(btn);
      }
    });
    
    console.log('✅ 按钮绑定完成');
  }
  
  // 绑定侧边栏项
  function bindSidebarItem(item) {
    item.dataset.forceBound = 'true';
    
    // 确保样式
    item.style.pointerEvents = 'auto';
    item.style.cursor = 'pointer';
    item.style.position = 'relative';
    item.style.zIndex = '99999';
    
    // 移除disabled
    item.removeAttribute('disabled');
    item.classList.remove('disabled');
    
    // 绑定点击事件（使用capture阶段，最高优先级）
    const clickHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🔘 侧边栏项被点击:', item.dataset.view || item.dataset.openFeedback);
      
      const view = item.dataset.view;
      const openFeedback = item.dataset.openFeedback;
      
      if (view) {
        // 确保switchView可用
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        } else {
          // 备用方案：直接操作DOM
          const viewIds = [
            'homeView', 'dashboardView', 'listView', 'pedigreeView',
            'statsView', 'raceView', 'breedingView', 'healthView',
            'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
          ];
          
          viewIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
          
          const targetView = document.getElementById(view);
          if (targetView) {
            targetView.style.display = '';
            
            // 更新侧边栏状态
            document.querySelectorAll('.sidebar-item').forEach(sidebarItem => {
              if (sidebarItem.dataset.view === view) {
                sidebarItem.classList.add('active');
              } else {
                sidebarItem.classList.remove('active');
              }
            });
          }
        }
      } else if (openFeedback) {
        // 处理反馈功能
        if (typeof window.openFeedbackModal === 'function') {
          window.openFeedbackModal();
        } else {
          console.warn('openFeedbackModal函数不存在');
        }
      }
      
      return false;
    };
    
    // 移除旧的事件监听器
    item.removeEventListener('click', clickHandler, true);
    item.removeEventListener('mousedown', clickHandler, true);
    
    // 绑定新的事件监听器（使用capture阶段，最高优先级）
    item.addEventListener('click', clickHandler, { capture: true, passive: false });
    item.addEventListener('mousedown', clickHandler, { capture: true, passive: false });
    
    // 键盘支持
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler(e);
      }
    }, { capture: true });
  }
  
  // 绑定普通按钮
  function bindButton(btn) {
    btn.dataset.forceBound = 'true';
    
    // 确保样式
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.position = 'relative';
    btn.style.zIndex = '99999';
    
    // 移除disabled
    btn.removeAttribute('disabled');
    btn.classList.remove('disabled');
    
    // 如果有onclick属性，确保它能工作
    if (btn.hasAttribute('onclick')) {
      const onclickAttr = btn.getAttribute('onclick');
      try {
        const onclickFunc = new Function('event', onclickAttr);
        btn.onclick = onclickFunc;
      } catch (e) {
        console.warn('无法解析onclick属性:', onclickAttr, e);
      }
    }
    
    // 如果有data-view属性，绑定视图切换
    if (btn.dataset.view) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const view = btn.dataset.view;
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        }
      }, { capture: true, passive: false });
    }
  }
  
  // 移除所有可能阻止点击的覆盖层
  function removeBlockingOverlays() {
    const overlays = document.querySelectorAll(
      '.sidebar-overlay:not(.active), .loading-overlay, .modal-backdrop:not(.active), .overlay:not(.active), [class*="overlay"]:not(.active), [class*="backdrop"]:not(.active)'
    );
    
    overlays.forEach(overlay => {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    });
    
    // 检查固定定位的高z-index元素
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    fixedElements.forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
      if (zIndex > 100 && !el.classList.contains('modal') && !el.classList.contains('active')) {
        const hasClickableContent = el.querySelector('button, a, [onclick], [role="button"]');
        if (!hasClickableContent) {
          el.style.pointerEvents = 'none';
          el.style.zIndex = '-1';
        }
      }
    });
  }
  
  // 添加全局CSS样式
  function addGlobalStyles() {
    if (document.getElementById('ultimate-click-fix-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'ultimate-click-fix-styles';
    style.textContent = `
      /* PC端点击问题终极修复 - 最高优先级 */
      button, .btn, .sidebar-item, [role="button"], [data-view], [data-open-feedback] {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 99999 !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      .sidebar, .sidebar-menu, .main-content {
        pointer-events: auto !important;
      }
      
      body, html {
        pointer-events: auto !important;
        overflow: visible !important;
      }
      
      .sidebar-overlay:not(.active), .loading-overlay:not(.active), 
      .modal-backdrop:not(.active) {
        display: none !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      
      /* 确保按钮在悬停时可见 */
      button:hover, .btn:hover, .sidebar-item:hover {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 主修复函数
  function ultimateFix() {
    console.log('🚀 执行终极修复...');
    
    // 1. 确保switchView可用
    ensureSwitchViewAvailable();
    
    // 2. 移除阻止点击的覆盖层
    removeBlockingOverlays();
    
    // 3. 添加全局样式
    addGlobalStyles();
    
    // 4. 强制绑定所有按钮
    forceBindAllButtons();
    
    // 5. 确保body和html可点击
    document.body.style.pointerEvents = 'auto';
    document.documentElement.style.pointerEvents = 'auto';
    
    console.log('✅ 终极修复完成！');
  }
  
  // 立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ultimateFix);
  } else {
    ultimateFix();
  }
  
  // 延迟多次执行
  setTimeout(ultimateFix, 100);
  setTimeout(ultimateFix, 500);
  setTimeout(ultimateFix, 1000);
  setTimeout(ultimateFix, 2000);
  
  // 监听DOM变化，自动修复新添加的元素
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldFix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldFix = true;
        }
      });
      if (shouldFix) {
        setTimeout(ultimateFix, 100);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 暴露到全局
  window.ultimateFixPC = ultimateFix;
  window.ensureSwitchViewAvailable = ensureSwitchViewAvailable;
  
  console.log('✅ PC端点击问题终极修复脚本已加载');
  console.log('💡 如果仍有问题，请在控制台运行: window.ultimateFixPC()');
})();

 * PC端点击问题终极修复脚本
 * 这个脚本会强制修复所有按钮点击问题，确保100%可用
 */

(function() {
  'use strict';
  
  console.log('🔧 开始PC端点击问题终极修复...');
  
  // 确保switchView函数可用
  function ensureSwitchViewAvailable() {
    // 如果window.switchView不存在，尝试从DOM中查找并创建
    if (typeof window.switchView !== 'function') {
      console.warn('⚠️ switchView函数不存在，尝试创建...');
      
      // 创建备用switchView函数
      window.switchView = function(viewName) {
        console.log('🔄 切换视图:', viewName);
        
        // 获取所有视图
        const viewIds = [
          'homeView', 'dashboardView', 'listView', 'pedigreeView',
          'statsView', 'raceView', 'breedingView', 'healthView',
          'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
        ];
        
        // 隐藏所有视图
        viewIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.display = 'none';
          }
        });
        
        // 显示目标视图
        const targetView = document.getElementById(viewName);
        if (targetView) {
          targetView.style.display = '';
          console.log('✅ 视图切换成功:', viewName);
        } else {
          console.error('❌ 目标视图不存在:', viewName);
        }
        
        // 更新侧边栏状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
          if (item.dataset.view === viewName) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      };
      
      console.log('✅ switchView函数已创建');
    }
  }
  
  // 强制绑定所有按钮的点击事件
  function forceBindAllButtons() {
    console.log('🔧 开始强制绑定所有按钮...');
    
    // 1. 绑定侧边栏菜单项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item, index) => {
      // 移除旧的事件监听器（通过克隆节点）
      if (item.dataset.forceBound === 'true') {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        const freshItem = document.querySelectorAll('.sidebar-item')[index];
        if (freshItem) {
          bindSidebarItem(freshItem);
        }
      } else {
        bindSidebarItem(item);
      }
    });
    
    // 2. 绑定所有按钮
    const allButtons = document.querySelectorAll('button, .btn, [role="button"], [data-view], [data-open-feedback]');
    allButtons.forEach(btn => {
      if (!btn.dataset.forceBound) {
        bindButton(btn);
      }
    });
    
    console.log('✅ 按钮绑定完成');
  }
  
  // 绑定侧边栏项
  function bindSidebarItem(item) {
    item.dataset.forceBound = 'true';
    
    // 确保样式
    item.style.pointerEvents = 'auto';
    item.style.cursor = 'pointer';
    item.style.position = 'relative';
    item.style.zIndex = '99999';
    
    // 移除disabled
    item.removeAttribute('disabled');
    item.classList.remove('disabled');
    
    // 绑定点击事件（使用capture阶段，最高优先级）
    const clickHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🔘 侧边栏项被点击:', item.dataset.view || item.dataset.openFeedback);
      
      const view = item.dataset.view;
      const openFeedback = item.dataset.openFeedback;
      
      if (view) {
        // 确保switchView可用
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        } else {
          // 备用方案：直接操作DOM
          const viewIds = [
            'homeView', 'dashboardView', 'listView', 'pedigreeView',
            'statsView', 'raceView', 'breedingView', 'healthView',
            'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
          ];
          
          viewIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
          
          const targetView = document.getElementById(view);
          if (targetView) {
            targetView.style.display = '';
            
            // 更新侧边栏状态
            document.querySelectorAll('.sidebar-item').forEach(sidebarItem => {
              if (sidebarItem.dataset.view === view) {
                sidebarItem.classList.add('active');
              } else {
                sidebarItem.classList.remove('active');
              }
            });
          }
        }
      } else if (openFeedback) {
        // 处理反馈功能
        if (typeof window.openFeedbackModal === 'function') {
          window.openFeedbackModal();
        } else {
          console.warn('openFeedbackModal函数不存在');
        }
      }
      
      return false;
    };
    
    // 移除旧的事件监听器
    item.removeEventListener('click', clickHandler, true);
    item.removeEventListener('mousedown', clickHandler, true);
    
    // 绑定新的事件监听器（使用capture阶段，最高优先级）
    item.addEventListener('click', clickHandler, { capture: true, passive: false });
    item.addEventListener('mousedown', clickHandler, { capture: true, passive: false });
    
    // 键盘支持
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler(e);
      }
    }, { capture: true });
  }
  
  // 绑定普通按钮
  function bindButton(btn) {
    btn.dataset.forceBound = 'true';
    
    // 确保样式
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.position = 'relative';
    btn.style.zIndex = '99999';
    
    // 移除disabled
    btn.removeAttribute('disabled');
    btn.classList.remove('disabled');
    
    // 如果有onclick属性，确保它能工作
    if (btn.hasAttribute('onclick')) {
      const onclickAttr = btn.getAttribute('onclick');
      try {
        const onclickFunc = new Function('event', onclickAttr);
        btn.onclick = onclickFunc;
      } catch (e) {
        console.warn('无法解析onclick属性:', onclickAttr, e);
      }
    }
    
    // 如果有data-view属性，绑定视图切换
    if (btn.dataset.view) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const view = btn.dataset.view;
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        }
      }, { capture: true, passive: false });
    }
  }
  
  // 移除所有可能阻止点击的覆盖层
  function removeBlockingOverlays() {
    const overlays = document.querySelectorAll(
      '.sidebar-overlay:not(.active), .loading-overlay, .modal-backdrop:not(.active), .overlay:not(.active), [class*="overlay"]:not(.active), [class*="backdrop"]:not(.active)'
    );
    
    overlays.forEach(overlay => {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    });
    
    // 检查固定定位的高z-index元素
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    fixedElements.forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
      if (zIndex > 100 && !el.classList.contains('modal') && !el.classList.contains('active')) {
        const hasClickableContent = el.querySelector('button, a, [onclick], [role="button"]');
        if (!hasClickableContent) {
          el.style.pointerEvents = 'none';
          el.style.zIndex = '-1';
        }
      }
    });
  }
  
  // 添加全局CSS样式
  function addGlobalStyles() {
    if (document.getElementById('ultimate-click-fix-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'ultimate-click-fix-styles';
    style.textContent = `
      /* PC端点击问题终极修复 - 最高优先级 */
      button, .btn, .sidebar-item, [role="button"], [data-view], [data-open-feedback] {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 99999 !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      .sidebar, .sidebar-menu, .main-content {
        pointer-events: auto !important;
      }
      
      body, html {
        pointer-events: auto !important;
        overflow: visible !important;
      }
      
      .sidebar-overlay:not(.active), .loading-overlay:not(.active), 
      .modal-backdrop:not(.active) {
        display: none !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      
      /* 确保按钮在悬停时可见 */
      button:hover, .btn:hover, .sidebar-item:hover {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 主修复函数
  function ultimateFix() {
    console.log('🚀 执行终极修复...');
    
    // 1. 确保switchView可用
    ensureSwitchViewAvailable();
    
    // 2. 移除阻止点击的覆盖层
    removeBlockingOverlays();
    
    // 3. 添加全局样式
    addGlobalStyles();
    
    // 4. 强制绑定所有按钮
    forceBindAllButtons();
    
    // 5. 确保body和html可点击
    document.body.style.pointerEvents = 'auto';
    document.documentElement.style.pointerEvents = 'auto';
    
    console.log('✅ 终极修复完成！');
  }
  
  // 立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ultimateFix);
  } else {
    ultimateFix();
  }
  
  // 延迟多次执行
  setTimeout(ultimateFix, 100);
  setTimeout(ultimateFix, 500);
  setTimeout(ultimateFix, 1000);
  setTimeout(ultimateFix, 2000);
  
  // 监听DOM变化，自动修复新添加的元素
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldFix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldFix = true;
        }
      });
      if (shouldFix) {
        setTimeout(ultimateFix, 100);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 暴露到全局
  window.ultimateFixPC = ultimateFix;
  window.ensureSwitchViewAvailable = ensureSwitchViewAvailable;
  
  console.log('✅ PC端点击问题终极修复脚本已加载');
  console.log('💡 如果仍有问题，请在控制台运行: window.ultimateFixPC()');
})();

 * PC端点击问题终极修复脚本
 * 这个脚本会强制修复所有按钮点击问题，确保100%可用
 */

(function() {
  'use strict';
  
  console.log('🔧 开始PC端点击问题终极修复...');
  
  // 确保switchView函数可用
  function ensureSwitchViewAvailable() {
    // 如果window.switchView不存在，尝试从DOM中查找并创建
    if (typeof window.switchView !== 'function') {
      console.warn('⚠️ switchView函数不存在，尝试创建...');
      
      // 创建备用switchView函数
      window.switchView = function(viewName) {
        console.log('🔄 切换视图:', viewName);
        
        // 获取所有视图
        const viewIds = [
          'homeView', 'dashboardView', 'listView', 'pedigreeView',
          'statsView', 'raceView', 'breedingView', 'healthView',
          'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
        ];
        
        // 隐藏所有视图
        viewIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.display = 'none';
          }
        });
        
        // 显示目标视图
        const targetView = document.getElementById(viewName);
        if (targetView) {
          targetView.style.display = '';
          console.log('✅ 视图切换成功:', viewName);
        } else {
          console.error('❌ 目标视图不存在:', viewName);
        }
        
        // 更新侧边栏状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
          if (item.dataset.view === viewName) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      };
      
      console.log('✅ switchView函数已创建');
    }
  }
  
  // 强制绑定所有按钮的点击事件
  function forceBindAllButtons() {
    console.log('🔧 开始强制绑定所有按钮...');
    
    // 1. 绑定侧边栏菜单项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item, index) => {
      // 移除旧的事件监听器（通过克隆节点）
      if (item.dataset.forceBound === 'true') {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        const freshItem = document.querySelectorAll('.sidebar-item')[index];
        if (freshItem) {
          bindSidebarItem(freshItem);
        }
      } else {
        bindSidebarItem(item);
      }
    });
    
    // 2. 绑定所有按钮
    const allButtons = document.querySelectorAll('button, .btn, [role="button"], [data-view], [data-open-feedback]');
    allButtons.forEach(btn => {
      if (!btn.dataset.forceBound) {
        bindButton(btn);
      }
    });
    
    console.log('✅ 按钮绑定完成');
  }
  
  // 绑定侧边栏项
  function bindSidebarItem(item) {
    item.dataset.forceBound = 'true';
    
    // 确保样式
    item.style.pointerEvents = 'auto';
    item.style.cursor = 'pointer';
    item.style.position = 'relative';
    item.style.zIndex = '99999';
    
    // 移除disabled
    item.removeAttribute('disabled');
    item.classList.remove('disabled');
    
    // 绑定点击事件（使用capture阶段，最高优先级）
    const clickHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🔘 侧边栏项被点击:', item.dataset.view || item.dataset.openFeedback);
      
      const view = item.dataset.view;
      const openFeedback = item.dataset.openFeedback;
      
      if (view) {
        // 确保switchView可用
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        } else {
          // 备用方案：直接操作DOM
          const viewIds = [
            'homeView', 'dashboardView', 'listView', 'pedigreeView',
            'statsView', 'raceView', 'breedingView', 'healthView',
            'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
          ];
          
          viewIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
          
          const targetView = document.getElementById(view);
          if (targetView) {
            targetView.style.display = '';
            
            // 更新侧边栏状态
            document.querySelectorAll('.sidebar-item').forEach(sidebarItem => {
              if (sidebarItem.dataset.view === view) {
                sidebarItem.classList.add('active');
              } else {
                sidebarItem.classList.remove('active');
              }
            });
          }
        }
      } else if (openFeedback) {
        // 处理反馈功能
        if (typeof window.openFeedbackModal === 'function') {
          window.openFeedbackModal();
        } else {
          console.warn('openFeedbackModal函数不存在');
        }
      }
      
      return false;
    };
    
    // 移除旧的事件监听器
    item.removeEventListener('click', clickHandler, true);
    item.removeEventListener('mousedown', clickHandler, true);
    
    // 绑定新的事件监听器（使用capture阶段，最高优先级）
    item.addEventListener('click', clickHandler, { capture: true, passive: false });
    item.addEventListener('mousedown', clickHandler, { capture: true, passive: false });
    
    // 键盘支持
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler(e);
      }
    }, { capture: true });
  }
  
  // 绑定普通按钮
  function bindButton(btn) {
    btn.dataset.forceBound = 'true';
    
    // 确保样式
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.position = 'relative';
    btn.style.zIndex = '99999';
    
    // 移除disabled
    btn.removeAttribute('disabled');
    btn.classList.remove('disabled');
    
    // 如果有onclick属性，确保它能工作
    if (btn.hasAttribute('onclick')) {
      const onclickAttr = btn.getAttribute('onclick');
      try {
        const onclickFunc = new Function('event', onclickAttr);
        btn.onclick = onclickFunc;
      } catch (e) {
        console.warn('无法解析onclick属性:', onclickAttr, e);
      }
    }
    
    // 如果有data-view属性，绑定视图切换
    if (btn.dataset.view) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const view = btn.dataset.view;
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        }
      }, { capture: true, passive: false });
    }
  }
  
  // 移除所有可能阻止点击的覆盖层
  function removeBlockingOverlays() {
    const overlays = document.querySelectorAll(
      '.sidebar-overlay:not(.active), .loading-overlay, .modal-backdrop:not(.active), .overlay:not(.active), [class*="overlay"]:not(.active), [class*="backdrop"]:not(.active)'
    );
    
    overlays.forEach(overlay => {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    });
    
    // 检查固定定位的高z-index元素
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    fixedElements.forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
      if (zIndex > 100 && !el.classList.contains('modal') && !el.classList.contains('active')) {
        const hasClickableContent = el.querySelector('button, a, [onclick], [role="button"]');
        if (!hasClickableContent) {
          el.style.pointerEvents = 'none';
          el.style.zIndex = '-1';
        }
      }
    });
  }
  
  // 添加全局CSS样式
  function addGlobalStyles() {
    if (document.getElementById('ultimate-click-fix-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'ultimate-click-fix-styles';
    style.textContent = `
      /* PC端点击问题终极修复 - 最高优先级 */
      button, .btn, .sidebar-item, [role="button"], [data-view], [data-open-feedback] {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 99999 !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      .sidebar, .sidebar-menu, .main-content {
        pointer-events: auto !important;
      }
      
      body, html {
        pointer-events: auto !important;
        overflow: visible !important;
      }
      
      .sidebar-overlay:not(.active), .loading-overlay:not(.active), 
      .modal-backdrop:not(.active) {
        display: none !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      
      /* 确保按钮在悬停时可见 */
      button:hover, .btn:hover, .sidebar-item:hover {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 主修复函数
  function ultimateFix() {
    console.log('🚀 执行终极修复...');
    
    // 1. 确保switchView可用
    ensureSwitchViewAvailable();
    
    // 2. 移除阻止点击的覆盖层
    removeBlockingOverlays();
    
    // 3. 添加全局样式
    addGlobalStyles();
    
    // 4. 强制绑定所有按钮
    forceBindAllButtons();
    
    // 5. 确保body和html可点击
    document.body.style.pointerEvents = 'auto';
    document.documentElement.style.pointerEvents = 'auto';
    
    console.log('✅ 终极修复完成！');
  }
  
  // 立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ultimateFix);
  } else {
    ultimateFix();
  }
  
  // 延迟多次执行
  setTimeout(ultimateFix, 100);
  setTimeout(ultimateFix, 500);
  setTimeout(ultimateFix, 1000);
  setTimeout(ultimateFix, 2000);
  
  // 监听DOM变化，自动修复新添加的元素
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldFix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldFix = true;
        }
      });
      if (shouldFix) {
        setTimeout(ultimateFix, 100);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 暴露到全局
  window.ultimateFixPC = ultimateFix;
  window.ensureSwitchViewAvailable = ensureSwitchViewAvailable;
  
  console.log('✅ PC端点击问题终极修复脚本已加载');
  console.log('💡 如果仍有问题，请在控制台运行: window.ultimateFixPC()');
})();

 * PC端点击问题终极修复脚本
 * 这个脚本会强制修复所有按钮点击问题，确保100%可用
 */

(function() {
  'use strict';
  
  console.log('🔧 开始PC端点击问题终极修复...');
  
  // 确保switchView函数可用
  function ensureSwitchViewAvailable() {
    // 如果window.switchView不存在，尝试从DOM中查找并创建
    if (typeof window.switchView !== 'function') {
      console.warn('⚠️ switchView函数不存在，尝试创建...');
      
      // 创建备用switchView函数
      window.switchView = function(viewName) {
        console.log('🔄 切换视图:', viewName);
        
        // 获取所有视图
        const viewIds = [
          'homeView', 'dashboardView', 'listView', 'pedigreeView',
          'statsView', 'raceView', 'breedingView', 'healthView',
          'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
        ];
        
        // 隐藏所有视图
        viewIds.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.display = 'none';
          }
        });
        
        // 显示目标视图
        const targetView = document.getElementById(viewName);
        if (targetView) {
          targetView.style.display = '';
          console.log('✅ 视图切换成功:', viewName);
        } else {
          console.error('❌ 目标视图不存在:', viewName);
        }
        
        // 更新侧边栏状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
          if (item.dataset.view === viewName) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      };
      
      console.log('✅ switchView函数已创建');
    }
  }
  
  // 强制绑定所有按钮的点击事件
  function forceBindAllButtons() {
    console.log('🔧 开始强制绑定所有按钮...');
    
    // 1. 绑定侧边栏菜单项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item, index) => {
      // 移除旧的事件监听器（通过克隆节点）
      if (item.dataset.forceBound === 'true') {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        const freshItem = document.querySelectorAll('.sidebar-item')[index];
        if (freshItem) {
          bindSidebarItem(freshItem);
        }
      } else {
        bindSidebarItem(item);
      }
    });
    
    // 2. 绑定所有按钮
    const allButtons = document.querySelectorAll('button, .btn, [role="button"], [data-view], [data-open-feedback]');
    allButtons.forEach(btn => {
      if (!btn.dataset.forceBound) {
        bindButton(btn);
      }
    });
    
    console.log('✅ 按钮绑定完成');
  }
  
  // 绑定侧边栏项
  function bindSidebarItem(item) {
    item.dataset.forceBound = 'true';
    
    // 确保样式
    item.style.pointerEvents = 'auto';
    item.style.cursor = 'pointer';
    item.style.position = 'relative';
    item.style.zIndex = '99999';
    
    // 移除disabled
    item.removeAttribute('disabled');
    item.classList.remove('disabled');
    
    // 绑定点击事件（使用capture阶段，最高优先级）
    const clickHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🔘 侧边栏项被点击:', item.dataset.view || item.dataset.openFeedback);
      
      const view = item.dataset.view;
      const openFeedback = item.dataset.openFeedback;
      
      if (view) {
        // 确保switchView可用
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        } else {
          // 备用方案：直接操作DOM
          const viewIds = [
            'homeView', 'dashboardView', 'listView', 'pedigreeView',
            'statsView', 'raceView', 'breedingView', 'healthView',
            'analysisView', 'trainingView', 'qualificationView', 'createView', 'detailView'
          ];
          
          viewIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
          
          const targetView = document.getElementById(view);
          if (targetView) {
            targetView.style.display = '';
            
            // 更新侧边栏状态
            document.querySelectorAll('.sidebar-item').forEach(sidebarItem => {
              if (sidebarItem.dataset.view === view) {
                sidebarItem.classList.add('active');
              } else {
                sidebarItem.classList.remove('active');
              }
            });
          }
        }
      } else if (openFeedback) {
        // 处理反馈功能
        if (typeof window.openFeedbackModal === 'function') {
          window.openFeedbackModal();
        } else {
          console.warn('openFeedbackModal函数不存在');
        }
      }
      
      return false;
    };
    
    // 移除旧的事件监听器
    item.removeEventListener('click', clickHandler, true);
    item.removeEventListener('mousedown', clickHandler, true);
    
    // 绑定新的事件监听器（使用capture阶段，最高优先级）
    item.addEventListener('click', clickHandler, { capture: true, passive: false });
    item.addEventListener('mousedown', clickHandler, { capture: true, passive: false });
    
    // 键盘支持
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler(e);
      }
    }, { capture: true });
  }
  
  // 绑定普通按钮
  function bindButton(btn) {
    btn.dataset.forceBound = 'true';
    
    // 确保样式
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.position = 'relative';
    btn.style.zIndex = '99999';
    
    // 移除disabled
    btn.removeAttribute('disabled');
    btn.classList.remove('disabled');
    
    // 如果有onclick属性，确保它能工作
    if (btn.hasAttribute('onclick')) {
      const onclickAttr = btn.getAttribute('onclick');
      try {
        const onclickFunc = new Function('event', onclickAttr);
        btn.onclick = onclickFunc;
      } catch (e) {
        console.warn('无法解析onclick属性:', onclickAttr, e);
      }
    }
    
    // 如果有data-view属性，绑定视图切换
    if (btn.dataset.view) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const view = btn.dataset.view;
        ensureSwitchViewAvailable();
        
        if (typeof window.switchView === 'function') {
          window.switchView(view);
        }
      }, { capture: true, passive: false });
    }
  }
  
  // 移除所有可能阻止点击的覆盖层
  function removeBlockingOverlays() {
    const overlays = document.querySelectorAll(
      '.sidebar-overlay:not(.active), .loading-overlay, .modal-backdrop:not(.active), .overlay:not(.active), [class*="overlay"]:not(.active), [class*="backdrop"]:not(.active)'
    );
    
    overlays.forEach(overlay => {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    });
    
    // 检查固定定位的高z-index元素
    const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
    fixedElements.forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
      if (zIndex > 100 && !el.classList.contains('modal') && !el.classList.contains('active')) {
        const hasClickableContent = el.querySelector('button, a, [onclick], [role="button"]');
        if (!hasClickableContent) {
          el.style.pointerEvents = 'none';
          el.style.zIndex = '-1';
        }
      }
    });
  }
  
  // 添加全局CSS样式
  function addGlobalStyles() {
    if (document.getElementById('ultimate-click-fix-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'ultimate-click-fix-styles';
    style.textContent = `
      /* PC端点击问题终极修复 - 最高优先级 */
      button, .btn, .sidebar-item, [role="button"], [data-view], [data-open-feedback] {
        pointer-events: auto !important;
        cursor: pointer !important;
        position: relative !important;
        z-index: 99999 !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      .sidebar, .sidebar-menu, .main-content {
        pointer-events: auto !important;
      }
      
      body, html {
        pointer-events: auto !important;
        overflow: visible !important;
      }
      
      .sidebar-overlay:not(.active), .loading-overlay:not(.active), 
      .modal-backdrop:not(.active) {
        display: none !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      
      /* 确保按钮在悬停时可见 */
      button:hover, .btn:hover, .sidebar-item:hover {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // 主修复函数
  function ultimateFix() {
    console.log('🚀 执行终极修复...');
    
    // 1. 确保switchView可用
    ensureSwitchViewAvailable();
    
    // 2. 移除阻止点击的覆盖层
    removeBlockingOverlays();
    
    // 3. 添加全局样式
    addGlobalStyles();
    
    // 4. 强制绑定所有按钮
    forceBindAllButtons();
    
    // 5. 确保body和html可点击
    document.body.style.pointerEvents = 'auto';
    document.documentElement.style.pointerEvents = 'auto';
    
    console.log('✅ 终极修复完成！');
  }
  
  // 立即执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ultimateFix);
  } else {
    ultimateFix();
  }
  
  // 延迟多次执行
  setTimeout(ultimateFix, 100);
  setTimeout(ultimateFix, 500);
  setTimeout(ultimateFix, 1000);
  setTimeout(ultimateFix, 2000);
  
  // 监听DOM变化，自动修复新添加的元素
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(function(mutations) {
      let shouldFix = false;
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          shouldFix = true;
        }
      });
      if (shouldFix) {
        setTimeout(ultimateFix, 100);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 暴露到全局
  window.ultimateFixPC = ultimateFix;
  window.ensureSwitchViewAvailable = ensureSwitchViewAvailable;
  
  console.log('✅ PC端点击问题终极修复脚本已加载');
  console.log('💡 如果仍有问题，请在控制台运行: window.ultimateFixPC()');
})();


