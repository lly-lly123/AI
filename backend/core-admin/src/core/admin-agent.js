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

// 增强模块
const userManager = require('../enhanced/user-manager');
const dataManager = require('../enhanced/data-manager');
const performanceOptimizer = require('../enhanced/performance-optimizer');
const securityMonitor = require('../enhanced/security-monitor');
const reportGenerator = require('../enhanced/report-generator');

// 智能模块（新增）
const decisionEngine = require('../intelligent/decision-engine');
const predictiveMaintenance = require('../intelligent/predictive-maintenance');
const workflowEngine = require('../intelligent/workflow-engine');
const alertSystem = require('../intelligent/alert-system');
const adaptiveOptimizer = require('../intelligent/adaptive-optimizer');
const knowledgeGraph = require('../intelligent/knowledge-graph');
const intelligentReportGenerator = require('../intelligent/report-generator');

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
   * 初始化（增强版）
   */
  async initialize() {
    logger.info('智鸽·中枢管家初始化中...');

    try {
      // 1. 自动发现API
      apiSentinel.autoDiscoverApis();

      // 2. 启动API监控
      apiSentinel.startMonitoring();

      // 3. 初始化智能模块
      await this.initializeIntelligentModules();

      // 4. 注册默认工作流
      await this.registerDefaultWorkflows();

      // 5. 初始化完成
      this.status = 'running';
      logger.info('智鸽·中枢管家初始化完成（智能增强版）');

      // 6. 执行首次健康检查
      await this.healthCheck();

      // 7. 启动定时任务
      this.startScheduledTasks();

      return true;
    } catch (error) {
      logger.error('初始化失败', error);
      this.status = 'error';
      return false;
    }
  }

  /**
   * 初始化智能模块
   */
  async initializeIntelligentModules() {
    logger.info('初始化智能模块...');
    
    try {
      // 初始化知识图谱
      await knowledgeGraph.loadGraph();
      
      // 初始化自适应优化器
      const currentConfig = adaptiveOptimizer.getCurrentConfig();
      logger.info('自适应优化器已初始化', { config: currentConfig });
      
      logger.info('智能模块初始化完成');
    } catch (error) {
      logger.warn('智能模块初始化部分失败', error);
    }
  }

  /**
   * 注册默认工作流
   */
  async registerDefaultWorkflows() {
    logger.info('注册默认工作流...');
    
    try {
      // 注册每日健康检查工作流
      workflowEngine.registerWorkflow('dailyHealthCheck');
      
      // 注册数据清理工作流
      workflowEngine.registerWorkflow('dataCleanup');
      
      // 注册性能优化工作流
      workflowEngine.registerWorkflow('performanceOptimization');
      
      // 注册安全扫描工作流
      workflowEngine.registerWorkflow('securityScan');
      
      // 注册智能备份工作流
      workflowEngine.registerWorkflow('intelligentBackup');
      
      logger.info('默认工作流注册完成');
    } catch (error) {
      logger.warn('工作流注册失败', error);
    }
  }

  /**
   * 健康检查（增强版 - 集成预测性维护和告警）
   */
  async healthCheck() {
    logger.info('执行系统健康检查（智能增强版）...');

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

    // 预测性维护：预测潜在问题
    await this.performPredictiveMaintenance(checks);

    // 智能告警：根据问题严重程度创建告警
    await this.createIntelligentAlerts(checks);

    // 自适应优化：根据性能数据自动优化
    if (this.metrics.systemHealth < 0.8) {
      await adaptiveOptimizer.optimize({
        avgResponseTime: checks.apiHealth.score * 1000,
        errorRate: 1 - checks.apiHealth.score,
        cacheHitRate: 0.85
      });
    }

    logger.info(`健康检查完成: 健康度 ${(this.metrics.systemHealth * 100).toFixed(2)}%`);

    return {
      metrics: this.metrics,
      checks,
      issues: this.issues,
      timestamp: Date.now(),
      intelligent: {
        predictions: predictiveMaintenance.getStats(),
        alerts: alertSystem.getStats(),
        optimizations: adaptiveOptimizer.getStats()
      }
    };
  }

  /**
   * 执行预测性维护
   */
  async performPredictiveMaintenance(checks) {
    try {
      // 预测API故障
      const apis = apiSentinel.getApis();
      for (const api of apis) {
        if (api.stats) {
          await predictiveMaintenance.predictApiFailure({
            id: api.id,
            name: api.name,
            ...api.stats
          });
        }
      }

      // 预测数据质量问题
      if (checks.dataIntegrity.score < 0.9) {
        await predictiveMaintenance.predictDataQualityIssues({
          score: checks.dataIntegrity.score,
          duplicateRate: 0.05,
          completeness: checks.dataIntegrity.score
        });
      }

      // 预测性能问题
      if (checks.systemPerformance.score < 0.8) {
        await predictiveMaintenance.predictPerformanceIssues({
          memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
          cpuUsage: 0.5,
          responseTime: checks.apiHealth.score * 1000
        });
      }
    } catch (error) {
      logger.warn('预测性维护执行失败', error);
    }
  }

  /**
   * 创建智能告警
   */
  async createIntelligentAlerts(checks) {
    try {
      // 根据健康度创建告警
      if (this.metrics.systemHealth < 0.5) {
        await alertSystem.createAlert(
          'system_health',
          'critical',
          { health: this.metrics.systemHealth, checks },
          { source: 'health_check' }
        );
      } else if (this.metrics.systemHealth < 0.7) {
        await alertSystem.createAlert(
          'system_health',
          'high',
          { health: this.metrics.systemHealth, checks },
          { source: 'health_check' }
        );
      }

      // API健康告警
      if (checks.apiHealth.score < 0.7) {
        await alertSystem.createAlert(
          'api_health',
          checks.apiHealth.score < 0.5 ? 'critical' : 'high',
          checks.apiHealth,
          { source: 'health_check' }
        );
      }

      // 数据完整性告警
      if (checks.dataIntegrity.score < 0.8) {
        await alertSystem.createAlert(
          'data_integrity',
          'medium',
          checks.dataIntegrity,
          { source: 'health_check' }
        );
      }
    } catch (error) {
      logger.warn('创建告警失败', error);
    }
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

    // 每30分钟执行一次用户异常检测
    cron.schedule('*/30 * * * *', async () => {
      await userManager.detectAnomalousUsers();
    });

    // 每小时执行一次数据质量检查
    cron.schedule('0 * * * *', async () => {
      await dataManager.checkDataQuality();
    });

    // 每15分钟执行一次性能监控
    cron.schedule('*/15 * * * *', async () => {
      await performanceOptimizer.monitorPerformance();
    });

    // 每10分钟执行一次安全威胁检测
    cron.schedule('*/10 * * * *', async () => {
      await securityMonitor.detectThreats();
    });

    // 每天凌晨3点执行数据清理
    cron.schedule('0 3 * * *', async () => {
      await dataManager.autoCleanup();
    });

    // 每天凌晨2点执行备份
    cron.schedule('0 2 * * *', async () => {
      await dataManager.performBackup();
    });

    // 每天生成综合报告（使用智能报告生成器）
    cron.schedule('0 1 * * *', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('daily');
    });

    // 每周生成周报
    cron.schedule('0 2 * * 1', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('weekly');
    });

    // 每月生成月报
    cron.schedule('0 3 1 * *', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('monthly');
    });

    // 每30分钟执行预测性维护
    cron.schedule('*/30 * * * *', async () => {
      const healthCheck = await this.healthCheck();
      await this.performPredictiveMaintenance(healthCheck.checks);
    });

    // 每小时执行自适应优化
    cron.schedule('0 * * * *', async () => {
      const performance = await this.checkSystemPerformance();
      await adaptiveOptimizer.optimize({
        avgResponseTime: performance.score * 1000,
        errorRate: 1 - performance.score,
        cacheHitRate: 0.85
      });
    });

    logger.info('定时任务已启动（包含增强功能）');
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
   * 获取系统状态（智能增强版）
   */
  getStatus() {
    return {
      status: this.status,
      uptime: Date.now() - this.startTime,
      metrics: this.metrics,
      issues: this.issues,
      timestamp: Date.now(),
      // 增强功能状态
      enhanced: {
        userManagement: userManager.getStats(),
        dataManagement: dataManager.getStats(),
        performance: performanceOptimizer.getStats(),
        security: securityMonitor.getStats()
      },
      // 智能功能状态
      intelligent: {
        decisionEngine: decisionEngine.getStats(),
        predictiveMaintenance: predictiveMaintenance.getStats(),
        workflowEngine: workflowEngine.getStats(),
        alertSystem: alertSystem.getStats(),
        adaptiveOptimizer: adaptiveOptimizer.getStats(),
        knowledgeGraph: knowledgeGraph.getStats(),
        intelligentReporting: intelligentReportGenerator.getStats()
      }
    };
  }

  /**
   * 获取增强管理能力（智能增强版）
   */
  async getEnhancedCapabilities() {
    return {
      userManagement: {
        detectAnomalies: true,
        behaviorAnalysis: true,
        autoHandle: true
      },
      dataManagement: {
        qualityCheck: true,
        duplicateDetection: true,
        autoCleanup: true,
        smartBackup: true
      },
      performance: {
        monitoring: true,
        bottleneckAnalysis: true,
        optimization: true
      },
      security: {
        threatDetection: true,
        rateLimiting: true,
        ipBlocking: true,
        inputValidation: true
      },
      reporting: {
        comprehensiveReport: true,
        trendAnalysis: true,
        aiSummary: true
      },
      // 新增智能能力
      intelligent: {
        decisionEngine: {
          enabled: true,
          autoExecute: true,
          confidenceThreshold: decisionEngine.confidenceThreshold
        },
        predictiveMaintenance: {
          enabled: true,
          models: Object.keys(predictiveMaintenance.predictionModels),
          accuracy: predictiveMaintenance.predictionAccuracy
        },
        workflowEngine: {
          enabled: true,
          workflows: workflowEngine.workflows.length,
          running: workflowEngine.runningWorkflows.size
        },
        alertSystem: {
          enabled: true,
          activeAlerts: alertSystem.alerts.filter(a => a.status === 'active').length,
          channels: Object.keys(alertSystem.alertChannels).filter(k => alertSystem.alertChannels[k])
        },
        adaptiveOptimizer: {
          enabled: true,
          optimizationsApplied: adaptiveOptimizer.optimizationHistory.length,
          successRate: adaptiveOptimizer.getStats().successRate
        },
        knowledgeGraph: {
          enabled: true,
          nodes: knowledgeGraph.graph.nodes.length,
          edges: knowledgeGraph.graph.edges.length
        },
        intelligentReporting: {
          enabled: true,
          reportsGenerated: intelligentReportGenerator.reports.length,
          aiEnhanced: true
        }
      }
    };
  }

  /**
   * 获取智能决策建议
   */
  async getIntelligentAdvice(context = {}) {
    const healthData = await this.healthCheck();
    
    // 使用决策引擎生成建议
    const decision = await decisionEngine.makeDecision(
      'systemHealth',
      {
        health: healthData.metrics.systemHealth,
        issues: healthData.issues,
        ...context
      }
    );
    
    return {
      decision: decision.decision,
      healthData,
      recommendations: decision.decision.recommendedActions || []
    };
  }

  /**
   * 执行智能工作流
   */
  async executeIntelligentWorkflow(workflowName, context = {}) {
    const workflow = workflowEngine.workflows.find(w => w.name === workflowName);
    if (!workflow) {
      throw new Error(`工作流不存在: ${workflowName}`);
    }
    
    return await workflowEngine.executeWorkflow(workflow.id, context);
  }

  /**
   * 查询知识图谱
   */
  async queryKnowledgeGraph(query) {
    return await knowledgeGraph.intelligentQuery(query);
  }
}

module.exports = new AdminAgent();



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

// 增强模块
const userManager = require('../enhanced/user-manager');
const dataManager = require('../enhanced/data-manager');
const performanceOptimizer = require('../enhanced/performance-optimizer');
const securityMonitor = require('../enhanced/security-monitor');
const reportGenerator = require('../enhanced/report-generator');

// 智能模块（新增）
const decisionEngine = require('../intelligent/decision-engine');
const predictiveMaintenance = require('../intelligent/predictive-maintenance');
const workflowEngine = require('../intelligent/workflow-engine');
const alertSystem = require('../intelligent/alert-system');
const adaptiveOptimizer = require('../intelligent/adaptive-optimizer');
const knowledgeGraph = require('../intelligent/knowledge-graph');
const intelligentReportGenerator = require('../intelligent/report-generator');

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
   * 初始化（增强版）
   */
  async initialize() {
    logger.info('智鸽·中枢管家初始化中...');

    try {
      // 1. 自动发现API
      apiSentinel.autoDiscoverApis();

      // 2. 启动API监控
      apiSentinel.startMonitoring();

      // 3. 初始化智能模块
      await this.initializeIntelligentModules();

      // 4. 注册默认工作流
      await this.registerDefaultWorkflows();

      // 5. 初始化完成
      this.status = 'running';
      logger.info('智鸽·中枢管家初始化完成（智能增强版）');

      // 6. 执行首次健康检查
      await this.healthCheck();

      // 7. 启动定时任务
      this.startScheduledTasks();

      return true;
    } catch (error) {
      logger.error('初始化失败', error);
      this.status = 'error';
      return false;
    }
  }

  /**
   * 初始化智能模块
   */
  async initializeIntelligentModules() {
    logger.info('初始化智能模块...');
    
    try {
      // 初始化知识图谱
      await knowledgeGraph.loadGraph();
      
      // 初始化自适应优化器
      const currentConfig = adaptiveOptimizer.getCurrentConfig();
      logger.info('自适应优化器已初始化', { config: currentConfig });
      
      logger.info('智能模块初始化完成');
    } catch (error) {
      logger.warn('智能模块初始化部分失败', error);
    }
  }

  /**
   * 注册默认工作流
   */
  async registerDefaultWorkflows() {
    logger.info('注册默认工作流...');
    
    try {
      // 注册每日健康检查工作流
      workflowEngine.registerWorkflow('dailyHealthCheck');
      
      // 注册数据清理工作流
      workflowEngine.registerWorkflow('dataCleanup');
      
      // 注册性能优化工作流
      workflowEngine.registerWorkflow('performanceOptimization');
      
      // 注册安全扫描工作流
      workflowEngine.registerWorkflow('securityScan');
      
      // 注册智能备份工作流
      workflowEngine.registerWorkflow('intelligentBackup');
      
      logger.info('默认工作流注册完成');
    } catch (error) {
      logger.warn('工作流注册失败', error);
    }
  }

  /**
   * 健康检查（增强版 - 集成预测性维护和告警）
   */
  async healthCheck() {
    logger.info('执行系统健康检查（智能增强版）...');

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

    // 预测性维护：预测潜在问题
    await this.performPredictiveMaintenance(checks);

    // 智能告警：根据问题严重程度创建告警
    await this.createIntelligentAlerts(checks);

    // 自适应优化：根据性能数据自动优化
    if (this.metrics.systemHealth < 0.8) {
      await adaptiveOptimizer.optimize({
        avgResponseTime: checks.apiHealth.score * 1000,
        errorRate: 1 - checks.apiHealth.score,
        cacheHitRate: 0.85
      });
    }

    logger.info(`健康检查完成: 健康度 ${(this.metrics.systemHealth * 100).toFixed(2)}%`);

    return {
      metrics: this.metrics,
      checks,
      issues: this.issues,
      timestamp: Date.now(),
      intelligent: {
        predictions: predictiveMaintenance.getStats(),
        alerts: alertSystem.getStats(),
        optimizations: adaptiveOptimizer.getStats()
      }
    };
  }

  /**
   * 执行预测性维护
   */
  async performPredictiveMaintenance(checks) {
    try {
      // 预测API故障
      const apis = apiSentinel.getApis();
      for (const api of apis) {
        if (api.stats) {
          await predictiveMaintenance.predictApiFailure({
            id: api.id,
            name: api.name,
            ...api.stats
          });
        }
      }

      // 预测数据质量问题
      if (checks.dataIntegrity.score < 0.9) {
        await predictiveMaintenance.predictDataQualityIssues({
          score: checks.dataIntegrity.score,
          duplicateRate: 0.05,
          completeness: checks.dataIntegrity.score
        });
      }

      // 预测性能问题
      if (checks.systemPerformance.score < 0.8) {
        await predictiveMaintenance.predictPerformanceIssues({
          memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
          cpuUsage: 0.5,
          responseTime: checks.apiHealth.score * 1000
        });
      }
    } catch (error) {
      logger.warn('预测性维护执行失败', error);
    }
  }

  /**
   * 创建智能告警
   */
  async createIntelligentAlerts(checks) {
    try {
      // 根据健康度创建告警
      if (this.metrics.systemHealth < 0.5) {
        await alertSystem.createAlert(
          'system_health',
          'critical',
          { health: this.metrics.systemHealth, checks },
          { source: 'health_check' }
        );
      } else if (this.metrics.systemHealth < 0.7) {
        await alertSystem.createAlert(
          'system_health',
          'high',
          { health: this.metrics.systemHealth, checks },
          { source: 'health_check' }
        );
      }

      // API健康告警
      if (checks.apiHealth.score < 0.7) {
        await alertSystem.createAlert(
          'api_health',
          checks.apiHealth.score < 0.5 ? 'critical' : 'high',
          checks.apiHealth,
          { source: 'health_check' }
        );
      }

      // 数据完整性告警
      if (checks.dataIntegrity.score < 0.8) {
        await alertSystem.createAlert(
          'data_integrity',
          'medium',
          checks.dataIntegrity,
          { source: 'health_check' }
        );
      }
    } catch (error) {
      logger.warn('创建告警失败', error);
    }
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

    // 每30分钟执行一次用户异常检测
    cron.schedule('*/30 * * * *', async () => {
      await userManager.detectAnomalousUsers();
    });

    // 每小时执行一次数据质量检查
    cron.schedule('0 * * * *', async () => {
      await dataManager.checkDataQuality();
    });

    // 每15分钟执行一次性能监控
    cron.schedule('*/15 * * * *', async () => {
      await performanceOptimizer.monitorPerformance();
    });

    // 每10分钟执行一次安全威胁检测
    cron.schedule('*/10 * * * *', async () => {
      await securityMonitor.detectThreats();
    });

    // 每天凌晨3点执行数据清理
    cron.schedule('0 3 * * *', async () => {
      await dataManager.autoCleanup();
    });

    // 每天凌晨2点执行备份
    cron.schedule('0 2 * * *', async () => {
      await dataManager.performBackup();
    });

    // 每天生成综合报告（使用智能报告生成器）
    cron.schedule('0 1 * * *', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('daily');
    });

    // 每周生成周报
    cron.schedule('0 2 * * 1', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('weekly');
    });

    // 每月生成月报
    cron.schedule('0 3 1 * *', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('monthly');
    });

    // 每30分钟执行预测性维护
    cron.schedule('*/30 * * * *', async () => {
      const healthCheck = await this.healthCheck();
      await this.performPredictiveMaintenance(healthCheck.checks);
    });

    // 每小时执行自适应优化
    cron.schedule('0 * * * *', async () => {
      const performance = await this.checkSystemPerformance();
      await adaptiveOptimizer.optimize({
        avgResponseTime: performance.score * 1000,
        errorRate: 1 - performance.score,
        cacheHitRate: 0.85
      });
    });

    logger.info('定时任务已启动（包含增强功能）');
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
   * 获取系统状态（智能增强版）
   */
  getStatus() {
    return {
      status: this.status,
      uptime: Date.now() - this.startTime,
      metrics: this.metrics,
      issues: this.issues,
      timestamp: Date.now(),
      // 增强功能状态
      enhanced: {
        userManagement: userManager.getStats(),
        dataManagement: dataManager.getStats(),
        performance: performanceOptimizer.getStats(),
        security: securityMonitor.getStats()
      },
      // 智能功能状态
      intelligent: {
        decisionEngine: decisionEngine.getStats(),
        predictiveMaintenance: predictiveMaintenance.getStats(),
        workflowEngine: workflowEngine.getStats(),
        alertSystem: alertSystem.getStats(),
        adaptiveOptimizer: adaptiveOptimizer.getStats(),
        knowledgeGraph: knowledgeGraph.getStats(),
        intelligentReporting: intelligentReportGenerator.getStats()
      }
    };
  }

  /**
   * 获取增强管理能力（智能增强版）
   */
  async getEnhancedCapabilities() {
    return {
      userManagement: {
        detectAnomalies: true,
        behaviorAnalysis: true,
        autoHandle: true
      },
      dataManagement: {
        qualityCheck: true,
        duplicateDetection: true,
        autoCleanup: true,
        smartBackup: true
      },
      performance: {
        monitoring: true,
        bottleneckAnalysis: true,
        optimization: true
      },
      security: {
        threatDetection: true,
        rateLimiting: true,
        ipBlocking: true,
        inputValidation: true
      },
      reporting: {
        comprehensiveReport: true,
        trendAnalysis: true,
        aiSummary: true
      },
      // 新增智能能力
      intelligent: {
        decisionEngine: {
          enabled: true,
          autoExecute: true,
          confidenceThreshold: decisionEngine.confidenceThreshold
        },
        predictiveMaintenance: {
          enabled: true,
          models: Object.keys(predictiveMaintenance.predictionModels),
          accuracy: predictiveMaintenance.predictionAccuracy
        },
        workflowEngine: {
          enabled: true,
          workflows: workflowEngine.workflows.length,
          running: workflowEngine.runningWorkflows.size
        },
        alertSystem: {
          enabled: true,
          activeAlerts: alertSystem.alerts.filter(a => a.status === 'active').length,
          channels: Object.keys(alertSystem.alertChannels).filter(k => alertSystem.alertChannels[k])
        },
        adaptiveOptimizer: {
          enabled: true,
          optimizationsApplied: adaptiveOptimizer.optimizationHistory.length,
          successRate: adaptiveOptimizer.getStats().successRate
        },
        knowledgeGraph: {
          enabled: true,
          nodes: knowledgeGraph.graph.nodes.length,
          edges: knowledgeGraph.graph.edges.length
        },
        intelligentReporting: {
          enabled: true,
          reportsGenerated: intelligentReportGenerator.reports.length,
          aiEnhanced: true
        }
      }
    };
  }

  /**
   * 获取智能决策建议
   */
  async getIntelligentAdvice(context = {}) {
    const healthData = await this.healthCheck();
    
    // 使用决策引擎生成建议
    const decision = await decisionEngine.makeDecision(
      'systemHealth',
      {
        health: healthData.metrics.systemHealth,
        issues: healthData.issues,
        ...context
      }
    );
    
    return {
      decision: decision.decision,
      healthData,
      recommendations: decision.decision.recommendedActions || []
    };
  }

  /**
   * 执行智能工作流
   */
  async executeIntelligentWorkflow(workflowName, context = {}) {
    const workflow = workflowEngine.workflows.find(w => w.name === workflowName);
    if (!workflow) {
      throw new Error(`工作流不存在: ${workflowName}`);
    }
    
    return await workflowEngine.executeWorkflow(workflow.id, context);
  }

  /**
   * 查询知识图谱
   */
  async queryKnowledgeGraph(query) {
    return await knowledgeGraph.intelligentQuery(query);
  }
}

module.exports = new AdminAgent();



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

// 增强模块
const userManager = require('../enhanced/user-manager');
const dataManager = require('../enhanced/data-manager');
const performanceOptimizer = require('../enhanced/performance-optimizer');
const securityMonitor = require('../enhanced/security-monitor');
const reportGenerator = require('../enhanced/report-generator');

// 智能模块（新增）
const decisionEngine = require('../intelligent/decision-engine');
const predictiveMaintenance = require('../intelligent/predictive-maintenance');
const workflowEngine = require('../intelligent/workflow-engine');
const alertSystem = require('../intelligent/alert-system');
const adaptiveOptimizer = require('../intelligent/adaptive-optimizer');
const knowledgeGraph = require('../intelligent/knowledge-graph');
const intelligentReportGenerator = require('../intelligent/report-generator');

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
   * 初始化（增强版）
   */
  async initialize() {
    logger.info('智鸽·中枢管家初始化中...');

    try {
      // 1. 自动发现API
      apiSentinel.autoDiscoverApis();

      // 2. 启动API监控
      apiSentinel.startMonitoring();

      // 3. 初始化智能模块
      await this.initializeIntelligentModules();

      // 4. 注册默认工作流
      await this.registerDefaultWorkflows();

      // 5. 初始化完成
      this.status = 'running';
      logger.info('智鸽·中枢管家初始化完成（智能增强版）');

      // 6. 执行首次健康检查
      await this.healthCheck();

      // 7. 启动定时任务
      this.startScheduledTasks();

      return true;
    } catch (error) {
      logger.error('初始化失败', error);
      this.status = 'error';
      return false;
    }
  }

  /**
   * 初始化智能模块
   */
  async initializeIntelligentModules() {
    logger.info('初始化智能模块...');
    
    try {
      // 初始化知识图谱
      await knowledgeGraph.loadGraph();
      
      // 初始化自适应优化器
      const currentConfig = adaptiveOptimizer.getCurrentConfig();
      logger.info('自适应优化器已初始化', { config: currentConfig });
      
      logger.info('智能模块初始化完成');
    } catch (error) {
      logger.warn('智能模块初始化部分失败', error);
    }
  }

  /**
   * 注册默认工作流
   */
  async registerDefaultWorkflows() {
    logger.info('注册默认工作流...');
    
    try {
      // 注册每日健康检查工作流
      workflowEngine.registerWorkflow('dailyHealthCheck');
      
      // 注册数据清理工作流
      workflowEngine.registerWorkflow('dataCleanup');
      
      // 注册性能优化工作流
      workflowEngine.registerWorkflow('performanceOptimization');
      
      // 注册安全扫描工作流
      workflowEngine.registerWorkflow('securityScan');
      
      // 注册智能备份工作流
      workflowEngine.registerWorkflow('intelligentBackup');
      
      logger.info('默认工作流注册完成');
    } catch (error) {
      logger.warn('工作流注册失败', error);
    }
  }

  /**
   * 健康检查（增强版 - 集成预测性维护和告警）
   */
  async healthCheck() {
    logger.info('执行系统健康检查（智能增强版）...');

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

    // 预测性维护：预测潜在问题
    await this.performPredictiveMaintenance(checks);

    // 智能告警：根据问题严重程度创建告警
    await this.createIntelligentAlerts(checks);

    // 自适应优化：根据性能数据自动优化
    if (this.metrics.systemHealth < 0.8) {
      await adaptiveOptimizer.optimize({
        avgResponseTime: checks.apiHealth.score * 1000,
        errorRate: 1 - checks.apiHealth.score,
        cacheHitRate: 0.85
      });
    }

    logger.info(`健康检查完成: 健康度 ${(this.metrics.systemHealth * 100).toFixed(2)}%`);

    return {
      metrics: this.metrics,
      checks,
      issues: this.issues,
      timestamp: Date.now(),
      intelligent: {
        predictions: predictiveMaintenance.getStats(),
        alerts: alertSystem.getStats(),
        optimizations: adaptiveOptimizer.getStats()
      }
    };
  }

  /**
   * 执行预测性维护
   */
  async performPredictiveMaintenance(checks) {
    try {
      // 预测API故障
      const apis = apiSentinel.getApis();
      for (const api of apis) {
        if (api.stats) {
          await predictiveMaintenance.predictApiFailure({
            id: api.id,
            name: api.name,
            ...api.stats
          });
        }
      }

      // 预测数据质量问题
      if (checks.dataIntegrity.score < 0.9) {
        await predictiveMaintenance.predictDataQualityIssues({
          score: checks.dataIntegrity.score,
          duplicateRate: 0.05,
          completeness: checks.dataIntegrity.score
        });
      }

      // 预测性能问题
      if (checks.systemPerformance.score < 0.8) {
        await predictiveMaintenance.predictPerformanceIssues({
          memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
          cpuUsage: 0.5,
          responseTime: checks.apiHealth.score * 1000
        });
      }
    } catch (error) {
      logger.warn('预测性维护执行失败', error);
    }
  }

  /**
   * 创建智能告警
   */
  async createIntelligentAlerts(checks) {
    try {
      // 根据健康度创建告警
      if (this.metrics.systemHealth < 0.5) {
        await alertSystem.createAlert(
          'system_health',
          'critical',
          { health: this.metrics.systemHealth, checks },
          { source: 'health_check' }
        );
      } else if (this.metrics.systemHealth < 0.7) {
        await alertSystem.createAlert(
          'system_health',
          'high',
          { health: this.metrics.systemHealth, checks },
          { source: 'health_check' }
        );
      }

      // API健康告警
      if (checks.apiHealth.score < 0.7) {
        await alertSystem.createAlert(
          'api_health',
          checks.apiHealth.score < 0.5 ? 'critical' : 'high',
          checks.apiHealth,
          { source: 'health_check' }
        );
      }

      // 数据完整性告警
      if (checks.dataIntegrity.score < 0.8) {
        await alertSystem.createAlert(
          'data_integrity',
          'medium',
          checks.dataIntegrity,
          { source: 'health_check' }
        );
      }
    } catch (error) {
      logger.warn('创建告警失败', error);
    }
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

    // 每30分钟执行一次用户异常检测
    cron.schedule('*/30 * * * *', async () => {
      await userManager.detectAnomalousUsers();
    });

    // 每小时执行一次数据质量检查
    cron.schedule('0 * * * *', async () => {
      await dataManager.checkDataQuality();
    });

    // 每15分钟执行一次性能监控
    cron.schedule('*/15 * * * *', async () => {
      await performanceOptimizer.monitorPerformance();
    });

    // 每10分钟执行一次安全威胁检测
    cron.schedule('*/10 * * * *', async () => {
      await securityMonitor.detectThreats();
    });

    // 每天凌晨3点执行数据清理
    cron.schedule('0 3 * * *', async () => {
      await dataManager.autoCleanup();
    });

    // 每天凌晨2点执行备份
    cron.schedule('0 2 * * *', async () => {
      await dataManager.performBackup();
    });

    // 每天生成综合报告（使用智能报告生成器）
    cron.schedule('0 1 * * *', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('daily');
    });

    // 每周生成周报
    cron.schedule('0 2 * * 1', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('weekly');
    });

    // 每月生成月报
    cron.schedule('0 3 1 * *', async () => {
      await intelligentReportGenerator.generateComprehensiveReport('monthly');
    });

    // 每30分钟执行预测性维护
    cron.schedule('*/30 * * * *', async () => {
      const healthCheck = await this.healthCheck();
      await this.performPredictiveMaintenance(healthCheck.checks);
    });

    // 每小时执行自适应优化
    cron.schedule('0 * * * *', async () => {
      const performance = await this.checkSystemPerformance();
      await adaptiveOptimizer.optimize({
        avgResponseTime: performance.score * 1000,
        errorRate: 1 - performance.score,
        cacheHitRate: 0.85
      });
    });

    logger.info('定时任务已启动（包含增强功能）');
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
   * 获取系统状态（智能增强版）
   */
  getStatus() {
    return {
      status: this.status,
      uptime: Date.now() - this.startTime,
      metrics: this.metrics,
      issues: this.issues,
      timestamp: Date.now(),
      // 增强功能状态
      enhanced: {
        userManagement: userManager.getStats(),
        dataManagement: dataManager.getStats(),
        performance: performanceOptimizer.getStats(),
        security: securityMonitor.getStats()
      },
      // 智能功能状态
      intelligent: {
        decisionEngine: decisionEngine.getStats(),
        predictiveMaintenance: predictiveMaintenance.getStats(),
        workflowEngine: workflowEngine.getStats(),
        alertSystem: alertSystem.getStats(),
        adaptiveOptimizer: adaptiveOptimizer.getStats(),
        knowledgeGraph: knowledgeGraph.getStats(),
        intelligentReporting: intelligentReportGenerator.getStats()
      }
    };
  }

  /**
   * 获取增强管理能力（智能增强版）
   */
  async getEnhancedCapabilities() {
    return {
      userManagement: {
        detectAnomalies: true,
        behaviorAnalysis: true,
        autoHandle: true
      },
      dataManagement: {
        qualityCheck: true,
        duplicateDetection: true,
        autoCleanup: true,
        smartBackup: true
      },
      performance: {
        monitoring: true,
        bottleneckAnalysis: true,
        optimization: true
      },
      security: {
        threatDetection: true,
        rateLimiting: true,
        ipBlocking: true,
        inputValidation: true
      },
      reporting: {
        comprehensiveReport: true,
        trendAnalysis: true,
        aiSummary: true
      },
      // 新增智能能力
      intelligent: {
        decisionEngine: {
          enabled: true,
          autoExecute: true,
          confidenceThreshold: decisionEngine.confidenceThreshold
        },
        predictiveMaintenance: {
          enabled: true,
          models: Object.keys(predictiveMaintenance.predictionModels),
          accuracy: predictiveMaintenance.predictionAccuracy
        },
        workflowEngine: {
          enabled: true,
          workflows: workflowEngine.workflows.length,
          running: workflowEngine.runningWorkflows.size
        },
        alertSystem: {
          enabled: true,
          activeAlerts: alertSystem.alerts.filter(a => a.status === 'active').length,
          channels: Object.keys(alertSystem.alertChannels).filter(k => alertSystem.alertChannels[k])
        },
        adaptiveOptimizer: {
          enabled: true,
          optimizationsApplied: adaptiveOptimizer.optimizationHistory.length,
          successRate: adaptiveOptimizer.getStats().successRate
        },
        knowledgeGraph: {
          enabled: true,
          nodes: knowledgeGraph.graph.nodes.length,
          edges: knowledgeGraph.graph.edges.length
        },
        intelligentReporting: {
          enabled: true,
          reportsGenerated: intelligentReportGenerator.reports.length,
          aiEnhanced: true
        }
      }
    };
  }

  /**
   * 获取智能决策建议
   */
  async getIntelligentAdvice(context = {}) {
    const healthData = await this.healthCheck();
    
    // 使用决策引擎生成建议
    const decision = await decisionEngine.makeDecision(
      'systemHealth',
      {
        health: healthData.metrics.systemHealth,
        issues: healthData.issues,
        ...context
      }
    );
    
    return {
      decision: decision.decision,
      healthData,
      recommendations: decision.decision.recommendedActions || []
    };
  }

  /**
   * 执行智能工作流
   */
  async executeIntelligentWorkflow(workflowName, context = {}) {
    const workflow = workflowEngine.workflows.find(w => w.name === workflowName);
    if (!workflow) {
      throw new Error(`工作流不存在: ${workflowName}`);
    }
    
    return await workflowEngine.executeWorkflow(workflow.id, context);
  }

  /**
   * 查询知识图谱
   */
  async queryKnowledgeGraph(query) {
    return await knowledgeGraph.intelligentQuery(query);
  }
}

module.exports = new AdminAgent();


