/**
 * 通用按钮点击修复脚本
 * 适用于所有页面（index.html, mobile.html, admin.html）
 */

(function() {
  'use strict';
  
  console.log('🔧 开始通用按钮点击修复...');
  
  // 强制修复所有按钮点击问题
  function forceFixAllButtons() {
    // 1. 强制移除所有可能阻止点击的覆盖层
    const overlays = document.querySelectorAll(`
      .sidebar-overlay:not(.active), 
      .loading-overlay, 
      .modal-backdrop:not(.active),
      .overlay:not(.active)
    `);
    overlays.forEach(overlay => {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '-1';
    });
    
    // 2. 强制设置所有按钮可点击
    const allClickableElements = document.querySelectorAll(`
      button, .btn, .sidebar-item, .quick-link-btn, 
      .view-switch-btn, .race-tab-btn, .event-tab-btn, 
      .news-filter-btn, [role="button"], 
      .card-header button, .home-overview button, 
      .home-content button, a[onclick], 
      .announcement-modal-close, .modal-close,
      .mobile-nav-item, .mobile-tab, .mobile-quick-link-btn,
      .btn-icon, .btn-primary, .btn-outline, .btn-secondary
    `);
    
    allClickableElements.forEach(el => {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';
      el.style.zIndex = '10';
      if (!el.hasAttribute('role') && el.tagName !== 'A') {
        el.setAttribute('role', 'button');
      }
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
    });
    
    // 3. 确保关键容器可点击
    const containers = [
      '.sidebar', '.sidebar-menu', '.main-content', 
      '.content-wrapper', '.home-section', '.home-content',
      '.mobile-header', '.mobile-content', '.mobile-nav',
      'body', 'html'
    ];
    
    containers.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.pointerEvents = 'auto';
      }
    });
    
    // 4. 添加全局CSS样式（如果不存在）
    if (!document.getElementById('universal-button-fix-styles')) {
      const style = document.createElement('style');
      style.id = 'universal-button-fix-styles';
      style.textContent = `
        /* 强制所有按钮可点击 */
        button, .btn, .sidebar-item, .quick-link-btn, 
        .view-switch-btn, .race-tab-btn, .event-tab-btn, 
        .news-filter-btn, [role="button"],
        .mobile-nav-item, .mobile-tab, .mobile-quick-link-btn,
        .btn-icon, .btn-primary, .btn-outline, .btn-secondary {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          position: relative !important;
          z-index: 10 !important;
        }
        /* 确保容器可点击 */
        .sidebar, .sidebar-menu, .main-content, .content-wrapper,
        .home-section, .home-content, .home-overview,
        .mobile-header, .mobile-content, .mobile-nav {
          pointer-events: auto !important;
        }
        /* 确保body和html可点击 */
        body, html {
          pointer-events: auto !important;
        }
        /* 移除可能遮挡的覆盖层 */
        .sidebar-overlay:not(.active),
        .loading-overlay:not(.active),
        .modal-backdrop:not(.active) {
          display: none !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log(`✅ 通用修复完成: ${allClickableElements.length} 个可点击元素`);
  }
  
  // 立即执行
  forceFixAllButtons();
  
  // 延迟多次执行，确保DOM完全加载
  setTimeout(forceFixAllButtons, 100);
  setTimeout(forceFixAllButtons, 500);
  setTimeout(forceFixAllButtons, 1000);
  setTimeout(forceFixAllButtons, 2000);
  
  // 页面完全加载后再次执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceFixAllButtons);
  }
  window.addEventListener('load', forceFixAllButtons);
  
  // 暴露到全局
  window.forceFixAllButtons = forceFixAllButtons;
  
  console.log('✅ 通用按钮点击修复脚本已加载');
  
})();

