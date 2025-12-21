/**
 * AI调度中枢
 * 负责判断何时调用AI，控制频率和成本
 */

const zhipuClient = require('./zhipu-client');
const logger = require('../utils/logger');
const config = require('../config/config');

class AIHub {
  constructor() {
    this.callHistory = [];
    this.decisionCache = new Map();
  }

  /**
   * 判断是否需要调用AI
   * @param {object} context - 上下文
   * @returns {boolean} 是否需要调用AI
   */
  shouldCallAI(context) {
    // 如果AI未启用，不调用
    if (!config.zhipu.enabled || !zhipuClient.enabled) {
      return false;
    }

    // 简单确定问题 → 本地处理
    if (context.complexity === 'simple' && context.localRuleResult) {
      return false;
    }

    // 复杂不确定问题 → AI参与
    if (
      context.complexity === 'complex' ||
      context.sourceCount >= config.truthValidator.minSourceCount ||
      context.hasConflict ||
      context.needsAnalysis ||
      context.needsPrediction
    ) {
      return true;
    }

    // 检查缓存
    const cacheKey = this.getCacheKey(context);
    if (this.decisionCache.has(cacheKey)) {
      const cached = this.decisionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1小时缓存
        return cached.shouldCall;
      }
    }

    return false;
  }

  /**
   * 调用AI进行分析
   * @param {string} task - 任务类型
   * @param {object} data - 数据
   * @param {object} context - 上下文
   */
  async analyze(task, data, context = {}) {
    if (!this.shouldCallAI(context)) {
      return {
        used: false,
        reason: '不需要AI参与或AI未启用',
        fallback: true
      };
    }

    try {
      let result;

      switch (task) {
        case 'truth_analysis':
          result = await zhipuClient.analyzeDataTruth(data, context.sources || []);
          break;
        case 'management_advice':
          result = await zhipuClient.generateManagementAdvice(
            context.metrics || {},
            context.issues || []
          );
          break;
        default:
          result = await zhipuClient.call(
            context.prompt || '请分析以下情况',
            { data },
            { task }
          );
      }

      // 记录调用历史
      this.recordCall(task, result);

      // 缓存决策
      const cacheKey = this.getCacheKey(context);
      this.decisionCache.set(cacheKey, {
        shouldCall: true,
        timestamp: Date.now()
      });

      return {
        used: true,
        result: result.success ? result : null,
        error: result.success ? null : result.error,
        fallback: result.fallback || false
      };

    } catch (error) {
      logger.error(`AI Hub分析失败: ${error.message}`, error);
      return {
        used: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * 记录AI调用
   */
  recordCall(task, result) {
    this.callHistory.push({
      task,
      timestamp: Date.now(),
      success: result.success,
      confidence: result.confidence || 0,
      tokens: result.usage?.total_tokens || 0
    });

    // 只保留最近1000条记录
    if (this.callHistory.length > 1000) {
      this.callHistory.shift();
    }
  }

  /**
   * 获取缓存键
   */
  getCacheKey(context) {
    return JSON.stringify({
      complexity: context.complexity,
      sourceCount: context.sourceCount,
      hasConflict: context.hasConflict
    });
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const recentCalls = this.callHistory.filter(
      call => Date.now() - call.timestamp < 3600000
    );

    return {
      totalCalls: this.callHistory.length,
      recentCalls: recentCalls.length,
      successRate: recentCalls.length > 0
        ? recentCalls.filter(c => c.success).length / recentCalls.length
        : 0,
      avgConfidence: recentCalls.length > 0
        ? recentCalls.reduce((sum, c) => sum + (c.confidence || 0), 0) / recentCalls.length
        : 0,
      totalTokens: recentCalls.reduce((sum, c) => sum + (c.tokens || 0), 0)
    };
  }
}

module.exports = new AIHub();








