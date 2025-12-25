/**
 * 用户注册、登录和后台管理功能测试脚本
 * 用于检测：
 * 1. 用户注册功能（PC端、移动端、后台）
 * 2. 用户登录功能（PC端、移动端、后台）
 * 3. 后台用户管理功能
 * 4. 后台用户信息保存功能
 * 5. 后台用户密码修改功能
 */

// 测试配置
const TEST_CONFIG = {
  backendUrl: window.location.origin + '/api',
  testUser: {
    username: 'test_user_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'test123456'
  },
  adminUser: {
    username: 'admin',
    password: 'admin123'
  }
};

// 测试结果
const testResults = {
  register: { success: false, error: null, data: null },
  login: { success: false, error: null, data: null },
  adminLogin: { success: false, error: null, data: null },
  userList: { success: false, error: null, data: null },
  userInfo: { success: false, error: null, data: null },
  changePassword: { success: false, error: null, data: null },
  adminResetPassword: { success: false, error: null, data: null }
};

/**
 * 测试1: 用户注册
 */
async function testRegister() {
  console.log('🧪 开始测试用户注册...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CONFIG.testUser)
    });
    
    const result = await response.json();
    
    if (result.success) {
      testResults.register = {
        success: true,
        error: null,
        data: {
          userId: result.data.id,
          username: result.data.username,
          email: result.data.email
        }
      };
      console.log('✅ 用户注册测试成功:', testResults.register.data);
      return true;
    } else {
      throw new Error(result.error || '注册失败');
    }
  } catch (error) {
    testResults.register = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 用户注册测试失败:', error);
    return false;
  }
}

/**
 * 测试2: 用户登录
 */
async function testLogin() {
  console.log('🧪 开始测试用户登录...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: TEST_CONFIG.testUser.username,
        password: TEST_CONFIG.testUser.password
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.token) {
      // 保存token
      localStorage.setItem('testAuthToken', result.data.token);
      
      testResults.login = {
        success: true,
        error: null,
        data: {
          token: result.data.token.substring(0, 20) + '...',
          user: result.data.user
        }
      };
      console.log('✅ 用户登录测试成功:', testResults.login.data);
      return true;
    } else {
      throw new Error(result.error || '登录失败');
    }
  } catch (error) {
    testResults.login = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 用户登录测试失败:', error);
    return false;
  }
}

/**
 * 测试3: 管理员登录
 */
async function testAdminLogin() {
  console.log('🧪 开始测试管理员登录...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CONFIG.adminUser)
    });
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.token) {
      // 保存管理员token
      localStorage.setItem('testAdminToken', result.data.token);
      
      testResults.adminLogin = {
        success: true,
        error: null,
        data: {
          token: result.data.token.substring(0, 20) + '...',
          user: result.data.user,
          isAdmin: result.data.user.role === 'admin'
        }
      };
      console.log('✅ 管理员登录测试成功:', testResults.adminLogin.data);
      return true;
    } else {
      throw new Error(result.error || '管理员登录失败');
    }
  } catch (error) {
    testResults.adminLogin = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 管理员登录测试失败:', error);
    return false;
  }
}

/**
 * 测试4: 获取用户列表（管理员）
 */
async function testUserList() {
  console.log('🧪 开始测试获取用户列表...');
  
  try {
    const token = localStorage.getItem('testAdminToken');
    if (!token) {
      throw new Error('需要管理员登录');
    }
    
    const response = await fetch(`${TEST_CONFIG.backendUrl}/admin/users?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data && Array.isArray(result.data.users)) {
      testResults.userList = {
        success: true,
        error: null,
        data: {
          userCount: result.data.users.length,
          total: result.data.pagination?.total || 0,
          users: result.data.users.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role,
            status: u.status
          }))
        }
      };
      console.log('✅ 获取用户列表测试成功:', testResults.userList.data);
      return true;
    } else {
      throw new Error(result.error || '获取用户列表失败');
    }
  } catch (error) {
    testResults.userList = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 获取用户列表测试失败:', error);
    return false;
  }
}

/**
 * 测试5: 获取用户信息
 */
async function testUserInfo() {
  console.log('🧪 开始测试获取用户信息...');
  
  try {
    const token = localStorage.getItem('testAuthToken');
    if (!token) {
      throw new Error('需要用户登录');
    }
    
    const response = await fetch(`${TEST_CONFIG.backendUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      testResults.userInfo = {
        success: true,
        error: null,
        data: {
          id: result.data.id,
          username: result.data.username,
          email: result.data.email,
          role: result.data.role,
          status: result.data.status
        }
      };
      console.log('✅ 获取用户信息测试成功:', testResults.userInfo.data);
      return true;
    } else {
      throw new Error(result.error || '获取用户信息失败');
    }
  } catch (error) {
    testResults.userInfo = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 获取用户信息测试失败:', error);
    return false;
  }
}

/**
 * 测试6: 用户修改密码
 */
async function testChangePassword() {
  console.log('🧪 开始测试用户修改密码...');
  
  try {
    const token = localStorage.getItem('testAuthToken');
    if (!token) {
      throw new Error('需要用户登录');
    }
    
    const newPassword = 'newpassword123';
    const response = await fetch(`${TEST_CONFIG.backendUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: TEST_CONFIG.testUser.password,
        newPassword: newPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 更新测试密码
      TEST_CONFIG.testUser.password = newPassword;
      
      testResults.changePassword = {
        success: true,
        error: null,
        data: {
          message: result.message
        }
      };
      console.log('✅ 用户修改密码测试成功:', testResults.changePassword.data);
      return true;
    } else {
      throw new Error(result.error || '修改密码失败');
    }
  } catch (error) {
    testResults.changePassword = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 用户修改密码测试失败:', error);
    return false;
  }
}

/**
 * 测试7: 管理员重置用户密码
 */
async function testAdminResetPassword() {
  console.log('🧪 开始测试管理员重置用户密码...');
  
  try {
    const adminToken = localStorage.getItem('testAdminToken');
    if (!adminToken) {
      throw new Error('需要管理员登录');
    }
    
    // 获取测试用户的ID
    const userId = testResults.register.data?.userId;
    if (!userId) {
      throw new Error('需要先完成注册测试');
    }
    
    const newPassword = 'adminreset123';
    const response = await fetch(`${TEST_CONFIG.backendUrl}/admin/users/${userId}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        newPassword: newPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      testResults.adminResetPassword = {
        success: true,
        error: null,
        data: {
          userId: userId,
          message: result.message
        }
      };
      console.log('✅ 管理员重置用户密码测试成功:', testResults.adminResetPassword.data);
      return true;
    } else {
      throw new Error(result.error || '管理员重置密码失败');
    }
  } catch (error) {
    testResults.adminResetPassword = {
      success: false,
      error: error.message,
      data: null
    };
    console.error('❌ 管理员重置用户密码测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行用户注册登录和管理功能测试...\n');
  
  // 按顺序执行测试
  const results = {
    register: await testRegister(),
    login: await testLogin(),
    adminLogin: await testAdminLogin(),
    userList: await testUserList(),
    userInfo: await testUserInfo(),
    changePassword: await testChangePassword(),
    adminResetPassword: await testAdminResetPassword()
  };
  
  // 生成测试报告
  console.log('\n📊 测试报告:');
  console.log('='.repeat(50));
  console.log('1. 用户注册:', results.register ? '✅ 通过' : '❌ 失败');
  if (!results.register) {
    console.log('   错误:', testResults.register.error);
  }
  
  console.log('\n2. 用户登录:', results.login ? '✅ 通过' : '❌ 失败');
  if (!results.login) {
    console.log('   错误:', testResults.login.error);
  }
  
  console.log('\n3. 管理员登录:', results.adminLogin ? '✅ 通过' : '❌ 失败');
  if (!results.adminLogin) {
    console.log('   错误:', testResults.adminLogin.error);
  }
  
  console.log('\n4. 获取用户列表:', results.userList ? '✅ 通过' : '❌ 失败');
  if (!results.userList) {
    console.log('   错误:', testResults.userList.error);
  } else {
    console.log('   用户数量:', testResults.userList.data.userCount);
  }
  
  console.log('\n5. 获取用户信息:', results.userInfo ? '✅ 通过' : '❌ 失败');
  if (!results.userInfo) {
    console.log('   错误:', testResults.userInfo.error);
  }
  
  console.log('\n6. 用户修改密码:', results.changePassword ? '✅ 通过' : '❌ 失败');
  if (!results.changePassword) {
    console.log('   错误:', testResults.changePassword.error);
  }
  
  console.log('\n7. 管理员重置密码:', results.adminResetPassword ? '✅ 通过' : '❌ 失败');
  if (!results.adminResetPassword) {
    console.log('   错误:', testResults.adminResetPassword.error);
  }
  
  console.log('='.repeat(50));
  
  // 返回测试结果
  return {
    allPassed: Object.values(results).every(r => r),
    results: testResults
  };
}

// 如果在浏览器中运行，自动执行测试
if (typeof window !== 'undefined') {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAllTests, 1000);
    });
  } else {
    setTimeout(runAllTests, 1000);
  }
  
  // 暴露到全局
  window.testUserAuth = {
    runAllTests,
    testRegister,
    testLogin,
    testAdminLogin,
    testUserList,
    testUserInfo,
    testChangePassword,
    testAdminResetPassword,
    getResults: () => testResults
  };
  
  console.log('✅ 用户注册登录和管理功能测试脚本已加载');
  console.log('💡 使用方法:');
  console.log('   - 自动测试: 页面加载后自动运行');
  console.log('   - 手动测试: window.testUserAuth.runAllTests()');
  console.log('   - 查看结果: window.testUserAuth.getResults()');
}

// 如果在Node.js中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testRegister,
    testLogin,
    testAdminLogin,
    testUserList,
    testUserInfo,
    testChangePassword,
    testAdminResetPassword,
    getResults: () => testResults
  };
}


