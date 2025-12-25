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
      
      // 3. AI辅助建议（可选）
      let aiSuggestion = null;
      if (options.useAI !== false) {
        aiSuggestion = await this.getAISuggestion(category, context, ruleDecision);
      }
      
      // 4. 综合决策
      const finalDecision = this.combineDecisions(ruleDecision, aiSuggestion, similarDecisions);
      
      // 5. 记录决策
      this.decisionHistory.push({
        id: decisionId,
        category,
        context,
        ruleDecision,
        aiSuggestion,
        similarDecisions,
        finalDecision,
        timestamp: Date.now(),
        executed: false
      });
      
      return {
        id: decisionId,
        ruleDecision,
        aiSuggestion,
        finalDecision
      };
    } catch (error) {
      logger.error('决策失败', { category, error });
      throw error;
    }
  }

  /**
   * 应用规则
   */
  applyRules(category, context) {
    const rules = this.decisionRules[category];
    if (!rules) {
      return null;
    }
    
    const severity = context.severity || context.level || 'low';
    const rule = rules[severity] || rules.low;
    
    return {
      ...rule,
      source: 'rule_engine',
      confidence: 0.8
    };
  }

  /**
   * 查找相似决策
   */
  async findSimilarDecisions(category, context) {
    try {
      return await learningEngine.findSimilarDecisions(category, context);
    } catch (error) {
      logger.warn('查找相似决策失败', error);
      return [];
    }
  }

  /**
   * 获取AI建议
   */
  async getAISuggestion(category, context, ruleDecision) {
    try {
      const prompt = `
        你是智能决策助手，请根据以下信息给出决策建议：
        类别: ${category}
        上下文: ${JSON.stringify(context)}
        规则决策: ${JSON.stringify(ruleDecision)}
      `;
      
      const aiResult = await aiHub.generate({
        prompt,
        maxTokens: 200,
        temperature: 0.3
      });
      
      if (!aiResult || !aiResult.text) {
        return null;
      }
      
      return {
        source: 'ai',
        suggestion: aiResult.text,
        confidence: aiResult.confidence || 0.6
      };
    } catch (error) {
      logger.warn('获取AI建议失败', error);
      return null;
    }
  }

  /**
   * 综合决策
   */
  combineDecisions(ruleDecision, aiSuggestion, similarDecisions) {
    // 基础：规则决策为主
    let final = ruleDecision || { action: 'log_and_continue', source: 'default' };
    
    // 如果AI置信度高于阈值，且提供了更具体的建议，合并提示
    if (aiSuggestion && aiSuggestion.confidence >= this.confidenceThreshold) {
      final = {
        ...final,
        aiSuggestion: aiSuggestion.suggestion,
        aiConfidence: aiSuggestion.confidence
      };
    }
    
    // 类似决策参考（不覆盖，仅记录）
    const references = similarDecisions && similarDecisions.length > 0
      ? similarDecisions.slice(0, 3)
      : [];
    
    return {
      ...final,
      references
    };
  }

  /**
   * 执行决策
   */
  async executeDecision(decisionId) {
    const decision = this.decisionHistory.find(d => d.id === decisionId);
    if (!decision) {
      throw new Error('决策不存在');
    }
    
    try {
      const result = await ruleEngine.execute(decision.finalDecision.action, decision.context);
      decision.executed = true;
      decision.executionResult = result;
      return result;
    } catch (error) {
      logger.error('执行决策失败', error);
      decision.executed = true;
      decision.executionResult = { success: false, error: error.message };
      throw error;
    }
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
      
      // 3. AI辅助建议（可选）
      let aiSuggestion = null;
      if (options.useAI !== false) {
        aiSuggestion = await this.getAISuggestion(category, context, ruleDecision);
      }
      
      // 4. 综合决策
      const finalDecision = this.combineDecisions(ruleDecision, aiSuggestion, similarDecisions);
      
      // 5. 记录决策
      this.decisionHistory.push({
        id: decisionId,
        category,
        context,
        ruleDecision,
        aiSuggestion,
        similarDecisions,
        finalDecision,
        timestamp: Date.now(),
        executed: false
      });
      
      return {
        id: decisionId,
        ruleDecision,
        aiSuggestion,
        finalDecision
      };
    } catch (error) {
      logger.error('决策失败', { category, error });
      throw error;
    }
  }

  /**
   * 应用规则
   */
  applyRules(category, context) {
    const rules = this.decisionRules[category];
    if (!rules) {
      return null;
    }
    
    const severity = context.severity || context.level || 'low';
    const rule = rules[severity] || rules.low;
    
    return {
      ...rule,
      source: 'rule_engine',
      confidence: 0.8
    };
  }

  /**
   * 查找相似决策
   */
  async findSimilarDecisions(category, context) {
    try {
      return await learningEngine.findSimilarDecisions(category, context);
    } catch (error) {
      logger.warn('查找相似决策失败', error);
      return [];
    }
  }

  /**
   * 获取AI建议
   */
  async getAISuggestion(category, context, ruleDecision) {
    try {
      const prompt = `
        你是智能决策助手，请根据以下信息给出决策建议：
        类别: ${category}
        上下文: ${JSON.stringify(context)}
        规则决策: ${JSON.stringify(ruleDecision)}
      `;
      
      const aiResult = await aiHub.generate({
        prompt,
        maxTokens: 200,
        temperature: 0.3
      });
      
      if (!aiResult || !aiResult.text) {
        return null;
      }
      
      return {
        source: 'ai',
        suggestion: aiResult.text,
        confidence: aiResult.confidence || 0.6
      };
    } catch (error) {
      logger.warn('获取AI建议失败', error);
      return null;
    }
  }

  /**
   * 综合决策
   */
  combineDecisions(ruleDecision, aiSuggestion, similarDecisions) {
    // 基础：规则决策为主
    let final = ruleDecision || { action: 'log_and_continue', source: 'default' };
    
    // 如果AI置信度高于阈值，且提供了更具体的建议，合并提示
    if (aiSuggestion && aiSuggestion.confidence >= this.confidenceThreshold) {
      final = {
        ...final,
        aiSuggestion: aiSuggestion.suggestion,
        aiConfidence: aiSuggestion.confidence
      };
    }
    
    // 类似决策参考（不覆盖，仅记录）
    const references = similarDecisions && similarDecisions.length > 0
      ? similarDecisions.slice(0, 3)
      : [];
    
    return {
      ...final,
      references
    };
  }

  /**
   * 执行决策
   */
  async executeDecision(decisionId) {
    const decision = this.decisionHistory.find(d => d.id === decisionId);
    if (!decision) {
      throw new Error('决策不存在');
    }
    
    try {
      const result = await ruleEngine.execute(decision.finalDecision.action, decision.context);
      decision.executed = true;
      decision.executionResult = result;
      return result;
    } catch (error) {
      logger.error('执行决策失败', error);
      decision.executed = true;
      decision.executionResult = { success: false, error: error.message };
      throw error;
    }
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


















































