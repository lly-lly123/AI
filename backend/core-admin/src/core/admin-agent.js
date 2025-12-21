/**
 * 管理员代理（核心）
 * 永远在线，最终执行权，不依赖AI
 */

const logger = require('../utils/logger');
const apiSentinel = require('../api-sentinel/api-sentinel');
const truthValidator = require('../truth-validator/data-truth-validator');
const aiHub = require('../ai-hub/ai-hub');
const ruleEngine = require('../rule-engine/rule-engine');
const dataAnalyzer = require('../analytics/data-analyzer');
const autoMaintainer = require('../maintenance/auto-maintainer');
const learningEngine = require('../learning/learning-engine');
const cron = require('node-cron');

class AdminAgent {
  constructor() {
    this.status = 'initializing';
    this.startTime = Date.now();
    this.metrics = {
      systemHealth: 1.0,
      dataIntegrity: 1.0,
      apiHealth: 1.0,
      riskLevel: 'low'
    };
    this.issues = [];
    this.actions = [];
  }

  /**
   * 初始化
   */
  async initialize() {
    logger.info('智鸽·中枢管家初始化中...');

    try {
      // 1. 自动发现API
      apiSentinel.autoDiscoverApis();

      // 2. 启动API监控
      apiSentinel.startMonitoring();

      // 3. 初始化完成
      this.status = 'running';
      logger.info('智鸽·中枢管家初始化完成');

      // 4. 执行首次健康检查
      await this.healthCheck();

      // 5. 启动定时任务
      this.startScheduledTasks();

      return true;
    } catch (error) {
      logger.error('初始化失败', error);
      this.status = 'error';
      return false;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    logger.info('执行系统健康检查...');

    const checks = {
      apiHealth: await this.checkApiHealth(),
      dataIntegrity: await this.checkDataIntegrity(),
      systemPerformance: await this.checkSystemPerformance()
    };

    // 计算总体健康度
    this.metrics.systemHealth = (
      checks.apiHealth.score * 0.4 +
      checks.dataIntegrity.score * 0.4 +
      checks.systemPerformance.score * 0.2
    );

    // 更新风险等级
    if (this.metrics.systemHealth < 0.5) {
      this.metrics.riskLevel = 'critical';
    } else if (this.metrics.systemHealth < 0.7) {
      this.metrics.riskLevel = 'high';
    } else if (this.metrics.systemHealth < 0.9) {
      this.metrics.riskLevel = 'medium';
    } else {
      this.metrics.riskLevel = 'low';
    }

    // 收集问题
    this.issues = [
      ...checks.apiHealth.issues,
      ...checks.dataIntegrity.issues,
      ...checks.systemPerformance.issues
    ];

    logger.info(`健康检查完成: 健康度 ${(this.metrics.systemHealth * 100).toFixed(2)}%`);

    return {
      metrics: this.metrics,
      checks,
      issues: this.issues,
      timestamp: Date.now()
    };
  }

  /**
   * 检查API健康
   */
  async checkApiHealth() {
    const stats = apiSentinel.getOverallStats();
    const apis = apiSentinel.getApis();

    const issues = [];
    let score = 1.0;

    // 检查API可用性
    if (stats.healthRate < 0.8) {
      issues.push({
        type: 'api_availability',
        severity: 'high',
        message: `API可用率过低: ${(stats.healthRate * 100).toFixed(2)}%`,
        apis: apis.filter(a => a.health.status !== 'healthy')
      });
      score -= 0.3;
    }

    // 检查响应时间
    const slowApis = apis.filter(a => a.stats.avgResponseTime > 5000);
    if (slowApis.length > 0) {
      issues.push({
        type: 'api_performance',
        severity: 'medium',
        message: `${slowApis.length} 个API响应时间过长`,
        apis: slowApis
      });
      score -= 0.1;
    }

    // 检查数据真实性
    const suspectApis = apis.filter(a => a.health.truthStatus === 'suspect' || a.health.truthStatus === 'invalid');
    if (suspectApis.length > 0) {
      issues.push({
        type: 'data_truth',
        severity: 'high',
        message: `${suspectApis.length} 个API数据真实性可疑`,
        apis: suspectApis
      });
      score -= 0.2;
    }

    this.metrics.apiHealth = Math.max(0, score);

    return { score: this.metrics.apiHealth, issues };
  }

  /**
   * 检查数据完整性
   */
  async checkDataIntegrity() {
    const issues = [];
    let score = 1.0;

    // 这里可以添加数据完整性检查逻辑
    // 例如：检查数据库一致性、数据备份状态等

    this.metrics.dataIntegrity = Math.max(0, score);

    return { score: this.metrics.dataIntegrity, issues };
  }

  /**
   * 检查系统性能
   */
  async checkSystemPerformance() {
    const issues = [];
    let score = 1.0;

    // 检查内存使用
    const memUsage = process.memoryUsage();
    const memUsagePercent = memUsage.heapUsed / memUsage.heapTotal;
    if (memUsagePercent > 0.9) {
      issues.push({
        type: 'memory',
        severity: 'high',
        message: `内存使用率过高: ${(memUsagePercent * 100).toFixed(2)}%`
      });
      score -= 0.2;
    }

    // 检查运行时间
    const uptime = Date.now() - this.startTime;
    if (uptime > 86400000 * 7) { // 7天
      issues.push({
        type: 'uptime',
        severity: 'low',
        message: '系统已运行较长时间，建议重启'
      });
    }

    return { score, issues };
  }

  /**
   * 获取管理建议（调用AI）
   */
  async getManagementAdvice() {
    const healthData = await this.healthCheck();

    // 判断是否需要AI
    const needsAI = 
      this.issues.length > 0 ||
      this.metrics.riskLevel !== 'low' ||
      this.metrics.systemHealth < 0.9;

    if (!needsAI) {
      return {
        used: false,
        advice: {
          summary: '系统运行正常，无需特别关注',
          priority: 'low',
          actions: []
        }
      };
    }

    // 调用AI生成建议
    const aiResult = await aiHub.analyze('management_advice', null, {
      complexity: 'complex',
      needsAnalysis: true,
      metrics: this.metrics,
      issues: this.issues
    });

    if (aiResult.used && aiResult.result) {
      try {
        const advice = JSON.parse(aiResult.result.content);
        return {
          used: true,
          advice: {
            ...advice,
            confidence: aiResult.result.confidence || 0.7
          }
        };
      } catch (e) {
        // AI返回不是JSON
        return {
          used: true,
          advice: {
            summary: aiResult.result.content,
            priority: 'medium',
            actions: [],
            confidence: aiResult.result.confidence || 0.7
          }
        };
      }
    }

    // AI调用失败，返回本地建议
    return {
      used: false,
      advice: {
        summary: '系统存在一些问题，建议检查',
        priority: this.metrics.riskLevel,
        actions: this.issues.map(i => i.message),
        confidence: 0.8
      }
    };
  }

  /**
   * 启动定时任务
   */
  startScheduledTasks() {
    // 每5分钟执行一次健康检查
    cron.schedule('*/5 * * * *', async () => {
      await this.healthCheck();
    });

    // 每小时执行一次数据分析
    cron.schedule('0 * * * *', async () => {
      await this.performDataAnalysis();
    });

    // 每6小时执行一次维护检查
    cron.schedule('0 */6 * * *', async () => {
      await autoMaintainer.performRoutineCheck();
    });

    // 每天执行一次自我升级
    cron.schedule('0 2 * * *', async () => {
      learningEngine.selfUpgrade();
    });

    logger.info('定时任务已启动');
  }

  /**
   * 执行数据分析
   */
  async performDataAnalysis() {
    try {
      const report = dataAnalyzer.getComprehensiveReport();
      
      // 记录分析事件
      learningEngine.recordEvent('data_analysis', {
        report,
        timestamp: Date.now()
      }, {
        type: 'scheduled',
        source: 'auto'
      });

      // 如果发现问题，调用AI分析
      if (report.apiUsage.total > 0) {
        const failedApis = report.apiUsage.topEndpoints.filter(
          api => api.successRate < 0.8
        );

        if (failedApis.length > 0) {
          await aiHub.analyze('api_performance_issue', null, {
            complexity: 'medium',
            needsAnalysis: true,
            data: {
              failedApis,
              report
            }
          });
        }
      }

      logger.info('数据分析完成');
    } catch (error) {
      logger.error('数据分析失败', error);
    }
  }

  /**
   * 自动管理数据
   */
  async autoManageData() {
    try {
      const report = dataAnalyzer.getComprehensiveReport();
      
      // 分析数据上传模式
      const uploadPatterns = dataAnalyzer.analyzeUploadPatterns();
      
      // 分析用户行为
      const behaviorPatterns = dataAnalyzer.analyzeUserBehaviorPatterns();

      // 生成管理建议
      const advice = await this.generateDataManagementAdvice(
        report,
        uploadPatterns,
        behaviorPatterns
      );

      return advice;
    } catch (error) {
      logger.error('自动数据管理失败', error);
      return null;
    }
  }

  /**
   * 生成数据管理建议
   */
  async generateDataManagementAdvice(report, uploadPatterns, behaviorPatterns) {
    const advice = {
      timestamp: Date.now(),
      recommendations: []
    };

    // 分析上传成功率
    for (const [type, stats] of Object.entries(uploadPatterns.byType)) {
      if (stats.successRate < 0.9) {
        advice.recommendations.push({
          type: 'upload_optimization',
          priority: 'high',
          message: `${type}类型数据上传成功率较低(${(stats.successRate * 100).toFixed(1)}%)，建议检查上传流程`,
          action: `检查${type}数据上传接口`
        });
      }
    }

    // 分析API使用情况
    const slowApis = report.apiUsage.topEndpoints.filter(
      api => api.avgResponseTime > 2000
    );

    if (slowApis.length > 0) {
      advice.recommendations.push({
        type: 'performance_optimization',
        priority: 'medium',
        message: `发现${slowApis.length}个响应较慢的API，建议优化`,
        action: '优化API性能',
        details: slowApis.map(api => ({
          endpoint: api.endpoint,
          responseTime: api.avgResponseTime
        }))
      });
    }

    // 分析用户行为异常
    const topActions = Object.entries(behaviorPatterns.topActions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topActions.length > 0) {
      advice.recommendations.push({
        type: 'user_experience',
        priority: 'low',
        message: '用户最常执行的操作',
        action: '优化用户体验',
        details: topActions.map(([action, count]) => ({ action, count }))
      });
    }

    return advice;
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      status: this.status,
      uptime: Date.now() - this.startTime,
      metrics: this.metrics,
      issues: this.issues,
      timestamp: Date.now()
    };
  }
}

module.exports = new AdminAgent();


