/**
 * 学习引擎
 * 负责行为学习、结果学习、记忆系统
 */

const logger = require('../utils/logger');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

class LearningEngine {
  constructor() {
    this.memoryPath = path.join(__dirname, '../../data/memory.json');
    this.memories = this.loadMemories();
    this.behaviorPatterns = [];
    this.decisionHistory = [];
  }

  /**
   * 加载记忆
   */
  loadMemories() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.error('加载记忆失败', error);
    }
    return {
      events: [],
      strategies: [],
      outcomes: []
    };
  }

  /**
   * 保存记忆
   */
  saveMemories() {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memories, null, 2));
    } catch (error) {
      logger.error('保存记忆失败', error);
    }
  }

  /**
   * 记录事件
   * @param {string} type - 事件类型
   * @param {object} data - 事件数据
   * @param {object} context - 上下文
   */
  recordEvent(type, data, context = {}) {
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      context,
      timestamp: Date.now()
    };

    this.memories.events.push(event);

    // 只保留最近90天的记忆
    const cutoff = Date.now() - config.learning.memoryRetentionDays * 24 * 60 * 60 * 1000;
    this.memories.events = this.memories.events.filter(e => e.timestamp > cutoff);

    this.saveMemories();
    logger.debug(`事件已记录: ${type}`);
  }

  /**
   * 记录决策
   * @param {string} decision - 决策内容
   * @param {object} context - 上下文
   * @param {string} source - 决策来源 (human/ai/local)
   */
  recordDecision(decision, context, source = 'local') {
    const record = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      decision,
      context,
      source,
      timestamp: Date.now(),
      outcome: null // 稍后更新
    };

    this.decisionHistory.push(record);

    // 只保留最近1000条决策
    if (this.decisionHistory.length > 1000) {
      this.decisionHistory.shift();
    }

    return record.id;
  }

  /**
   * 更新决策结果
   * @param {string} decisionId - 决策ID
   * @param {object} outcome - 结果
   */
  updateDecisionOutcome(decisionId, outcome) {
    const record = this.decisionHistory.find(d => d.id === decisionId);
    if (record) {
      record.outcome = outcome;
      record.outcomeTime = Date.now();

      // 学习结果
      this.learnFromOutcome(record);
    }
  }

  /**
   * 从结果中学习
   */
  learnFromOutcome(decisionRecord) {
    if (!decisionRecord.outcome) return;

    const strategy = {
      id: `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      decision: decisionRecord.decision,
      context: decisionRecord.context,
      outcome: decisionRecord.outcome,
      effectiveness: this.calculateEffectiveness(decisionRecord.outcome),
      timestamp: Date.now()
    };

    this.memories.strategies.push(strategy);

    // 只保留最近100条策略
    if (this.memories.strategies.length > 100) {
      this.memories.strategies.shift();
    }

    this.saveMemories();
  }

  /**
   * 计算策略有效性
   */
  calculateEffectiveness(outcome) {
    // 简化实现：根据结果评分
    if (outcome.success) {
      return Math.min(1.0, 0.5 + (outcome.improvement || 0) * 0.5);
    }
    return Math.max(0, 0.5 - (outcome.degradation || 0) * 0.5);
  }

  /**
   * 查找相似历史
   * @param {object} context - 当前上下文
   */
  findSimilarHistory(context) {
    // 查找相似的历史事件和策略
    const similar = [];

    for (const event of this.memories.events) {
      const similarity = this.calculateSimilarity(context, event.context);
      if (similarity > 0.7) {
        similar.push({
          type: 'event',
          data: event,
          similarity
        });
      }
    }

    for (const strategy of this.memories.strategies) {
      const similarity = this.calculateSimilarity(context, strategy.context);
      if (similarity > 0.7) {
        similar.push({
          type: 'strategy',
          data: strategy,
          similarity
        });
      }
    }

    // 按相似度排序
    similar.sort((a, b) => b.similarity - a.similarity);

    return similar.slice(0, 10); // 返回前10个最相似的
  }

  /**
   * 计算相似度
   */
  calculateSimilarity(context1, context2) {
    // 简化实现：基于关键字段的匹配度
    if (!context1 || !context2) return 0;

    let matches = 0;
    let total = 0;

    for (const key in context1) {
      total++;
      if (context2[key] === context1[key]) {
        matches++;
      }
    }

    return total > 0 ? matches / total : 0;
  }

  /**
   * 行为学习：分析用户行为模式
   * @param {Array} behaviors - 行为数据数组
   */
  learnFromBehaviors(behaviors) {
    const patterns = {};
    
    for (const behavior of behaviors) {
      const key = `${behavior.action}_${behavior.context?.page || 'unknown'}`;
      if (!patterns[key]) {
        patterns[key] = {
          count: 0,
          contexts: [],
          timestamps: []
        };
      }
      patterns[key].count++;
      patterns[key].contexts.push(behavior.context);
      patterns[key].timestamps.push(behavior.timestamp);
    }

    // 识别行为模式
    for (const [key, pattern] of Object.entries(patterns)) {
      if (pattern.count > 10) { // 频繁行为
        this.behaviorPatterns.push({
          pattern: key,
          frequency: pattern.count,
          contexts: pattern.contexts,
          learnedAt: Date.now()
        });
      }
    }

    // 只保留最近100个模式
    if (this.behaviorPatterns.length > 100) {
      this.behaviorPatterns.shift();
    }

    this.saveMemories();
    logger.info(`行为学习完成: 识别了${Object.keys(patterns).length}个行为模式`);
  }

  /**
   * 结果学习：从操作结果中学习
   * @param {string} action - 操作类型
   * @param {object} result - 操作结果
   * @param {object} context - 上下文
   */
  learnFromResult(action, result, context = {}) {
    const outcome = {
      id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      result,
      context,
      timestamp: Date.now(),
      success: result.success || false,
      impact: result.impact || 'neutral'
    };

    this.memories.outcomes.push(outcome);

    // 只保留最近500个结果
    if (this.memories.outcomes.length > 500) {
      this.memories.outcomes.shift();
    }

    // 分析结果模式
    const similarOutcomes = this.memories.outcomes.filter(
      o => o.action === action && o.success === outcome.success
    );

    if (similarOutcomes.length > 5) {
      // 识别成功/失败的模式
      const pattern = {
        action,
        successRate: similarOutcomes.filter(o => o.success).length / similarOutcomes.length,
        avgImpact: similarOutcomes.reduce((sum, o) => {
          const impactValue = o.impact === 'positive' ? 1 : o.impact === 'negative' ? -1 : 0;
          return sum + impactValue;
        }, 0) / similarOutcomes.length,
        learnedAt: Date.now()
      };

      // 更新或添加策略
      const existingStrategy = this.memories.strategies.find(s => s.action === action);
      if (existingStrategy) {
        existingStrategy.effectiveness = pattern.successRate;
        existingStrategy.lastUpdated = Date.now();
      } else {
        this.memories.strategies.push({
          id: `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action,
          effectiveness: pattern.successRate,
          context: context,
          learnedAt: Date.now()
        });
      }
    }

    this.saveMemories();
    logger.debug(`结果学习: ${action} - ${outcome.success ? '成功' : '失败'}`);
  }

  /**
   * 记忆系统：检索相关记忆
   * @param {object} query - 查询条件
   */
  retrieveMemories(query) {
    const { type, context, timeRange } = query;
    let memories = [];

    // 根据类型检索
    if (type === 'event' || !type) {
      memories = memories.concat(this.memories.events);
    }
    if (type === 'strategy' || !type) {
      memories = memories.concat(this.memories.strategies);
    }
    if (type === 'outcome' || !type) {
      memories = memories.concat(this.memories.outcomes);
    }

    // 根据时间范围过滤
    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      memories = memories.filter(m => m.timestamp >= cutoff);
    }

    // 根据上下文相似度排序
    if (context) {
      memories = memories.map(m => ({
        ...m,
        similarity: this.calculateSimilarity(context, m.context || {})
      })).sort((a, b) => b.similarity - a.similarity);
    }

    return memories.slice(0, 20); // 返回前20个最相关的记忆
  }

  /**
   * 自我升级：基于学习结果优化策略
   */
  selfUpgrade() {
    logger.info('执行自我升级...');

    // 分析策略有效性
    const effectiveStrategies = this.memories.strategies
      .filter(s => s.effectiveness > 0.7)
      .sort((a, b) => b.effectiveness - a.effectiveness);

    // 分析失败模式
    const failedOutcomes = this.memories.outcomes.filter(o => !o.success);
    const failurePatterns = {};

    for (const outcome of failedOutcomes) {
      const key = `${outcome.action}_${JSON.stringify(outcome.context)}`;
      failurePatterns[key] = (failurePatterns[key] || 0) + 1;
    }

    // 生成升级建议
    const upgrade = {
      id: `upgrade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      effectiveStrategies: effectiveStrategies.slice(0, 10),
      failurePatterns: Object.entries(failurePatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([pattern, count]) => ({ pattern, count })),
      recommendations: this.generateRecommendations(effectiveStrategies, failurePatterns)
    };

    logger.info(`自我升级完成: 识别了${effectiveStrategies.length}个有效策略`);
    return upgrade;
  }

  /**
   * 生成推荐
   */
  generateRecommendations(effectiveStrategies, failurePatterns) {
    const recommendations = [];

    // 推荐使用有效策略
    if (effectiveStrategies.length > 0) {
      recommendations.push({
        type: 'use_strategy',
        priority: 'high',
        message: `建议使用以下有效策略: ${effectiveStrategies.slice(0, 3).map(s => s.action).join(', ')}`
      });
    }

    // 避免失败模式
    const topFailures = Object.entries(failurePatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topFailures.length > 0) {
      recommendations.push({
        type: 'avoid_pattern',
        priority: 'medium',
        message: `避免以下失败模式: ${topFailures.map(([pattern]) => pattern).join(', ')}`
      });
    }

    return recommendations;
  }

  /**
   * 获取学习统计
   */
  getStats() {
    return {
      totalEvents: this.memories.events.length,
      totalStrategies: this.memories.strategies.length,
      totalDecisions: this.decisionHistory.length,
      totalOutcomes: this.memories.outcomes.length,
      behaviorPatterns: this.behaviorPatterns.length,
      avgEffectiveness: this.memories.strategies.length > 0
        ? this.memories.strategies.reduce((sum, s) => sum + (s.effectiveness || 0), 0) / this.memories.strategies.length
        : 0,
      successRate: this.memories.outcomes.length > 0
        ? this.memories.outcomes.filter(o => o.success).length / this.memories.outcomes.length
        : 0
    };
  }
}

module.exports = new LearningEngine();


