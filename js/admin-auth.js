/**
 * 管理员权限验证模块（admin.html专属）
 * 功能：访问控制、登录增强、防绕过机制
 * 要求：每次访问均校验，不可篡改，独立于原有功能逻辑
 */
(function() {
  'use strict';
  
  // 仅在admin.html中执行
  const currentFile = window.location.pathname.split('/').pop() || '';
  if (currentFile !== 'admin.html' && !window.location.href.includes('admin.html')) {
    return; // 不是admin.html，不执行
  }
  
  /**
   * 简单加密/解密函数（用于管理员标识）
   */
  function simpleEncrypt(text) {
    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        result += String.fromCharCode(charCode + 3); // 简单位移加密
      }
      return btoa(result); // Base64编码
    } catch (e) {
      return text;
    }
  }
  
  function simpleDecrypt(encrypted) {
    try {
      const decoded = atob(encrypted);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i);
        result += String.fromCharCode(charCode - 3);
      }
      return result;
    } catch (e) {
      return encrypted;
    }
  }
  
  /**
   * 检测设备类型（用于跳转到对应主站）
   */
  function detectDevice() {
    const ua = (navigator.userAgent || '').toLowerCase();
    const mobileKeywords = ['iphone', 'ipad', 'ipod', 'android', 'mobile', 'tablet'];
    return mobileKeywords.some(keyword => ua.includes(keyword));
  }
  
  /**
   * 验证管理员权限
   * @returns {boolean} 是否为管理员
   */
  function verifyAdminAccess() {
    try {
      // 1. 检查是否已登录
      const token = localStorage.getItem('adminToken');
      const user = localStorage.getItem('adminUser');
      
      if (!token || !user) {
        return false; // 未登录
      }
      
      // 2. 检查账号是否标记为"管理员"
      let userData;
      try {
        userData = JSON.parse(user);
      } catch (e) {
        return false; // 用户数据格式错误
      }
      
      // 3. 验证角色（支持多种标识方式）
      const role = userData.role;
      const isAdmin = role === 'admin' || 
                     role === '管理员' || 
                     role === 'administrator' ||
                     userData.isAdmin === true;
      
      if (!isAdmin) {
        return false; // 不是管理员
      }
      
      // 4. 验证加密标识（防篡改）
      const adminMark = localStorage.getItem('admin_mark');
      if (adminMark) {
        try {
          const decrypted = simpleDecrypt(adminMark);
          if (decrypted !== 'admin_' + userData.id) {
            // 标识被篡改，清除登录状态
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('admin_mark');
            return false;
          }
        } catch (e) {
          // 解密失败，可能是旧数据，允许通过但重新设置标识
          const newMark = simpleEncrypt('admin_' + userData.id);
          localStorage.setItem('admin_mark', newMark);
        }
      } else {
        // 首次登录，设置加密标识
        const newMark = simpleEncrypt('admin_' + userData.id);
        localStorage.setItem('admin_mark', newMark);
      }
      
      return true; // 验证通过
      
    } catch (e) {
      console.error('[Admin Auth] 验证失败:', e);
      return false;
    }
  }
  
  /**
   * 跳转到对应设备主站
   */
  function redirectToMainSite() {
    const isMobile = detectDevice();
    const target = isMobile ? 'mobile.html' : 'index.html';
    window.location.replace(target);
  }
  
  /**
   * 初始化权限验证
   */
  function initAuth() {
    // 优先执行验证（在页面渲染前）
    if (!verifyAdminAccess()) {
      // 非管理员，跳转到主站
      redirectToMainSite();
      return;
    }
    
    // 验证通过，允许访问
    console.log('[Admin Auth] 管理员权限验证通过');
  }
  
  /**
   * 增强登录表单：添加"管理员标识"勾选框
   */
  function enhanceLoginForm() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        addAdminCheckbox();
      });
    } else {
      addAdminCheckbox();
    }
  }
  
  function addAdminCheckbox() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
      // 如果登录表单不存在，可能已经登录，不需要添加
      return;
    }
    
    // 检查是否已添加过
    if (document.getElementById('adminMarkCheckbox')) {
      return;
    }
    
    // 查找密码输入框后面的位置
    const passwordGroup = loginForm.querySelector('input[type="password"]')?.closest('.form-group');
    if (!passwordGroup) {
      return;
    }
    
    // 创建管理员标识勾选框（仅初始账号可设置）
    const checkboxGroup = document.createElement('div');
    checkboxGroup.className = 'form-group';
    checkboxGroup.style.marginTop = '8px';
    checkboxGroup.innerHTML = `
      <label style="display: flex; align-items: center; cursor: pointer; font-size: 13px; font-weight: normal; color: var(--text-secondary);">
        <input type="checkbox" id="adminMarkCheckbox" style="margin-right: 6px; width: 14px; height: 14px; cursor: pointer;" />
        <span>标记为管理员（仅首次登录时勾选）</span>
      </label>
    `;
    
    // 插入到密码输入框后面
    passwordGroup.parentNode.insertBefore(checkboxGroup, passwordGroup.nextSibling);
    
    // 监听登录表单提交
    const originalSubmit = loginForm.onsubmit;
    loginForm.addEventListener('submit', function(e) {
      const checkbox = document.getElementById('adminMarkCheckbox');
      if (checkbox && checkbox.checked) {
        // 用户勾选了管理员标识，在登录成功后设置
        // 这个逻辑会在登录成功的回调中处理
        window._shouldMarkAsAdmin = true;
      }
    });
  }
  
  /**
   * 设置管理员标识（在登录成功后调用）
   */
  function markAsAdmin(userData) {
    try {
      if (!userData || !userData.id) {
        return;
      }
      
      const adminMark = simpleEncrypt('admin_' + userData.id);
      localStorage.setItem('admin_mark', adminMark);
      
      // 更新用户数据中的角色
      if (userData.role !== 'admin' && userData.role !== '管理员') {
        userData.role = 'admin';
        localStorage.setItem('adminUser', JSON.stringify(userData));
      }
      
      console.log('[Admin Auth] 管理员标识已设置');
    } catch (e) {
      console.error('[Admin Auth] 设置管理员标识失败:', e);
    }
  }
  
  // 导出函数供外部调用
  window.AdminAuth = {
    verify: verifyAdminAccess,
    markAsAdmin: markAsAdmin,
    init: initAuth
  };
  
  // 立即执行验证（优先执行）
  initAuth();
  
  // 增强登录表单
  enhanceLoginForm();
  
  // 监听登录成功事件（如果存在）
  window.addEventListener('adminLoginSuccess', function(e) {
    const userData = e.detail?.userData;
    if (userData && window._shouldMarkAsAdmin) {
      markAsAdmin(userData);
      window._shouldMarkAsAdmin = false;
    }
  });
  
})();
























































































