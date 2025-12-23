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
    } else if (this.metrics.systemHealth < 0.85) {
      this.metrics.riskLevel = 'medium';
    } else {
      this.metrics.riskLevel = 'low';
    }

    // 生成健康报告
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      issues: this.issues,
      actions: this.actions
    };

    // 记录报告
    logger.info('系统健康检查报告', report);

    return report;
  }

  /**
   * API健康检查
   */
  async checkApiHealth() {
    try {
      const status = await apiSentinel.checkApis();
      this.metrics.apiHealth = status.score;
      return status;
    } catch (error) {
      logger.error('API健康检查失败', error);
      return { score: 0, errors: [error.message] };
    }
  }

  /**
   * 数据完整性检查
   */
  async checkDataIntegrity() {
    try {
      const result = await truthValidator.validate();
      this.metrics.dataIntegrity = result.score;
      return result;
    } catch (error) {
      logger.error('数据完整性检查失败', error);
      return { score: 0, errors: [error.message] };
    }
  }

  /**
   * 系统性能检查
   */
  async checkSystemPerformance() {
    try {
      const metrics = await performanceOptimizer.getMetrics();
      return {
        score: metrics.performanceScore || 0.8,
        metrics
      };
    } catch (error) {
      logger.error('系统性能检查失败', error);
      return { score: 0, errors: [error.message] };
    }
  }

  /**
   * 启动定时任务
   */
  startScheduledTasks() {
    logger.info('启动定时任务...');

    // 每5分钟执行一次健康检查
    cron.schedule('*/5 * * * *', async () => {
      await this.healthCheck();
    });

    // 每小时执行一次数据分析
    cron.schedule('0 * * * *', async () => {
      await dataAnalyzer.runHourlyAnalysis();
    });

    // 每天凌晨3点执行自动维护
    cron.schedule('0 3 * * *', async () => {
      await autoMaintainer.runScheduledMaintenance();
    });

    // 每天4点执行数据真实性验证
    cron.schedule('0 4 * * *', async () => {
      await truthValidator.runScheduledValidation();
    });

    // 每天5点执行学习系统
    cron.schedule('0 5 * * *', async () => {
      await learningEngine.runDailyLearning();
    });

    logger.info('定时任务已启动');
  }
}

module.exports = new AdminAgent();
