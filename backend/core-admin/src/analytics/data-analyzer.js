/**
 * 数据分析模块
 * 负责用户行为分析、点击率分析、数据上传分析
 */

const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class DataAnalyzer {
  constructor() {
    this.statsPath = path.join(__dirname, '../../data/analytics.json');
    this.stats = this.loadStats();
    this.clickTracking = new Map(); // 实时点击追踪
    this.uploadTracking = new Map(); // 数据上传追踪
  }

  /**
   * 加载统计数据
   */
  loadStats() {
    try {
      if (fs.existsSync(this.statsPath)) {
        const data = fs.readFileSync(this.statsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.error('加载统计数据失败', error);
    }
    return {
      clicks: {},
      uploads: {},
      userBehaviors: [],
      pageViews: {},
      apiUsage: {},
      timestamp: Date.now()
    };
  }

  /**
   * 保存统计数据
   */
  saveStats() {
    try {
      const dir = path.dirname(this.statsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.statsPath, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      logger.error('保存统计数据失败', error);
    }
  }

  /**
   * 记录点击事件
   * @param {string} element - 点击的元素
   * @param {object} context - 上下文信息
   */
  recordClick(element, context = {}) {
    const key = `${element}_${context.page || 'unknown'}`;
    const now = Date.now();

    // 实时追踪
    if (!this.clickTracking.has(key)) {
      this.clickTracking.set(key, {
        count: 0,
        firstClick: now,
        lastClick: now,
        contexts: []
      });
    }

    const tracking = this.clickTracking.get(key);
    tracking.count++;
    tracking.lastClick = now;
    tracking.contexts.push({
      timestamp: now,
      ...context
    });

    // 保存到统计
    if (!this.stats.clicks[key]) {
      this.stats.clicks[key] = {
        total: 0,
        daily: {},
        hourly: {}
      };
    }

    this.stats.clicks[key].total++;
    
    const date = new Date(now).toISOString().split('T')[0];
    const hour = new Date(now).getHours();
    
    this.stats.clicks[key].daily[date] = (this.stats.clicks[key].daily[date] || 0) + 1;
    this.stats.clicks[key].hourly[hour] = (this.stats.clicks[key].hourly[hour] || 0) + 1;

    this.saveStats();
    logger.debug(`点击记录: ${element} on ${context.page || 'unknown'}`);
  }

  /**
   * 记录数据上传
   * @param {string} type - 数据类型
   * @param {object} metadata - 元数据
   */
  recordUpload(type, metadata = {}) {
    const now = Date.now();
    const key = `${type}_${now}`;

    const uploadRecord = {
      id: key,
      type,
      timestamp: now,
      size: metadata.size || 0,
      userId: metadata.userId || 'unknown',
      status: metadata.status || 'success',
      ...metadata
    };

    // 实时追踪
    this.uploadTracking.set(key, uploadRecord);

    // 保存到统计
    if (!this.stats.uploads[type]) {
      this.stats.uploads[type] = {
        total: 0,
        success: 0,
        failed: 0,
        totalSize: 0,
        daily: {},
        recent: []
      };
    }

    const typeStats = this.stats.uploads[type];
    typeStats.total++;
    typeStats.totalSize += uploadRecord.size;
    
    if (uploadRecord.status === 'success') {
      typeStats.success++;
    } else {
      typeStats.failed++;
    }

    const date = new Date(now).toISOString().split('T')[0];
    typeStats.daily[date] = (typeStats.daily[date] || 0) + 1;

    // 保留最近100条记录
    typeStats.recent.push(uploadRecord);
    if (typeStats.recent.length > 100) {
      typeStats.recent.shift();
    }

    this.saveStats();
    logger.info(`数据上传记录: ${type} - ${uploadRecord.status}`);
  }

  /**
   * 记录用户行为
   * @param {string} action - 行为类型
   * @param {object} data - 行为数据
   */
  recordUserBehavior(action, data = {}) {
    const behavior = {
      id: `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      userAgent: data.userAgent,
      ip: data.ip,
      sessionId: data.sessionId
    };

    this.stats.userBehaviors.push(behavior);

    // 只保留最近10000条行为记录
    if (this.stats.userBehaviors.length > 10000) {
      this.stats.userBehaviors.shift();
    }

    this.saveStats();
    logger.debug(`用户行为记录: ${action}`);
  }

  /**
   * 记录页面访问
   * @param {string} page - 页面路径
   * @param {object} context - 上下文
   */
  recordPageView(page, context = {}) {
    const now = Date.now();
    const date = new Date(now).toISOString().split('T')[0];

    if (!this.stats.pageViews[page]) {
      this.stats.pageViews[page] = {
        total: 0,
        daily: {},
        uniqueVisitors: new Set(),
        avgTimeOnPage: 0,
        bounceRate: 0
      };
    }

    const pageStats = this.stats.pageViews[page];
    pageStats.total++;
    pageStats.daily[date] = (pageStats.daily[date] || 0) + 1;

    if (context.userId) {
      pageStats.uniqueVisitors.add(context.userId);
    }

    this.saveStats();
  }

  /**
   * 记录API使用
   * @param {string} endpoint - API端点
   * @param {object} metadata - 元数据
   */
  recordApiUsage(endpoint, metadata = {}) {
    const now = Date.now();
    const date = new Date(now).toISOString().split('T')[0];

    if (!this.stats.apiUsage[endpoint]) {
      this.stats.apiUsage[endpoint] = {
        total: 0,
        success: 0,
        failed: 0,
        avgResponseTime: 0,
        daily: {},
        hourly: {}
      };
    }

    const apiStats = this.stats.apiUsage[endpoint];
    apiStats.total++;
    
    if (metadata.status === 'success') {
      apiStats.success++;
    } else {
      apiStats.failed++;
    }

    if (metadata.responseTime) {
      apiStats.avgResponseTime = 
        (apiStats.avgResponseTime * (apiStats.total - 1) + metadata.responseTime) / apiStats.total;
    }

    apiStats.daily[date] = (apiStats.daily[date] || 0) + 1;
    
    const hour = new Date(now).getHours();
    apiStats.hourly[hour] = (apiStats.hourly[hour] || 0) + 1;

    this.saveStats();
  }

  /**
   * 分析点击率
   * @param {string} element - 元素标识
   * @param {string} page - 页面标识
   */
  analyzeClickRate(element, page) {
    const key = `${element}_${page}`;
    const clickData = this.stats.clicks[key];
    
    if (!clickData) {
      return {
        clickRate: 0,
        totalClicks: 0,
        trend: 'stable'
      };
    }

    // 计算趋势（最近7天 vs 前7天）
    const dates = Object.keys(clickData.daily).sort();
    const recent7Days = dates.slice(-7);
    const previous7Days = dates.slice(-14, -7);

    const recentTotal = recent7Days.reduce((sum, date) => sum + (clickData.daily[date] || 0), 0);
    const previousTotal = previous7Days.reduce((sum, date) => sum + (clickData.daily[date] || 0), 0);

    let trend = 'stable';
    if (previousTotal > 0) {
      const change = (recentTotal - previousTotal) / previousTotal;
      if (change > 0.2) trend = 'increasing';
      else if (change < -0.2) trend = 'decreasing';
    }

    return {
      clickRate: clickData.total,
      totalClicks: clickData.total,
      trend,
      dailyBreakdown: clickData.daily,
      hourlyBreakdown: clickData.hourly
    };
  }

  /**
   * 分析数据上传模式
   */
  analyzeUploadPatterns() {
    const patterns = {
      byType: {},
      byTime: {},
      byUser: {},
      trends: {}
    };

    for (const [type, stats] of Object.entries(this.stats.uploads)) {
      patterns.byType[type] = {
        total: stats.total,
        successRate: stats.total > 0 ? stats.success / stats.total : 0,
        avgSize: stats.total > 0 ? stats.totalSize / stats.total : 0,
        dailyTrend: stats.daily
      };

      // 分析时间模式
      for (const record of stats.recent) {
        const hour = new Date(record.timestamp).getHours();
        patterns.byTime[hour] = (patterns.byTime[hour] || 0) + 1;
      }

      // 分析用户模式
      for (const record of stats.recent) {
        const userId = record.userId || 'unknown';
        if (!patterns.byUser[userId]) {
          patterns.byUser[userId] = 0;
        }
        patterns.byUser[userId]++;
      }
    }

    return patterns;
  }

  /**
   * 分析用户行为模式
   */
  analyzeUserBehaviorPatterns() {
    const patterns = {
      topActions: {},
      actionSequence: [],
      peakHours: {},
      userJourney: {}
    };

    // 统计行为频率
    for (const behavior of this.stats.userBehaviors) {
      patterns.topActions[behavior.action] = (patterns.topActions[behavior.action] || 0) + 1;
      
      const hour = new Date(behavior.timestamp).getHours();
      patterns.peakHours[hour] = (patterns.peakHours[hour] || 0) + 1;
    }

    // 分析行为序列（最近100条）
    const recentBehaviors = this.stats.userBehaviors.slice(-100);
    for (let i = 1; i < recentBehaviors.length; i++) {
      const sequence = `${recentBehaviors[i-1].action} -> ${recentBehaviors[i].action}`;
      patterns.actionSequence.push(sequence);
    }

    return patterns;
  }

  /**
   * 获取综合分析报告
   */
  getComprehensiveReport() {
    return {
      clicks: {
        total: Object.values(this.stats.clicks).reduce((sum, c) => sum + c.total, 0),
        topElements: Object.entries(this.stats.clicks)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 10)
          .map(([key, data]) => ({ element: key, clicks: data.total }))
      },
      uploads: {
        total: Object.values(this.stats.uploads).reduce((sum, u) => sum + u.total, 0),
        byType: Object.entries(this.stats.uploads).map(([type, stats]) => ({
          type,
          total: stats.total,
          successRate: stats.total > 0 ? stats.success / stats.total : 0
        }))
      },
      userBehaviors: {
        total: this.stats.userBehaviors.length,
        topActions: Object.entries(this.analyzeUserBehaviorPatterns().topActions)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([action, count]) => ({ action, count }))
      },
      pageViews: {
        total: Object.values(this.stats.pageViews).reduce((sum, p) => sum + p.total, 0),
        topPages: Object.entries(this.stats.pageViews)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 10)
          .map(([page, stats]) => ({ page, views: stats.total }))
      },
      apiUsage: {
        total: Object.values(this.stats.apiUsage).reduce((sum, a) => sum + a.total, 0),
        topEndpoints: Object.entries(this.stats.apiUsage)
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 10)
          .map(([endpoint, stats]) => ({
            endpoint,
            calls: stats.total,
            successRate: stats.total > 0 ? stats.success / stats.total : 0,
            avgResponseTime: stats.avgResponseTime
          }))
      },
      timestamp: Date.now()
    };
  }
}

module.exports = new DataAnalyzer();







