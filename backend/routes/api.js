const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const trainingService = require('../services/trainingService');
const qualificationService = require('../services/qualificationService');
const authService = require('../services/authService');
const adminService = require('../services/adminService');
const storageService = require('../services/storageService');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');
const config = require('../config/config');

// 认证中间件
async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供认证token'
      });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'token无效或已过期'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('认证失败', error);
    res.status(401).json({
      success: false,
      error: '认证失败'
    });
  }
}

// 管理员权限中间件
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: '需要管理员权限'
    });
  }
}

/**
 * 获取资讯列表
 * GET /api/news
 * Query params:
 *   - region: local|national (可选)
 *   - category: race|breeding|health (可选)
 *   - limit: 数量限制 (可选)
 */
router.get('/news', async (req, res) => {
  try {
    const { region, category, limit } = req.query;
    
    let news = await dataService.fetchNews();
    
    // 确保news是数组
    if (!Array.isArray(news)) {
      news = [];
    }
    
    // 过滤
    if (region) {
      news = news.filter(item => item.region === region);
    }
    
    if (category) {
      news = news.filter(item => item.category === category);
    }
    
    // 限制数量
    if (limit) {
      news = news.slice(0, parseInt(limit, 10));
    }
    
    // 始终返回成功响应，即使数据为空
    res.json({
      success: true,
      data: news,
      count: news.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('获取资讯失败', error);
    // 即使出错也返回空数组，而不是错误响应
    res.json({
      success: true,
      data: [],
      count: 0,
      timestamp: new Date().toISOString(),
      warning: '数据获取失败，返回空数据'
    });
  }
});

/**
 * 获取赛事列表
 * GET /api/events
 * Query params:
 *   - type: ongoing|upcoming|results (可选)
 *   - region: local|national (可选)
 */
router.get('/events', async (req, res) => {
  try {
    const { type, region } = req.query;
    
    let events = await dataService.fetchEvents();
    
    // 确保events是对象且包含必要的字段
    if (!events || typeof events !== 'object') {
      events = { ongoing: [], upcoming: [], results: [] };
    }
    if (!Array.isArray(events.ongoing)) events.ongoing = [];
    if (!Array.isArray(events.upcoming)) events.upcoming = [];
    if (!Array.isArray(events.results)) events.results = [];
    
    let result = events;
    
    // 按类型过滤
    if (type && ['ongoing', 'upcoming', 'results'].includes(type)) {
      result = { [type]: events[type] || [] };
    }
    
    // 按地区过滤
    if (region) {
      Object.keys(result).forEach(key => {
        if (Array.isArray(result[key])) {
          result[key] = result[key].filter(event => event.region === region);
        }
      });
    }
    
    // 始终返回成功响应，即使数据为空
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('获取赛事失败', error);
    // 即使出错也返回空数据结构，而不是错误响应
    res.json({
      success: true,
      data: { ongoing: [], upcoming: [], results: [] },
      timestamp: new Date().toISOString(),
      warning: '数据获取失败，返回空数据'
    });
  }
});

/**
 * 刷新资讯数据
 * POST /api/news/refresh
 */
router.post('/news/refresh', async (req, res) => {
  try {
    const news = await dataService.refreshNews();
    res.json({
      success: true,
      message: '资讯数据已刷新',
      count: news.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('刷新资讯失败', error);
    res.status(500).json({
      success: false,
      error: '刷新资讯失败',
      message: error.message
    });
  }
});

/**
 * 刷新赛事数据
 * POST /api/events/refresh
 */
router.post('/events/refresh', async (req, res) => {
  try {
    const events = await dataService.refreshEvents();
    res.json({
      success: true,
      message: '赛事数据已刷新',
      data: {
        ongoing: events.ongoing.length,
        upcoming: events.upcoming.length,
        results: events.results.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('刷新赛事失败', error);
    res.status(500).json({
      success: false,
      error: '刷新赛事失败',
      message: error.message
    });
  }
});

/**
 * 健康检查
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * 获取统计信息
 * GET /api/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const news = await dataService.fetchNews();
    const events = await dataService.fetchEvents();
    const cacheStats = require('../services/cacheService').getStats();
    
    res.json({
      success: true,
      data: {
        news: {
          total: news.length,
          byRegion: {
            local: news.filter(n => n.region === 'local').length,
            national: news.filter(n => n.region === 'national').length
          },
          byCategory: {
            race: news.filter(n => n.category === 'race').length,
            breeding: news.filter(n => n.category === 'breeding').length,
            health: news.filter(n => n.category === 'health').length
          }
        },
        events: {
          ongoing: events.ongoing.length,
          upcoming: events.upcoming.length,
          results: events.results.length
        },
        cache: cacheStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('获取统计信息失败', error);
    res.status(500).json({
      success: false,
      error: '获取统计信息失败',
      message: error.message
    });
  }
});

// ==========================================
// 用户认证相关API
// ==========================================

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱和密码为必填项'
      });
    }

    const user = await authService.createUser({ username, email, password });
    res.json({
      success: true,
      data: user,
      message: '注册成功'
    });
  } catch (error) {
    logger.error('注册失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '注册失败'
    });
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名和密码为必填项'
      });
    }

    const result = await authService.login(username, password);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('登录失败', error);
    res.status(401).json({
      success: false,
      error: error.message || '登录失败'
    });
  }
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/auth/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

/**
 * 修改密码
 * POST /api/auth/change-password
 */
router.post('/auth/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '原密码和新密码为必填项'
      });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    logger.error('修改密码失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '修改密码失败'
    });
  }
});

/**
 * 请求密码重置
 * POST /api/auth/forgot-password
 */
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: '邮箱为必填项'
      });
    }

    const result = await authService.generatePasswordResetToken(email);
    res.json({
      success: true,
      message: result.message,
      // 实际应用中不应该返回token，应该通过邮件发送
      resetToken: result.token
    });
  } catch (error) {
    logger.error('请求密码重置失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '请求密码重置失败'
    });
  }
});

/**
 * 重置密码
 * POST /api/auth/reset-password
 */
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '重置token和新密码为必填项'
      });
    }

    await authService.resetPassword(token, newPassword);
    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    logger.error('重置密码失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '重置密码失败'
    });
  }
});

/**
 * 登出
 * POST /api/auth/logout
 */
router.post('/auth/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await authService.logout(token);
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    logger.error('登出失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '登出失败'
    });
  }
});

// ==========================================
// 训练相关API
// ==========================================

/**
 * 创建训练记录
 * POST /api/training
 */
router.post('/training', authenticate, async (req, res) => {
  try {
    const training = await trainingService.createTraining(
      req.user.id,
      req.body.pigeonId,
      req.body
    );
    
    // 记录使用统计
    await adminService.recordUsage(req.user.id, 'training');
    
    res.json({
      success: true,
      data: training,
      message: '训练记录创建成功'
    });
  } catch (error) {
    logger.error('创建训练记录失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '创建训练记录失败'
    });
  }
});

/**
 * 获取鸽子的训练记录
 * GET /api/training/pigeon/:pigeonId
 */
router.get('/training/pigeon/:pigeonId', authenticate, async (req, res) => {
  try {
    const { pigeonId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const records = await trainingService.getTrainingRecords(pigeonId, limit);
    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    logger.error('获取训练记录失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取训练记录失败'
    });
  }
});

/**
 * 更新训练记录
 * PUT /api/training/:id
 */
router.put('/training/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await trainingService.updateTraining(id, req.body);
    res.json({
      success: true,
      data: updated,
      message: '训练记录更新成功'
    });
  } catch (error) {
    logger.error('更新训练记录失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '更新训练记录失败'
    });
  }
});

/**
 * 删除训练记录
 * DELETE /api/training/:id
 */
router.delete('/training/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await trainingService.deleteTraining(id);
    res.json({
      success: true,
      message: '训练记录删除成功'
    });
  } catch (error) {
    logger.error('删除训练记录失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '删除训练记录失败'
    });
  }
});

/**
 * 获取训练统计和分析
 * GET /api/training/pigeon/:pigeonId/stats
 */
router.get('/training/pigeon/:pigeonId/stats', authenticate, async (req, res) => {
  try {
    const { pigeonId } = req.params;
    
    const stats = await trainingService.updateTrainingStats(pigeonId);
    const analysis = await trainingService.analyzeTrainingData(pigeonId);
    
    res.json({
      success: true,
      data: {
        stats,
        analysis: analysis.analysis
      }
    });
  } catch (error) {
    logger.error('获取训练统计失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取训练统计失败'
    });
  }
});

// ==========================================
// 能力综合分析API
// ==========================================

/**
 * 分析参赛资格
 * POST /api/qualification/analyze
 */
router.post('/qualification/analyze', authenticate, async (req, res) => {
  try {
    const { pigeonId, raceDistance } = req.body;
    
    if (!pigeonId || !raceDistance) {
      return res.status(400).json({
        success: false,
        error: '鸽子ID和比赛距离为必填项'
      });
    }

    const result = await qualificationService.analyzeQualification(pigeonId, raceDistance);
    
    // 记录使用统计
    await adminService.recordUsage(req.user.id, 'qualification_analysis');
    
    res.json(result);
  } catch (error) {
    logger.error('分析参赛资格失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '分析参赛资格失败'
    });
  }
});

// ==========================================
// 鸽子数据API
// ==========================================

/**
 * 根据脚环号获取鸽子
 * GET /api/pigeons/ring/:ring
 */
router.get('/pigeons/ring/:ring', authenticate, async (req, res) => {
  try {
    const { ring } = req.params;
    const pigeons = await storageService.read('pigeons');
    const pigeon = pigeons.find(p => 
      p.ring && p.ring.toLowerCase() === ring.toLowerCase() && p.alive
    );
    
    if (!pigeon) {
      return res.status(404).json({
        success: false,
        error: '未找到该脚环号的鸽子'
      });
    }

    res.json({
      success: true,
      data: pigeon
    });
  } catch (error) {
    logger.error('获取鸽子信息失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取鸽子信息失败'
    });
  }
});

/**
 * 获取用户的所有鸽子
 * GET /api/pigeons
 */
router.get('/pigeons', authenticate, async (req, res) => {
  try {
    const pigeons = await storageService.filter('pigeons', 
      p => p.userId === req.user.id
    );
    
    res.json({
      success: true,
      data: pigeons,
      count: pigeons.length
    });
  } catch (error) {
    logger.error('获取鸽子列表失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取鸽子列表失败'
    });
  }
});

// ==========================================
// 后台管理API（需要管理员权限）
// ==========================================

/**
 * 获取用户列表
 * GET /api/admin/users
 */
router.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status,
      role: req.query.role,
      search: req.query.search
    };

    const result = await adminService.getUserList(page, limit, filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('获取用户列表失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取用户列表失败'
    });
  }
});

/**
 * 更新用户状态
 * PUT /api/admin/users/:id/status
 */
router.put('/admin/users/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updated = await adminService.updateUserStatus(id, status);
    res.json({
      success: true,
      data: updated,
      message: '用户状态更新成功'
    });
  } catch (error) {
    logger.error('更新用户状态失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '更新用户状态失败'
    });
  }
});

/**
 * 更新用户权限
 * PUT /api/admin/users/:id/role
 */
router.put('/admin/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const updated = await adminService.updateUserRole(id, role);
    res.json({
      success: true,
      data: updated,
      message: '用户权限更新成功'
    });
  } catch (error) {
    logger.error('更新用户权限失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '更新用户权限失败'
    });
  }
});

/**
 * 获取鸽子数据统计
 * GET /api/admin/pigeons/stats
 */
router.get('/admin/pigeons/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await adminService.getPigeonStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取鸽子统计失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取鸽子统计失败'
    });
  }
});

/**
 * 获取训练记录列表
 * GET /api/admin/training
 */
router.get('/admin/training', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      pigeonId: req.query.pigeonId,
      userId: req.query.userId,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await adminService.getTrainingRecords(page, limit, filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('获取训练记录失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取训练记录失败'
    });
  }
});

/**
 * 获取比赛记录列表
 * GET /api/admin/races
 */
router.get('/admin/races', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      pigeonId: req.query.pigeonId,
      status: req.query.status
    };

    const result = await adminService.getRaceRecords(page, limit, filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('获取比赛记录失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取比赛记录失败'
    });
  }
});

/**
 * 获取使用量统计
 * GET /api/admin/usage-stats
 */
router.get('/admin/usage-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || '7d';
    const stats = await adminService.getUsageStats(period);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取使用量统计失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取使用量统计失败'
    });
  }
});

/**
 * 获取活跃用户统计
 * GET /api/admin/active-users
 */
router.get('/admin/active-users', authenticate, requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || '7d';
    const stats = await adminService.getActiveUsers(period);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取活跃用户统计失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取活跃用户统计失败'
    });
  }
});

/**
 * 获取功能使用频率
 * GET /api/admin/feature-usage
 */
router.get('/admin/feature-usage', authenticate, requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || '7d';
    const stats = await adminService.getFeatureUsageFrequency(period);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取功能使用频率失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取功能使用频率失败'
    });
  }
});

/**
 * 获取资讯来源列表
 * GET /api/admin/news-sources
 */
router.get('/admin/news-sources', authenticate, requireAdmin, async (req, res) => {
  try {
    const sources = await adminService.getNewsSources();
    res.json({
      success: true,
      data: sources
    });
  } catch (error) {
    logger.error('获取资讯来源失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取资讯来源失败'
    });
  }
});

/**
 * 更新资讯来源状态
 * PUT /api/admin/news-sources/:id/status
 */
router.put('/admin/news-sources/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updated = await adminService.updateNewsSourceStatus(id, status);
    res.json({
      success: true,
      data: updated,
      message: '资讯来源状态更新成功'
    });
  } catch (error) {
    logger.error('更新资讯来源状态失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '更新资讯来源状态失败'
    });
  }
});

/**
 * 获取登录日志
 * GET /api/admin/login-logs
 */
router.get('/admin/login-logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {
      username: req.query.username,
      success: req.query.success === 'true' ? true : req.query.success === 'false' ? false : undefined,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const result = await adminService.getLoginLogs(page, limit, filters);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('获取登录日志失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取登录日志失败'
    });
  }
});

/**
 * 获取需要修改密码的用户
 * GET /api/admin/password-change-needed
 */
router.get('/admin/password-change-needed', authenticate, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const users = await adminService.getUsersNeedPasswordChange(days);
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    logger.error('获取需要修改密码的用户失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取需要修改密码的用户失败'
    });
  }
});

/**
 * 获取token列表
 * GET /api/admin/tokens
 */
router.get('/admin/tokens', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await adminService.getTokenList(page, limit);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('获取token列表失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取token列表失败'
    });
  }
});

/**
 * 撤销token
 * DELETE /api/admin/tokens/:id
 */
router.delete('/admin/tokens/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.revokeToken(id);
    res.json({
      success: true,
      message: 'token已撤销'
    });
  } catch (error) {
    logger.error('撤销token失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '撤销token失败'
    });
  }
});

/**
 * 获取公告列表（公开接口，无需认证）
 * GET /api/announcements
 */
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await storageService.read('announcements') || [];
    // 只返回已发布且未过期的公告
    const now = new Date();
    const activeAnnouncements = announcements
      .filter(a => a.active && (!a.expiresAt || new Date(a.expiresAt) > now))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: activeAnnouncements
    });
  } catch (error) {
    logger.error('获取公告列表失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取公告列表失败'
    });
  }
});

/**
 * 获取最新公告（公开接口，无需认证）
 * GET /api/announcements/latest
 */
router.get('/announcements/latest', async (req, res) => {
  try {
    const announcements = await storageService.read('announcements') || [];
    const now = new Date();
    const activeAnnouncements = announcements
      .filter(a => a.active && (!a.expiresAt || new Date(a.expiresAt) > now))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const latest = activeAnnouncements.length > 0 ? activeAnnouncements[0] : null;
    res.json({
      success: true,
      data: latest
    });
  } catch (error) {
    logger.error('获取最新公告失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取最新公告失败'
    });
  }
});

/**
 * 获取所有公告（管理员）
 * GET /api/admin/announcements
 */
router.get('/admin/announcements', authenticate, requireAdmin, async (req, res) => {
  try {
    const announcements = await storageService.read('announcements') || [];
    // 按创建时间倒序排列
    const sorted = announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: sorted
    });
  } catch (error) {
    logger.error('获取公告列表失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '获取公告列表失败'
    });
  }
});

/**
 * 创建公告（管理员）
 * POST /api/admin/announcements
 */
router.post('/admin/announcements', authenticate, requireAdmin, async (req, res) => {
  try {
    const { content, active } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: '公告内容不能为空'
      });
    }
    
    const announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      active: active !== false, // 默认为true
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.id,
      expiresAt: null // 可以后续添加过期时间功能
    };
    
    const announcements = await storageService.read('announcements') || [];
    announcements.push(announcement);
    await storageService.write('announcements', announcements);
    
    res.json({
      success: true,
      data: announcement,
      message: '公告创建成功'
    });
  } catch (error) {
    logger.error('创建公告失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '创建公告失败'
    });
  }
});

/**
 * 更新公告（管理员）
 * PUT /api/admin/announcements/:id
 */
router.put('/admin/announcements/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, active } = req.body;
    
    const announcements = await storageService.read('announcements') || [];
    const index = announcements.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: '公告不存在'
      });
    }
    
    if (content !== undefined) {
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          error: '公告内容不能为空'
        });
      }
      announcements[index].content = content.trim();
    }
    
    if (active !== undefined) {
      announcements[index].active = active;
    }
    
    announcements[index].updatedAt = new Date().toISOString();
    
    await storageService.write('announcements', announcements);
    
    res.json({
      success: true,
      data: announcements[index],
      message: '公告更新成功'
    });
  } catch (error) {
    logger.error('更新公告失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '更新公告失败'
    });
  }
});

/**
 * 删除公告（管理员）
 * DELETE /api/admin/announcements/:id
 */
router.delete('/admin/announcements/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcements = await storageService.read('announcements') || [];
    const filtered = announcements.filter(a => a.id !== id);
    
    if (filtered.length === announcements.length) {
      return res.status(404).json({
        success: false,
        error: '公告不存在'
      });
    }
    
    await storageService.write('announcements', filtered);
    
    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    logger.error('删除公告失败', error);
    res.status(400).json({
      success: false,
      error: error.message || '删除公告失败'
    });
  }
});

// ==========================================
// Evo 智能助手 AI 聊天 API
// ==========================================

/**
 * Evo 智能助手聊天接口
 * POST /api/evo/chat
 * Body: { question: string, history: array, context: object }
 */
router.post('/evo/chat', authenticate, async (req, res) => {
  try {
    const { question, history = [], context = {} } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: '问题不能为空'
      });
    }

    // 获取用户数据作为上下文
    const pigeons = await storageService.filter('pigeons', 
      p => p.userId === req.user.id
    ) || [];
    
    const enhancedContext = {
      ...context,
      totalPigeons: pigeons.length,
      alivePigeons: pigeons.filter(p => p.alive).length,
      breeders: pigeons.filter(p => p.type === '种鸽' && p.alive).length,
      userId: req.user.id,
      username: req.user.username
    };

    // 调用 AI 服务
    const result = await aiService.chat(question, history, enhancedContext);
    
    // 记录使用统计
    await adminService.recordUsage(req.user.id, 'evo_chat');
    
    res.json({
      success: true,
      data: {
        text: result.text,
        response: result.text,
        model: result.model,
        provider: result.provider,
        error: result.error || null
      },
      modelInfo: aiService.getModelInfo()
    });
  } catch (error) {
    logger.error('Evo 聊天失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '聊天服务暂时不可用',
      message: '请稍后重试'
    });
  }
});

/**
 * 获取 AI 模型信息
 * GET /api/evo/model-info
 */
router.get('/evo/model-info', authenticate, async (req, res) => {
  try {
    const modelInfo = aiService.getModelInfo();
    res.json({
      success: true,
      data: modelInfo
    });
  } catch (error) {
    logger.error('获取模型信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取模型信息失败'
    });
  }
});

/**
 * 测试 AI 连接
 * GET /api/evo/test
 */
router.get('/evo/test', authenticate, async (req, res) => {
  try {
    const result = await aiService.testConnection();
    res.json({
      success: result.success,
      message: result.message,
      data: {
        model: result.model,
        provider: result.provider
      }
    });
  } catch (error) {
    logger.error('测试 AI 连接失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '测试连接失败'
    });
  }
});

// ==========================================
// Evo 智能助手设置管理 API（管理员权限）
// ==========================================

/**
 * 获取 Evo 设置（管理员）
 * GET /api/admin/evo-settings
 */
router.get('/admin/evo-settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const settings = await storageService.read('evo_settings') || null;
    
    // 如果没有设置，返回默认设置
    if (!settings) {
      const defaultSettings = {
        enabled: true,
        position: 'bottom-right',
        displayMode: 'always',
        autoClose: 5,
        iconSize: 70,
        theme: 'purple',
        showWelcome: true,
        saveHistory: true,
        showAnalytics: true,
        showRecommendations: true,
        github: {
          repo: '',
          token: '',
          apiEndpoint: ''
        },
        updatedAt: new Date().toISOString(),
        updatedBy: null
      };
      
      res.json({
        success: true,
        data: defaultSettings
      });
      return;
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('获取 Evo 设置失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取设置失败'
    });
  }
});

/**
 * 保存 Evo 设置（管理员）
 * POST /api/admin/evo-settings
 * Body: { settings object }
 */
router.post('/admin/evo-settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: '设置数据格式错误'
      });
    }
    
    // 验证必需字段
    const validatedSettings = {
      enabled: settings.enabled !== false,
      position: settings.position || 'bottom-right',
      displayMode: settings.displayMode || 'always',
      autoClose: parseInt(settings.autoClose) || 5,
      iconSize: parseInt(settings.iconSize) || 70,
      theme: settings.theme || 'purple',
      showWelcome: settings.showWelcome !== false,
      saveHistory: settings.saveHistory !== false,
      showAnalytics: settings.showAnalytics !== false,
      showRecommendations: settings.showRecommendations !== false,
      github: {
        repo: settings.github?.repo || '',
        token: settings.github?.token || '',
        apiEndpoint: settings.github?.apiEndpoint || ''
      },
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };
    
    // 保存到存储
    await storageService.write('evo_settings', validatedSettings);
    
    logger.info('Evo 设置已更新', {
      updatedBy: req.user.id,
      updatedAt: validatedSettings.updatedAt
    });
    
    res.json({
      success: true,
      data: validatedSettings,
      message: 'Evo 设置已保存，主站将自动更新'
    });
  } catch (error) {
    logger.error('保存 Evo 设置失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存设置失败'
    });
  }
});

/**
 * 获取 Evo 设置（公开接口，用于主站同步）
 * GET /api/evo-settings
 */
router.get('/evo-settings', async (req, res) => {
  try {
    const settings = await storageService.read('evo_settings') || null;
    
    if (!settings) {
      // 返回默认设置
      const defaultSettings = {
        enabled: true,
        position: 'bottom-right',
        displayMode: 'always',
        autoClose: 5,
        iconSize: 70,
        theme: 'purple',
        showWelcome: true,
        saveHistory: true,
        showAnalytics: true,
        showRecommendations: true,
        github: {
          repo: '',
          token: '',
          apiEndpoint: ''
        }
      };
      
      res.json({
        success: true,
        data: defaultSettings
      });
      return;
    }
    
    // 移除敏感信息（token）
    const publicSettings = {
      ...settings,
      github: {
        ...settings.github,
        token: '' // 不返回token给主站
      }
    };
    
    res.json({
      success: true,
      data: publicSettings,
      timestamp: settings.updatedAt
    });
  } catch (error) {
    logger.error('获取 Evo 设置失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取设置失败'
    });
  }
});

// ==========================================
// 用户数据同步相关API
// ==========================================

/**
 * 保存用户鸽子数据
 * POST /api/user/data/pigeons
 */
router.post('/user/data/pigeons', authenticate, async (req, res) => {
  try {
    const { pigeons } = req.body;
    
    if (!Array.isArray(pigeons)) {
      return res.status(400).json({
        success: false,
        error: '数据格式错误，需要数组格式'
      });
    }

    // 读取现有用户数据
    const userDataKey = `user_data_${req.user.id}`;
    let userData = {};
    
    try {
      const existingData = await storageService.read('user_data') || [];
      const existing = existingData.find(d => d.userId === req.user.id);
      if (existing) {
        userData = existing.data || {};
      }
    } catch (error) {
      // 如果读取失败，创建新数据
    }

    // 更新鸽子数据
    userData.pigeons = pigeons;
    userData.updatedAt = new Date().toISOString();

    // 保存用户数据
    let userDataList = await storageService.read('user_data') || [];
    const existingIndex = userDataList.findIndex(d => d.userId === req.user.id);
    
    if (existingIndex >= 0) {
      userDataList[existingIndex] = {
        userId: req.user.id,
        username: req.user.username,
        data: userData,
        updatedAt: new Date().toISOString()
      };
    } else {
      userDataList.push({
        userId: req.user.id,
        username: req.user.username,
        data: userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await storageService.write('user_data', userDataList);

    logger.info('用户数据已保存', {
      userId: req.user.id,
      username: req.user.username,
      pigeonsCount: pigeons.length
    });

    res.json({
      success: true,
      message: '数据保存成功',
      data: {
        count: pigeons.length,
        updatedAt: userData.updatedAt
      }
    });
  } catch (error) {
    logger.error('保存用户数据失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '保存数据失败'
    });
  }
});

/**
 * 获取用户鸽子数据
 * GET /api/user/data/pigeons
 */
router.get('/user/data/pigeons', authenticate, async (req, res) => {
  try {
    const userDataList = await storageService.read('user_data') || [];
    const userData = userDataList.find(d => d.userId === req.user.id);

    if (!userData || !userData.data || !userData.data.pigeons) {
      res.json({
        success: true,
        data: [],
        message: '暂无数据'
      });
      return;
    }

    res.json({
      success: true,
      data: userData.data.pigeons,
      updatedAt: userData.updatedAt
    });
  } catch (error) {
    logger.error('获取用户数据失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取数据失败'
    });
  }
});

/**
 * 获取所有用户数据（管理员）
 * GET /api/admin/users/data
 */
router.get('/admin/users/data', authenticate, requireAdmin, async (req, res) => {
  try {
    const userDataList = await storageService.read('user_data') || [];
    
    // 统计信息
    const stats = userDataList.map(item => ({
      userId: item.userId,
      username: item.username,
      pigeonsCount: item.data?.pigeons?.length || 0,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt
    }));

    res.json({
      success: true,
      data: stats,
      total: stats.length
    });
  } catch (error) {
    logger.error('获取用户数据列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取数据列表失败'
    });
  }
});

/**
 * 获取指定用户的详细数据（管理员）
 * GET /api/admin/users/:userId/data
 */
router.get('/admin/users/:userId/data', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const userDataList = await storageService.read('user_data') || [];
    const userData = userDataList.find(d => d.userId === userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: '用户数据不存在'
      });
    }

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    logger.error('获取用户详细数据失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取数据失败'
    });
  }
});

/**
 * 自动备份用户数据（定时任务调用）
 * POST /api/admin/backup
 */
router.post('/admin/backup', authenticate, requireAdmin, async (req, res) => {
  try {
    const userDataList = await storageService.read('user_data') || [];
    const users = await storageService.read('users') || [];
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      }),
      userData: userDataList,
      totalUsers: users.length,
      totalDataRecords: userDataList.length
    };

    // 保存备份
    const backupKey = `backup_${Date.now()}`;
    const backups = await storageService.read('backups') || [];
    backups.push({
      id: backupKey,
      ...backup
    });

    // 只保留最近30个备份
    if (backups.length > 30) {
      backups.shift();
    }

    await storageService.write('backups', backups);

    logger.info('数据备份完成', {
      totalUsers: backup.totalUsers,
      totalDataRecords: backup.totalDataRecords
    });

    res.json({
      success: true,
      message: '备份完成',
      data: {
        backupId: backupKey,
        timestamp: backup.timestamp,
        totalUsers: backup.totalUsers,
        totalDataRecords: backup.totalDataRecords
      }
    });
  } catch (error) {
    logger.error('数据备份失败', error);
    res.status(500).json({
      success: false,
      error: error.message || '备份失败'
    });
  }
});

module.exports = router;



