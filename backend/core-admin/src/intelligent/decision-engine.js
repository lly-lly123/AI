/**
 * 智能决策引擎
 * 基于规则和AI的自动决策系统
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const ruleEngine = require('../rule-engine/rule-engine');
const learningEngine = require('../learning/learning-engine');

class DecisionEngine {
  constructor() {
    this.decisionHistory = [];
    this.decisionRules = this.initializeRules();
    this.confidenceThreshold = 0.7; // 置信度阈值
  }

  /**
   * 初始化决策规则
   */
  initializeRules() {
    return {
      // 系统健康相关决策
      systemHealth: {
        critical: {
          action: 'immediate_intervention',
          autoExecute: true,
          requiresConfirmation: false
        },
        high: {
          action: 'alert_and_monitor',
          autoExecute: false,
          requiresConfirmation: false
        },
        medium: {
          action: 'schedule_maintenance',
          autoExecute: true,
          requiresConfirmation: false
        },
        low: {
          action: 'log_and_continue',
          autoExecute: true,
          requiresConfirmation: false
        }
      },
      
      // API相关决策
      apiHealth: {
        unavailable: {
          action: 'enable_fallback',
          autoExecute: true,
          requiresConfirmation: false
        },
        slow: {
          action: 'optimize_or_cache',
          autoExecute: true,
          requiresConfirmation: false
        },
        errorRate: {
          action: 'investigate_and_fix',
          autoExecute: false,
          requiresConfirmation: true
        }
      },
      
      // 数据质量相关决策
      dataQuality: {
        poor: {
          action: 'cleanup_and_validate',
          autoExecute: true,
          requiresConfirmation: false
        },
        duplicate: {
          action: 'merge_or_remove',
          autoExecute: false,
          requiresConfirmation: true
        },
        incomplete: {
          action: 'notify_user',
          autoExecute: true,
          requiresConfirmation: false
        }
      },
      
      // 用户行为相关决策
      userBehavior: {
        suspicious: {
          action: 'restrict_access',
          autoExecute: false,
          requiresConfirmation: true
        },
        abusive: {
          action: 'ban_user',
          autoExecute: false,
          requiresConfirmation: true
        },
        inactive: {
          action: 'send_notification',
          autoExecute: true,
          requiresConfirmation: false
        }
      }
    };
  }

  /**
   * 智能决策主入口
   * @param {string} category - 决策类别
   * @param {object} context - 决策上下文
   * @param {object} options - 决策选项
   */
  async makeDecision(category, context, options = {}) {
    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. 规则引擎决策
      const ruleDecision = this.applyRules(category, context);
      
      // 2. 学习引擎查找相似历史
      const similarDecisions = await this.findSimilarDecisions(category, context);
      
      // 3. 判断是否需要AI辅助
      const needsAI = this.shouldUseAI(ruleDecision, similarDecisions, context);
      
      let finalDecision;
      if (needsAI) {
        // 使用AI增强决策
        finalDecision = await this.aiEnhancedDecision(category, context, ruleDecision, similarDecisions);
      } else {
        // 使用规则和历史的组合决策
        finalDecision = this.combineDecisions(ruleDecision, similarDecisions);
      }
      
      // 4. 记录决策
      const decisionRecord = {
        id: decisionId,
        category,
        context,
        ruleDecision,
        similarDecisions: similarDecisions.map(d => d.id),
        finalDecision,
        timestamp: Date.now(),
        executed: false
      };
      
      this.decisionHistory.push(decisionRecord);
      
      // 5. 自动执行（如果允许）
      if (finalDecision.autoExecute && finalDecision.confidence >= this.confidenceThreshold) {
        const executionResult = await this.executeDecision(finalDecision, context);
        decisionRecord.executed = true;
        decisionRecord.executionResult = executionResult;
        
        // 记录到学习引擎
        learningEngine.recordDecision(finalDecision.action, context, 'auto');
      }
      
      // 只保留最近1000条决策记录
      if (this.decisionHistory.length > 1000) {
        this.decisionHistory.shift();
      }
      
      logger.info(`决策完成: ${category} - ${finalDecision.action}`, {
        confidence: finalDecision.confidence,
        autoExecute: finalDecision.autoExecute
      });
      
      return {
        decision: finalDecision,
        record: decisionRecord
      };
    } catch (error) {
      logger.error('决策失败', error);
      throw error;
    }
  }

  /**
   * 应用规则引擎
   */
  applyRules(category, context) {
    const rules = this.decisionRules[category];
    if (!rules) {
      return {
        action: 'no_action',
        confidence: 0.5,
        reason: '未找到匹配的规则',
        autoExecute: false
      };
    }
    
    // 根据上下文确定严重程度
    const severity = this.determineSeverity(category, context);
    const rule = rules[severity];
    
    if (!rule) {
      return {
        action: 'monitor',
        confidence: 0.6,
        reason: '规则匹配但无明确动作',
        autoExecute: false
      };
    }
    
    return {
      ...rule,
      confidence: 0.8,
      reason: `规则引擎: ${severity}级别`,
      severity
    };
  }

  /**
   * 确定严重程度
   */
  determineSeverity(category, context) {
    if (category === 'systemHealth') {
      const health = context.health || 1.0;
      if (health < 0.5) return 'critical';
      if (health < 0.7) return 'high';
      if (health < 0.9) return 'medium';
      return 'low';
    }
    
    if (category === 'apiHealth') {
      if (context.status === 'down') return 'unavailable';
      if (context.avgResponseTime > 5000) return 'slow';
      if (context.errorRate > 0.1) return 'errorRate';
      return 'healthy';
    }
    
    if (category === 'dataQuality') {
      if (context.score < 0.5) return 'poor';
      if (context.duplicateRate > 0.1) return 'duplicate';
      if (context.completeness < 0.8) return 'incomplete';
      return 'good';
    }
    
    if (category === 'userBehavior') {
      if (context.riskScore > 0.8) return 'abusive';
      if (context.riskScore > 0.6) return 'suspicious';
      return 'normal';
    }
    
    return 'low';
  }

  /**
   * 查找相似历史决策
   */
  async findSimilarDecisions(category, context) {
    const similar = this.decisionHistory
      .filter(d => d.category === category)
      .filter(d => {
        // 简单的相似度计算
        const timeDiff = Math.abs(Date.now() - d.timestamp);
        return timeDiff < 7 * 24 * 60 * 60 * 1000; // 7天内
      })
      .slice(-10); // 最近10条
    
    return similar;
  }

  /**
   * 判断是否需要AI辅助
   */
  shouldUseAI(ruleDecision, similarDecisions, context) {
    // 如果规则决策置信度低
    if (ruleDecision.confidence < 0.6) return true;
    
    // 如果没有相似历史
    if (similarDecisions.length === 0) return true;
    
    // 如果上下文复杂
    if (context.complexity === 'high') return true;
    
    // 如果涉及敏感操作
    if (ruleDecision.requiresConfirmation) return true;
    
    return false;
  }

  /**
   * AI增强决策
   */
  async aiEnhancedDecision(category, context, ruleDecision, similarDecisions) {
    try {
      const prompt = this.buildDecisionPrompt(category, context, ruleDecision, similarDecisions);
      
      const aiResult = await aiHub.analyze('decision_support', null, {
        complexity: 'high',
        needsAnalysis: true,
        prompt,
        context: {
          category,
          ruleDecision,
          similarDecisions: similarDecisions.length,
          context
        }
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const aiDecision = JSON.parse(aiResult.result.content);
          return {
            ...ruleDecision,
            ...aiDecision,
            confidence: Math.max(ruleDecision.confidence, aiDecision.confidence || 0.7),
            source: 'ai_enhanced',
            aiReasoning: aiDecision.reasoning
          };
        } catch (e) {
          // AI返回不是JSON，使用文本分析
          return {
            ...ruleDecision,
            confidence: 0.75,
            source: 'ai_enhanced',
            aiReasoning: aiResult.result.content
          };
        }
      }
    } catch (error) {
      logger.warn('AI决策失败，使用规则决策', error);
    }
    
    return ruleDecision;
  }

  /**
   * 构建决策提示词
   */
  buildDecisionPrompt(category, context, ruleDecision, similarDecisions) {
    return `作为智能管理系统，需要为以下情况做出决策：

类别: ${category}
上下文: ${JSON.stringify(context, null, 2)}
规则建议: ${JSON.stringify(ruleDecision, null, 2)}
历史相似决策数量: ${similarDecisions.length}

请分析情况并返回JSON格式的决策建议：
{
  "action": "建议的动作",
  "confidence": 0.0-1.0,
  "reasoning": "决策理由",
  "autoExecute": true/false,
  "requiresConfirmation": true/false,
  "estimatedImpact": "high/medium/low"
}`;
  }

  /**
   * 组合决策
   */
  combineDecisions(ruleDecision, similarDecisions) {
    if (similarDecisions.length === 0) {
      return ruleDecision;
    }
    
    // 统计历史决策的成功率
    const successfulDecisions = similarDecisions.filter(d => 
      d.executionResult && d.executionResult.success
    );
    
    const successRate = successfulDecisions.length / similarDecisions.length;
    
    // 如果历史决策成功率低，降低置信度
    if (successRate < 0.5) {
      return {
        ...ruleDecision,
        confidence: ruleDecision.confidence * 0.8,
        reason: `${ruleDecision.reason} (历史成功率: ${(successRate * 100).toFixed(1)}%)`
      };
    }
    
    return {
      ...ruleDecision,
      confidence: Math.min(0.95, ruleDecision.confidence + (successRate - 0.5) * 0.2),
      reason: `${ruleDecision.reason} (历史成功率: ${(successRate * 100).toFixed(1)}%)`
    };
  }

  /**
   * 执行决策
   */
  async executeDecision(decision, context) {
    logger.info(`执行决策: ${decision.action}`, { context });
    
    try {
      // 根据动作类型执行相应操作
      switch (decision.action) {
        case 'immediate_intervention':
          return await this.immediateIntervention(context);
        case 'enable_fallback':
          return await this.enableFallback(context);
        case 'optimize_or_cache':
          return await this.optimizeOrCache(context);
        case 'cleanup_and_validate':
          return await this.cleanupAndValidate(context);
        case 'schedule_maintenance':
          return await this.scheduleMaintenance(context);
        default:
          return {
            success: false,
            message: `未知动作: ${decision.action}`
          };
      }
    } catch (error) {
      logger.error('执行决策失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 立即干预
   */
  async immediateIntervention(context) {
    // 实现立即干预逻辑
    logger.warn('执行立即干预', context);
    return { success: true, message: '已执行立即干预' };
  }

  /**
   * 启用降级方案
   */
  async enableFallback(context) {
    logger.info('启用降级方案', context);
    return { success: true, message: '已启用降级方案' };
  }

  /**
   * 优化或缓存
   */
  async optimizeOrCache(context) {
    logger.info('执行优化或缓存', context);
    return { success: true, message: '已执行优化' };
  }

  /**
   * 清理和验证
   */
  async cleanupAndValidate(context) {
    logger.info('执行清理和验证', context);
    return { success: true, message: '已执行清理和验证' };
  }

  /**
   * 安排维护
   */
  async scheduleMaintenance(context) {
    logger.info('安排维护', context);
    return { success: true, message: '已安排维护' };
  }

  /**
   * 获取决策统计
   */
  getStats() {
    const total = this.decisionHistory.length;
    const executed = this.decisionHistory.filter(d => d.executed).length;
    const successful = this.decisionHistory.filter(d => 
      d.executed && d.executionResult && d.executionResult.success
    ).length;
    
    return {
      total,
      executed,
      successful,
      successRate: executed > 0 ? successful / executed : 0,
      byCategory: this.groupByCategory()
    };
  }

  /**
   * 按类别分组
   */
  groupByCategory() {
    const grouped = {};
    this.decisionHistory.forEach(d => {
      if (!grouped[d.category]) {
        grouped[d.category] = 0;
      }
      grouped[d.category]++;
    });
    return grouped;
  }
}

module.exports = new DecisionEngine();






 * 智能决策引擎
 * 基于规则和AI的自动决策系统
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const ruleEngine = require('../rule-engine/rule-engine');
const learningEngine = require('../learning/learning-engine');

class DecisionEngine {
  constructor() {
    this.decisionHistory = [];
    this.decisionRules = this.initializeRules();
    this.confidenceThreshold = 0.7; // 置信度阈值
  }

  /**
   * 初始化决策规则
   */
  initializeRules() {
    return {
      // 系统健康相关决策
      systemHealth: {
        critical: {
          action: 'immediate_intervention',
          autoExecute: true,
          requiresConfirmation: false
        },
        high: {
          action: 'alert_and_monitor',
          autoExecute: false,
          requiresConfirmation: false
        },
        medium: {
          action: 'schedule_maintenance',
          autoExecute: true,
          requiresConfirmation: false
        },
        low: {
          action: 'log_and_continue',
          autoExecute: true,
          requiresConfirmation: false
        }
      },
      
      // API相关决策
      apiHealth: {
        unavailable: {
          action: 'enable_fallback',
          autoExecute: true,
          requiresConfirmation: false
        },
        slow: {
          action: 'optimize_or_cache',
          autoExecute: true,
          requiresConfirmation: false
        },
        errorRate: {
          action: 'investigate_and_fix',
          autoExecute: false,
          requiresConfirmation: true
        }
      },
      
      // 数据质量相关决策
      dataQuality: {
        poor: {
          action: 'cleanup_and_validate',
          autoExecute: true,
          requiresConfirmation: false
        },
        duplicate: {
          action: 'merge_or_remove',
          autoExecute: false,
          requiresConfirmation: true
        },
        incomplete: {
          action: 'notify_user',
          autoExecute: true,
          requiresConfirmation: false
        }
      },
      
      // 用户行为相关决策
      userBehavior: {
        suspicious: {
          action: 'restrict_access',
          autoExecute: false,
          requiresConfirmation: true
        },
        abusive: {
          action: 'ban_user',
          autoExecute: false,
          requiresConfirmation: true
        },
        inactive: {
          action: 'send_notification',
          autoExecute: true,
          requiresConfirmation: false
        }
      }
    };
  }

  /**
   * 智能决策主入口
   * @param {string} category - 决策类别
   * @param {object} context - 决策上下文
   * @param {object} options - 决策选项
   */
  async makeDecision(category, context, options = {}) {
    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. 规则引擎决策
      const ruleDecision = this.applyRules(category, context);
      
      // 2. 学习引擎查找相似历史
      const similarDecisions = await this.findSimilarDecisions(category, context);
      
      // 3. 判断是否需要AI辅助
      const needsAI = this.shouldUseAI(ruleDecision, similarDecisions, context);
      
      let finalDecision;
      if (needsAI) {
        // 使用AI增强决策
        finalDecision = await this.aiEnhancedDecision(category, context, ruleDecision, similarDecisions);
      } else {
        // 使用规则和历史的组合决策
        finalDecision = this.combineDecisions(ruleDecision, similarDecisions);
      }
      
      // 4. 记录决策
      const decisionRecord = {
        id: decisionId,
        category,
        context,
        ruleDecision,
        similarDecisions: similarDecisions.map(d => d.id),
        finalDecision,
        timestamp: Date.now(),
        executed: false
      };
      
      this.decisionHistory.push(decisionRecord);
      
      // 5. 自动执行（如果允许）
      if (finalDecision.autoExecute && finalDecision.confidence >= this.confidenceThreshold) {
        const executionResult = await this.executeDecision(finalDecision, context);
        decisionRecord.executed = true;
        decisionRecord.executionResult = executionResult;
        
        // 记录到学习引擎
        learningEngine.recordDecision(finalDecision.action, context, 'auto');
      }
      
      // 只保留最近1000条决策记录
      if (this.decisionHistory.length > 1000) {
        this.decisionHistory.shift();
      }
      
      logger.info(`决策完成: ${category} - ${finalDecision.action}`, {
        confidence: finalDecision.confidence,
        autoExecute: finalDecision.autoExecute
      });
      
      return {
        decision: finalDecision,
        record: decisionRecord
      };
    } catch (error) {
      logger.error('决策失败', error);
      throw error;
    }
  }

  /**
   * 应用规则引擎
   */
  applyRules(category, context) {
    const rules = this.decisionRules[category];
    if (!rules) {
      return {
        action: 'no_action',
        confidence: 0.5,
        reason: '未找到匹配的规则',
        autoExecute: false
      };
    }
    
    // 根据上下文确定严重程度
    const severity = this.determineSeverity(category, context);
    const rule = rules[severity];
    
    if (!rule) {
      return {
        action: 'monitor',
        confidence: 0.6,
        reason: '规则匹配但无明确动作',
        autoExecute: false
      };
    }
    
    return {
      ...rule,
      confidence: 0.8,
      reason: `规则引擎: ${severity}级别`,
      severity
    };
  }

  /**
   * 确定严重程度
   */
  determineSeverity(category, context) {
    if (category === 'systemHealth') {
      const health = context.health || 1.0;
      if (health < 0.5) return 'critical';
      if (health < 0.7) return 'high';
      if (health < 0.9) return 'medium';
      return 'low';
    }
    
    if (category === 'apiHealth') {
      if (context.status === 'down') return 'unavailable';
      if (context.avgResponseTime > 5000) return 'slow';
      if (context.errorRate > 0.1) return 'errorRate';
      return 'healthy';
    }
    
    if (category === 'dataQuality') {
      if (context.score < 0.5) return 'poor';
      if (context.duplicateRate > 0.1) return 'duplicate';
      if (context.completeness < 0.8) return 'incomplete';
      return 'good';
    }
    
    if (category === 'userBehavior') {
      if (context.riskScore > 0.8) return 'abusive';
      if (context.riskScore > 0.6) return 'suspicious';
      return 'normal';
    }
    
    return 'low';
  }

  /**
   * 查找相似历史决策
   */
  async findSimilarDecisions(category, context) {
    const similar = this.decisionHistory
      .filter(d => d.category === category)
      .filter(d => {
        // 简单的相似度计算
        const timeDiff = Math.abs(Date.now() - d.timestamp);
        return timeDiff < 7 * 24 * 60 * 60 * 1000; // 7天内
      })
      .slice(-10); // 最近10条
    
    return similar;
  }

  /**
   * 判断是否需要AI辅助
   */
  shouldUseAI(ruleDecision, similarDecisions, context) {
    // 如果规则决策置信度低
    if (ruleDecision.confidence < 0.6) return true;
    
    // 如果没有相似历史
    if (similarDecisions.length === 0) return true;
    
    // 如果上下文复杂
    if (context.complexity === 'high') return true;
    
    // 如果涉及敏感操作
    if (ruleDecision.requiresConfirmation) return true;
    
    return false;
  }

  /**
   * AI增强决策
   */
  async aiEnhancedDecision(category, context, ruleDecision, similarDecisions) {
    try {
      const prompt = this.buildDecisionPrompt(category, context, ruleDecision, similarDecisions);
      
      const aiResult = await aiHub.analyze('decision_support', null, {
        complexity: 'high',
        needsAnalysis: true,
        prompt,
        context: {
          category,
          ruleDecision,
          similarDecisions: similarDecisions.length,
          context
        }
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const aiDecision = JSON.parse(aiResult.result.content);
          return {
            ...ruleDecision,
            ...aiDecision,
            confidence: Math.max(ruleDecision.confidence, aiDecision.confidence || 0.7),
            source: 'ai_enhanced',
            aiReasoning: aiDecision.reasoning
          };
        } catch (e) {
          // AI返回不是JSON，使用文本分析
          return {
            ...ruleDecision,
            confidence: 0.75,
            source: 'ai_enhanced',
            aiReasoning: aiResult.result.content
          };
        }
      }
    } catch (error) {
      logger.warn('AI决策失败，使用规则决策', error);
    }
    
    return ruleDecision;
  }

  /**
   * 构建决策提示词
   */
  buildDecisionPrompt(category, context, ruleDecision, similarDecisions) {
    return `作为智能管理系统，需要为以下情况做出决策：

类别: ${category}
上下文: ${JSON.stringify(context, null, 2)}
规则建议: ${JSON.stringify(ruleDecision, null, 2)}
历史相似决策数量: ${similarDecisions.length}

请分析情况并返回JSON格式的决策建议：
{
  "action": "建议的动作",
  "confidence": 0.0-1.0,
  "reasoning": "决策理由",
  "autoExecute": true/false,
  "requiresConfirmation": true/false,
  "estimatedImpact": "high/medium/low"
}`;
  }

  /**
   * 组合决策
   */
  combineDecisions(ruleDecision, similarDecisions) {
    if (similarDecisions.length === 0) {
      return ruleDecision;
    }
    
    // 统计历史决策的成功率
    const successfulDecisions = similarDecisions.filter(d => 
      d.executionResult && d.executionResult.success
    );
    
    const successRate = successfulDecisions.length / similarDecisions.length;
    
    // 如果历史决策成功率低，降低置信度
    if (successRate < 0.5) {
      return {
        ...ruleDecision,
        confidence: ruleDecision.confidence * 0.8,
        reason: `${ruleDecision.reason} (历史成功率: ${(successRate * 100).toFixed(1)}%)`
      };
    }
    
    return {
      ...ruleDecision,
      confidence: Math.min(0.95, ruleDecision.confidence + (successRate - 0.5) * 0.2),
      reason: `${ruleDecision.reason} (历史成功率: ${(successRate * 100).toFixed(1)}%)`
    };
  }

  /**
   * 执行决策
   */
  async executeDecision(decision, context) {
    logger.info(`执行决策: ${decision.action}`, { context });
    
    try {
      // 根据动作类型执行相应操作
      switch (decision.action) {
        case 'immediate_intervention':
          return await this.immediateIntervention(context);
        case 'enable_fallback':
          return await this.enableFallback(context);
        case 'optimize_or_cache':
          return await this.optimizeOrCache(context);
        case 'cleanup_and_validate':
          return await this.cleanupAndValidate(context);
        case 'schedule_maintenance':
          return await this.scheduleMaintenance(context);
        default:
          return {
            success: false,
            message: `未知动作: ${decision.action}`
          };
      }
    } catch (error) {
      logger.error('执行决策失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 立即干预
   */
  async immediateIntervention(context) {
    // 实现立即干预逻辑
    logger.warn('执行立即干预', context);
    return { success: true, message: '已执行立即干预' };
  }

  /**
   * 启用降级方案
   */
  async enableFallback(context) {
    logger.info('启用降级方案', context);
    return { success: true, message: '已启用降级方案' };
  }

  /**
   * 优化或缓存
   */
  async optimizeOrCache(context) {
    logger.info('执行优化或缓存', context);
    return { success: true, message: '已执行优化' };
  }

  /**
   * 清理和验证
   */
  async cleanupAndValidate(context) {
    logger.info('执行清理和验证', context);
    return { success: true, message: '已执行清理和验证' };
  }

  /**
   * 安排维护
   */
  async scheduleMaintenance(context) {
    logger.info('安排维护', context);
    return { success: true, message: '已安排维护' };
  }

  /**
   * 获取决策统计
   */
  getStats() {
    const total = this.decisionHistory.length;
    const executed = this.decisionHistory.filter(d => d.executed).length;
    const successful = this.decisionHistory.filter(d => 
      d.executed && d.executionResult && d.executionResult.success
    ).length;
    
    return {
      total,
      executed,
      successful,
      successRate: executed > 0 ? successful / executed : 0,
      byCategory: this.groupByCategory()
    };
  }

  /**
   * 按类别分组
   */
  groupByCategory() {
    const grouped = {};
    this.decisionHistory.forEach(d => {
      if (!grouped[d.category]) {
        grouped[d.category] = 0;
      }
      grouped[d.category]++;
    });
    return grouped;
  }
}

module.exports = new DecisionEngine();






 * 智能决策引擎
 * 基于规则和AI的自动决策系统
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const ruleEngine = require('../rule-engine/rule-engine');
const learningEngine = require('../learning/learning-engine');

class DecisionEngine {
  constructor() {
    this.decisionHistory = [];
    this.decisionRules = this.initializeRules();
    this.confidenceThreshold = 0.7; // 置信度阈值
  }

  /**
   * 初始化决策规则
   */
  initializeRules() {
    return {
      // 系统健康相关决策
      systemHealth: {
        critical: {
          action: 'immediate_intervention',
          autoExecute: true,
          requiresConfirmation: false
        },
        high: {
          action: 'alert_and_monitor',
          autoExecute: false,
          requiresConfirmation: false
        },
        medium: {
          action: 'schedule_maintenance',
          autoExecute: true,
          requiresConfirmation: false
        },
        low: {
          action: 'log_and_continue',
          autoExecute: true,
          requiresConfirmation: false
        }
      },
      
      // API相关决策
      apiHealth: {
        unavailable: {
          action: 'enable_fallback',
          autoExecute: true,
          requiresConfirmation: false
        },
        slow: {
          action: 'optimize_or_cache',
          autoExecute: true,
          requiresConfirmation: false
        },
        errorRate: {
          action: 'investigate_and_fix',
          autoExecute: false,
          requiresConfirmation: true
        }
      },
      
      // 数据质量相关决策
      dataQuality: {
        poor: {
          action: 'cleanup_and_validate',
          autoExecute: true,
          requiresConfirmation: false
        },
        duplicate: {
          action: 'merge_or_remove',
          autoExecute: false,
          requiresConfirmation: true
        },
        incomplete: {
          action: 'notify_user',
          autoExecute: true,
          requiresConfirmation: false
        }
      },
      
      // 用户行为相关决策
      userBehavior: {
        suspicious: {
          action: 'restrict_access',
          autoExecute: false,
          requiresConfirmation: true
        },
        abusive: {
          action: 'ban_user',
          autoExecute: false,
          requiresConfirmation: true
        },
        inactive: {
          action: 'send_notification',
          autoExecute: true,
          requiresConfirmation: false
        }
      }
    };
  }

  /**
   * 智能决策主入口
   * @param {string} category - 决策类别
   * @param {object} context - 决策上下文
   * @param {object} options - 决策选项
   */
  async makeDecision(category, context, options = {}) {
    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. 规则引擎决策
      const ruleDecision = this.applyRules(category, context);
      
      // 2. 学习引擎查找相似历史
      const similarDecisions = await this.findSimilarDecisions(category, context);
      
      // 3. 判断是否需要AI辅助
      const needsAI = this.shouldUseAI(ruleDecision, similarDecisions, context);
      
      let finalDecision;
      if (needsAI) {
        // 使用AI增强决策
        finalDecision = await this.aiEnhancedDecision(category, context, ruleDecision, similarDecisions);
      } else {
        // 使用规则和历史的组合决策
        finalDecision = this.combineDecisions(ruleDecision, similarDecisions);
      }
      
      // 4. 记录决策
      const decisionRecord = {
        id: decisionId,
        category,
        context,
        ruleDecision,
        similarDecisions: similarDecisions.map(d => d.id),
        finalDecision,
        timestamp: Date.now(),
        executed: false
      };
      
      this.decisionHistory.push(decisionRecord);
      
      // 5. 自动执行（如果允许）
      if (finalDecision.autoExecute && finalDecision.confidence >= this.confidenceThreshold) {
        const executionResult = await this.executeDecision(finalDecision, context);
        decisionRecord.executed = true;
        decisionRecord.executionResult = executionResult;
        
        // 记录到学习引擎
        learningEngine.recordDecision(finalDecision.action, context, 'auto');
      }
      
      // 只保留最近1000条决策记录
      if (this.decisionHistory.length > 1000) {
        this.decisionHistory.shift();
      }
      
      logger.info(`决策完成: ${category} - ${finalDecision.action}`, {
        confidence: finalDecision.confidence,
        autoExecute: finalDecision.autoExecute
      });
      
      return {
        decision: finalDecision,
        record: decisionRecord
      };
    } catch (error) {
      logger.error('决策失败', error);
      throw error;
    }
  }

  /**
   * 应用规则引擎
   */
  applyRules(category, context) {
    const rules = this.decisionRules[category];
    if (!rules) {
      return {
        action: 'no_action',
        confidence: 0.5,
        reason: '未找到匹配的规则',
        autoExecute: false
      };
    }
    
    // 根据上下文确定严重程度
    const severity = this.determineSeverity(category, context);
    const rule = rules[severity];
    
    if (!rule) {
      return {
        action: 'monitor',
        confidence: 0.6,
        reason: '规则匹配但无明确动作',
        autoExecute: false
      };
    }
    
    return {
      ...rule,
      confidence: 0.8,
      reason: `规则引擎: ${severity}级别`,
      severity
    };
  }

  /**
   * 确定严重程度
   */
  determineSeverity(category, context) {
    if (category === 'systemHealth') {
      const health = context.health || 1.0;
      if (health < 0.5) return 'critical';
      if (health < 0.7) return 'high';
      if (health < 0.9) return 'medium';
      return 'low';
    }
    
    if (category === 'apiHealth') {
      if (context.status === 'down') return 'unavailable';
      if (context.avgResponseTime > 5000) return 'slow';
      if (context.errorRate > 0.1) return 'errorRate';
      return 'healthy';
    }
    
    if (category === 'dataQuality') {
      if (context.score < 0.5) return 'poor';
      if (context.duplicateRate > 0.1) return 'duplicate';
      if (context.completeness < 0.8) return 'incomplete';
      return 'good';
    }
    
    if (category === 'userBehavior') {
      if (context.riskScore > 0.8) return 'abusive';
      if (context.riskScore > 0.6) return 'suspicious';
      return 'normal';
    }
    
    return 'low';
  }

  /**
   * 查找相似历史决策
   */
  async findSimilarDecisions(category, context) {
    const similar = this.decisionHistory
      .filter(d => d.category === category)
      .filter(d => {
        // 简单的相似度计算
        const timeDiff = Math.abs(Date.now() - d.timestamp);
        return timeDiff < 7 * 24 * 60 * 60 * 1000; // 7天内
      })
      .slice(-10); // 最近10条
    
    return similar;
  }

  /**
   * 判断是否需要AI辅助
   */
  shouldUseAI(ruleDecision, similarDecisions, context) {
    // 如果规则决策置信度低
    if (ruleDecision.confidence < 0.6) return true;
    
    // 如果没有相似历史
    if (similarDecisions.length === 0) return true;
    
    // 如果上下文复杂
    if (context.complexity === 'high') return true;
    
    // 如果涉及敏感操作
    if (ruleDecision.requiresConfirmation) return true;
    
    return false;
  }

  /**
   * AI增强决策
   */
  async aiEnhancedDecision(category, context, ruleDecision, similarDecisions) {
    try {
      const prompt = this.buildDecisionPrompt(category, context, ruleDecision, similarDecisions);
      
      const aiResult = await aiHub.analyze('decision_support', null, {
        complexity: 'high',
        needsAnalysis: true,
        prompt,
        context: {
          category,
          ruleDecision,
          similarDecisions: similarDecisions.length,
          context
        }
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const aiDecision = JSON.parse(aiResult.result.content);
          return {
            ...ruleDecision,
            ...aiDecision,
            confidence: Math.max(ruleDecision.confidence, aiDecision.confidence || 0.7),
            source: 'ai_enhanced',
            aiReasoning: aiDecision.reasoning
          };
        } catch (e) {
          // AI返回不是JSON，使用文本分析
          return {
            ...ruleDecision,
            confidence: 0.75,
            source: 'ai_enhanced',
            aiReasoning: aiResult.result.content
          };
        }
      }
    } catch (error) {
      logger.warn('AI决策失败，使用规则决策', error);
    }
    
    return ruleDecision;
  }

  /**
   * 构建决策提示词
   */
  buildDecisionPrompt(category, context, ruleDecision, similarDecisions) {
    return `作为智能管理系统，需要为以下情况做出决策：

类别: ${category}
上下文: ${JSON.stringify(context, null, 2)}
规则建议: ${JSON.stringify(ruleDecision, null, 2)}
历史相似决策数量: ${similarDecisions.length}

请分析情况并返回JSON格式的决策建议：
{
  "action": "建议的动作",
  "confidence": 0.0-1.0,
  "reasoning": "决策理由",
  "autoExecute": true/false,
  "requiresConfirmation": true/false,
  "estimatedImpact": "high/medium/low"
}`;
  }

  /**
   * 组合决策
   */
  combineDecisions(ruleDecision, similarDecisions) {
    if (similarDecisions.length === 0) {
      return ruleDecision;
    }
    
    // 统计历史决策的成功率
    const successfulDecisions = similarDecisions.filter(d => 
      d.executionResult && d.executionResult.success
    );
    
    const successRate = successfulDecisions.length / similarDecisions.length;
    
    // 如果历史决策成功率低，降低置信度
    if (successRate < 0.5) {
      return {
        ...ruleDecision,
        confidence: ruleDecision.confidence * 0.8,
        reason: `${ruleDecision.reason} (历史成功率: ${(successRate * 100).toFixed(1)}%)`
      };
    }
    
    return {
      ...ruleDecision,
      confidence: Math.min(0.95, ruleDecision.confidence + (successRate - 0.5) * 0.2),
      reason: `${ruleDecision.reason} (历史成功率: ${(successRate * 100).toFixed(1)}%)`
    };
  }

  /**
   * 执行决策
   */
  async executeDecision(decision, context) {
    logger.info(`执行决策: ${decision.action}`, { context });
    
    try {
      // 根据动作类型执行相应操作
      switch (decision.action) {
        case 'immediate_intervention':
          return await this.immediateIntervention(context);
        case 'enable_fallback':
          return await this.enableFallback(context);
        case 'optimize_or_cache':
          return await this.optimizeOrCache(context);
        case 'cleanup_and_validate':
          return await this.cleanupAndValidate(context);
        case 'schedule_maintenance':
          return await this.scheduleMaintenance(context);
        default:
          return {
            success: false,
            message: `未知动作: ${decision.action}`
          };
      }
    } catch (error) {
      logger.error('执行决策失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 立即干预
   */
  async immediateIntervention(context) {
    // 实现立即干预逻辑
    logger.warn('执行立即干预', context);
    return { success: true, message: '已执行立即干预' };
  }

  /**
   * 启用降级方案
   */
  async enableFallback(context) {
    logger.info('启用降级方案', context);
    return { success: true, message: '已启用降级方案' };
  }

  /**
   * 优化或缓存
   */
  async optimizeOrCache(context) {
    logger.info('执行优化或缓存', context);
    return { success: true, message: '已执行优化' };
  }

  /**
   * 清理和验证
   */
  async cleanupAndValidate(context) {
    logger.info('执行清理和验证', context);
    return { success: true, message: '已执行清理和验证' };
  }

  /**
   * 安排维护
   */
  async scheduleMaintenance(context) {
    logger.info('安排维护', context);
    return { success: true, message: '已安排维护' };
  }

  /**
   * 获取决策统计
   */
  getStats() {
    const total = this.decisionHistory.length;
    const executed = this.decisionHistory.filter(d => d.executed).length;
    const successful = this.decisionHistory.filter(d => 
      d.executed && d.executionResult && d.executionResult.success
    ).length;
    
    return {
      total,
      executed,
      successful,
      successRate: executed > 0 ? successful / executed : 0,
      byCategory: this.groupByCategory()
    };
  }

  /**
   * 按类别分组
   */
  groupByCategory() {
    const grouped = {};
    this.decisionHistory.forEach(d => {
      if (!grouped[d.category]) {
        grouped[d.category] = 0;
      }
      grouped[d.category]++;
    });
    return grouped;
  }
}

module.exports = new DecisionEngine();






