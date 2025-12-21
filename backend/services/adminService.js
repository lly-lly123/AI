const storageService = require('./storageService');
const logger = require('../utils/logger');
const moment = require('moment');

class AdminService {
  /**
   * 获取用户列表
   */
  async getUserList(page = 1, limit = 20, filters = {}) {
    try {
      let users = await storageService.read('users');
      
      // 过滤
      if (filters.status) {
        users = users.filter(u => u.status === filters.status);
      }
      if (filters.role) {
        users = users.filter(u => u.role === filters.role);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u => 
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      }

      // 分页
      const total = users.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end).map(u => {
        const { password, passwordResetToken, ...user } = u;
        return user;
      });

      return {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取用户列表失败', error);
      throw error;
    }
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(userId, status) {
    try {
      return await storageService.update('users', userId, { status });
    } catch (error) {
      logger.error('更新用户状态失败', error);
      throw error;
    }
  }

  /**
   * 更新用户权限
   */
  async updateUserRole(userId, role) {
    try {
      return await storageService.update('users', userId, { role });
    } catch (error) {
      logger.error('更新用户权限失败', error);
      throw error;
    }
  }

  /**
   * 获取鸽子数据统计
   */
  async getPigeonStats() {
    try {
      const pigeons = await storageService.read('pigeons');
      const training = await storageService.read('training');
      const races = await storageService.read('races');

      return {
        totalPigeons: pigeons.length,
        alivePigeons: pigeons.filter(p => p.alive).length,
        totalTrainings: training.length,
        totalRaces: races.length,
        completedRaces: races.filter(r => r.status === 'completed').length,
        byStatus: {
          alive: pigeons.filter(p => p.alive).length,
          dead: pigeons.filter(p => !p.alive).length
        }
      };
    } catch (error) {
      logger.error('获取鸽子统计失败', error);
      throw error;
    }
  }

  /**
   * 获取训练记录列表
   */
  async getTrainingRecords(page = 1, limit = 20, filters = {}) {
    try {
      let records = await storageService.read('training');
      
      if (filters.pigeonId) {
        records = records.filter(r => r.pigeonId === filters.pigeonId);
      }
      if (filters.userId) {
        records = records.filter(r => r.userId === filters.userId);
      }
      if (filters.dateFrom) {
        records = records.filter(r => r.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        records = records.filter(r => r.date <= filters.dateTo);
      }

      records.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

      const total = records.length;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        records: records.slice(start, end),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取训练记录失败', error);
      throw error;
    }
  }

  /**
   * 获取比赛记录列表
   */
  async getRaceRecords(page = 1, limit = 20, filters = {}) {
    try {
      let records = await storageService.read('races');
      
      if (filters.pigeonId) {
        records = records.filter(r => r.pigeonId === filters.pigeonId);
      }
      if (filters.status) {
        records = records.filter(r => r.status === filters.status);
      }

      records.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());

      const total = records.length;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        records: records.slice(start, end),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取比赛记录失败', error);
      throw error;
    }
  }

  /**
   * 获取使用量统计
   */
  async getUsageStats(period = '7d') {
    try {
      const stats = await storageService.read('usageStats');
      
      // 如果没有统计数据，返回空数据
      if (!stats || stats.length === 0) {
        return this.getEmptyStats(period);
      }

      // 根据时间段过滤
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoffDate = moment().subtract(days, 'days').toISOString();
      
      const filtered = stats.filter(s => s.date >= cutoffDate);

      return {
        period,
        totalUsers: new Set(filtered.map(s => s.userId)).size,
        totalRequests: filtered.reduce((sum, s) => sum + s.requests, 0),
        byDate: this.groupByDate(filtered),
        byFeature: this.groupByFeature(filtered)
      };
    } catch (error) {
      logger.error('获取使用量统计失败', error);
      throw error;
    }
  }

  /**
   * 记录使用统计
   */
  async recordUsage(userId, feature) {
    try {
      const today = moment().format('YYYY-MM-DD');
      const stats = await storageService.read('usageStats');
      
      const existing = stats.find(s => s.date === today && s.userId === userId && s.feature === feature);
      
      if (existing) {
        await storageService.update('usageStats', existing.id, {
          requests: existing.requests + 1,
          lastUsed: new Date().toISOString()
        });
      } else {
        await storageService.add('usageStats', {
          userId,
          feature,
          date: today,
          requests: 1,
          lastUsed: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('记录使用统计失败', error);
    }
  }

  /**
   * 获取活跃用户统计
   */
  async getActiveUsers(period = '7d') {
    try {
      const loginLogs = await storageService.read('loginLogs');
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoffDate = moment().subtract(days, 'days').toISOString();
      
      const recentLogs = loginLogs.filter(log => 
        log.timestamp >= cutoffDate && log.success
      );

      const uniqueUsers = new Set(recentLogs.map(log => log.username));
      
      return {
        period,
        totalActiveUsers: uniqueUsers.size,
        dailyActiveUsers: this.getDailyActiveUsers(recentLogs),
        byDate: this.groupLogsByDate(recentLogs)
      };
    } catch (error) {
      logger.error('获取活跃用户统计失败', error);
      throw error;
    }
  }

  /**
   * 获取功能使用频率
   */
  async getFeatureUsageFrequency(period = '7d') {
    try {
      const stats = await storageService.read('usageStats');
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const cutoffDate = moment().subtract(days, 'days').toISOString();
      
      const recent = stats.filter(s => s.date >= cutoffDate);
      
      const featureMap = {};
      recent.forEach(s => {
        featureMap[s.feature] = (featureMap[s.feature] || 0) + s.requests;
      });

      return Object.entries(featureMap)
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('获取功能使用频率失败', error);
      throw error;
    }
  }

  /**
   * 获取资讯来源管理
   */
  async getNewsSources() {
    try {
      const sources = await storageService.read('newsSources');
      return sources;
    } catch (error) {
      logger.error('获取资讯来源失败', error);
      throw error;
    }
  }

  /**
   * 更新资讯来源状态
   */
  async updateNewsSourceStatus(sourceId, status) {
    try {
      return await storageService.update('newsSources', sourceId, { status });
    } catch (error) {
      logger.error('更新资讯来源状态失败', error);
      throw error;
    }
  }

  /**
   * 获取登录日志
   */
  async getLoginLogs(page = 1, limit = 50, filters = {}) {
    try {
      let logs = await storageService.read('loginLogs');
      
      if (filters.username) {
        logs = logs.filter(l => l.username.includes(filters.username));
      }
      if (filters.success !== undefined) {
        logs = logs.filter(l => l.success === filters.success);
      }
      if (filters.dateFrom) {
        logs = logs.filter(l => l.timestamp >= filters.dateFrom);
      }
      if (filters.dateTo) {
        logs = logs.filter(l => l.timestamp <= filters.dateTo);
      }

      logs.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf());

      const total = logs.length;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        logs: logs.slice(start, end),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取登录日志失败', error);
      throw error;
    }
  }

  /**
   * 获取需要修改密码的用户
   */
  async getUsersNeedPasswordChange(days = 90) {
    try {
      const users = await storageService.read('users');
      const cutoffDate = moment().subtract(days, 'days').toISOString();
      
      return users.filter(u => 
        u.passwordChangedAt && 
        moment(u.passwordChangedAt).isBefore(cutoffDate)
      ).map(u => {
        const { password, passwordResetToken, ...user } = u;
        return {
          ...user,
          daysSincePasswordChange: moment().diff(moment(u.passwordChangedAt), 'days')
        };
      });
    } catch (error) {
      logger.error('获取需要修改密码的用户失败', error);
      throw error;
    }
  }

  /**
   * 获取token列表
   */
  async getTokenList(page = 1, limit = 50) {
    try {
      const tokens = await storageService.read('tokens');
      const validTokens = tokens.filter(t => new Date(t.expiresAt) > new Date());
      
      validTokens.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf());

      const total = validTokens.length;
      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        tokens: validTokens.slice(start, end),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('获取token列表失败', error);
      throw error;
    }
  }

  /**
   * 撤销token
   */
  async revokeToken(tokenId) {
    try {
      await storageService.delete('tokens', tokenId);
      return { success: true };
    } catch (error) {
      logger.error('撤销token失败', error);
      throw error;
    }
  }

  // 辅助方法
  getEmptyStats(period) {
    return {
      period,
      totalUsers: 0,
      totalRequests: 0,
      byDate: [],
      byFeature: []
    };
  }

  groupByDate(stats) {
    const grouped = {};
    stats.forEach(s => {
      if (!grouped[s.date]) {
        grouped[s.date] = 0;
      }
      grouped[s.date] += s.requests;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  groupByFeature(stats) {
    const grouped = {};
    stats.forEach(s => {
      grouped[s.feature] = (grouped[s.feature] || 0) + s.requests;
    });
    return Object.entries(grouped).map(([feature, count]) => ({ feature, count }));
  }

  getDailyActiveUsers(logs) {
    const daily = {};
    logs.forEach(log => {
      const date = moment(log.timestamp).format('YYYY-MM-DD');
      if (!daily[date]) {
        daily[date] = new Set();
      }
      daily[date].add(log.username);
    });
    return Object.entries(daily).map(([date, users]) => ({
      date,
      count: users.size
    }));
  }

  groupLogsByDate(logs) {
    const grouped = {};
    logs.forEach(log => {
      const date = moment(log.timestamp).format('YYYY-MM-DD');
      if (!grouped[date]) {
        grouped[date] = 0;
      }
      grouped[date]++;
    });
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }
}

module.exports = new AdminService();


















