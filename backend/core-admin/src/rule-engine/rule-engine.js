/**
 * 规则引擎
 * 负责阈值规则、体育逻辑规则、风控规则
 */

const logger = require('../utils/logger');

class RuleEngine {
  constructor() {
    this.rules = {
      // 数据真实性规则
      truth: {
        timestampMonotonic: (data) => {
          if (!Array.isArray(data) || data.length < 2) return { pass: true };
          for (let i = 1; i < data.length; i++) {
            const prev = new Date(data[i - 1].timestamp || data[i - 1].time);
            const curr = new Date(data[i].timestamp || data[i].time);
            if (curr < prev) {
              return {
                pass: false,
                issue: `时间戳不单调递增: ${i - 1} -> ${i}`,
                severity: 'high'
              };
            }
          }
          return { pass: true };
        },
        statusContinuity: (data) => {
          // 检查状态连续性（例如：比赛状态不能从"未开始"直接跳到"已结束"）
          const validTransitions = {
            '未开始': ['进行中', '已取消'],
            '进行中': ['已结束', '暂停', '已取消'],
            '暂停': ['进行中', '已取消'],
            '已结束': [],
            '已取消': []
          };

          if (!Array.isArray(data) || data.length < 2) return { pass: true };

          for (let i = 1; i < data.length; i++) {
            const prevStatus = data[i - 1].status;
            const currStatus = data[i].status;
            if (prevStatus && currStatus && validTransitions[prevStatus]) {
              if (!validTransitions[prevStatus].includes(currStatus)) {
                return {
                  pass: false,
                  issue: `状态转换无效: ${prevStatus} -> ${currStatus}`,
                  severity: 'high'
                };
              }
            }
          }
          return { pass: true };
        },
        scoreRationality: (data) => {
          // 检查比分合理性
          if (!data.score) return { pass: true };
          const score = data.score;
          if (typeof score === 'string') {
            const parts = score.split(':');
            if (parts.length === 2) {
              const home = parseInt(parts[0], 10);
              const away = parseInt(parts[1], 10);
              if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
                return {
                  pass: false,
                  issue: `比分格式无效: ${score}`,
                  severity: 'medium'
                };
              }
            }
          }
          return { pass: true };
        }
      },
      // 性能规则
      performance: {
        responseTime: (metrics) => {
          const threshold = 5000; // 5秒
          if (metrics.responseTime > threshold) {
            return {
              pass: false,
              issue: `响应时间过长: ${metrics.responseTime}ms`,
              severity: 'medium'
            };
          }
          return { pass: true };
        },
        errorRate: (metrics) => {
          const threshold = 0.05; // 5%
          if (metrics.errorRate > threshold) {
            return {
              pass: false,
              issue: `错误率过高: ${(metrics.errorRate * 100).toFixed(2)}%`,
              severity: 'high'
            };
          }
          return { pass: true };
        }
      },
      // 数据完整性规则
      completeness: {
        requiredFields: (data, requiredFields) => {
          const missing = requiredFields.filter(field => !data[field]);
          if (missing.length > 0) {
            return {
              pass: false,
              issue: `缺少必需字段: ${missing.join(', ')}`,
              severity: 'high'
            };
          }
          return { pass: true };
        },
        nonEmpty: (data) => {
          if (Array.isArray(data) && data.length === 0) {
            return {
              pass: false,
              issue: '数据为空',
              severity: 'medium'
            };
          }
          if (typeof data === 'object' && Object.keys(data).length === 0) {
            return {
              pass: false,
              issue: '数据对象为空',
              severity: 'medium'
            };
          }
          return { pass: true };
        }
      }
    };
  }

  /**
   * 执行规则检查
   * @param {string} category - 规则类别
   * @param {string} ruleName - 规则名称
   * @param {*} data - 数据
   * @param {*} options - 选项
   */
  check(category, ruleName, data, options = {}) {
    if (!this.rules[category] || !this.rules[category][ruleName]) {
      logger.warn(`规则不存在: ${category}.${ruleName}`);
      return { pass: true, rule: `${category}.${ruleName}` };
    }

    try {
      const result = this.rules[category][ruleName](data, options);
      return {
        ...result,
        rule: `${category}.${ruleName}`,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error(`规则执行失败: ${category}.${ruleName}`, error);
      return {
        pass: false,
        error: error.message,
        rule: `${category}.${ruleName}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 批量检查规则
   * @param {Array} checks - 检查列表 [{category, rule, data, options}]
   */
  batchCheck(checks) {
    const results = [];
    const issues = [];

    for (const check of checks) {
      const result = this.check(
        check.category,
        check.rule,
        check.data,
        check.options
      );
      results.push(result);
      if (!result.pass) {
        issues.push(result);
      }
    }

    return {
      allPassed: issues.length === 0,
      results,
      issues,
      issueCount: issues.length
    };
  }

  /**
   * 评估数据复杂度
   * @param {*} data - 数据
   * @param {number} sourceCount - 数据源数量
   */
  assessComplexity(data, sourceCount = 1) {
    let complexity = 'simple';

    // 多源数据 → 复杂
    if (sourceCount >= 2) {
      complexity = 'complex';
    }

    // 数据量大 → 复杂
    if (Array.isArray(data) && data.length > 100) {
      complexity = 'complex';
    }

    // 嵌套层级深 → 复杂
    if (typeof data === 'object') {
      const depth = this.getObjectDepth(data);
      if (depth > 3) {
        complexity = 'complex';
      }
    }

    return complexity;
  }

  /**
   * 获取对象深度
   */
  getObjectDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }
    let maxDepth = depth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const childDepth = this.getObjectDepth(obj[key], depth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    return maxDepth;
  }
}

module.exports = new RuleEngine();








