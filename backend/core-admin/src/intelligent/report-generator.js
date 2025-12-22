/**
 * 智能报告生成器
 * AI生成管理报告
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const dataAnalyzer = require('../analytics/data-analyzer');
const knowledgeGraph = require('./knowledge-graph');

class IntelligentReportGenerator {
  constructor() {
    this.reports = [];
    this.reportTemplates = {
      daily: {
        sections: ['summary', 'health', 'performance', 'issues', 'recommendations'],
        aiEnhanced: true
      },
      weekly: {
        sections: ['summary', 'trends', 'health', 'performance', 'users', 'data', 'recommendations'],
        aiEnhanced: true
      },
      monthly: {
        sections: ['summary', 'trends', 'health', 'performance', 'users', 'data', 'optimization', 'recommendations'],
        aiEnhanced: true
      },
      custom: {
        sections: [],
        aiEnhanced: true
      }
    };
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport(type = 'daily', options = {}) {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = this.reportTemplates[type] || this.reportTemplates.daily;
    
    logger.info(`生成${type}报告`, { reportId });
    
    try {
      // 1. 收集数据
      const data = await this.collectReportData(type, options);
      
      // 2. 生成各章节
      const sections = {};
      for (const section of template.sections) {
        sections[section] = await this.generateSection(section, data, type);
      }
      
      // 3. AI增强（如果启用）
      let aiSummary = null;
      if (template.aiEnhanced) {
        aiSummary = await this.generateAISummary(sections, data, type);
      }
      
      // 4. 生成报告
      const report = {
        id: reportId,
        type,
        timestamp: Date.now(),
        period: this.getPeriod(type),
        sections,
        aiSummary,
        metadata: {
          generatedBy: 'intelligent_report_generator',
          version: '2.0'
        }
      };
      
      this.reports.push(report);
      
      // 只保留最近100个报告
      if (this.reports.length > 100) {
        this.reports.shift();
      }
      
      // 记录到知识图谱
      await knowledgeGraph.recordEvent('report_generated', {
        type,
        reportId,
        sections: Object.keys(sections)
      });
      
      logger.info(`报告生成完成: ${reportId}`);
      
      return report;
    } catch (error) {
      logger.error('生成报告失败', error);
      throw error;
    }
  }

  /**
   * 收集报告数据
   */
  async collectReportData(type, options) {
    const data = {
      health: await this.collectHealthData(),
      performance: await this.collectPerformanceData(),
      users: await this.collectUserData(),
      data: await this.collectDataQuality(),
      api: await this.collectApiData(),
      issues: await this.collectIssues(),
      trends: type !== 'daily' ? await this.collectTrends(type) : null
    };
    
    return data;
  }

  /**
   * 收集健康数据
   */
  async collectHealthData() {
    // 从admin-agent获取健康数据
    const adminAgent = require('../core/admin-agent');
    const healthCheck = await adminAgent.healthCheck();
    
    return {
      systemHealth: healthCheck.metrics.systemHealth,
      riskLevel: healthCheck.metrics.riskLevel,
      issues: healthCheck.issues.length,
      checks: healthCheck.checks
    };
  }

  /**
   * 收集性能数据
   */
  async collectPerformanceData() {
    const analyzer = dataAnalyzer.getComprehensiveReport();
    
    return {
      avgResponseTime: analyzer.apiUsage?.avgResponseTime || 0,
      throughput: analyzer.apiUsage?.totalRequests || 0,
      errorRate: analyzer.apiUsage?.errorRate || 0,
      cacheHitRate: 0.85 // 示例
    };
  }

  /**
   * 收集用户数据
   */
  async collectUserData() {
    const path = require('path');
    const storageService = require(path.join(__dirname, '../../../services/storageService'));
    
    const users = await storageService.read('users') || [];
    const activeUsers = users.filter(u => {
      if (!u.lastLogin) return false;
      const daysSinceLogin = (Date.now() - new Date(u.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin < 30;
    });
    
    return {
      total: users.length,
      active: activeUsers.length,
      newToday: users.filter(u => {
        const daysSinceCreated = (Date.now() - new Date(u.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreated < 1;
      }).length
    };
  }

  /**
   * 收集数据质量
   */
  async collectDataQuality() {
    const dataManager = require('../enhanced/data-manager');
    const qualityReport = await dataManager.checkDataQuality();
    
    return {
      overallScore: qualityReport.overallScore,
      issues: qualityReport.issues.length,
      recommendations: qualityReport.recommendations.length
    };
  }

  /**
   * 收集API数据
   */
  async collectApiData() {
    const apiSentinel = require('../api-sentinel/api-sentinel');
    const stats = apiSentinel.getOverallStats();
    
    return {
      totalApis: stats.totalApis || 0,
      healthyApis: stats.healthyApis || 0,
      healthRate: stats.healthRate || 0,
      avgResponseTime: stats.avgResponseTime || 0
    };
  }

  /**
   * 收集问题
   */
  async collectIssues() {
    const adminAgent = require('../core/admin-agent');
    const status = adminAgent.getStatus();
    
    return {
      total: status.issues.length,
      critical: status.issues.filter(i => i.severity === 'critical').length,
      high: status.issues.filter(i => i.severity === 'high').length,
      medium: status.issues.filter(i => i.severity === 'medium').length,
      low: status.issues.filter(i => i.severity === 'low').length
    };
  }

  /**
   * 收集趋势数据
   */
  async collectTrends(type) {
    // 从历史报告中提取趋势
    const recentReports = this.reports
      .filter(r => r.type === type)
      .slice(-7); // 最近7个报告
    
    return {
      healthTrend: this.calculateTrend(recentReports, 'sections.health.systemHealth'),
      performanceTrend: this.calculateTrend(recentReports, 'sections.performance.avgResponseTime'),
      userGrowthTrend: this.calculateTrend(recentReports, 'sections.users.total')
    };
  }

  /**
   * 计算趋势
   */
  calculateTrend(reports, path) {
    if (reports.length < 2) return 'stable';
    
    const values = reports.map(r => {
      const parts = path.split('.');
      let value = r;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || 0;
    });
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * 生成章节
   */
  async generateSection(section, data, type) {
    switch (section) {
      case 'summary':
        return this.generateSummary(data, type);
      case 'health':
        return this.generateHealthSection(data);
      case 'performance':
        return this.generatePerformanceSection(data);
      case 'issues':
        return this.generateIssuesSection(data);
      case 'recommendations':
        return await this.generateRecommendationsSection(data, type);
      case 'trends':
        return this.generateTrendsSection(data);
      case 'users':
        return this.generateUsersSection(data);
      case 'data':
        return this.generateDataSection(data);
      case 'optimization':
        return await this.generateOptimizationSection(data);
      default:
        return { content: '章节未实现' };
    }
  }

  /**
   * 生成摘要
   */
  generateSummary(data, type) {
    return {
      title: `${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}系统摘要`,
      content: {
        systemHealth: `${(data.health.systemHealth * 100).toFixed(1)}%`,
        riskLevel: data.health.riskLevel,
        totalIssues: data.issues.total,
        activeUsers: data.users.active,
        dataQuality: `${(data.data.overallScore * 100).toFixed(1)}%`
      },
      highlights: this.extractHighlights(data)
    };
  }

  /**
   * 提取亮点
   */
  extractHighlights(data) {
    const highlights = [];
    
    if (data.health.systemHealth > 0.9) {
      highlights.push('系统健康度优秀');
    }
    
    if (data.issues.total === 0) {
      highlights.push('无系统问题');
    }
    
    if (data.users.active > data.users.total * 0.5) {
      highlights.push('用户活跃度高');
    }
    
    return highlights;
  }

  /**
   * 生成健康章节
   */
  generateHealthSection(data) {
    return {
      title: '系统健康',
      content: {
        overallHealth: data.health.systemHealth,
        riskLevel: data.health.riskLevel,
        apiHealth: data.api.healthRate,
        dataIntegrity: data.data.overallScore,
        issues: {
          total: data.issues.total,
          bySeverity: {
            critical: data.issues.critical,
            high: data.issues.high,
            medium: data.issues.medium,
            low: data.issues.low
          }
        }
      }
    };
  }

  /**
   * 生成性能章节
   */
  generatePerformanceSection(data) {
    return {
      title: '系统性能',
      content: {
        avgResponseTime: `${data.performance.avgResponseTime}ms`,
        throughput: data.performance.throughput,
        errorRate: `${(data.performance.errorRate * 100).toFixed(2)}%`,
        cacheHitRate: `${(data.performance.cacheHitRate * 100).toFixed(1)}%`
      }
    };
  }

  /**
   * 生成问题章节
   */
  generateIssuesSection(data) {
    return {
      title: '系统问题',
      content: {
        total: data.issues.total,
        bySeverity: {
          critical: data.issues.critical,
          high: data.issues.high,
          medium: data.issues.medium,
          low: data.issues.low
        },
        topIssues: [] // 可以从admin-agent获取
      }
    };
  }

  /**
   * 生成建议章节（AI增强）
   */
  async generateRecommendationsSection(data, type) {
    try {
      const prompt = this.buildRecommendationsPrompt(data, type);
      
      const aiResult = await aiHub.analyze('report_recommendations', null, {
        complexity: 'high',
        needsAnalysis: true,
        prompt,
        data
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const recommendations = JSON.parse(aiResult.result.content);
          return {
            title: '管理建议',
            content: recommendations,
            source: 'ai_enhanced'
          };
        } catch (e) {
          return {
            title: '管理建议',
            content: {
              summary: aiResult.result.content,
              recommendations: this.extractRecommendationsFromText(aiResult.result.content)
            },
            source: 'ai_enhanced'
          };
        }
      }
    } catch (error) {
      logger.warn('AI生成建议失败，使用本地建议', error);
    }
    
    // 本地建议
    return {
      title: '管理建议',
      content: {
        recommendations: this.generateLocalRecommendations(data)
      },
      source: 'local'
    };
  }

  /**
   * 构建建议提示词
   */
  buildRecommendationsPrompt(data, type) {
    return `作为智能管理系统，请为以下系统状态生成管理建议：

报告类型: ${type}
系统健康度: ${(data.health.systemHealth * 100).toFixed(1)}%
风险等级: ${data.health.riskLevel}
问题数量: ${data.issues.total}
性能指标: 平均响应时间 ${data.performance.avgResponseTime}ms, 错误率 ${(data.performance.errorRate * 100).toFixed(2)}%
数据质量: ${(data.data.overallScore * 100).toFixed(1)}%

请返回JSON格式的建议：
{
  "summary": "总体建议摘要",
  "recommendations": [
    {
      "priority": "high/medium/low",
      "category": "health/performance/security/data",
      "title": "建议标题",
      "description": "详细描述",
      "action": "建议采取的行动"
    }
  ]
}`;
  }

  /**
   * 从文本提取建议
   */
  extractRecommendationsFromText(text) {
    const recommendations = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^\d+[\.\)]/) || line.includes('建议') || line.includes('应该')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  /**
   * 生成本地建议
   */
  generateLocalRecommendations(data) {
    const recommendations = [];
    
    if (data.health.systemHealth < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'health',
        title: '系统健康度偏低',
        description: `当前系统健康度为${(data.health.systemHealth * 100).toFixed(1)}%，建议检查系统问题`,
        action: '执行系统健康检查并修复发现的问题'
      });
    }
    
    if (data.performance.errorRate > 0.05) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: '错误率偏高',
        description: `当前错误率为${(data.performance.errorRate * 100).toFixed(2)}%`,
        action: '检查API接口和错误日志'
      });
    }
    
    return recommendations;
  }

  /**
   * 生成趋势章节
   */
  generateTrendsSection(data) {
    return {
      title: '趋势分析',
      content: data.trends || {}
    };
  }

  /**
   * 生成用户章节
   */
  generateUsersSection(data) {
    return {
      title: '用户统计',
      content: data.users
    };
  }

  /**
   * 生成数据章节
   */
  generateDataSection(data) {
    return {
      title: '数据质量',
      content: data.data
    };
  }

  /**
   * 生成优化章节
   */
  async generateOptimizationSection(data) {
    const adaptiveOptimizer = require('./adaptive-optimizer');
    const stats = adaptiveOptimizer.getStats();
    
    return {
      title: '优化建议',
      content: {
        optimizationsApplied: stats.total,
        successRate: `${(stats.successRate * 100).toFixed(1)}%`,
        averageImprovement: `${(stats.averageImprovement * 100).toFixed(1)}%`
      }
    };
  }

  /**
   * 生成AI摘要
   */
  async generateAISummary(sections, data, type) {
    try {
      const prompt = `请为以下${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}系统报告生成一个简洁的AI摘要（200字以内）：

${JSON.stringify(sections, null, 2)}

请用中文生成摘要，突出关键信息和重要建议。`;
      
      const aiResult = await aiHub.analyze('report_summary', null, {
        complexity: 'medium',
        needsAnalysis: true,
        prompt
      });
      
      if (aiResult.used && aiResult.result) {
        return {
          content: aiResult.result.content,
          confidence: aiResult.result.confidence || 0.7,
          generatedAt: Date.now()
        };
      }
    } catch (error) {
      logger.warn('生成AI摘要失败', error);
    }
    
    return null;
  }

  /**
   * 获取时间段
   */
  getPeriod(type) {
    const now = new Date();
    const start = new Date(now);
    
    switch (type) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      case 'weekly':
        start.setDate(start.getDate() - 7);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      default:
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
    }
  }

  /**
   * 获取报告
   */
  getReport(reportId) {
    return this.reports.find(r => r.id === reportId);
  }

  /**
   * 获取最新报告
   */
  getLatestReport(type = null) {
    const filtered = type 
      ? this.reports.filter(r => r.type === type)
      : this.reports;
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 获取报告统计
   */
  getStats() {
    const byType = {};
    this.reports.forEach(r => {
      if (!byType[r.type]) {
        byType[r.type] = 0;
      }
      byType[r.type]++;
    });
    
    return {
      total: this.reports.length,
      byType,
      latest: this.reports.length > 0 ? this.reports[this.reports.length - 1].timestamp : null
    };
  }
}

module.exports = new IntelligentReportGenerator();






 * 智能报告生成器
 * AI生成管理报告
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const dataAnalyzer = require('../analytics/data-analyzer');
const knowledgeGraph = require('./knowledge-graph');

class IntelligentReportGenerator {
  constructor() {
    this.reports = [];
    this.reportTemplates = {
      daily: {
        sections: ['summary', 'health', 'performance', 'issues', 'recommendations'],
        aiEnhanced: true
      },
      weekly: {
        sections: ['summary', 'trends', 'health', 'performance', 'users', 'data', 'recommendations'],
        aiEnhanced: true
      },
      monthly: {
        sections: ['summary', 'trends', 'health', 'performance', 'users', 'data', 'optimization', 'recommendations'],
        aiEnhanced: true
      },
      custom: {
        sections: [],
        aiEnhanced: true
      }
    };
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport(type = 'daily', options = {}) {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = this.reportTemplates[type] || this.reportTemplates.daily;
    
    logger.info(`生成${type}报告`, { reportId });
    
    try {
      // 1. 收集数据
      const data = await this.collectReportData(type, options);
      
      // 2. 生成各章节
      const sections = {};
      for (const section of template.sections) {
        sections[section] = await this.generateSection(section, data, type);
      }
      
      // 3. AI增强（如果启用）
      let aiSummary = null;
      if (template.aiEnhanced) {
        aiSummary = await this.generateAISummary(sections, data, type);
      }
      
      // 4. 生成报告
      const report = {
        id: reportId,
        type,
        timestamp: Date.now(),
        period: this.getPeriod(type),
        sections,
        aiSummary,
        metadata: {
          generatedBy: 'intelligent_report_generator',
          version: '2.0'
        }
      };
      
      this.reports.push(report);
      
      // 只保留最近100个报告
      if (this.reports.length > 100) {
        this.reports.shift();
      }
      
      // 记录到知识图谱
      await knowledgeGraph.recordEvent('report_generated', {
        type,
        reportId,
        sections: Object.keys(sections)
      });
      
      logger.info(`报告生成完成: ${reportId}`);
      
      return report;
    } catch (error) {
      logger.error('生成报告失败', error);
      throw error;
    }
  }

  /**
   * 收集报告数据
   */
  async collectReportData(type, options) {
    const data = {
      health: await this.collectHealthData(),
      performance: await this.collectPerformanceData(),
      users: await this.collectUserData(),
      data: await this.collectDataQuality(),
      api: await this.collectApiData(),
      issues: await this.collectIssues(),
      trends: type !== 'daily' ? await this.collectTrends(type) : null
    };
    
    return data;
  }

  /**
   * 收集健康数据
   */
  async collectHealthData() {
    // 从admin-agent获取健康数据
    const adminAgent = require('../core/admin-agent');
    const healthCheck = await adminAgent.healthCheck();
    
    return {
      systemHealth: healthCheck.metrics.systemHealth,
      riskLevel: healthCheck.metrics.riskLevel,
      issues: healthCheck.issues.length,
      checks: healthCheck.checks
    };
  }

  /**
   * 收集性能数据
   */
  async collectPerformanceData() {
    const analyzer = dataAnalyzer.getComprehensiveReport();
    
    return {
      avgResponseTime: analyzer.apiUsage?.avgResponseTime || 0,
      throughput: analyzer.apiUsage?.totalRequests || 0,
      errorRate: analyzer.apiUsage?.errorRate || 0,
      cacheHitRate: 0.85 // 示例
    };
  }

  /**
   * 收集用户数据
   */
  async collectUserData() {
    const path = require('path');
    const storageService = require(path.join(__dirname, '../../../services/storageService'));
    
    const users = await storageService.read('users') || [];
    const activeUsers = users.filter(u => {
      if (!u.lastLogin) return false;
      const daysSinceLogin = (Date.now() - new Date(u.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin < 30;
    });
    
    return {
      total: users.length,
      active: activeUsers.length,
      newToday: users.filter(u => {
        const daysSinceCreated = (Date.now() - new Date(u.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreated < 1;
      }).length
    };
  }

  /**
   * 收集数据质量
   */
  async collectDataQuality() {
    const dataManager = require('../enhanced/data-manager');
    const qualityReport = await dataManager.checkDataQuality();
    
    return {
      overallScore: qualityReport.overallScore,
      issues: qualityReport.issues.length,
      recommendations: qualityReport.recommendations.length
    };
  }

  /**
   * 收集API数据
   */
  async collectApiData() {
    const apiSentinel = require('../api-sentinel/api-sentinel');
    const stats = apiSentinel.getOverallStats();
    
    return {
      totalApis: stats.totalApis || 0,
      healthyApis: stats.healthyApis || 0,
      healthRate: stats.healthRate || 0,
      avgResponseTime: stats.avgResponseTime || 0
    };
  }

  /**
   * 收集问题
   */
  async collectIssues() {
    const adminAgent = require('../core/admin-agent');
    const status = adminAgent.getStatus();
    
    return {
      total: status.issues.length,
      critical: status.issues.filter(i => i.severity === 'critical').length,
      high: status.issues.filter(i => i.severity === 'high').length,
      medium: status.issues.filter(i => i.severity === 'medium').length,
      low: status.issues.filter(i => i.severity === 'low').length
    };
  }

  /**
   * 收集趋势数据
   */
  async collectTrends(type) {
    // 从历史报告中提取趋势
    const recentReports = this.reports
      .filter(r => r.type === type)
      .slice(-7); // 最近7个报告
    
    return {
      healthTrend: this.calculateTrend(recentReports, 'sections.health.systemHealth'),
      performanceTrend: this.calculateTrend(recentReports, 'sections.performance.avgResponseTime'),
      userGrowthTrend: this.calculateTrend(recentReports, 'sections.users.total')
    };
  }

  /**
   * 计算趋势
   */
  calculateTrend(reports, path) {
    if (reports.length < 2) return 'stable';
    
    const values = reports.map(r => {
      const parts = path.split('.');
      let value = r;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || 0;
    });
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * 生成章节
   */
  async generateSection(section, data, type) {
    switch (section) {
      case 'summary':
        return this.generateSummary(data, type);
      case 'health':
        return this.generateHealthSection(data);
      case 'performance':
        return this.generatePerformanceSection(data);
      case 'issues':
        return this.generateIssuesSection(data);
      case 'recommendations':
        return await this.generateRecommendationsSection(data, type);
      case 'trends':
        return this.generateTrendsSection(data);
      case 'users':
        return this.generateUsersSection(data);
      case 'data':
        return this.generateDataSection(data);
      case 'optimization':
        return await this.generateOptimizationSection(data);
      default:
        return { content: '章节未实现' };
    }
  }

  /**
   * 生成摘要
   */
  generateSummary(data, type) {
    return {
      title: `${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}系统摘要`,
      content: {
        systemHealth: `${(data.health.systemHealth * 100).toFixed(1)}%`,
        riskLevel: data.health.riskLevel,
        totalIssues: data.issues.total,
        activeUsers: data.users.active,
        dataQuality: `${(data.data.overallScore * 100).toFixed(1)}%`
      },
      highlights: this.extractHighlights(data)
    };
  }

  /**
   * 提取亮点
   */
  extractHighlights(data) {
    const highlights = [];
    
    if (data.health.systemHealth > 0.9) {
      highlights.push('系统健康度优秀');
    }
    
    if (data.issues.total === 0) {
      highlights.push('无系统问题');
    }
    
    if (data.users.active > data.users.total * 0.5) {
      highlights.push('用户活跃度高');
    }
    
    return highlights;
  }

  /**
   * 生成健康章节
   */
  generateHealthSection(data) {
    return {
      title: '系统健康',
      content: {
        overallHealth: data.health.systemHealth,
        riskLevel: data.health.riskLevel,
        apiHealth: data.api.healthRate,
        dataIntegrity: data.data.overallScore,
        issues: {
          total: data.issues.total,
          bySeverity: {
            critical: data.issues.critical,
            high: data.issues.high,
            medium: data.issues.medium,
            low: data.issues.low
          }
        }
      }
    };
  }

  /**
   * 生成性能章节
   */
  generatePerformanceSection(data) {
    return {
      title: '系统性能',
      content: {
        avgResponseTime: `${data.performance.avgResponseTime}ms`,
        throughput: data.performance.throughput,
        errorRate: `${(data.performance.errorRate * 100).toFixed(2)}%`,
        cacheHitRate: `${(data.performance.cacheHitRate * 100).toFixed(1)}%`
      }
    };
  }

  /**
   * 生成问题章节
   */
  generateIssuesSection(data) {
    return {
      title: '系统问题',
      content: {
        total: data.issues.total,
        bySeverity: {
          critical: data.issues.critical,
          high: data.issues.high,
          medium: data.issues.medium,
          low: data.issues.low
        },
        topIssues: [] // 可以从admin-agent获取
      }
    };
  }

  /**
   * 生成建议章节（AI增强）
   */
  async generateRecommendationsSection(data, type) {
    try {
      const prompt = this.buildRecommendationsPrompt(data, type);
      
      const aiResult = await aiHub.analyze('report_recommendations', null, {
        complexity: 'high',
        needsAnalysis: true,
        prompt,
        data
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const recommendations = JSON.parse(aiResult.result.content);
          return {
            title: '管理建议',
            content: recommendations,
            source: 'ai_enhanced'
          };
        } catch (e) {
          return {
            title: '管理建议',
            content: {
              summary: aiResult.result.content,
              recommendations: this.extractRecommendationsFromText(aiResult.result.content)
            },
            source: 'ai_enhanced'
          };
        }
      }
    } catch (error) {
      logger.warn('AI生成建议失败，使用本地建议', error);
    }
    
    // 本地建议
    return {
      title: '管理建议',
      content: {
        recommendations: this.generateLocalRecommendations(data)
      },
      source: 'local'
    };
  }

  /**
   * 构建建议提示词
   */
  buildRecommendationsPrompt(data, type) {
    return `作为智能管理系统，请为以下系统状态生成管理建议：

报告类型: ${type}
系统健康度: ${(data.health.systemHealth * 100).toFixed(1)}%
风险等级: ${data.health.riskLevel}
问题数量: ${data.issues.total}
性能指标: 平均响应时间 ${data.performance.avgResponseTime}ms, 错误率 ${(data.performance.errorRate * 100).toFixed(2)}%
数据质量: ${(data.data.overallScore * 100).toFixed(1)}%

请返回JSON格式的建议：
{
  "summary": "总体建议摘要",
  "recommendations": [
    {
      "priority": "high/medium/low",
      "category": "health/performance/security/data",
      "title": "建议标题",
      "description": "详细描述",
      "action": "建议采取的行动"
    }
  ]
}`;
  }

  /**
   * 从文本提取建议
   */
  extractRecommendationsFromText(text) {
    const recommendations = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^\d+[\.\)]/) || line.includes('建议') || line.includes('应该')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  /**
   * 生成本地建议
   */
  generateLocalRecommendations(data) {
    const recommendations = [];
    
    if (data.health.systemHealth < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'health',
        title: '系统健康度偏低',
        description: `当前系统健康度为${(data.health.systemHealth * 100).toFixed(1)}%，建议检查系统问题`,
        action: '执行系统健康检查并修复发现的问题'
      });
    }
    
    if (data.performance.errorRate > 0.05) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: '错误率偏高',
        description: `当前错误率为${(data.performance.errorRate * 100).toFixed(2)}%`,
        action: '检查API接口和错误日志'
      });
    }
    
    return recommendations;
  }

  /**
   * 生成趋势章节
   */
  generateTrendsSection(data) {
    return {
      title: '趋势分析',
      content: data.trends || {}
    };
  }

  /**
   * 生成用户章节
   */
  generateUsersSection(data) {
    return {
      title: '用户统计',
      content: data.users
    };
  }

  /**
   * 生成数据章节
   */
  generateDataSection(data) {
    return {
      title: '数据质量',
      content: data.data
    };
  }

  /**
   * 生成优化章节
   */
  async generateOptimizationSection(data) {
    const adaptiveOptimizer = require('./adaptive-optimizer');
    const stats = adaptiveOptimizer.getStats();
    
    return {
      title: '优化建议',
      content: {
        optimizationsApplied: stats.total,
        successRate: `${(stats.successRate * 100).toFixed(1)}%`,
        averageImprovement: `${(stats.averageImprovement * 100).toFixed(1)}%`
      }
    };
  }

  /**
   * 生成AI摘要
   */
  async generateAISummary(sections, data, type) {
    try {
      const prompt = `请为以下${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}系统报告生成一个简洁的AI摘要（200字以内）：

${JSON.stringify(sections, null, 2)}

请用中文生成摘要，突出关键信息和重要建议。`;
      
      const aiResult = await aiHub.analyze('report_summary', null, {
        complexity: 'medium',
        needsAnalysis: true,
        prompt
      });
      
      if (aiResult.used && aiResult.result) {
        return {
          content: aiResult.result.content,
          confidence: aiResult.result.confidence || 0.7,
          generatedAt: Date.now()
        };
      }
    } catch (error) {
      logger.warn('生成AI摘要失败', error);
    }
    
    return null;
  }

  /**
   * 获取时间段
   */
  getPeriod(type) {
    const now = new Date();
    const start = new Date(now);
    
    switch (type) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      case 'weekly':
        start.setDate(start.getDate() - 7);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      default:
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
    }
  }

  /**
   * 获取报告
   */
  getReport(reportId) {
    return this.reports.find(r => r.id === reportId);
  }

  /**
   * 获取最新报告
   */
  getLatestReport(type = null) {
    const filtered = type 
      ? this.reports.filter(r => r.type === type)
      : this.reports;
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 获取报告统计
   */
  getStats() {
    const byType = {};
    this.reports.forEach(r => {
      if (!byType[r.type]) {
        byType[r.type] = 0;
      }
      byType[r.type]++;
    });
    
    return {
      total: this.reports.length,
      byType,
      latest: this.reports.length > 0 ? this.reports[this.reports.length - 1].timestamp : null
    };
  }
}

module.exports = new IntelligentReportGenerator();






 * 智能报告生成器
 * AI生成管理报告
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const dataAnalyzer = require('../analytics/data-analyzer');
const knowledgeGraph = require('./knowledge-graph');

class IntelligentReportGenerator {
  constructor() {
    this.reports = [];
    this.reportTemplates = {
      daily: {
        sections: ['summary', 'health', 'performance', 'issues', 'recommendations'],
        aiEnhanced: true
      },
      weekly: {
        sections: ['summary', 'trends', 'health', 'performance', 'users', 'data', 'recommendations'],
        aiEnhanced: true
      },
      monthly: {
        sections: ['summary', 'trends', 'health', 'performance', 'users', 'data', 'optimization', 'recommendations'],
        aiEnhanced: true
      },
      custom: {
        sections: [],
        aiEnhanced: true
      }
    };
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport(type = 'daily', options = {}) {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = this.reportTemplates[type] || this.reportTemplates.daily;
    
    logger.info(`生成${type}报告`, { reportId });
    
    try {
      // 1. 收集数据
      const data = await this.collectReportData(type, options);
      
      // 2. 生成各章节
      const sections = {};
      for (const section of template.sections) {
        sections[section] = await this.generateSection(section, data, type);
      }
      
      // 3. AI增强（如果启用）
      let aiSummary = null;
      if (template.aiEnhanced) {
        aiSummary = await this.generateAISummary(sections, data, type);
      }
      
      // 4. 生成报告
      const report = {
        id: reportId,
        type,
        timestamp: Date.now(),
        period: this.getPeriod(type),
        sections,
        aiSummary,
        metadata: {
          generatedBy: 'intelligent_report_generator',
          version: '2.0'
        }
      };
      
      this.reports.push(report);
      
      // 只保留最近100个报告
      if (this.reports.length > 100) {
        this.reports.shift();
      }
      
      // 记录到知识图谱
      await knowledgeGraph.recordEvent('report_generated', {
        type,
        reportId,
        sections: Object.keys(sections)
      });
      
      logger.info(`报告生成完成: ${reportId}`);
      
      return report;
    } catch (error) {
      logger.error('生成报告失败', error);
      throw error;
    }
  }

  /**
   * 收集报告数据
   */
  async collectReportData(type, options) {
    const data = {
      health: await this.collectHealthData(),
      performance: await this.collectPerformanceData(),
      users: await this.collectUserData(),
      data: await this.collectDataQuality(),
      api: await this.collectApiData(),
      issues: await this.collectIssues(),
      trends: type !== 'daily' ? await this.collectTrends(type) : null
    };
    
    return data;
  }

  /**
   * 收集健康数据
   */
  async collectHealthData() {
    // 从admin-agent获取健康数据
    const adminAgent = require('../core/admin-agent');
    const healthCheck = await adminAgent.healthCheck();
    
    return {
      systemHealth: healthCheck.metrics.systemHealth,
      riskLevel: healthCheck.metrics.riskLevel,
      issues: healthCheck.issues.length,
      checks: healthCheck.checks
    };
  }

  /**
   * 收集性能数据
   */
  async collectPerformanceData() {
    const analyzer = dataAnalyzer.getComprehensiveReport();
    
    return {
      avgResponseTime: analyzer.apiUsage?.avgResponseTime || 0,
      throughput: analyzer.apiUsage?.totalRequests || 0,
      errorRate: analyzer.apiUsage?.errorRate || 0,
      cacheHitRate: 0.85 // 示例
    };
  }

  /**
   * 收集用户数据
   */
  async collectUserData() {
    const path = require('path');
    const storageService = require(path.join(__dirname, '../../../services/storageService'));
    
    const users = await storageService.read('users') || [];
    const activeUsers = users.filter(u => {
      if (!u.lastLogin) return false;
      const daysSinceLogin = (Date.now() - new Date(u.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin < 30;
    });
    
    return {
      total: users.length,
      active: activeUsers.length,
      newToday: users.filter(u => {
        const daysSinceCreated = (Date.now() - new Date(u.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreated < 1;
      }).length
    };
  }

  /**
   * 收集数据质量
   */
  async collectDataQuality() {
    const dataManager = require('../enhanced/data-manager');
    const qualityReport = await dataManager.checkDataQuality();
    
    return {
      overallScore: qualityReport.overallScore,
      issues: qualityReport.issues.length,
      recommendations: qualityReport.recommendations.length
    };
  }

  /**
   * 收集API数据
   */
  async collectApiData() {
    const apiSentinel = require('../api-sentinel/api-sentinel');
    const stats = apiSentinel.getOverallStats();
    
    return {
      totalApis: stats.totalApis || 0,
      healthyApis: stats.healthyApis || 0,
      healthRate: stats.healthRate || 0,
      avgResponseTime: stats.avgResponseTime || 0
    };
  }

  /**
   * 收集问题
   */
  async collectIssues() {
    const adminAgent = require('../core/admin-agent');
    const status = adminAgent.getStatus();
    
    return {
      total: status.issues.length,
      critical: status.issues.filter(i => i.severity === 'critical').length,
      high: status.issues.filter(i => i.severity === 'high').length,
      medium: status.issues.filter(i => i.severity === 'medium').length,
      low: status.issues.filter(i => i.severity === 'low').length
    };
  }

  /**
   * 收集趋势数据
   */
  async collectTrends(type) {
    // 从历史报告中提取趋势
    const recentReports = this.reports
      .filter(r => r.type === type)
      .slice(-7); // 最近7个报告
    
    return {
      healthTrend: this.calculateTrend(recentReports, 'sections.health.systemHealth'),
      performanceTrend: this.calculateTrend(recentReports, 'sections.performance.avgResponseTime'),
      userGrowthTrend: this.calculateTrend(recentReports, 'sections.users.total')
    };
  }

  /**
   * 计算趋势
   */
  calculateTrend(reports, path) {
    if (reports.length < 2) return 'stable';
    
    const values = reports.map(r => {
      const parts = path.split('.');
      let value = r;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || 0;
    });
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * 生成章节
   */
  async generateSection(section, data, type) {
    switch (section) {
      case 'summary':
        return this.generateSummary(data, type);
      case 'health':
        return this.generateHealthSection(data);
      case 'performance':
        return this.generatePerformanceSection(data);
      case 'issues':
        return this.generateIssuesSection(data);
      case 'recommendations':
        return await this.generateRecommendationsSection(data, type);
      case 'trends':
        return this.generateTrendsSection(data);
      case 'users':
        return this.generateUsersSection(data);
      case 'data':
        return this.generateDataSection(data);
      case 'optimization':
        return await this.generateOptimizationSection(data);
      default:
        return { content: '章节未实现' };
    }
  }

  /**
   * 生成摘要
   */
  generateSummary(data, type) {
    return {
      title: `${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}系统摘要`,
      content: {
        systemHealth: `${(data.health.systemHealth * 100).toFixed(1)}%`,
        riskLevel: data.health.riskLevel,
        totalIssues: data.issues.total,
        activeUsers: data.users.active,
        dataQuality: `${(data.data.overallScore * 100).toFixed(1)}%`
      },
      highlights: this.extractHighlights(data)
    };
  }

  /**
   * 提取亮点
   */
  extractHighlights(data) {
    const highlights = [];
    
    if (data.health.systemHealth > 0.9) {
      highlights.push('系统健康度优秀');
    }
    
    if (data.issues.total === 0) {
      highlights.push('无系统问题');
    }
    
    if (data.users.active > data.users.total * 0.5) {
      highlights.push('用户活跃度高');
    }
    
    return highlights;
  }

  /**
   * 生成健康章节
   */
  generateHealthSection(data) {
    return {
      title: '系统健康',
      content: {
        overallHealth: data.health.systemHealth,
        riskLevel: data.health.riskLevel,
        apiHealth: data.api.healthRate,
        dataIntegrity: data.data.overallScore,
        issues: {
          total: data.issues.total,
          bySeverity: {
            critical: data.issues.critical,
            high: data.issues.high,
            medium: data.issues.medium,
            low: data.issues.low
          }
        }
      }
    };
  }

  /**
   * 生成性能章节
   */
  generatePerformanceSection(data) {
    return {
      title: '系统性能',
      content: {
        avgResponseTime: `${data.performance.avgResponseTime}ms`,
        throughput: data.performance.throughput,
        errorRate: `${(data.performance.errorRate * 100).toFixed(2)}%`,
        cacheHitRate: `${(data.performance.cacheHitRate * 100).toFixed(1)}%`
      }
    };
  }

  /**
   * 生成问题章节
   */
  generateIssuesSection(data) {
    return {
      title: '系统问题',
      content: {
        total: data.issues.total,
        bySeverity: {
          critical: data.issues.critical,
          high: data.issues.high,
          medium: data.issues.medium,
          low: data.issues.low
        },
        topIssues: [] // 可以从admin-agent获取
      }
    };
  }

  /**
   * 生成建议章节（AI增强）
   */
  async generateRecommendationsSection(data, type) {
    try {
      const prompt = this.buildRecommendationsPrompt(data, type);
      
      const aiResult = await aiHub.analyze('report_recommendations', null, {
        complexity: 'high',
        needsAnalysis: true,
        prompt,
        data
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const recommendations = JSON.parse(aiResult.result.content);
          return {
            title: '管理建议',
            content: recommendations,
            source: 'ai_enhanced'
          };
        } catch (e) {
          return {
            title: '管理建议',
            content: {
              summary: aiResult.result.content,
              recommendations: this.extractRecommendationsFromText(aiResult.result.content)
            },
            source: 'ai_enhanced'
          };
        }
      }
    } catch (error) {
      logger.warn('AI生成建议失败，使用本地建议', error);
    }
    
    // 本地建议
    return {
      title: '管理建议',
      content: {
        recommendations: this.generateLocalRecommendations(data)
      },
      source: 'local'
    };
  }

  /**
   * 构建建议提示词
   */
  buildRecommendationsPrompt(data, type) {
    return `作为智能管理系统，请为以下系统状态生成管理建议：

报告类型: ${type}
系统健康度: ${(data.health.systemHealth * 100).toFixed(1)}%
风险等级: ${data.health.riskLevel}
问题数量: ${data.issues.total}
性能指标: 平均响应时间 ${data.performance.avgResponseTime}ms, 错误率 ${(data.performance.errorRate * 100).toFixed(2)}%
数据质量: ${(data.data.overallScore * 100).toFixed(1)}%

请返回JSON格式的建议：
{
  "summary": "总体建议摘要",
  "recommendations": [
    {
      "priority": "high/medium/low",
      "category": "health/performance/security/data",
      "title": "建议标题",
      "description": "详细描述",
      "action": "建议采取的行动"
    }
  ]
}`;
  }

  /**
   * 从文本提取建议
   */
  extractRecommendationsFromText(text) {
    const recommendations = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^\d+[\.\)]/) || line.includes('建议') || line.includes('应该')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  /**
   * 生成本地建议
   */
  generateLocalRecommendations(data) {
    const recommendations = [];
    
    if (data.health.systemHealth < 0.8) {
      recommendations.push({
        priority: 'high',
        category: 'health',
        title: '系统健康度偏低',
        description: `当前系统健康度为${(data.health.systemHealth * 100).toFixed(1)}%，建议检查系统问题`,
        action: '执行系统健康检查并修复发现的问题'
      });
    }
    
    if (data.performance.errorRate > 0.05) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        title: '错误率偏高',
        description: `当前错误率为${(data.performance.errorRate * 100).toFixed(2)}%`,
        action: '检查API接口和错误日志'
      });
    }
    
    return recommendations;
  }

  /**
   * 生成趋势章节
   */
  generateTrendsSection(data) {
    return {
      title: '趋势分析',
      content: data.trends || {}
    };
  }

  /**
   * 生成用户章节
   */
  generateUsersSection(data) {
    return {
      title: '用户统计',
      content: data.users
    };
  }

  /**
   * 生成数据章节
   */
  generateDataSection(data) {
    return {
      title: '数据质量',
      content: data.data
    };
  }

  /**
   * 生成优化章节
   */
  async generateOptimizationSection(data) {
    const adaptiveOptimizer = require('./adaptive-optimizer');
    const stats = adaptiveOptimizer.getStats();
    
    return {
      title: '优化建议',
      content: {
        optimizationsApplied: stats.total,
        successRate: `${(stats.successRate * 100).toFixed(1)}%`,
        averageImprovement: `${(stats.averageImprovement * 100).toFixed(1)}%`
      }
    };
  }

  /**
   * 生成AI摘要
   */
  async generateAISummary(sections, data, type) {
    try {
      const prompt = `请为以下${type === 'daily' ? '每日' : type === 'weekly' ? '每周' : '每月'}系统报告生成一个简洁的AI摘要（200字以内）：

${JSON.stringify(sections, null, 2)}

请用中文生成摘要，突出关键信息和重要建议。`;
      
      const aiResult = await aiHub.analyze('report_summary', null, {
        complexity: 'medium',
        needsAnalysis: true,
        prompt
      });
      
      if (aiResult.used && aiResult.result) {
        return {
          content: aiResult.result.content,
          confidence: aiResult.result.confidence || 0.7,
          generatedAt: Date.now()
        };
      }
    } catch (error) {
      logger.warn('生成AI摘要失败', error);
    }
    
    return null;
  }

  /**
   * 获取时间段
   */
  getPeriod(type) {
    const now = new Date();
    const start = new Date(now);
    
    switch (type) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      case 'weekly':
        start.setDate(start.getDate() - 7);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
      default:
        return {
          start: start.toISOString(),
          end: now.toISOString()
        };
    }
  }

  /**
   * 获取报告
   */
  getReport(reportId) {
    return this.reports.find(r => r.id === reportId);
  }

  /**
   * 获取最新报告
   */
  getLatestReport(type = null) {
    const filtered = type 
      ? this.reports.filter(r => r.type === type)
      : this.reports;
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  /**
   * 获取报告统计
   */
  getStats() {
    const byType = {};
    this.reports.forEach(r => {
      if (!byType[r.type]) {
        byType[r.type] = 0;
      }
      byType[r.type]++;
    });
    
    return {
      total: this.reports.length,
      byType,
      latest: this.reports.length > 0 ? this.reports[this.reports.length - 1].timestamp : null
    };
  }
}

module.exports = new IntelligentReportGenerator();






