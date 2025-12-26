/**
 * 数据真实性校验器
 * 核心：防止假数据进入前端
 */

const ruleEngine = require('../rule-engine/rule-engine');
const aiHub = require('../ai-hub/ai-hub');
const logger = require('../utils/logger');
const config = require('../config/config');

class DataTruthValidator {
  constructor() {
    this.validationCache = new Map();
  }

  /**
   * 验证数据真实性
   * @param {*} data - 数据
   * @param {Array} sources - 数据源列表
   * @param {object} options - 选项
   */
  async validate(data, sources = [], options = {}) {
    const startTime = Date.now();

    // 1. 基础检查
    const basicCheck = this.basicValidation(data, sources);
    if (!basicCheck.pass) {
      return this.buildResult('invalid', 0, basicCheck.issues, sources);
    }

    // 2. 规则引擎检查
    const ruleResults = this.ruleValidation(data, options);
    if (!ruleResults.allPassed) {
      // 有规则违反，但可能不是致命错误
      const severity = this.getMaxSeverity(ruleResults.issues);
      if (severity === 'high') {
        return this.buildResult('invalid', 0.2, ruleResults.issues, sources);
      }
    }

    // 3. 多源交叉验证
    let multiSourceResult = null;
    if (sources.length >= 2) {
      multiSourceResult = await this.multiSourceValidation(data, sources);
      if (!multiSourceResult.consistent) {
        // 多源不一致，需要AI判断
        const aiResult = await aiHub.analyze('truth_analysis', data, {
          complexity: 'complex',
          sourceCount: sources.length,
          hasConflict: true,
          sources,
          rules: ruleResults
        });

        if (aiResult.used && aiResult.result) {
          try {
            const aiAnalysis = JSON.parse(aiResult.result.content);
            return this.buildResult(
              aiAnalysis.truth_status || 'suspect',
              aiAnalysis.confidence || 0.5,
              aiAnalysis.issues || multiSourceResult.conflicts,
              sources,
              aiAnalysis.recommendation
            );
          } catch (e) {
            // AI返回不是JSON，使用默认处理
          }
        }

        return this.buildResult('suspect', 0.4, multiSourceResult.conflicts, sources);
      }
    }

    // 4. 时间戳和状态连续性检查
    const timeCheck = ruleEngine.check('truth', 'timestampMonotonic', data);
    const statusCheck = ruleEngine.check('truth', 'statusContinuity', data);

    if (!timeCheck.pass || !statusCheck.pass) {
      const issues = [];
      if (!timeCheck.pass) issues.push(timeCheck.issue);
      if (!statusCheck.pass) issues.push(statusCheck.issue);

      // 时间戳或状态问题，可能需要AI分析
      if (options.requireAI || sources.length >= 2) {
        const aiResult = await aiHub.analyze('truth_analysis', data, {
          complexity: 'complex',
          sourceCount: sources.length,
          needsAnalysis: true,
          sources,
          rules: { timeCheck, statusCheck }
        });

        if (aiResult.used && aiResult.result) {
          try {
            const aiAnalysis = JSON.parse(aiResult.result.content);
            return this.buildResult(
              aiAnalysis.truth_status || 'suspect',
              aiAnalysis.confidence || 0.5,
              aiAnalysis.issues || issues,
              sources
            );
          } catch (e) {
            logger.warn('AI分析结果解析失败，使用默认结果', e.message);
          }
        }
      }

      return this.buildResult('suspect', 0.5, issues, sources);
    }

    // 5. 所有检查通过
    const confidence = this.calculateConfidence(ruleResults, multiSourceResult, sources.length);
    const validationTime = Date.now() - startTime;

    logger.info(`数据验证完成: ${confidence.toFixed(2)} 置信度, 耗时 ${validationTime}ms`);

    return this.buildResult('verified', confidence, [], sources);
  }

  /**
   * 基础验证
   */
  basicValidation(data, sources) {
    const issues = [];

    // 检查数据是否为空
    const emptyCheck = ruleEngine.check('completeness', 'nonEmpty', data);
    if (!emptyCheck.pass) {
      issues.push(emptyCheck.issue);
      return { pass: false, issues };
    }

    // 检查数据源
    if (sources.length === 0) {
      issues.push('无数据源信息');
      return { pass: false, issues };
    }

    return { pass: true, issues: [] };
  }

  /**
   * 规则验证
   */
  ruleValidation(data, options) {
    const checks = [];

    // 时间戳检查
    if (Array.isArray(data)) {
      checks.push({
        category: 'truth',
        rule: 'timestampMonotonic',
        data
      });
      checks.push({
        category: 'truth',
        rule: 'statusContinuity',
        data
      });
    }

    // 比分合理性检查
    if (data.score) {
      checks.push({
        category: 'truth',
        rule: 'scoreRationality',
        data
      });
    }

    // 必需字段检查
    if (options.requiredFields) {
      checks.push({
        category: 'completeness',
        rule: 'requiredFields',
        data,
        options: { requiredFields: options.requiredFields }
      });
    }

    return ruleEngine.batchCheck(checks);
  }

  /**
   * 多源交叉验证
   */
  async multiSourceValidation(data, sources) {
    // 简化实现：检查多个源的数据是否一致
    // 实际应用中需要更复杂的比对逻辑

    const conflicts = [];
    const sourceData = {};

    // 收集各源数据
    for (const source of sources) {
      if (source.data) {
        sourceData[source.id] = source.data;
      }
    }

    // 比对关键字段
    const keys = ['timestamp', 'status', 'score'];
    for (const key of keys) {
      const values = Object.values(sourceData).map(d => d[key]).filter(v => v !== undefined);
      if (values.length > 1) {
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length > 1) {
          conflicts.push(`字段 ${key} 在不同源中不一致: ${uniqueValues.join(', ')}`);
        }
      }
    }

    return {
      consistent: conflicts.length === 0,
      conflicts
    };
  }

  /**
   * 计算置信度
   */
  calculateConfidence(ruleResults, multiSourceResult, sourceCount) {
    let confidence = 1.0;

    // 规则违反降低置信度
    if (ruleResults.issues.length > 0) {
      const highSeverityCount = ruleResults.issues.filter(i => i.severity === 'high').length;
      const mediumSeverityCount = ruleResults.issues.filter(i => i.severity === 'medium').length;
      confidence -= highSeverityCount * 0.3;
      confidence -= mediumSeverityCount * 0.1;
    }

    // 多源一致性提高置信度
    if (sourceCount >= 2 && multiSourceResult && multiSourceResult.consistent) {
      confidence = Math.min(1.0, confidence + 0.2);
    }

    // 多源数量提高置信度
    if (sourceCount >= 3) {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 获取最高严重程度
   */
  getMaxSeverity(issues) {
    if (issues.some(i => i.severity === 'high')) return 'high';
    if (issues.some(i => i.severity === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * 构建验证结果
   */
  buildResult(status, confidence, issues, sources, recommendation = null) {
    return {
      truth_status: status, // verified | suspect | invalid
      confidence: Math.max(0, Math.min(1, confidence)),
      issues,
      sources: sources.map(s => ({
        id: s.id || 'unknown',
        type: s.type || 'unknown',
        timestamp: s.timestamp || Date.now()
      })),
      source_summary: `${sources.length} 个数据源`,
      recommendation,
      validated_at: Date.now()
    };
  }
}

module.exports = new DataTruthValidator();














































