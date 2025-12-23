/**
 * API限流中间件
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// 通用API限流：15分钟内最多100次请求
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100,
  message: {
    success: false,
    error: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('API限流触发', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: '请求过于频繁，请稍后再试',
    });
  },
});

// 严格限流：15分钟内最多5次请求（用于登录、注册等敏感操作）
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: '操作过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('严格限流触发', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      error: '操作过于频繁，请稍后再试',
    });
  },
});

// AI接口限流：每分钟最多10次请求
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10,
  message: {
    success: false,
    error: 'AI服务请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  strictLimiter,
  aiLimiter,
};







