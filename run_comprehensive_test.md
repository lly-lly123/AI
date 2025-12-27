# 全面功能测试执行指南

由于需要测试所有功能，请在浏览器控制台执行以下测试脚本：

## 使用方法

1. 打开网站（PC端、移动端或后台）
2. 打开浏览器开发者工具（F12）
3. 进入Console标签
4. 复制粘贴下面的测试脚本
5. 按回车执行
6. 查看测试结果

## 测试脚本

```javascript
// ============================================
// 全面功能测试脚本
// ============================================

(function() {
  const testResults = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  function log(type, message) {
    const icon = type === 'pass' ? '✅' : type === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${message}`);
    if (type === 'pass') {
      testResults.passed.push(message);
    } else if (type === 'fail') {
      testResults.failed.push(message);
    } else {
      testResults.warnings.push(message);
    }
  }
  
  function test(name, testFn) {
    try {
      const result = testFn();
      if (result === true || result) {
        log('pass', name);
        return true;
      } else {
        log('fail', name);
        return false;
      }
    } catch (e) {
      log('fail', `${name}: ${e.message}`);
      return false;
    }
  }
  
  console.log('\n🔍 开始全面功能测试...\n');
  console.log('当前页面:', window.location.pathname);
  console.log('='.repeat(50));
  
  // 检测页面类型
  const isMobile = window.location.pathname.includes('mobile');
  const isAdmin = window.location.pathname.includes('admin');
  const isPC = !isMobile && !isAdmin;
  
  console.log(`页面类型: ${isMobile ? '移动端' : isAdmin ? '后台' : 'PC端'}\n`);
  
  // ==================== 移动端测试 ====================
  if (isMobile) {
    console.log('\n📱 移动端功能测试\n');
    
    // 1. 测试底部导航
    console.log('--- 底部导航测试 ---');
    const navItems = document.querySelectorAll('.mobile-nav-item');
    test('底部导航按钮存在（至少4个）', () => navItems.length >= 4);
    
    // 测试每个导航按钮
    navItems.forEach((btn, index) => {
      const onclick = btn.getAttribute('onclick') || '';
      const text = btn.textContent.trim();
      test(`导航按钮${index + 1}可点击: ${text}`, () => {
        return onclick.includes('switchView') || btn.onclick !== null;
      });
    });
    
    // 2. 测试更多功能视图中的卡片（重点）
    console.log('\n--- 更多功能视图测试（重点）---');
    
    // 先切换到更多功能视图
    if (typeof window.switchView === 'function') {
      window.switchView('more');
      setTimeout(() => {
        const moreView = document.getElementById('moreView');
        test('更多功能视图存在', () => moreView !== null);
        test('更多功能视图已显示', () => {
          if (!moreView) return false;
          const style = window.getComputedStyle(moreView);
          return style.display !== 'none';
        });
        
        // 查找功能卡片
        const cards = moreView ? moreView.querySelectorAll('.mobile-card') : [];
        test(`功能卡片数量正确（应该5个）: 找到${cards.length}个`, () => cards.length >= 5);
        
        // 测试每个卡片
        cards.forEach((card, index) => {
          const title = card.querySelector('.mobile-card-title')?.textContent?.trim() || `卡片${index + 1}`;
          
          // 检查onclick属性
          const onclickAttr = card.getAttribute('onclick');
          test(`卡片${index + 1}有onclick属性: ${title}`, () => onclickAttr !== null && onclickAttr.length > 0);
          
          // 检查pointer-events
          const style = window.getComputedStyle(card);
          const pointerEvents = style.pointerEvents;
          test(`卡片${index + 1}pointer-events不为none: ${title}`, () => pointerEvents !== 'none');
          
          // 检查是否有事件监听器
          const hasClickHandler = card.onclick !== null;
          test(`卡片${index + 1}有click处理器: ${title}`, () => hasClickHandler || onclickAttr);
          
          // 尝试点击测试
          const beforeView = document.getElementById('moreView')?.style.display;
          try {
            card.click();
            setTimeout(() => {
              // 检查视图是否切换
              const afterView = document.getElementById('moreView')?.style.display;
              if (afterView === 'none') {
                log('pass', `卡片${index + 1}点击后视图切换成功: ${title}`);
              } else {
                log('warn', `卡片${index + 1}点击后视图未切换: ${title}`);
              }
            }, 200);
          } catch (e) {
            log('fail', `卡片${index + 1}点击失败: ${title} - ${e.message}`);
          }
        });
        
        // 切换回首页继续其他测试
        setTimeout(() => {
          if (typeof window.switchView === 'function') {
            window.switchView('home');
          }
        }, 1000);
      }, 500);
    }
    
    // 3. 测试顶部按钮
    console.log('\n--- 顶部按钮测试 ---');
    const accountBtn = document.querySelector('[onclick*="account"]') || 
                       Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('账户'));
    test('账户按钮存在', () => accountBtn !== undefined);
    
    const settingsBtn = document.querySelector('[onclick*="settings"]') || 
                        Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('设置'));
    test('设置按钮存在', () => settingsBtn !== undefined);
    
    // 4. 测试switchView函数
    console.log('\n--- 核心函数测试 ---');
    test('switchView函数存在', () => typeof window.switchView === 'function');
  }
  
  // ==================== PC端测试 ====================
  if (isPC) {
    console.log('\n💻 PC端功能测试\n');
    
    // 测试侧边栏按钮
    console.log('--- 侧边栏导航测试 ---');
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
    test(`侧边栏按钮存在（应该11个）: 找到${sidebarItems.length}个`, () => sidebarItems.length >= 11);
    
    sidebarItems.forEach((item, index) => {
      const view = item.dataset.view;
      const text = item.textContent.trim();
      test(`侧边栏按钮${index + 1}: ${text} (${view})`, () => {
        return view && item !== null;
      });
    });
    
    // 测试switchView函数
    test('switchView函数存在', () => typeof window.switchView === 'function');
    
    // 测试顶部按钮
    console.log('\n--- 顶部按钮测试 ---');
    const addBtn = document.getElementById('btnGoCreate') || 
                   Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('新增'));
    test('新增鸽子按钮存在', () => addBtn !== undefined);
  }
  
  // ==================== 后台测试 ====================
  if (isAdmin) {
    console.log('\n🔧 后台管理功能测试\n');
    
    // 测试登录表单
    console.log('--- 登录功能测试 ---');
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('登录'));
    
    test('用户名输入框存在', () => usernameInput !== null);
    test('密码输入框存在', () => passwordInput !== null);
    test('登录按钮存在', () => loginBtn !== undefined);
    
    // 如果已登录，测试侧边栏
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
    if (sidebarItems.length > 0) {
      console.log('\n--- 后台侧边栏测试（已登录）---');
      test(`侧边栏按钮存在: 找到${sidebarItems.length}个`, () => sidebarItems.length > 0);
      
      test('switchTab函数存在', () => typeof window.switchTab === 'function');
    }
  }
  
  // ==================== 测试结果汇总 ====================
  setTimeout(() => {
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果汇总');
    console.log('='.repeat(50));
    console.log(`✅ 通过: ${testResults.passed.length} 项`);
    console.log(`❌ 失败: ${testResults.failed.length} 项`);
    console.log(`⚠️  警告: ${testResults.warnings.length} 项`);
    
    if (testResults.failed.length > 0) {
      console.log('\n❌ 失败的测试:');
      testResults.failed.forEach(item => console.log(`  - ${item}`));
    }
    
    if (testResults.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      testResults.warnings.forEach(item => console.log(`  - ${item}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    // 保存结果到全局变量
    window.testResults = testResults;
    console.log('测试结果已保存到 window.testResults');
  }, 3000);
})();
```

## 移动端重点测试脚本

如果专门要测试移动端按钮点击问题，使用这个脚本：

```javascript
// 移动端按钮点击问题诊断脚本
(function() {
  console.log('🔍 移动端按钮点击问题诊断\n');
  
  // 切换到更多功能视图
  if (typeof window.switchView === 'function') {
    window.switchView('more');
    
    setTimeout(() => {
      const moreView = document.getElementById('moreView');
      if (!moreView) {
        console.error('❌ 更多功能视图不存在');
        return;
      }
      
      console.log('✅ 更多功能视图已找到');
      console.log('视图display状态:', window.getComputedStyle(moreView).display);
      
      const cards = moreView.querySelectorAll('.mobile-card');
      console.log(`\n找到 ${cards.length} 个功能卡片\n`);
      
      cards.forEach((card, index) => {
        const title = card.querySelector('.mobile-card-title')?.textContent?.trim() || `卡片${index + 1}`;
        console.log(`\n--- 卡片 ${index + 1}: ${title} ---`);
        
        // 检查onclick
        const onclick = card.getAttribute('onclick');
        console.log('onclick属性:', onclick || '❌ 无');
        
        // 检查样式
        const style = window.getComputedStyle(card);
        console.log('pointer-events:', style.pointerEvents);
        console.log('cursor:', style.cursor);
        console.log('z-index:', style.zIndex);
        console.log('position:', style.position);
        
        // 检查事件监听器
        console.log('onclick处理器:', card.onclick ? '✅ 有' : '❌ 无');
        
        // 尝试点击
        console.log('尝试点击...');
        try {
          const beforeDisplay = window.getComputedStyle(moreView).display;
          card.click();
          setTimeout(() => {
            const afterDisplay = window.getComputedStyle(moreView).display;
            if (afterDisplay === 'none') {
              console.log('✅ 点击成功，视图已切换');
            } else {
              console.log('❌ 点击后视图未切换');
            }
          }, 200);
        } catch (e) {
          console.error('❌ 点击失败:', e.message);
        }
      });
    }, 500);
  } else {
    console.error('❌ switchView函数不存在');
  }
})();
```






