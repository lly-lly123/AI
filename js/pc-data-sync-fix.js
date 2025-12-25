/**
 * PC端数据同步修复脚本
 * 监听localStorage变化，自动刷新数据
 */

(function() {
  'use strict';
  
  console.log('🔧 [PC端数据同步] 开始加载数据同步修复脚本...');
  
  const STORAGE_KEY = 'pigeon_manager_data_v1';
  let lastDataHash = null;
  
  // 计算数据哈希
  function getDataHash(data) {
    if (!data) return null;
    try {
      return JSON.stringify(data).length.toString();
    } catch (e) {
      return null;
    }
  }
  
  // 刷新数据
  function refreshData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      
      const data = JSON.parse(raw);
      const currentHash = getDataHash(data);
      
      // 如果数据没有变化，跳过
      if (currentHash === lastDataHash) {
        return;
      }
      
      lastDataHash = currentHash;
      
      // 如果全局pigeons变量存在，更新它
      if (typeof window.pigeons !== 'undefined') {
        window.pigeons = data;
      }
      
      // 刷新视图
      if (typeof window.renderPigeonList === 'function') {
        console.log('🔄 [PC端数据同步] 刷新鸽子列表');
        window.renderPigeonList();
      }
      
      if (typeof window.renderStats === 'function') {
        console.log('🔄 [PC端数据同步] 刷新统计数据');
        window.renderStats();
      }
      
      // 如果当前在详情页，也刷新详情
      if (typeof window.renderDetail === 'function' && typeof window.currentDetailId !== 'undefined' && window.currentDetailId) {
        console.log('🔄 [PC端数据同步] 刷新详情页');
        window.renderDetail(window.currentDetailId);
      }
      
      console.log('✅ [PC端数据同步] 数据已刷新');
    } catch (e) {
      console.error('❌ [PC端数据同步] 刷新数据失败:', e);
    }
  }
  
  // 监听storage事件（跨标签页同步）
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY && e.newValue !== e.oldValue) {
      console.log('🔄 [PC端数据同步] 检测到storage事件（跨标签页），刷新数据');
      setTimeout(refreshData, 100);
    }
  });
  
  // 重写localStorage.setItem以监听同标签页内的变化
  if (typeof Storage !== 'undefined') {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      const oldValue = this.getItem(key);
      originalSetItem.call(this, key, value);
      
      // 如果是我们关心的key，触发刷新
      if (key === STORAGE_KEY && value !== oldValue) {
        console.log('🔄 [PC端数据同步] 检测到localStorage变化，刷新数据');
        setTimeout(refreshData, 100);
      }
      
      // 触发storage事件（虽然同标签页不会触发，但我们手动触发自定义事件）
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, oldValue, newValue: value }
      }));
    };
  }
  
  // 初始化：获取当前数据哈希
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      lastDataHash = getDataHash(data);
    }
  } catch (e) {
    console.warn('⚠️ [PC端数据同步] 初始化失败:', e);
  }
  
  // 定期检查数据变化（作为备用方案）
  setInterval(function() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const currentHash = getDataHash(data);
        if (currentHash !== lastDataHash) {
          console.log('🔄 [PC端数据同步] 定期检查发现数据变化，刷新数据');
          refreshData();
        }
      }
    } catch (e) {
      // 忽略错误
    }
  }, 2000); // 每2秒检查一次
  
  console.log('✅ [PC端数据同步] 数据同步修复脚本已加载');
  
  // 暴露刷新函数供外部调用
  window.refreshDataFromStorage = refreshData;
})();

