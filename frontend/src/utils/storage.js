/**
 * 本地存储工具函数
 */

const STORAGE_PREFIX = 'pigeonai_';

/**
 * 设置存储项
 * @param {string} key - 键
 * @param {*} value - 值
 */
export function setStorage(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('存储失败:', error);
  }
}

/**
 * 获取存储项
 * @param {string} key - 键
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error('读取存储失败:', error);
    return defaultValue;
  }
}

/**
 * 删除存储项
 * @param {string} key - 键
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('删除存储失败:', error);
  }
}

/**
 * 清空所有存储
 */
export function clearStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空存储失败:', error);
  }
}

/**
 * 设置用户信息
 * @param {object} user - 用户信息
 */
export function setUser(user) {
  setStorage('user', user);
  if (user?.token) {
    localStorage.setItem('token', user.token);
  }
}

/**
 * 获取用户信息
 * @returns {object|null}
 */
export function getUser() {
  return getStorage('user', null);
}

/**
 * 清除用户信息
 */
export function clearUser() {
  removeStorage('user');
  localStorage.removeItem('token');
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  const user = getUser();
  return !!(token && user);
}






 * 本地存储工具函数
 */

const STORAGE_PREFIX = 'pigeonai_';

/**
 * 设置存储项
 * @param {string} key - 键
 * @param {*} value - 值
 */
export function setStorage(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('存储失败:', error);
  }
}

/**
 * 获取存储项
 * @param {string} key - 键
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error('读取存储失败:', error);
    return defaultValue;
  }
}

/**
 * 删除存储项
 * @param {string} key - 键
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('删除存储失败:', error);
  }
}

/**
 * 清空所有存储
 */
export function clearStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空存储失败:', error);
  }
}

/**
 * 设置用户信息
 * @param {object} user - 用户信息
 */
export function setUser(user) {
  setStorage('user', user);
  if (user?.token) {
    localStorage.setItem('token', user.token);
  }
}

/**
 * 获取用户信息
 * @returns {object|null}
 */
export function getUser() {
  return getStorage('user', null);
}

/**
 * 清除用户信息
 */
export function clearUser() {
  removeStorage('user');
  localStorage.removeItem('token');
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  const user = getUser();
  return !!(token && user);
}






 * 本地存储工具函数
 */

const STORAGE_PREFIX = 'pigeonai_';

/**
 * 设置存储项
 * @param {string} key - 键
 * @param {*} value - 值
 */
export function setStorage(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('存储失败:', error);
  }
}

/**
 * 获取存储项
 * @param {string} key - 键
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function getStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error('读取存储失败:', error);
    return defaultValue;
  }
}

/**
 * 删除存储项
 * @param {string} key - 键
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('删除存储失败:', error);
  }
}

/**
 * 清空所有存储
 */
export function clearStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空存储失败:', error);
  }
}

/**
 * 设置用户信息
 * @param {object} user - 用户信息
 */
export function setUser(user) {
  setStorage('user', user);
  if (user?.token) {
    localStorage.setItem('token', user.token);
  }
}

/**
 * 获取用户信息
 * @returns {object|null}
 */
export function getUser() {
  return getStorage('user', null);
}

/**
 * 清除用户信息
 */
export function clearUser() {
  removeStorage('user');
  localStorage.removeItem('token');
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token');
  const user = getUser();
  return !!(token && user);
}






