/**
 * 智能告警系统
 * 智能分析和分级告警
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const decisionEngine = require('./decision-engine');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.alertRules = this.initializeAlertRules();
    this.alertChannels = {
      log: true,
      email: false,
      webhook: false
    };
  }

  /**
   * 初始化告警规则
   */
  initializeAlertRules() {
    return {
      critical: {
        threshold: 0.9,
        actions: ['immediate_notification', 'auto_intervention'],
        cooldown: 0 // 无冷却时间
      },
      high: {
        threshold: 0.7,
        actions: ['notification', 'monitor'],
        cooldown: 300000 // 5分钟
      },
      medium: {
        threshold: 0.5,
        actions: ['log', 'schedule_check'],
        cooldown: 1800000 // 30分钟
      },
      low: {
        threshold: 0.3,
        actions: ['log'],
        cooldown: 3600000 // 1小时
      }
    };
  }

  /**
   * 创建告警
   */
  async createAlert(type, severity, data, context = {}) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查是否在冷却期内
    const recentAlert = this.findRecentAlert(type, severity);
    if (recentAlert && this.isInCooldown(recentAlert, severity)) {
      logger.debug(`告警在冷却期内，跳过: ${type}`);
      return null;
    }
    
    const alert = {
      id: alertId,
      type,
      severity,
      data,
      context,
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      resolved: false,
      actions: [],
      aiAnalysis: null
    };
    
    this.alerts.push(alert);
    
    // 智能分析告警
    if (severity === 'critical' || severity === 'high') {
      await this.analyzeAlert(alert);
    }
    
    // 执行告警动作
    await this.executeAlertActions(alert);
    
    // 只保留最近1000条告警
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }
    
    logger.warn(`告警创建: ${type} - ${severity}`, { alertId });
    
    return alert;
  }

  /**
   * 查找最近的告警
   */
  findRecentAlert(type, severity) {
    return this.alerts
      .filter(a => a.type === type && a.severity === severity)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 检查是否在冷却期内
   */
  isInCooldown(alert, severity) {
    const rule = this.alertRules[severity];
    if (!rule) return false;
    
    const elapsed = Date.now() - alert.timestamp;
    return elapsed < rule.cooldown;
  }

  /**
   * 分析告警
   */
  async analyzeAlert(alert) {
    try {
      const analysis = await aiHub.analyze('alert_analysis', null, {
        complexity: 'medium',
        needsAnalysis: true,
        data: {
          type: alert.type,
          severity: alert.severity,
          data: alert.data,
          context: alert.context,
          similarAlerts: this.findSimilarAlerts(alert)
        }
      });
      
      if (analysis.used && analysis.result) {
        alert.aiAnalysis = {
          summary: analysis.result.content,
          recommendations: this.extractRecommendations(analysis.result.content),
          confidence: analysis.result.confidence || 0.7
        };
      }
    } catch (error) {
      logger.warn('告警AI分析失败', error);
    }
  }

  /**
   * 查找相似告警
   */
  findSimilarAlerts(alert) {
    return this.alerts
      .filter(a => 
        a.id !== alert.id &&
        a.type === alert.type &&
        (Date.now() - a.timestamp) < 7 * 24 * 60 * 60 * 1000 // 7天内
      )
      .slice(0, 5);
  }

  /**
   * 提取建议
   */
  extractRecommendations(content) {
    // 简化实现：从AI返回的内容中提取建议
    const recommendations = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('建议') || line.includes('推荐') || line.includes('应该')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  /**
   * 执行告警动作
   */
  async executeAlertActions(alert) {
    const rule = this.alertRules[alert.severity];
    if (!rule) return;
    
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, alert);
        alert.actions.push({
          action,
          timestamp: Date.now(),
          success: true
        });
      } catch (error) {
        logger.error(`执行告警动作失败: ${action}`, error);
        alert.actions.push({
          action,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });
      }
    }
  }

  /**
   * 执行动作
   */
  async executeAction(action, alert) {
    switch (action) {
      case 'immediate_notification':
        await this.sendImmediateNotification(alert);
        break;
      case 'notification':
        await this.sendNotification(alert);
        break;
      case 'auto_intervention':
        await this.autoIntervention(alert);
        break;
      case 'monitor':
        await this.enhanceMonitoring(alert);
        break;
      case 'log':
        this.logAlert(alert);
        break;
      case 'schedule_check':
        await this.scheduleCheck(alert);
        break;
    }
  }

  /**
   * 发送即时通知
   */
  async sendImmediateNotification(alert) {
    logger.error(`🚨 紧急告警: ${alert.type}`, {
      severity: alert.severity,
      data: alert.data
    });
    
    // 可以集成邮件、短信、Webhook等通知渠道
    if (this.alertChannels.email) {
      // 发送邮件
    }
    if (this.alertChannels.webhook) {
      // 发送Webhook
    }
  }

  /**
   * 发送通知
   */
  async sendNotification(alert) {
    logger.warn(`⚠️ 告警: ${alert.type}`, {
      severity: alert.severity,
      data: alert.data
    });
  }

  /**
   * 自动干预
   */
  async autoIntervention(alert) {
    // 使用决策引擎决定干预措施
    const decision = await decisionEngine.makeDecision(
      this.mapAlertTypeToCategory(alert.type),
      {
        alert: alert.data,
        severity: alert.severity
      }
    );
    
    if (decision.decision.autoExecute) {
      logger.info(`自动干预执行: ${decision.decision.action}`);
    }
  }

  /**
   * 增强监控
   */
  async enhanceMonitoring(alert) {
    logger.info(`增强监控: ${alert.type}`);
    // 可以增加监控频率、添加更多监控点等
  }

  /**
   * 记录告警
   */
  logAlert(alert) {
    logger.info(`告警记录: ${alert.type}`, alert.data);
  }

  /**
   * 安排检查
   */
  async scheduleCheck(alert) {
    logger.info(`安排检查: ${alert.type}`);
    // 可以安排后续检查任务
  }

  /**
   * 映射告警类型到决策类别
   */
  mapAlertTypeToCategory(type) {
    if (type.includes('api') || type.includes('API')) {
      return 'apiHealth';
    }
    if (type.includes('data') || type.includes('Data')) {
      return 'dataQuality';
    }
    if (type.includes('system') || type.includes('System')) {
      return 'systemHealth';
    }
    if (type.includes('user') || type.includes('User')) {
      return 'userBehavior';
    }
    return 'systemHealth';
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = Date.now();
      logger.info(`告警已确认: ${alertId}`, { userId });
    }
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId, resolution) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolution = resolution;
      alert.resolvedAt = Date.now();
      alert.status = 'resolved';
      logger.info(`告警已解决: ${alertId}`, { resolution });
    }
  }

  /**
   * 获取告警统计
   */
  getStats() {
    const active = this.alerts.filter(a => a.status === 'active');
    const resolved = this.alerts.filter(a => a.status === 'resolved');
    
    const bySeverity = {};
    this.alerts.forEach(a => {
      if (!bySeverity[a.severity]) {
        bySeverity[a.severity] = 0;
      }
      bySeverity[a.severity]++;
    });
    
    return {
      total: this.alerts.length,
      active: active.length,
      resolved: resolved.length,
      bySeverity,
      byType: this.groupByType()
    };
  }

  /**
   * 按类型分组
   */
  groupByType() {
    const grouped = {};
    this.alerts.forEach(a => {
      if (!grouped[a.type]) {
        grouped[a.type] = 0;
      }
      grouped[a.type]++;
    });
    return grouped;
  }
}

module.exports = new AlertSystem();






 * 智能告警系统
 * 智能分析和分级告警
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const decisionEngine = require('./decision-engine');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.alertRules = this.initializeAlertRules();
    this.alertChannels = {
      log: true,
      email: false,
      webhook: false
    };
  }

  /**
   * 初始化告警规则
   */
  initializeAlertRules() {
    return {
      critical: {
        threshold: 0.9,
        actions: ['immediate_notification', 'auto_intervention'],
        cooldown: 0 // 无冷却时间
      },
      high: {
        threshold: 0.7,
        actions: ['notification', 'monitor'],
        cooldown: 300000 // 5分钟
      },
      medium: {
        threshold: 0.5,
        actions: ['log', 'schedule_check'],
        cooldown: 1800000 // 30分钟
      },
      low: {
        threshold: 0.3,
        actions: ['log'],
        cooldown: 3600000 // 1小时
      }
    };
  }

  /**
   * 创建告警
   */
  async createAlert(type, severity, data, context = {}) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查是否在冷却期内
    const recentAlert = this.findRecentAlert(type, severity);
    if (recentAlert && this.isInCooldown(recentAlert, severity)) {
      logger.debug(`告警在冷却期内，跳过: ${type}`);
      return null;
    }
    
    const alert = {
      id: alertId,
      type,
      severity,
      data,
      context,
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      resolved: false,
      actions: [],
      aiAnalysis: null
    };
    
    this.alerts.push(alert);
    
    // 智能分析告警
    if (severity === 'critical' || severity === 'high') {
      await this.analyzeAlert(alert);
    }
    
    // 执行告警动作
    await this.executeAlertActions(alert);
    
    // 只保留最近1000条告警
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }
    
    logger.warn(`告警创建: ${type} - ${severity}`, { alertId });
    
    return alert;
  }

  /**
   * 查找最近的告警
   */
  findRecentAlert(type, severity) {
    return this.alerts
      .filter(a => a.type === type && a.severity === severity)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 检查是否在冷却期内
   */
  isInCooldown(alert, severity) {
    const rule = this.alertRules[severity];
    if (!rule) return false;
    
    const elapsed = Date.now() - alert.timestamp;
    return elapsed < rule.cooldown;
  }

  /**
   * 分析告警
   */
  async analyzeAlert(alert) {
    try {
      const analysis = await aiHub.analyze('alert_analysis', null, {
        complexity: 'medium',
        needsAnalysis: true,
        data: {
          type: alert.type,
          severity: alert.severity,
          data: alert.data,
          context: alert.context,
          similarAlerts: this.findSimilarAlerts(alert)
        }
      });
      
      if (analysis.used && analysis.result) {
        alert.aiAnalysis = {
          summary: analysis.result.content,
          recommendations: this.extractRecommendations(analysis.result.content),
          confidence: analysis.result.confidence || 0.7
        };
      }
    } catch (error) {
      logger.warn('告警AI分析失败', error);
    }
  }

  /**
   * 查找相似告警
   */
  findSimilarAlerts(alert) {
    return this.alerts
      .filter(a => 
        a.id !== alert.id &&
        a.type === alert.type &&
        (Date.now() - a.timestamp) < 7 * 24 * 60 * 60 * 1000 // 7天内
      )
      .slice(0, 5);
  }

  /**
   * 提取建议
   */
  extractRecommendations(content) {
    // 简化实现：从AI返回的内容中提取建议
    const recommendations = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('建议') || line.includes('推荐') || line.includes('应该')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  /**
   * 执行告警动作
   */
  async executeAlertActions(alert) {
    const rule = this.alertRules[alert.severity];
    if (!rule) return;
    
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, alert);
        alert.actions.push({
          action,
          timestamp: Date.now(),
          success: true
        });
      } catch (error) {
        logger.error(`执行告警动作失败: ${action}`, error);
        alert.actions.push({
          action,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });
      }
    }
  }

  /**
   * 执行动作
   */
  async executeAction(action, alert) {
    switch (action) {
      case 'immediate_notification':
        await this.sendImmediateNotification(alert);
        break;
      case 'notification':
        await this.sendNotification(alert);
        break;
      case 'auto_intervention':
        await this.autoIntervention(alert);
        break;
      case 'monitor':
        await this.enhanceMonitoring(alert);
        break;
      case 'log':
        this.logAlert(alert);
        break;
      case 'schedule_check':
        await this.scheduleCheck(alert);
        break;
    }
  }

  /**
   * 发送即时通知
   */
  async sendImmediateNotification(alert) {
    logger.error(`🚨 紧急告警: ${alert.type}`, {
      severity: alert.severity,
      data: alert.data
    });
    
    // 可以集成邮件、短信、Webhook等通知渠道
    if (this.alertChannels.email) {
      // 发送邮件
    }
    if (this.alertChannels.webhook) {
      // 发送Webhook
    }
  }

  /**
   * 发送通知
   */
  async sendNotification(alert) {
    logger.warn(`⚠️ 告警: ${alert.type}`, {
      severity: alert.severity,
      data: alert.data
    });
  }

  /**
   * 自动干预
   */
  async autoIntervention(alert) {
    // 使用决策引擎决定干预措施
    const decision = await decisionEngine.makeDecision(
      this.mapAlertTypeToCategory(alert.type),
      {
        alert: alert.data,
        severity: alert.severity
      }
    );
    
    if (decision.decision.autoExecute) {
      logger.info(`自动干预执行: ${decision.decision.action}`);
    }
  }

  /**
   * 增强监控
   */
  async enhanceMonitoring(alert) {
    logger.info(`增强监控: ${alert.type}`);
    // 可以增加监控频率、添加更多监控点等
  }

  /**
   * 记录告警
   */
  logAlert(alert) {
    logger.info(`告警记录: ${alert.type}`, alert.data);
  }

  /**
   * 安排检查
   */
  async scheduleCheck(alert) {
    logger.info(`安排检查: ${alert.type}`);
    // 可以安排后续检查任务
  }

  /**
   * 映射告警类型到决策类别
   */
  mapAlertTypeToCategory(type) {
    if (type.includes('api') || type.includes('API')) {
      return 'apiHealth';
    }
    if (type.includes('data') || type.includes('Data')) {
      return 'dataQuality';
    }
    if (type.includes('system') || type.includes('System')) {
      return 'systemHealth';
    }
    if (type.includes('user') || type.includes('User')) {
      return 'userBehavior';
    }
    return 'systemHealth';
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = Date.now();
      logger.info(`告警已确认: ${alertId}`, { userId });
    }
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId, resolution) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolution = resolution;
      alert.resolvedAt = Date.now();
      alert.status = 'resolved';
      logger.info(`告警已解决: ${alertId}`, { resolution });
    }
  }

  /**
   * 获取告警统计
   */
  getStats() {
    const active = this.alerts.filter(a => a.status === 'active');
    const resolved = this.alerts.filter(a => a.status === 'resolved');
    
    const bySeverity = {};
    this.alerts.forEach(a => {
      if (!bySeverity[a.severity]) {
        bySeverity[a.severity] = 0;
      }
      bySeverity[a.severity]++;
    });
    
    return {
      total: this.alerts.length,
      active: active.length,
      resolved: resolved.length,
      bySeverity,
      byType: this.groupByType()
    };
  }

  /**
   * 按类型分组
   */
  groupByType() {
    const grouped = {};
    this.alerts.forEach(a => {
      if (!grouped[a.type]) {
        grouped[a.type] = 0;
      }
      grouped[a.type]++;
    });
    return grouped;
  }
}

module.exports = new AlertSystem();






 * 智能告警系统
 * 智能分析和分级告警
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const decisionEngine = require('./decision-engine');

class AlertSystem {
  constructor() {
    this.alerts = [];
    this.alertRules = this.initializeAlertRules();
    this.alertChannels = {
      log: true,
      email: false,
      webhook: false
    };
  }

  /**
   * 初始化告警规则
   */
  initializeAlertRules() {
    return {
      critical: {
        threshold: 0.9,
        actions: ['immediate_notification', 'auto_intervention'],
        cooldown: 0 // 无冷却时间
      },
      high: {
        threshold: 0.7,
        actions: ['notification', 'monitor'],
        cooldown: 300000 // 5分钟
      },
      medium: {
        threshold: 0.5,
        actions: ['log', 'schedule_check'],
        cooldown: 1800000 // 30分钟
      },
      low: {
        threshold: 0.3,
        actions: ['log'],
        cooldown: 3600000 // 1小时
      }
    };
  }

  /**
   * 创建告警
   */
  async createAlert(type, severity, data, context = {}) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 检查是否在冷却期内
    const recentAlert = this.findRecentAlert(type, severity);
    if (recentAlert && this.isInCooldown(recentAlert, severity)) {
      logger.debug(`告警在冷却期内，跳过: ${type}`);
      return null;
    }
    
    const alert = {
      id: alertId,
      type,
      severity,
      data,
      context,
      timestamp: Date.now(),
      status: 'active',
      acknowledged: false,
      resolved: false,
      actions: [],
      aiAnalysis: null
    };
    
    this.alerts.push(alert);
    
    // 智能分析告警
    if (severity === 'critical' || severity === 'high') {
      await this.analyzeAlert(alert);
    }
    
    // 执行告警动作
    await this.executeAlertActions(alert);
    
    // 只保留最近1000条告警
    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }
    
    logger.warn(`告警创建: ${type} - ${severity}`, { alertId });
    
    return alert;
  }

  /**
   * 查找最近的告警
   */
  findRecentAlert(type, severity) {
    return this.alerts
      .filter(a => a.type === type && a.severity === severity)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 检查是否在冷却期内
   */
  isInCooldown(alert, severity) {
    const rule = this.alertRules[severity];
    if (!rule) return false;
    
    const elapsed = Date.now() - alert.timestamp;
    return elapsed < rule.cooldown;
  }

  /**
   * 分析告警
   */
  async analyzeAlert(alert) {
    try {
      const analysis = await aiHub.analyze('alert_analysis', null, {
        complexity: 'medium',
        needsAnalysis: true,
        data: {
          type: alert.type,
          severity: alert.severity,
          data: alert.data,
          context: alert.context,
          similarAlerts: this.findSimilarAlerts(alert)
        }
      });
      
      if (analysis.used && analysis.result) {
        alert.aiAnalysis = {
          summary: analysis.result.content,
          recommendations: this.extractRecommendations(analysis.result.content),
          confidence: analysis.result.confidence || 0.7
        };
      }
    } catch (error) {
      logger.warn('告警AI分析失败', error);
    }
  }

  /**
   * 查找相似告警
   */
  findSimilarAlerts(alert) {
    return this.alerts
      .filter(a => 
        a.id !== alert.id &&
        a.type === alert.type &&
        (Date.now() - a.timestamp) < 7 * 24 * 60 * 60 * 1000 // 7天内
      )
      .slice(0, 5);
  }

  /**
   * 提取建议
   */
  extractRecommendations(content) {
    // 简化实现：从AI返回的内容中提取建议
    const recommendations = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('建议') || line.includes('推荐') || line.includes('应该')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  /**
   * 执行告警动作
   */
  async executeAlertActions(alert) {
    const rule = this.alertRules[alert.severity];
    if (!rule) return;
    
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, alert);
        alert.actions.push({
          action,
          timestamp: Date.now(),
          success: true
        });
      } catch (error) {
        logger.error(`执行告警动作失败: ${action}`, error);
        alert.actions.push({
          action,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });
      }
    }
  }

  /**
   * 执行动作
   */
  async executeAction(action, alert) {
    switch (action) {
      case 'immediate_notification':
        await this.sendImmediateNotification(alert);
        break;
      case 'notification':
        await this.sendNotification(alert);
        break;
      case 'auto_intervention':
        await this.autoIntervention(alert);
        break;
      case 'monitor':
        await this.enhanceMonitoring(alert);
        break;
      case 'log':
        this.logAlert(alert);
        break;
      case 'schedule_check':
        await this.scheduleCheck(alert);
        break;
    }
  }

  /**
   * 发送即时通知
   */
  async sendImmediateNotification(alert) {
    logger.error(`🚨 紧急告警: ${alert.type}`, {
      severity: alert.severity,
      data: alert.data
    });
    
    // 可以集成邮件、短信、Webhook等通知渠道
    if (this.alertChannels.email) {
      // 发送邮件
    }
    if (this.alertChannels.webhook) {
      // 发送Webhook
    }
  }

  /**
   * 发送通知
   */
  async sendNotification(alert) {
    logger.warn(`⚠️ 告警: ${alert.type}`, {
      severity: alert.severity,
      data: alert.data
    });
  }

  /**
   * 自动干预
   */
  async autoIntervention(alert) {
    // 使用决策引擎决定干预措施
    const decision = await decisionEngine.makeDecision(
      this.mapAlertTypeToCategory(alert.type),
      {
        alert: alert.data,
        severity: alert.severity
      }
    );
    
    if (decision.decision.autoExecute) {
      logger.info(`自动干预执行: ${decision.decision.action}`);
    }
  }

  /**
   * 增强监控
   */
  async enhanceMonitoring(alert) {
    logger.info(`增强监控: ${alert.type}`);
    // 可以增加监控频率、添加更多监控点等
  }

  /**
   * 记录告警
   */
  logAlert(alert) {
    logger.info(`告警记录: ${alert.type}`, alert.data);
  }

  /**
   * 安排检查
   */
  async scheduleCheck(alert) {
    logger.info(`安排检查: ${alert.type}`);
    // 可以安排后续检查任务
  }

  /**
   * 映射告警类型到决策类别
   */
  mapAlertTypeToCategory(type) {
    if (type.includes('api') || type.includes('API')) {
      return 'apiHealth';
    }
    if (type.includes('data') || type.includes('Data')) {
      return 'dataQuality';
    }
    if (type.includes('system') || type.includes('System')) {
      return 'systemHealth';
    }
    if (type.includes('user') || type.includes('User')) {
      return 'userBehavior';
    }
    return 'systemHealth';
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId, userId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = Date.now();
      logger.info(`告警已确认: ${alertId}`, { userId });
    }
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId, resolution) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolution = resolution;
      alert.resolvedAt = Date.now();
      alert.status = 'resolved';
      logger.info(`告警已解决: ${alertId}`, { resolution });
    }
  }

  /**
   * 获取告警统计
   */
  getStats() {
    const active = this.alerts.filter(a => a.status === 'active');
    const resolved = this.alerts.filter(a => a.status === 'resolved');
    
    const bySeverity = {};
    this.alerts.forEach(a => {
      if (!bySeverity[a.severity]) {
        bySeverity[a.severity] = 0;
      }
      bySeverity[a.severity]++;
    });
    
    return {
      total: this.alerts.length,
      active: active.length,
      resolved: resolved.length,
      bySeverity,
      byType: this.groupByType()
    };
  }

  /**
   * 按类型分组
   */
  groupByType() {
    const grouped = {};
    this.alerts.forEach(a => {
      if (!grouped[a.type]) {
        grouped[a.type] = 0;
      }
      grouped[a.type]++;
    });
    return grouped;
  }
}

module.exports = new AlertSystem();






