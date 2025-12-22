/**
 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证手机号格式（中国）
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 验证脚环号格式
 * @param {string} ring - 脚环号
 * @returns {boolean}
 */
export function isValidRing(ring) {
  // 脚环号格式：年份+地区代码+编号，例如：2024-01-123456
  const re = /^\d{4}-\d{2}-\d{6}$/;
  return re.test(ring);
}

/**
 * 验证日期格式
 * @param {string} date - 日期字符串
 * @returns {boolean}
 */
export function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * 验证必填字段
 * @param {*} value - 值
 * @returns {boolean}
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * 验证字符串长度
 * @param {string} str - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean}
 */
export function isValidLength(str, min = 0, max = Infinity) {
  const length = str ? str.length : 0;
  return length >= min && length <= max;
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} { valid: boolean, strength: string, message: string }
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      strength: 'weak',
      message: '密码至少需要6个字符',
    };
  }
  
  if (password.length < 8) {
    return {
      valid: true,
      strength: 'medium',
      message: '密码强度：中等',
    };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (score >= 3) {
    return {
      valid: true,
      strength: 'strong',
      message: '密码强度：强',
    };
  }
  
  return {
    valid: true,
    strength: 'medium',
    message: '密码强度：中等',
  };
}

/**
 * 验证表单数据
 * @param {object} data - 表单数据
 * @param {object} rules - 验证规则
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateForm(data, rules) {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // 必填验证
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || `${field}为必填项`;
      return;
    }
    
    // 如果字段为空且不是必填，跳过其他验证
    if (!value && !fieldRules.required) {
      return;
    }
    
    // 类型验证
    if (fieldRules.type) {
      if (fieldRules.type === 'email' && !isValidEmail(value)) {
        errors[field] = '邮箱格式不正确';
        return;
      }
      if (fieldRules.type === 'phone' && !isValidPhone(value)) {
        errors[field] = '手机号格式不正确';
        return;
      }
      if (fieldRules.type === 'date' && !isValidDate(value)) {
        errors[field] = '日期格式不正确';
        return;
      }
    }
    
    // 长度验证
    if (fieldRules.minLength && !isValidLength(value, fieldRules.minLength)) {
      errors[field] = `至少需要${fieldRules.minLength}个字符`;
      return;
    }
    if (fieldRules.maxLength && !isValidLength(value, 0, fieldRules.maxLength)) {
      errors[field] = `最多${fieldRules.maxLength}个字符`;
      return;
    }
    
    // 自定义验证函数
    if (fieldRules.validator && typeof fieldRules.validator === 'function') {
      const result = fieldRules.validator(value, data);
      if (result !== true) {
        errors[field] = result || '验证失败';
        return;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}






 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证手机号格式（中国）
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 验证脚环号格式
 * @param {string} ring - 脚环号
 * @returns {boolean}
 */
export function isValidRing(ring) {
  // 脚环号格式：年份+地区代码+编号，例如：2024-01-123456
  const re = /^\d{4}-\d{2}-\d{6}$/;
  return re.test(ring);
}

/**
 * 验证日期格式
 * @param {string} date - 日期字符串
 * @returns {boolean}
 */
export function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * 验证必填字段
 * @param {*} value - 值
 * @returns {boolean}
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * 验证字符串长度
 * @param {string} str - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean}
 */
export function isValidLength(str, min = 0, max = Infinity) {
  const length = str ? str.length : 0;
  return length >= min && length <= max;
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} { valid: boolean, strength: string, message: string }
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      strength: 'weak',
      message: '密码至少需要6个字符',
    };
  }
  
  if (password.length < 8) {
    return {
      valid: true,
      strength: 'medium',
      message: '密码强度：中等',
    };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (score >= 3) {
    return {
      valid: true,
      strength: 'strong',
      message: '密码强度：强',
    };
  }
  
  return {
    valid: true,
    strength: 'medium',
    message: '密码强度：中等',
  };
}

/**
 * 验证表单数据
 * @param {object} data - 表单数据
 * @param {object} rules - 验证规则
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateForm(data, rules) {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // 必填验证
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || `${field}为必填项`;
      return;
    }
    
    // 如果字段为空且不是必填，跳过其他验证
    if (!value && !fieldRules.required) {
      return;
    }
    
    // 类型验证
    if (fieldRules.type) {
      if (fieldRules.type === 'email' && !isValidEmail(value)) {
        errors[field] = '邮箱格式不正确';
        return;
      }
      if (fieldRules.type === 'phone' && !isValidPhone(value)) {
        errors[field] = '手机号格式不正确';
        return;
      }
      if (fieldRules.type === 'date' && !isValidDate(value)) {
        errors[field] = '日期格式不正确';
        return;
      }
    }
    
    // 长度验证
    if (fieldRules.minLength && !isValidLength(value, fieldRules.minLength)) {
      errors[field] = `至少需要${fieldRules.minLength}个字符`;
      return;
    }
    if (fieldRules.maxLength && !isValidLength(value, 0, fieldRules.maxLength)) {
      errors[field] = `最多${fieldRules.maxLength}个字符`;
      return;
    }
    
    // 自定义验证函数
    if (fieldRules.validator && typeof fieldRules.validator === 'function') {
      const result = fieldRules.validator(value, data);
      if (result !== true) {
        errors[field] = result || '验证失败';
        return;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}






 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证手机号格式（中国）
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 验证脚环号格式
 * @param {string} ring - 脚环号
 * @returns {boolean}
 */
export function isValidRing(ring) {
  // 脚环号格式：年份+地区代码+编号，例如：2024-01-123456
  const re = /^\d{4}-\d{2}-\d{6}$/;
  return re.test(ring);
}

/**
 * 验证日期格式
 * @param {string} date - 日期字符串
 * @returns {boolean}
 */
export function isValidDate(date) {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * 验证必填字段
 * @param {*} value - 值
 * @returns {boolean}
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * 验证字符串长度
 * @param {string} str - 字符串
 * @param {number} min - 最小长度
 * @param {number} max - 最大长度
 * @returns {boolean}
 */
export function isValidLength(str, min = 0, max = Infinity) {
  const length = str ? str.length : 0;
  return length >= min && length <= max;
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} { valid: boolean, strength: string, message: string }
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      strength: 'weak',
      message: '密码至少需要6个字符',
    };
  }
  
  if (password.length < 8) {
    return {
      valid: true,
      strength: 'medium',
      message: '密码强度：中等',
    };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (score >= 3) {
    return {
      valid: true,
      strength: 'strong',
      message: '密码强度：强',
    };
  }
  
  return {
    valid: true,
    strength: 'medium',
    message: '密码强度：中等',
  };
}

/**
 * 验证表单数据
 * @param {object} data - 表单数据
 * @param {object} rules - 验证规则
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateForm(data, rules) {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];
    
    // 必填验证
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || `${field}为必填项`;
      return;
    }
    
    // 如果字段为空且不是必填，跳过其他验证
    if (!value && !fieldRules.required) {
      return;
    }
    
    // 类型验证
    if (fieldRules.type) {
      if (fieldRules.type === 'email' && !isValidEmail(value)) {
        errors[field] = '邮箱格式不正确';
        return;
      }
      if (fieldRules.type === 'phone' && !isValidPhone(value)) {
        errors[field] = '手机号格式不正确';
        return;
      }
      if (fieldRules.type === 'date' && !isValidDate(value)) {
        errors[field] = '日期格式不正确';
        return;
      }
    }
    
    // 长度验证
    if (fieldRules.minLength && !isValidLength(value, fieldRules.minLength)) {
      errors[field] = `至少需要${fieldRules.minLength}个字符`;
      return;
    }
    if (fieldRules.maxLength && !isValidLength(value, 0, fieldRules.maxLength)) {
      errors[field] = `最多${fieldRules.maxLength}个字符`;
      return;
    }
    
    // 自定义验证函数
    if (fieldRules.validator && typeof fieldRules.validator === 'function') {
      const result = fieldRules.validator(value, data);
      if (result !== true) {
        errors[field] = result || '验证失败';
        return;
      }
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}






