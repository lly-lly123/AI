/**
 * 设备自动识别与无感知跳转模块
 * 功能：检测设备类型，自动跳转到对应版本（PC→index.html，移动端→mobile.html）
 * 要求：检测准确率>99%，跳转无闪烁、无延迟
 */
(function() {
  'use strict';
  
  // 执行时机：页面DOM加载前完成检测
  const startTime = performance.now();
  
  try {
    // 1. 后台和子页面不参与自动跳转
    const path = window.location.pathname || '';
    const fileName = path.split('/').pop() || 'index.html';
    if (fileName !== '' && fileName !== 'index.html' && fileName !== '') {
      return; // 不是index.html，不处理
    }
    
    // 2. 用户手动选择过视图时，尊重用户选择（优先级最高）
    let forcedView = null;
    try {
      forcedView = localStorage.getItem('pigeon_forced_view'); // 'desktop' | 'mobile'
    } catch (e) {
      // localStorage不可用时忽略
    }
    
    // 3. 检测规则：匹配userAgent中"iphone、android、mobile、ipad、ipod"等关键词
    const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
    
    // 更全面的移动设备检测（准确率>99%）
    const mobileKeywords = [
      'iphone', 'ipad', 'ipod',           // iOS设备
      'android',                          // Android设备
      'mobile', 'tablet',                 // 通用移动设备标识
      'blackberry', 'windows phone',      // 其他移动设备
      'opera mini', 'opera mobi',         // Opera移动版
      'iemobile',                         // IE移动版
      'webos', 'palm',                    // Palm/WebOS
      'symbian', 'nokia',                 // 旧版移动设备
      'fennec', 'maemo'                   // Firefox移动版
    ];
    
    const isMobileUA = mobileKeywords.some(keyword => ua.includes(keyword));
    
    // 4. 屏幕尺寸辅助判断（作为UA检测的补充）
    const screenWidth = window.screen ? window.screen.width : 0;
    const isSmallScreen = screenWidth > 0 && screenWidth < 768;
    
    // 5. 触摸设备检测（作为辅助判断）
    const isTouchDevice = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         navigator.msMaxTouchPoints > 0;
    
    // 综合判断：UA检测为主，屏幕和触摸为辅
    const isMobileDevice = isMobileUA || (isSmallScreen && isTouchDevice);
    
    // 6. 跳转逻辑决策
    let shouldGoMobile = false;
    
    if (forcedView === 'mobile') {
      // 用户明确选择移动版
      shouldGoMobile = true;
    } else if (forcedView === 'desktop') {
      // 用户明确选择桌面版
      shouldGoMobile = false;
    } else {
      // 默认策略：移动端自动跳转到移动版
      shouldGoMobile = isMobileDevice;
    }
    
    // 7. 执行跳转（无闪烁、无延迟）
    if (shouldGoMobile) {
      const currentPath = window.location.pathname;
      const target = 'mobile.html' + window.location.search + window.location.hash;
      
      // 避免重复跳转
      if (!/mobile\.html($|\?|\#)/.test(currentPath)) {
        // 使用replace而不是assign，避免在历史记录中留下index.html
        window.location.replace(target);
        return; // 跳转后立即返回，不执行后续代码
      }
    }
    
    // 8. 性能监控（开发环境）
    if (window.console && console.log) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      if (duration > 10) { // 超过10ms才记录
        console.log('[Device Detect] 检测耗时:', duration.toFixed(2) + 'ms', {
          isMobile: isMobileDevice,
          forcedView: forcedView,
          shouldGoMobile: shouldGoMobile
        });
      }
    }
    
  } catch (e) {
    // 静默失败，不影响页面加载
    if (window.console && console.warn) {
      console.warn('[Device Detect] 设备检测失败:', e);
    }
  }
})();



































































