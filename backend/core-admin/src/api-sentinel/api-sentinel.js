/**
 * API监管系统
 * 负责监控主站API的健康状况和数据真实性
 */

const axios = require('axios');
const truthValidator = require('../truth-validator/data-truth-validator');
const logger = require('../utils/logger');
const config = require('../config/config');

class ApiSentinel {
  constructor() {
    this.apis = new Map();
    this.monitoring = false;
    this.stats = {
      totalChecks: 0,
      successChecks: 0,
      failedChecks: 0,
      avgResponseTime: 0,
      lastCheckTime: null
    };
  }

  /**
   * 注册API
   * @param {string} id - API ID
   * @param {object} apiConfig - API配置
   */
  registerApi(id, apiConfig) {
    this.apis.set(id, {
      ...apiConfig,
      id,
      stats: {
        calls: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0,
        lastCallTime: null,
        lastSuccessTime: null,
        lastFailureTime: null,
        errorRate: 0
      },
      health: {
        status: 'unknown',
        lastCheck: null,
        consecutiveFailures: 0
      }
    });
    logger.info(`API已注册: ${id}`);
  }

  /**
   * 自动识别主站API
   */
  autoDiscoverApis() {
    // 注册主站API
    const mainSiteApis = config.mainSiteApis;

    // 资讯API
    mainSiteApis.news.forEach((url, index) => {
      this.registerApi(`news_${index}`, {
        url,
        type: 'news',
        name: `资讯API ${index + 1}`,
        requiredFields: ['title', 'content', 'timestamp'],
        checkInterval: config.apiSentinel.checkInterval
      });
    });

    // 赛事API
    mainSiteApis.races.forEach((url, index) => {
      this.registerApi(`race_${index}`, {
        url,
        type: 'race',
        name: `赛事API ${index + 1}`,
        requiredFields: ['name', 'date', 'status'],
        checkInterval: config.apiSentinel.checkInterval,
        isRealTime: url.includes('live')
      });
    });

    // 事件API
    mainSiteApis.events.forEach((url, index) => {
      this.registerApi(`event_${index}`, {
        url,
        type: 'event',
        name: `事件API ${index + 1}`,
        requiredFields: ['type', 'timestamp'],
        checkInterval: config.apiSentinel.checkInterval,
        isRealTime: true
      });
    });

    logger.info(`自动发现并注册了 ${this.apis.size} 个API`);
  }

  /**
   * 检查API健康
   * @param {string} apiId - API ID
   */
  async checkApiHealth(apiId) {
    const api = this.apis.get(apiId);
    if (!api) {
      logger.warn(`API不存在: ${apiId}`);
      return null;
    }

    const startTime = Date.now();
    try {
      const response = await axios.get(api.url, {
        timeout: config.apiSentinel.timeout,
        validateStatus: (status) => status < 500
      });

      const responseTime = Date.now() - startTime;
      const success = response.status >= 200 && response.status < 400;

      // 更新统计
      api.stats.calls++;
      api.stats.lastCallTime = Date.now();
      if (success) {
        api.stats.successes++;
        api.stats.lastSuccessTime = Date.now();
        api.health.consecutiveFailures = 0;
        api.health.status = 'healthy';
      } else {
        api.stats.failures++;
        api.stats.lastFailureTime = Date.now();
        api.health.consecutiveFailures++;
        api.health.status = response.status === 404 ? 'not_found' : 'unhealthy';
      }

      // 更新平均响应时间
      const totalTime = api.stats.avgResponseTime * (api.stats.calls - 1) + responseTime;
      api.stats.avgResponseTime = totalTime / api.stats.calls;

      // 更新错误率
      api.stats.errorRate = api.stats.failures / api.stats.calls;

      api.health.lastCheck = Date.now();

      // 验证数据真实性
      if (success && response.data) {
        const validation = await truthValidator.validate(
          response.data,
          [{ id: apiId, type: api.type, data: response.data }],
          { requiredFields: api.requiredFields }
        );

        api.health.truthStatus = validation.truth_status;
        api.health.confidence = validation.confidence;

        if (validation.truth_status !== 'verified') {
          logger.warn(`API ${apiId} 数据真实性验证失败: ${validation.truth_status}`);
        }
      }

      this.stats.totalChecks++;
      if (success) {
        this.stats.successChecks++;
      } else {
        this.stats.failedChecks++;
      }

      return {
        apiId,
        success,
        responseTime,
        status: response.status,
        health: api.health,
        stats: { ...api.stats }
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      api.stats.calls++;
      api.stats.failures++;
      api.stats.lastCallTime = Date.now();
      api.stats.lastFailureTime = Date.now();
      api.health.consecutiveFailures++;
      api.health.status = 'error';
      api.health.lastCheck = Date.now();

      this.stats.totalChecks++;
      this.stats.failedChecks++;

      logger.error(`API健康检查失败: ${apiId}`, error);

      return {
        apiId,
        success: false,
        responseTime,
        error: error.message,
        health: api.health,
        stats: { ...api.stats }
      };
    }
  }

  /**
   * 检查所有API
   */
  async checkAllApis() {
    const results = [];
    for (const [apiId] of this.apis) {
      const result = await this.checkApiHealth(apiId);
      if (result) {
        results.push(result);
      }
    }
    this.stats.lastCheckTime = Date.now();
    return results;
  }

  /**
   * 开始监控
   */
  startMonitoring() {
    if (this.monitoring) {
      logger.warn('API监控已在运行');
      return;
    }

    this.monitoring = true;
    logger.info('API监控已启动');

    // 立即执行一次检查
    this.checkAllApis();

    // 定时检查
    this.monitorInterval = setInterval(() => {
      this.checkAllApis();
    }, config.apiSentinel.checkInterval);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.monitoring = false;
    logger.info('API监控已停止');
  }

  /**
   * 获取API列表
   */
  getApis() {
    return Array.from(this.apis.values()).map(api => ({
      id: api.id,
      name: api.name,
      url: api.url,
      type: api.type,
      health: api.health,
      stats: api.stats
    }));
  }

  /**
   * 获取API详情
   */
  getApi(apiId) {
    return this.apis.get(apiId);
  }

  /**
   * 获取总体统计
   */
  getOverallStats() {
    const apis = Array.from(this.apis.values());
    const healthyCount = apis.filter(a => a.health.status === 'healthy').length;
    const unhealthyCount = apis.filter(a => a.health.status !== 'healthy').length;

    return {
      ...this.stats,
      totalApis: apis.length,
      healthyApis: healthyCount,
      unhealthyApis: unhealthyCount,
      healthRate: apis.length > 0 ? healthyCount / apis.length : 0
    };
  }
}

module.exports = new ApiSentinel();














































