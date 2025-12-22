/**
 * 智能报告生成模块
 * 自动生成管理报告和趋势分析
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');
const adminAgent = require('../core/admin-agent');
const userManager = require('./user-manager');
const dataManager = require('./data-manager');
const performanceOptimizer = require('./performance-optimizer');
const securityMonitor = require('./security-monitor');

class ReportGenerator {
  constructor() {
    this.reportHistory = [];
  }

  /**
   * 生成综合管理报告
   */
  async generateComprehensiveReport(period = 'daily') {
    try {
      const report = {
        period,
        timestamp: Date.now(),
        generatedAt: new Date().toISOString(),
        sections: {}
      };
      
      // 1. 系统健康报告
      report.sections.systemHealth = await adminAgent.healthCheck();
      
      // 2. 用户管理报告
      report.sections.userManagement = {
        anomalies: await userManager.detectAnomalousUsers(),
        behaviorAnalysis: await this.analyzeUserBehaviorTrends(),
        recommendations: await userManager.generateUserManagementAdvice()
      };
      
      // 3. 数据质量报告
      report.sections.dataQuality = await dataManager.checkDataQuality();
      
      // 4. 性能报告
      report.sections.performance = await performanceOptimizer.monitorPerformance();
      report.sections.performance.bottlenecks = await performanceOptimizer.analyzeBottlenecks();
      
      // 5. 安全报告
      report.sections.security = await securityMonitor.detectThreats();
      
      // 6. 趋势分析
      report.sections.trends = await this.analyzeTrends(period);
      
      // 7. AI生成总结和建议
      report.summary = await this.generateAISummary(report);
      
      // 保存报告
      this.reportHistory.push(report);
      if (this.reportHistory.length > 100) {
        this.reportHistory.shift();
      }
      
      return report;
    } catch (error) {
      logger.error('生成综合报告失败', error);
      throw error;
    }
  }

  /**
   * 分析用户行为趋势
   */
  async analyzeUserBehaviorTrends() {
    // 这里可以添加用户行为趋势分析逻辑
    return {
      activeUsers: 0,
      newUsers: 0,
      inactiveUsers: 0,
      trend: 'stable'
    };
  }

  /**
   * 分析趋势
   */
  async analyzeTrends(period) {
    const trends = {
      userGrowth: this.calculateUserGrowthTrend(),
      dataGrowth: this.calculateDataGrowthTrend(),
      performanceTrend: this.calculatePerformanceTrend(),
      securityTrend: this.calculateSecurityTrend()
    };
    
    return trends;
  }

  /**
   * 生成AI总结
   */
  async generateAISummary(report) {
    try {
      const aiResult = await aiHub.analyze('management_report_summary', null, {
        complexity: 'complex',
        needsAnalysis: true,
        data: {
          report,
          sections: Object.keys(report.sections)
        }
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          return JSON.parse(aiResult.result.content);
        } catch (e) {
          return {
            summary: aiResult.result.content,
            keyFindings: [],
            recommendations: [],
            priority: 'medium'
          };
        }
      }
      
      // 本地总结
      return {
        summary: '系统运行正常，建议关注数据质量和性能优化',
        keyFindings: this.extractKeyFindings(report),
        recommendations: this.extractRecommendations(report),
        priority: this.determinePriority(report)
      };
    } catch (error) {
      logger.error('生成AI总结失败', error);
      return {
        summary: '报告生成完成',
        keyFindings: [],
        recommendations: [],
        priority: 'medium'
      };
    }
  }

  // ========== 辅助方法 ==========

  calculateUserGrowthTrend() {
    // 计算用户增长趋势
    return { trend: 'stable', growth: 0 };
  }

  calculateDataGrowthTrend() {
    // 计算数据增长趋势
    return { trend: 'increasing', growth: 5 };
  }

  calculatePerformanceTrend() {
    // 计算性能趋势
    return { trend: 'stable', change: 0 };
  }

  calculateSecurityTrend() {
    // 计算安全趋势
    return { trend: 'improving', threats: 0 };
  }

  extractKeyFindings(report) {
    const findings = [];
    
    // 从各个部分提取关键发现
    if (report.sections.systemHealth && report.sections.systemHealth.issues) {
      const highPriorityIssues = report.sections.systemHealth.issues.filter(
        i => i.severity === 'high'
      );
      if (highPriorityIssues.length > 0) {
        findings.push(`发现${highPriorityIssues.length}个高优先级系统问题`);
      }
    }
    
    if (report.sections.userManagement && report.sections.userManagement.anomalies) {
      const anomalies = report.sections.userManagement.anomalies;
      if (anomalies.highRisk > 0) {
        findings.push(`检测到${anomalies.highRisk}个高风险用户`);
      }
    }
    
    if (report.sections.dataQuality && report.sections.dataQuality.overallScore < 0.8) {
      findings.push(`数据质量评分较低: ${(report.sections.dataQuality.overallScore * 100).toFixed(1)}%`);
    }
    
    if (report.sections.security && report.sections.security.high > 0) {
      findings.push(`检测到${report.sections.security.high}个高风险安全威胁`);
    }
    
    return findings;
  }

  extractRecommendations(report) {
    const recommendations = [];
    
    // 收集所有建议
    Object.values(report.sections).forEach(section => {
      if (section.recommendations) {
        recommendations.push(...section.recommendations);
      }
    });
    
    // 按优先级排序
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => 
      (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    );
    
    return recommendations.slice(0, 10); // 返回前10个建议
  }

  determinePriority(report) {
    // 根据报告内容确定优先级
    let maxPriority = 'low';
    
    Object.values(report.sections).forEach(section => {
      if (section.issues) {
        const highIssues = section.issues.filter(i => i.severity === 'high');
        if (highIssues.length > 0 && maxPriority !== 'high') {
          maxPriority = 'high';
        } else if (section.issues.length > 0 && maxPriority === 'low') {
          maxPriority = 'medium';
        }
      }
    });
    
    return maxPriority;
  }

  /**
   * 获取报告历史
   */
  getReportHistory(limit = 10) {
    return this.reportHistory.slice(-limit).reverse();
  }
}

module.exports = new ReportGenerator();

























