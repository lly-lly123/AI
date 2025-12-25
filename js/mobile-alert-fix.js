/**
 * 移动端Alert修复脚本
 * 替换原生alert和confirm，使用自定义模态框，确保可以正常关闭
 */

(function() {
  'use strict';
  
  // 创建自定义alert模态框
  function createAlertModal() {
    if (document.getElementById('mobileAlertModal')) {
      return; // 已存在，不重复创建
    }
    
    const modalHTML = `
      <div id="mobileAlertModal" class="mobile-modal" style="display:none;z-index:99999;">
        <div class="mobile-modal-overlay" onclick="window._closeMobileAlert()"></div>
        <div class="mobile-modal-content" style="max-width:90%;width:320px;">
          <div class="mobile-modal-header">
            <h3 id="mobileAlertTitle" style="margin:0;font-size:18px;font-weight:600;">提示</h3>
            <button class="mobile-modal-close" onclick="window._closeMobileAlert()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#6b7280;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;">✕</button>
          </div>
          <div class="mobile-modal-body" style="padding:20px;">
            <p id="mobileAlertMessage" style="margin:0;font-size:16px;line-height:1.6;color:#374151;word-break:break-word;"></p>
          </div>
          <div class="mobile-modal-footer" style="padding:12px 20px;border-top:1px solid #e5e7eb;display:flex;gap:12px;justify-content:flex-end;">
            <button id="mobileAlertCancelBtn" onclick="window._closeMobileAlert()" style="display:none;flex:1;padding:10px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#374151;font-size:16px;font-weight:500;cursor:pointer;">取消</button>
            <button id="mobileAlertConfirmBtn" onclick="window._confirmMobileAlert()" style="flex:1;padding:10px;border:none;border-radius:8px;background:var(--primary, #2563eb);color:#fff;font-size:16px;font-weight:600;cursor:pointer;">确定</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 关闭函数
    window._closeMobileAlert = function() {
      const modal = document.getElementById('mobileAlertModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
      
      // 如果有回调，执行取消回调
      if (window._alertCancelCallback) {
        window._alertCancelCallback();
        window._alertCancelCallback = null;
      }
      window._alertConfirmCallback = null;
    };
    
    // 确认函数
    window._confirmMobileAlert = function() {
      const modal = document.getElementById('mobileAlertModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
      
      // 执行确认回调
      if (window._alertConfirmCallback) {
        window._alertConfirmCallback();
        window._alertConfirmCallback = null;
      }
      window._alertCancelCallback = null;
    };
  }
  
  // 自定义alert函数
  function customAlert(message, title = '提示') {
    return new Promise((resolve) => {
      createAlertModal();
      
      const modal = document.getElementById('mobileAlertModal');
      const titleEl = document.getElementById('mobileAlertTitle');
      const messageEl = document.getElementById('mobileAlertMessage');
      const cancelBtn = document.getElementById('mobileAlertCancelBtn');
      const confirmBtn = document.getElementById('mobileAlertConfirmBtn');
      
      if (!modal || !titleEl || !messageEl || !confirmBtn) {
        // 如果创建失败，使用console输出（避免原生alert可能的问题）
        console.error('❌ [移动端Alert] 模态框创建失败:', message);
        // 尝试使用window._originalAlert（如果存在）
        if (typeof window._originalAlert === 'function') {
          window._originalAlert(message);
        }
        resolve();
        return;
      }
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      cancelBtn.style.display = 'none';
      confirmBtn.textContent = '确定';
      
      window._alertConfirmCallback = () => {
        resolve();
      };
      
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // 聚焦到确认按钮
      setTimeout(() => {
        confirmBtn.focus();
      }, 100);
    });
  }
  
  // 自定义confirm函数
  function customConfirm(message, title = '确认') {
    return new Promise((resolve) => {
      createAlertModal();
      
      const modal = document.getElementById('mobileAlertModal');
      const titleEl = document.getElementById('mobileAlertTitle');
      const messageEl = document.getElementById('mobileAlertMessage');
      const cancelBtn = document.getElementById('mobileAlertCancelBtn');
      const confirmBtn = document.getElementById('mobileAlertConfirmBtn');
      
      if (!modal || !titleEl || !messageEl || !cancelBtn || !confirmBtn) {
        // 如果创建失败，使用console输出（避免原生confirm可能的问题）
        console.error('❌ [移动端Confirm] 模态框创建失败:', message);
        // 尝试使用window._originalConfirm（如果存在）
        if (typeof window._originalConfirm === 'function') {
          const result = window._originalConfirm(message);
          resolve(result);
        } else {
          // 默认返回false（取消）
          resolve(false);
        }
        return;
      }
      
      titleEl.textContent = title;
      messageEl.textContent = message;
      cancelBtn.style.display = 'flex';
      confirmBtn.textContent = '确定';
      
      window._alertConfirmCallback = () => {
        resolve(true);
      };
      
      window._alertCancelCallback = () => {
        resolve(false);
      };
      
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // 聚焦到确认按钮
      setTimeout(() => {
        confirmBtn.focus();
      }, 100);
    });
  }
  
  // 替换全局alert和confirm
  if (typeof window !== 'undefined') {
    // 保存原始函数
    window._originalAlert = window.alert;
    window._originalConfirm = window.confirm;
    
    // 替换为自定义函数
    window.alert = customAlert;
    window.confirm = customConfirm;
    
    console.log('✅ 移动端Alert修复脚本已加载');
  }
  
  // 暴露函数供外部使用
  if (typeof window !== 'undefined') {
    window.customAlert = customAlert;
    window.customConfirm = customConfirm;
  }
})();

