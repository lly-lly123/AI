/**
 * API路由
 */

const express = require('express');
const router = express.Router();
const coreAdminManager = require('../core/core-admin-manager');
const adminAgent = require('../core/admin-agent');
const apiSentinel = require('../api-sentinel/api-sentinel');
const truthValidator = require('../truth-validator/data-truth-validator');
const aiHub = require('../ai-hub/ai-hub');
const learningEngine = require('../learning/learning-engine');
const dataAnalyzer = require('../analytics/data-analyzer');
const autoMaintainer = require('../maintenance/auto-maintainer');
const logger = require('../utils/logger');

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

// 升级服务
const upgradeService = require('../services/upgrade-service');

/**
 * 获取系统状态（完整版 - 包含所有模块）
 */
router.get('/status', async (req, res) => {
  try {
    const status = coreAdminManager.getSystemStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('获取系统状态失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模块信息
 * GET /api/modules/:type
 */
router.get('/modules/:type', (req, res) => {
  try {
    const { type } = req.params;
    const info = coreAdminManager.getModuleInfo(type);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        error: `模块类型不存在: ${type}`
      });
    }
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('获取模块信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取所有功能能力
 * GET /api/capabilities
 */
router.get('/capabilities', (req, res) => {
  try {
    const capabilities = coreAdminManager.getAllCapabilities();
    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    logger.error('获取功能能力失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 健康检查
 */
router.get('/health', async (req, res) => {
  try {
    const health = await adminAgent.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('健康检查失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取管理建议（增强版 - 使用智能决策引擎）
 */
router.get('/advice', async (req, res) => {
  try {
    const advice = await adminAgent.getIntelligentAdvice(req.query);
    res.json({
      success: true,
      data: advice
    });
  } catch (error) {
    logger.error('获取管理建议失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取智能决策建议
 * GET /api/intelligent/advice
 */
router.get('/intelligent/advice', async (req, res) => {
  try {
    const { category, context } = req.query;
    const decision = await decisionEngine.makeDecision(
      category || 'systemHealth',
      context ? JSON.parse(context) : {}
    );
    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    logger.error('获取智能决策失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取预测性维护信息
 * GET /api/intelligent/predictions
 */
router.get('/intelligent/predictions', async (req, res) => {
  try {
    const stats = predictiveMaintenance.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取预测信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取工作流列表
 * GET /api/intelligent/workflows
 */
router.get('/intelligent/workflows', async (req, res) => {
  try {
    const workflows = workflowEngine.workflows;
    const stats = workflowEngine.getStats();
    res.json({
      success: true,
      data: {
        workflows,
        stats
      }
    });
  } catch (error) {
    logger.error('获取工作流列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 执行工作流
 * POST /api/intelligent/workflows/:id/execute
 */
router.post('/intelligent/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await workflowEngine.executeWorkflow(id, req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('执行工作流失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取告警列表
 * GET /api/intelligent/alerts
 */
router.get('/intelligent/alerts', async (req, res) => {
  try {
    const { status, severity } = req.query;
    let alerts = alertSystem.alerts;
    
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }
    
    const stats = alertSystem.getStats();
    res.json({
      success: true,
      data: {
        alerts: alerts.slice(-100), // 最近100条
        stats
      }
    });
  } catch (error) {
    logger.error('获取告警列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 确认告警
 * POST /api/intelligent/alerts/:id/acknowledge
 */
router.post('/intelligent/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    alertSystem.acknowledgeAlert(id, userId);
    res.json({
      success: true,
      message: '告警已确认'
    });
  } catch (error) {
    logger.error('确认告警失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 解决告警
 * POST /api/intelligent/alerts/:id/resolve
 */
router.post('/intelligent/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    alertSystem.resolveAlert(id, resolution);
    res.json({
      success: true,
      message: '告警已解决'
    });
  } catch (error) {
    logger.error('解决告警失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取自适应优化状态
 * GET /api/intelligent/optimization
 */
router.get('/intelligent/optimization', async (req, res) => {
  try {
    const stats = adaptiveOptimizer.getStats();
    const config = adaptiveOptimizer.getCurrentConfig();
    res.json({
      success: true,
      data: {
        stats,
        currentConfig: config
      }
    });
  } catch (error) {
    logger.error('获取优化状态失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 查询知识图谱
 * GET /api/intelligent/knowledge
 */
router.get('/intelligent/knowledge', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const stats = knowledgeGraph.getStats();
      return res.json({
        success: true,
        data: {
          stats,
          message: '请提供查询参数'
        }
      });
    }
    
    const result = await knowledgeGraph.intelligentQuery(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('查询知识图谱失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取智能报告
 * GET /api/intelligent/reports
 */
router.get('/intelligent/reports', async (req, res) => {
  try {
    const { type, id } = req.query;
    
    if (id) {
      const report = intelligentReportGenerator.getReport(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: '报告不存在'
        });
      }
      return res.json({
        success: true,
        data: report
      });
    }
    
    if (type) {
      const latest = intelligentReportGenerator.getLatestReport(type);
      return res.json({
        success: true,
        data: latest || null
      });
    }
    
    const stats = intelligentReportGenerator.getStats();
    res.json({
      success: true,
      data: {
        stats,
        reports: intelligentReportGenerator.reports.slice(-20) // 最近20个报告
      }
    });
  } catch (error) {
    logger.error('获取智能报告失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 生成智能报告
 * POST /api/intelligent/reports/generate
 */
router.post('/intelligent/reports/generate', async (req, res) => {
  try {
    const { type = 'daily', options = {} } = req.body;
    const report = await intelligentReportGenerator.generateComprehensiveReport(type, options);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('生成智能报告失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API列表
 */
router.get('/apis', (req, res) => {
  try {
    const apis = apiSentinel.getApis();
    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    logger.error('获取API列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API详情
 */
router.get('/apis/:id', (req, res) => {
  try {
    const api = apiSentinel.getApi(req.params.id);
    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API不存在'
      });
    }
    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    logger.error('获取API详情失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 检查API健康
 */
router.post('/apis/:id/check', async (req, res) => {
  try {
    const result = await apiSentinel.checkApiHealth(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'API不存在'
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('API健康检查失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API统计
 */
router.get('/apis/stats/overall', (req, res) => {
  try {
    const stats = apiSentinel.getOverallStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取API统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 验证数据真实性
 */
router.post('/validate/truth', async (req, res) => {
  try {
    const { data, sources, options } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: '缺少数据参数'
      });
    }

    const validation = await truthValidator.validate(
      data,
      sources || [],
      options || {}
    );

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('数据真实性验证失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取AI Hub统计
 */
router.get('/ai/stats', (req, res) => {
  try {
    const stats = aiHub.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取AI统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模型配置信息
 */
router.get('/model/config', (req, res) => {
  try {
    const config = require('../config/config');
    const zhipuClient = require('../ai-hub/zhipu-client');
    
    // 检查API Key状态（不暴露完整key）
    const apiKey = config.zhipu.apiKey || '';
    const apiKeyStatus = apiKey.length > 0 ? 'configured' : 'not_configured';
    const apiKeyPreview = apiKey.length > 0 
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : '未配置';
    
    // 检查连接状态（通过检查client是否启用）
    const connectionStatus = zhipuClient.enabled && config.zhipu.enabled ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      data: {
        provider: '智谱AI (ZhipuAI)',
        model: config.zhipu.model || 'glm-4',
        apiBase: config.zhipu.apiBase || 'https://open.bigmodel.cn/api/paas/v4',
        apiKeyStatus: apiKeyStatus,
        apiKeyPreview: apiKeyPreview,
        connectionStatus: connectionStatus,
        enabled: config.zhipu.enabled !== false,
        maxCallsPerHour: config.zhipu.maxCallsPerHour || 100,
        confidenceThreshold: config.zhipu.confidenceThreshold || 0.7,
        stats: aiHub.getStats()
      }
    });
  } catch (error) {
    logger.error('获取模型配置失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取学习统计
 */
router.get('/learning/stats', (req, res) => {
  try {
    const stats = learningEngine.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取学习统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 查找相似历史
 */
router.post('/learning/similar', (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({
        success: false,
        error: '缺少上下文参数'
      });
    }

    const similar = learningEngine.findSimilarHistory(context);
    res.json({
      success: true,
      data: similar
    });
  } catch (error) {
    logger.error('查找相似历史失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 记录事件
 */
router.post('/learning/events', (req, res) => {
  try {
    const { type, data, context } = req.body;
    if (!type) {
      return res.status(400).json({
        success: false,
        error: '缺少事件类型'
      });
    }

    learningEngine.recordEvent(type, data || {}, context || {});
    res.json({
      success: true,
      message: '事件已记录'
    });
  } catch (error) {
    logger.error('记录事件失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 数据分析相关API
 */
router.post('/analytics/click', (req, res) => {
  try {
    const { element, context } = req.body;
    dataAnalyzer.recordClick(element, context || {});
    res.json({ success: true, message: '点击已记录' });
  } catch (error) {
    logger.error('记录点击失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analytics/upload', (req, res) => {
  try {
    const { type, metadata } = req.body;
    dataAnalyzer.recordUpload(type, metadata || {});
    res.json({ success: true, message: '上传已记录' });
  } catch (error) {
    logger.error('记录上传失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/report', (req, res) => {
  try {
    const report = dataAnalyzer.getComprehensiveReport();
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('获取分析报告失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/clickrate/:element', (req, res) => {
  try {
    const { element } = req.params;
    const { page } = req.query;
    const analysis = dataAnalyzer.analyzeClickRate(element, page || 'unknown');
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('分析点击率失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 自动维护相关API
 */
router.get('/maintenance/stats', (req, res) => {
  try {
    const stats = autoMaintainer.getMaintenanceStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取维护统计失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/maintenance/check', async (req, res) => {
  try {
    const check = await autoMaintainer.performRoutineCheck();
    res.json({ success: true, data: check });
  } catch (error) {
    logger.error('执行维护检查失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/maintenance/detect-bug', async (req, res) => {
  try {
    const { error, context } = req.body;
    if (!error) {
      return res.status(400).json({
        success: false,
        error: '缺少错误信息'
      });
    }
    const bug = await autoMaintainer.detectBug(error, context || {});
    res.json({ success: true, data: bug });
  } catch (error) {
    logger.error('检测bug失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/learning/behavior', (req, res) => {
  try {
    const { behaviors } = req.body;
    if (!behaviors || !Array.isArray(behaviors)) {
      return res.status(400).json({
        success: false,
        error: '缺少行为数据'
      });
    }
    learningEngine.learnFromBehaviors(behaviors);
    res.json({ success: true, message: '行为学习完成' });
  } catch (error) {
    logger.error('行为学习失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/learning/result', (req, res) => {
  try {
    const { action, result, context } = req.body;
    if (!action || !result) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    learningEngine.learnFromResult(action, result, context || {});
    res.json({ success: true, message: '结果学习完成' });
  } catch (error) {
    logger.error('结果学习失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/learning/upgrade', (req, res) => {
  try {
    const upgrade = learningEngine.selfUpgrade();
    res.json({ success: true, data: upgrade });
  } catch (error) {
    logger.error('自我升级失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ==========================================
 * 增强功能API
 * ==========================================
 */

/**
 * 获取增强管理能力
 */
router.get('/enhanced/capabilities', async (req, res) => {
  try {
    const capabilities = await adminAgent.getEnhancedCapabilities();
    res.json({ success: true, data: capabilities });
  } catch (error) {
    logger.error('获取增强能力失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 用户管理增强
 */
router.get('/enhanced/users/anomalies', async (req, res) => {
  try {
    const anomalies = await userManager.detectAnomalousUsers();
    res.json({ success: true, data: anomalies });
  } catch (error) {
    logger.error('检测异常用户失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/users/:id/behavior', async (req, res) => {
  try {
    const behavior = await userManager.analyzeUserBehavior(req.params.id);
    res.json({ success: true, data: behavior });
  } catch (error) {
    logger.error('分析用户行为失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/users/advice', async (req, res) => {
  try {
    const advice = await userManager.generateUserManagementAdvice();
    res.json({ success: true, data: advice });
  } catch (error) {
    logger.error('生成用户管理建议失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 数据管理增强
 */
router.get('/enhanced/data/quality', async (req, res) => {
  try {
    const quality = await dataManager.checkDataQuality();
    res.json({ success: true, data: quality });
  } catch (error) {
    logger.error('检查数据质量失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/data/duplicates/:type', async (req, res) => {
  try {
    const duplicates = await dataManager.detectDuplicates(req.params.type);
    res.json({ success: true, data: duplicates });
  } catch (error) {
    logger.error('检测重复数据失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/data/cleanup', async (req, res) => {
  try {
    const result = await dataManager.autoCleanup();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('自动清理失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/data/backup', async (req, res) => {
  try {
    const result = await dataManager.performBackup();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('执行备份失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 性能优化增强
 */
router.get('/enhanced/performance/monitor', async (req, res) => {
  try {
    const performance = await performanceOptimizer.monitorPerformance();
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('监控性能失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/performance/bottlenecks', async (req, res) => {
  try {
    const bottlenecks = await performanceOptimizer.analyzeBottlenecks();
    res.json({ success: true, data: bottlenecks });
  } catch (error) {
    logger.error('分析性能瓶颈失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 安全监控增强
 */
router.get('/enhanced/security/threats', async (req, res) => {
  try {
    const threats = await securityMonitor.detectThreats();
    res.json({ success: true, data: threats });
  } catch (error) {
    logger.error('检测安全威胁失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/security/validate', (req, res) => {
  try {
    const { input, type } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, error: '缺少输入参数' });
    }
    const validation = securityMonitor.validateInput(input, type);
    res.json({ success: true, data: validation });
  } catch (error) {
    logger.error('验证输入失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/security/block-ip', (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, error: '缺少IP参数' });
    }
    securityMonitor.blockIP(ip, reason || '安全威胁');
    res.json({ success: true, message: `IP ${ip} 已阻止` });
  } catch (error) {
    logger.error('阻止IP失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 智能报告生成
 */
router.get('/enhanced/reports/comprehensive', async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const report = await reportGenerator.generateComprehensiveReport(period);
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('生成综合报告失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/reports/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = reportGenerator.getReportHistory(limit);
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('获取报告历史失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 系统升级相关API
 */
router.get('/upgrade/overview', (req, res) => {
  try {
    const overview = upgradeService.getUpgradeOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('获取升级概览失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/parts', (req, res) => {
  try {
    const parts = upgradeService.getAllParts();
    res.json({ success: true, data: parts });
  } catch (error) {
    logger.error('获取升级部分失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/parts/:partId', (req, res) => {
  try {
    const { partId } = req.params;
    const part = upgradeService.getPart(partId);
    if (!part) {
      return res.status(404).json({ success: false, error: '升级部分不存在' });
    }
    res.json({ success: true, data: part });
  } catch (error) {
    logger.error('获取升级部分详情失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/statistics', (req, res) => {
  try {
    const statistics = upgradeService.getStatistics();
    res.json({ success: true, data: statistics });
  } catch (error) {
    logger.error('获取升级统计失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/capabilities', (req, res) => {
  try {
    const capabilities = upgradeService.getCapabilities();
    res.json({ success: true, data: capabilities });
  } catch (error) {
    logger.error('获取升级能力失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/details', (req, res) => {
  try {
    const details = upgradeService.getUpgradeDetails();
    res.json({ success: true, data: details });
  } catch (error) {
    logger.error('获取升级详情失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;



 */

const express = require('express');
const router = express.Router();
const coreAdminManager = require('../core/core-admin-manager');
const adminAgent = require('../core/admin-agent');
const apiSentinel = require('../api-sentinel/api-sentinel');
const truthValidator = require('../truth-validator/data-truth-validator');
const aiHub = require('../ai-hub/ai-hub');
const learningEngine = require('../learning/learning-engine');
const dataAnalyzer = require('../analytics/data-analyzer');
const autoMaintainer = require('../maintenance/auto-maintainer');
const logger = require('../utils/logger');

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

// 升级服务
const upgradeService = require('../services/upgrade-service');

/**
 * 获取系统状态（完整版 - 包含所有模块）
 */
router.get('/status', async (req, res) => {
  try {
    const status = coreAdminManager.getSystemStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('获取系统状态失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模块信息
 * GET /api/modules/:type
 */
router.get('/modules/:type', (req, res) => {
  try {
    const { type } = req.params;
    const info = coreAdminManager.getModuleInfo(type);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        error: `模块类型不存在: ${type}`
      });
    }
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('获取模块信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取所有功能能力
 * GET /api/capabilities
 */
router.get('/capabilities', (req, res) => {
  try {
    const capabilities = coreAdminManager.getAllCapabilities();
    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    logger.error('获取功能能力失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 健康检查
 */
router.get('/health', async (req, res) => {
  try {
    const health = await adminAgent.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('健康检查失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取管理建议（增强版 - 使用智能决策引擎）
 */
router.get('/advice', async (req, res) => {
  try {
    const advice = await adminAgent.getIntelligentAdvice(req.query);
    res.json({
      success: true,
      data: advice
    });
  } catch (error) {
    logger.error('获取管理建议失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取智能决策建议
 * GET /api/intelligent/advice
 */
router.get('/intelligent/advice', async (req, res) => {
  try {
    const { category, context } = req.query;
    const decision = await decisionEngine.makeDecision(
      category || 'systemHealth',
      context ? JSON.parse(context) : {}
    );
    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    logger.error('获取智能决策失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取预测性维护信息
 * GET /api/intelligent/predictions
 */
router.get('/intelligent/predictions', async (req, res) => {
  try {
    const stats = predictiveMaintenance.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取预测信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取工作流列表
 * GET /api/intelligent/workflows
 */
router.get('/intelligent/workflows', async (req, res) => {
  try {
    const workflows = workflowEngine.workflows;
    const stats = workflowEngine.getStats();
    res.json({
      success: true,
      data: {
        workflows,
        stats
      }
    });
  } catch (error) {
    logger.error('获取工作流列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 执行工作流
 * POST /api/intelligent/workflows/:id/execute
 */
router.post('/intelligent/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await workflowEngine.executeWorkflow(id, req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('执行工作流失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取告警列表
 * GET /api/intelligent/alerts
 */
router.get('/intelligent/alerts', async (req, res) => {
  try {
    const { status, severity } = req.query;
    let alerts = alertSystem.alerts;
    
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }
    
    const stats = alertSystem.getStats();
    res.json({
      success: true,
      data: {
        alerts: alerts.slice(-100), // 最近100条
        stats
      }
    });
  } catch (error) {
    logger.error('获取告警列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 确认告警
 * POST /api/intelligent/alerts/:id/acknowledge
 */
router.post('/intelligent/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    alertSystem.acknowledgeAlert(id, userId);
    res.json({
      success: true,
      message: '告警已确认'
    });
  } catch (error) {
    logger.error('确认告警失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 解决告警
 * POST /api/intelligent/alerts/:id/resolve
 */
router.post('/intelligent/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    alertSystem.resolveAlert(id, resolution);
    res.json({
      success: true,
      message: '告警已解决'
    });
  } catch (error) {
    logger.error('解决告警失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取自适应优化状态
 * GET /api/intelligent/optimization
 */
router.get('/intelligent/optimization', async (req, res) => {
  try {
    const stats = adaptiveOptimizer.getStats();
    const config = adaptiveOptimizer.getCurrentConfig();
    res.json({
      success: true,
      data: {
        stats,
        currentConfig: config
      }
    });
  } catch (error) {
    logger.error('获取优化状态失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 查询知识图谱
 * GET /api/intelligent/knowledge
 */
router.get('/intelligent/knowledge', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const stats = knowledgeGraph.getStats();
      return res.json({
        success: true,
        data: {
          stats,
          message: '请提供查询参数'
        }
      });
    }
    
    const result = await knowledgeGraph.intelligentQuery(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('查询知识图谱失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取智能报告
 * GET /api/intelligent/reports
 */
router.get('/intelligent/reports', async (req, res) => {
  try {
    const { type, id } = req.query;
    
    if (id) {
      const report = intelligentReportGenerator.getReport(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: '报告不存在'
        });
      }
      return res.json({
        success: true,
        data: report
      });
    }
    
    if (type) {
      const latest = intelligentReportGenerator.getLatestReport(type);
      return res.json({
        success: true,
        data: latest || null
      });
    }
    
    const stats = intelligentReportGenerator.getStats();
    res.json({
      success: true,
      data: {
        stats,
        reports: intelligentReportGenerator.reports.slice(-20) // 最近20个报告
      }
    });
  } catch (error) {
    logger.error('获取智能报告失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 生成智能报告
 * POST /api/intelligent/reports/generate
 */
router.post('/intelligent/reports/generate', async (req, res) => {
  try {
    const { type = 'daily', options = {} } = req.body;
    const report = await intelligentReportGenerator.generateComprehensiveReport(type, options);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('生成智能报告失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API列表
 */
router.get('/apis', (req, res) => {
  try {
    const apis = apiSentinel.getApis();
    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    logger.error('获取API列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API详情
 */
router.get('/apis/:id', (req, res) => {
  try {
    const api = apiSentinel.getApi(req.params.id);
    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API不存在'
      });
    }
    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    logger.error('获取API详情失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 检查API健康
 */
router.post('/apis/:id/check', async (req, res) => {
  try {
    const result = await apiSentinel.checkApiHealth(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'API不存在'
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('API健康检查失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API统计
 */
router.get('/apis/stats/overall', (req, res) => {
  try {
    const stats = apiSentinel.getOverallStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取API统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 验证数据真实性
 */
router.post('/validate/truth', async (req, res) => {
  try {
    const { data, sources, options } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: '缺少数据参数'
      });
    }

    const validation = await truthValidator.validate(
      data,
      sources || [],
      options || {}
    );

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('数据真实性验证失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取AI Hub统计
 */
router.get('/ai/stats', (req, res) => {
  try {
    const stats = aiHub.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取AI统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模型配置信息
 */
router.get('/model/config', (req, res) => {
  try {
    const config = require('../config/config');
    const zhipuClient = require('../ai-hub/zhipu-client');
    
    // 检查API Key状态（不暴露完整key）
    const apiKey = config.zhipu.apiKey || '';
    const apiKeyStatus = apiKey.length > 0 ? 'configured' : 'not_configured';
    const apiKeyPreview = apiKey.length > 0 
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : '未配置';
    
    // 检查连接状态（通过检查client是否启用）
    const connectionStatus = zhipuClient.enabled && config.zhipu.enabled ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      data: {
        provider: '智谱AI (ZhipuAI)',
        model: config.zhipu.model || 'glm-4',
        apiBase: config.zhipu.apiBase || 'https://open.bigmodel.cn/api/paas/v4',
        apiKeyStatus: apiKeyStatus,
        apiKeyPreview: apiKeyPreview,
        connectionStatus: connectionStatus,
        enabled: config.zhipu.enabled !== false,
        maxCallsPerHour: config.zhipu.maxCallsPerHour || 100,
        confidenceThreshold: config.zhipu.confidenceThreshold || 0.7,
        stats: aiHub.getStats()
      }
    });
  } catch (error) {
    logger.error('获取模型配置失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取学习统计
 */
router.get('/learning/stats', (req, res) => {
  try {
    const stats = learningEngine.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取学习统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 查找相似历史
 */
router.post('/learning/similar', (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({
        success: false,
        error: '缺少上下文参数'
      });
    }

    const similar = learningEngine.findSimilarHistory(context);
    res.json({
      success: true,
      data: similar
    });
  } catch (error) {
    logger.error('查找相似历史失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 记录事件
 */
router.post('/learning/events', (req, res) => {
  try {
    const { type, data, context } = req.body;
    if (!type) {
      return res.status(400).json({
        success: false,
        error: '缺少事件类型'
      });
    }

    learningEngine.recordEvent(type, data || {}, context || {});
    res.json({
      success: true,
      message: '事件已记录'
    });
  } catch (error) {
    logger.error('记录事件失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 数据分析相关API
 */
router.post('/analytics/click', (req, res) => {
  try {
    const { element, context } = req.body;
    dataAnalyzer.recordClick(element, context || {});
    res.json({ success: true, message: '点击已记录' });
  } catch (error) {
    logger.error('记录点击失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analytics/upload', (req, res) => {
  try {
    const { type, metadata } = req.body;
    dataAnalyzer.recordUpload(type, metadata || {});
    res.json({ success: true, message: '上传已记录' });
  } catch (error) {
    logger.error('记录上传失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/report', (req, res) => {
  try {
    const report = dataAnalyzer.getComprehensiveReport();
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('获取分析报告失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/clickrate/:element', (req, res) => {
  try {
    const { element } = req.params;
    const { page } = req.query;
    const analysis = dataAnalyzer.analyzeClickRate(element, page || 'unknown');
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('分析点击率失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 自动维护相关API
 */
router.get('/maintenance/stats', (req, res) => {
  try {
    const stats = autoMaintainer.getMaintenanceStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取维护统计失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/maintenance/check', async (req, res) => {
  try {
    const check = await autoMaintainer.performRoutineCheck();
    res.json({ success: true, data: check });
  } catch (error) {
    logger.error('执行维护检查失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/maintenance/detect-bug', async (req, res) => {
  try {
    const { error, context } = req.body;
    if (!error) {
      return res.status(400).json({
        success: false,
        error: '缺少错误信息'
      });
    }
    const bug = await autoMaintainer.detectBug(error, context || {});
    res.json({ success: true, data: bug });
  } catch (error) {
    logger.error('检测bug失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/learning/behavior', (req, res) => {
  try {
    const { behaviors } = req.body;
    if (!behaviors || !Array.isArray(behaviors)) {
      return res.status(400).json({
        success: false,
        error: '缺少行为数据'
      });
    }
    learningEngine.learnFromBehaviors(behaviors);
    res.json({ success: true, message: '行为学习完成' });
  } catch (error) {
    logger.error('行为学习失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/learning/result', (req, res) => {
  try {
    const { action, result, context } = req.body;
    if (!action || !result) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    learningEngine.learnFromResult(action, result, context || {});
    res.json({ success: true, message: '结果学习完成' });
  } catch (error) {
    logger.error('结果学习失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/learning/upgrade', (req, res) => {
  try {
    const upgrade = learningEngine.selfUpgrade();
    res.json({ success: true, data: upgrade });
  } catch (error) {
    logger.error('自我升级失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ==========================================
 * 增强功能API
 * ==========================================
 */

/**
 * 获取增强管理能力
 */
router.get('/enhanced/capabilities', async (req, res) => {
  try {
    const capabilities = await adminAgent.getEnhancedCapabilities();
    res.json({ success: true, data: capabilities });
  } catch (error) {
    logger.error('获取增强能力失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 用户管理增强
 */
router.get('/enhanced/users/anomalies', async (req, res) => {
  try {
    const anomalies = await userManager.detectAnomalousUsers();
    res.json({ success: true, data: anomalies });
  } catch (error) {
    logger.error('检测异常用户失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/users/:id/behavior', async (req, res) => {
  try {
    const behavior = await userManager.analyzeUserBehavior(req.params.id);
    res.json({ success: true, data: behavior });
  } catch (error) {
    logger.error('分析用户行为失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/users/advice', async (req, res) => {
  try {
    const advice = await userManager.generateUserManagementAdvice();
    res.json({ success: true, data: advice });
  } catch (error) {
    logger.error('生成用户管理建议失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 数据管理增强
 */
router.get('/enhanced/data/quality', async (req, res) => {
  try {
    const quality = await dataManager.checkDataQuality();
    res.json({ success: true, data: quality });
  } catch (error) {
    logger.error('检查数据质量失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/data/duplicates/:type', async (req, res) => {
  try {
    const duplicates = await dataManager.detectDuplicates(req.params.type);
    res.json({ success: true, data: duplicates });
  } catch (error) {
    logger.error('检测重复数据失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/data/cleanup', async (req, res) => {
  try {
    const result = await dataManager.autoCleanup();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('自动清理失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/data/backup', async (req, res) => {
  try {
    const result = await dataManager.performBackup();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('执行备份失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 性能优化增强
 */
router.get('/enhanced/performance/monitor', async (req, res) => {
  try {
    const performance = await performanceOptimizer.monitorPerformance();
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('监控性能失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/performance/bottlenecks', async (req, res) => {
  try {
    const bottlenecks = await performanceOptimizer.analyzeBottlenecks();
    res.json({ success: true, data: bottlenecks });
  } catch (error) {
    logger.error('分析性能瓶颈失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 安全监控增强
 */
router.get('/enhanced/security/threats', async (req, res) => {
  try {
    const threats = await securityMonitor.detectThreats();
    res.json({ success: true, data: threats });
  } catch (error) {
    logger.error('检测安全威胁失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/security/validate', (req, res) => {
  try {
    const { input, type } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, error: '缺少输入参数' });
    }
    const validation = securityMonitor.validateInput(input, type);
    res.json({ success: true, data: validation });
  } catch (error) {
    logger.error('验证输入失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/security/block-ip', (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, error: '缺少IP参数' });
    }
    securityMonitor.blockIP(ip, reason || '安全威胁');
    res.json({ success: true, message: `IP ${ip} 已阻止` });
  } catch (error) {
    logger.error('阻止IP失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 智能报告生成
 */
router.get('/enhanced/reports/comprehensive', async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const report = await reportGenerator.generateComprehensiveReport(period);
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('生成综合报告失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/reports/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = reportGenerator.getReportHistory(limit);
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('获取报告历史失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 系统升级相关API
 */
router.get('/upgrade/overview', (req, res) => {
  try {
    const overview = upgradeService.getUpgradeOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('获取升级概览失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/parts', (req, res) => {
  try {
    const parts = upgradeService.getAllParts();
    res.json({ success: true, data: parts });
  } catch (error) {
    logger.error('获取升级部分失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/parts/:partId', (req, res) => {
  try {
    const { partId } = req.params;
    const part = upgradeService.getPart(partId);
    if (!part) {
      return res.status(404).json({ success: false, error: '升级部分不存在' });
    }
    res.json({ success: true, data: part });
  } catch (error) {
    logger.error('获取升级部分详情失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/statistics', (req, res) => {
  try {
    const statistics = upgradeService.getStatistics();
    res.json({ success: true, data: statistics });
  } catch (error) {
    logger.error('获取升级统计失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/capabilities', (req, res) => {
  try {
    const capabilities = upgradeService.getCapabilities();
    res.json({ success: true, data: capabilities });
  } catch (error) {
    logger.error('获取升级能力失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/details', (req, res) => {
  try {
    const details = upgradeService.getUpgradeDetails();
    res.json({ success: true, data: details });
  } catch (error) {
    logger.error('获取升级详情失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;



 */

const express = require('express');
const router = express.Router();
const coreAdminManager = require('../core/core-admin-manager');
const adminAgent = require('../core/admin-agent');
const apiSentinel = require('../api-sentinel/api-sentinel');
const truthValidator = require('../truth-validator/data-truth-validator');
const aiHub = require('../ai-hub/ai-hub');
const learningEngine = require('../learning/learning-engine');
const dataAnalyzer = require('../analytics/data-analyzer');
const autoMaintainer = require('../maintenance/auto-maintainer');
const logger = require('../utils/logger');

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

// 升级服务
const upgradeService = require('../services/upgrade-service');

/**
 * 获取系统状态（完整版 - 包含所有模块）
 */
router.get('/status', async (req, res) => {
  try {
    const status = coreAdminManager.getSystemStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('获取系统状态失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模块信息
 * GET /api/modules/:type
 */
router.get('/modules/:type', (req, res) => {
  try {
    const { type } = req.params;
    const info = coreAdminManager.getModuleInfo(type);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        error: `模块类型不存在: ${type}`
      });
    }
    
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('获取模块信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取所有功能能力
 * GET /api/capabilities
 */
router.get('/capabilities', (req, res) => {
  try {
    const capabilities = coreAdminManager.getAllCapabilities();
    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    logger.error('获取功能能力失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 健康检查
 */
router.get('/health', async (req, res) => {
  try {
    const health = await adminAgent.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('健康检查失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取管理建议（增强版 - 使用智能决策引擎）
 */
router.get('/advice', async (req, res) => {
  try {
    const advice = await adminAgent.getIntelligentAdvice(req.query);
    res.json({
      success: true,
      data: advice
    });
  } catch (error) {
    logger.error('获取管理建议失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取智能决策建议
 * GET /api/intelligent/advice
 */
router.get('/intelligent/advice', async (req, res) => {
  try {
    const { category, context } = req.query;
    const decision = await decisionEngine.makeDecision(
      category || 'systemHealth',
      context ? JSON.parse(context) : {}
    );
    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    logger.error('获取智能决策失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取预测性维护信息
 * GET /api/intelligent/predictions
 */
router.get('/intelligent/predictions', async (req, res) => {
  try {
    const stats = predictiveMaintenance.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取预测信息失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取工作流列表
 * GET /api/intelligent/workflows
 */
router.get('/intelligent/workflows', async (req, res) => {
  try {
    const workflows = workflowEngine.workflows;
    const stats = workflowEngine.getStats();
    res.json({
      success: true,
      data: {
        workflows,
        stats
      }
    });
  } catch (error) {
    logger.error('获取工作流列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 执行工作流
 * POST /api/intelligent/workflows/:id/execute
 */
router.post('/intelligent/workflows/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await workflowEngine.executeWorkflow(id, req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('执行工作流失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取告警列表
 * GET /api/intelligent/alerts
 */
router.get('/intelligent/alerts', async (req, res) => {
  try {
    const { status, severity } = req.query;
    let alerts = alertSystem.alerts;
    
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }
    
    const stats = alertSystem.getStats();
    res.json({
      success: true,
      data: {
        alerts: alerts.slice(-100), // 最近100条
        stats
      }
    });
  } catch (error) {
    logger.error('获取告警列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 确认告警
 * POST /api/intelligent/alerts/:id/acknowledge
 */
router.post('/intelligent/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    alertSystem.acknowledgeAlert(id, userId);
    res.json({
      success: true,
      message: '告警已确认'
    });
  } catch (error) {
    logger.error('确认告警失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 解决告警
 * POST /api/intelligent/alerts/:id/resolve
 */
router.post('/intelligent/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    alertSystem.resolveAlert(id, resolution);
    res.json({
      success: true,
      message: '告警已解决'
    });
  } catch (error) {
    logger.error('解决告警失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取自适应优化状态
 * GET /api/intelligent/optimization
 */
router.get('/intelligent/optimization', async (req, res) => {
  try {
    const stats = adaptiveOptimizer.getStats();
    const config = adaptiveOptimizer.getCurrentConfig();
    res.json({
      success: true,
      data: {
        stats,
        currentConfig: config
      }
    });
  } catch (error) {
    logger.error('获取优化状态失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 查询知识图谱
 * GET /api/intelligent/knowledge
 */
router.get('/intelligent/knowledge', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const stats = knowledgeGraph.getStats();
      return res.json({
        success: true,
        data: {
          stats,
          message: '请提供查询参数'
        }
      });
    }
    
    const result = await knowledgeGraph.intelligentQuery(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('查询知识图谱失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取智能报告
 * GET /api/intelligent/reports
 */
router.get('/intelligent/reports', async (req, res) => {
  try {
    const { type, id } = req.query;
    
    if (id) {
      const report = intelligentReportGenerator.getReport(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: '报告不存在'
        });
      }
      return res.json({
        success: true,
        data: report
      });
    }
    
    if (type) {
      const latest = intelligentReportGenerator.getLatestReport(type);
      return res.json({
        success: true,
        data: latest || null
      });
    }
    
    const stats = intelligentReportGenerator.getStats();
    res.json({
      success: true,
      data: {
        stats,
        reports: intelligentReportGenerator.reports.slice(-20) // 最近20个报告
      }
    });
  } catch (error) {
    logger.error('获取智能报告失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 生成智能报告
 * POST /api/intelligent/reports/generate
 */
router.post('/intelligent/reports/generate', async (req, res) => {
  try {
    const { type = 'daily', options = {} } = req.body;
    const report = await intelligentReportGenerator.generateComprehensiveReport(type, options);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('生成智能报告失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API列表
 */
router.get('/apis', (req, res) => {
  try {
    const apis = apiSentinel.getApis();
    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    logger.error('获取API列表失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API详情
 */
router.get('/apis/:id', (req, res) => {
  try {
    const api = apiSentinel.getApi(req.params.id);
    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API不存在'
      });
    }
    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    logger.error('获取API详情失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 检查API健康
 */
router.post('/apis/:id/check', async (req, res) => {
  try {
    const result = await apiSentinel.checkApiHealth(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'API不存在'
      });
    }
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('API健康检查失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取API统计
 */
router.get('/apis/stats/overall', (req, res) => {
  try {
    const stats = apiSentinel.getOverallStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取API统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 验证数据真实性
 */
router.post('/validate/truth', async (req, res) => {
  try {
    const { data, sources, options } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: '缺少数据参数'
      });
    }

    const validation = await truthValidator.validate(
      data,
      sources || [],
      options || {}
    );

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('数据真实性验证失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取AI Hub统计
 */
router.get('/ai/stats', (req, res) => {
  try {
    const stats = aiHub.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取AI统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模型配置信息
 */
router.get('/model/config', (req, res) => {
  try {
    const config = require('../config/config');
    const zhipuClient = require('../ai-hub/zhipu-client');
    
    // 检查API Key状态（不暴露完整key）
    const apiKey = config.zhipu.apiKey || '';
    const apiKeyStatus = apiKey.length > 0 ? 'configured' : 'not_configured';
    const apiKeyPreview = apiKey.length > 0 
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : '未配置';
    
    // 检查连接状态（通过检查client是否启用）
    const connectionStatus = zhipuClient.enabled && config.zhipu.enabled ? 'connected' : 'disconnected';
    
    res.json({
      success: true,
      data: {
        provider: '智谱AI (ZhipuAI)',
        model: config.zhipu.model || 'glm-4',
        apiBase: config.zhipu.apiBase || 'https://open.bigmodel.cn/api/paas/v4',
        apiKeyStatus: apiKeyStatus,
        apiKeyPreview: apiKeyPreview,
        connectionStatus: connectionStatus,
        enabled: config.zhipu.enabled !== false,
        maxCallsPerHour: config.zhipu.maxCallsPerHour || 100,
        confidenceThreshold: config.zhipu.confidenceThreshold || 0.7,
        stats: aiHub.getStats()
      }
    });
  } catch (error) {
    logger.error('获取模型配置失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取学习统计
 */
router.get('/learning/stats', (req, res) => {
  try {
    const stats = learningEngine.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取学习统计失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 查找相似历史
 */
router.post('/learning/similar', (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({
        success: false,
        error: '缺少上下文参数'
      });
    }

    const similar = learningEngine.findSimilarHistory(context);
    res.json({
      success: true,
      data: similar
    });
  } catch (error) {
    logger.error('查找相似历史失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 记录事件
 */
router.post('/learning/events', (req, res) => {
  try {
    const { type, data, context } = req.body;
    if (!type) {
      return res.status(400).json({
        success: false,
        error: '缺少事件类型'
      });
    }

    learningEngine.recordEvent(type, data || {}, context || {});
    res.json({
      success: true,
      message: '事件已记录'
    });
  } catch (error) {
    logger.error('记录事件失败', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 数据分析相关API
 */
router.post('/analytics/click', (req, res) => {
  try {
    const { element, context } = req.body;
    dataAnalyzer.recordClick(element, context || {});
    res.json({ success: true, message: '点击已记录' });
  } catch (error) {
    logger.error('记录点击失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analytics/upload', (req, res) => {
  try {
    const { type, metadata } = req.body;
    dataAnalyzer.recordUpload(type, metadata || {});
    res.json({ success: true, message: '上传已记录' });
  } catch (error) {
    logger.error('记录上传失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/report', (req, res) => {
  try {
    const report = dataAnalyzer.getComprehensiveReport();
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('获取分析报告失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analytics/clickrate/:element', (req, res) => {
  try {
    const { element } = req.params;
    const { page } = req.query;
    const analysis = dataAnalyzer.analyzeClickRate(element, page || 'unknown');
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('分析点击率失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 自动维护相关API
 */
router.get('/maintenance/stats', (req, res) => {
  try {
    const stats = autoMaintainer.getMaintenanceStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('获取维护统计失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/maintenance/check', async (req, res) => {
  try {
    const check = await autoMaintainer.performRoutineCheck();
    res.json({ success: true, data: check });
  } catch (error) {
    logger.error('执行维护检查失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/maintenance/detect-bug', async (req, res) => {
  try {
    const { error, context } = req.body;
    if (!error) {
      return res.status(400).json({
        success: false,
        error: '缺少错误信息'
      });
    }
    const bug = await autoMaintainer.detectBug(error, context || {});
    res.json({ success: true, data: bug });
  } catch (error) {
    logger.error('检测bug失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/learning/behavior', (req, res) => {
  try {
    const { behaviors } = req.body;
    if (!behaviors || !Array.isArray(behaviors)) {
      return res.status(400).json({
        success: false,
        error: '缺少行为数据'
      });
    }
    learningEngine.learnFromBehaviors(behaviors);
    res.json({ success: true, message: '行为学习完成' });
  } catch (error) {
    logger.error('行为学习失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/learning/result', (req, res) => {
  try {
    const { action, result, context } = req.body;
    if (!action || !result) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    learningEngine.learnFromResult(action, result, context || {});
    res.json({ success: true, message: '结果学习完成' });
  } catch (error) {
    logger.error('结果学习失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/learning/upgrade', (req, res) => {
  try {
    const upgrade = learningEngine.selfUpgrade();
    res.json({ success: true, data: upgrade });
  } catch (error) {
    logger.error('自我升级失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * ==========================================
 * 增强功能API
 * ==========================================
 */

/**
 * 获取增强管理能力
 */
router.get('/enhanced/capabilities', async (req, res) => {
  try {
    const capabilities = await adminAgent.getEnhancedCapabilities();
    res.json({ success: true, data: capabilities });
  } catch (error) {
    logger.error('获取增强能力失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 用户管理增强
 */
router.get('/enhanced/users/anomalies', async (req, res) => {
  try {
    const anomalies = await userManager.detectAnomalousUsers();
    res.json({ success: true, data: anomalies });
  } catch (error) {
    logger.error('检测异常用户失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/users/:id/behavior', async (req, res) => {
  try {
    const behavior = await userManager.analyzeUserBehavior(req.params.id);
    res.json({ success: true, data: behavior });
  } catch (error) {
    logger.error('分析用户行为失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/users/advice', async (req, res) => {
  try {
    const advice = await userManager.generateUserManagementAdvice();
    res.json({ success: true, data: advice });
  } catch (error) {
    logger.error('生成用户管理建议失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 数据管理增强
 */
router.get('/enhanced/data/quality', async (req, res) => {
  try {
    const quality = await dataManager.checkDataQuality();
    res.json({ success: true, data: quality });
  } catch (error) {
    logger.error('检查数据质量失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/data/duplicates/:type', async (req, res) => {
  try {
    const duplicates = await dataManager.detectDuplicates(req.params.type);
    res.json({ success: true, data: duplicates });
  } catch (error) {
    logger.error('检测重复数据失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/data/cleanup', async (req, res) => {
  try {
    const result = await dataManager.autoCleanup();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('自动清理失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/data/backup', async (req, res) => {
  try {
    const result = await dataManager.performBackup();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('执行备份失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 性能优化增强
 */
router.get('/enhanced/performance/monitor', async (req, res) => {
  try {
    const performance = await performanceOptimizer.monitorPerformance();
    res.json({ success: true, data: performance });
  } catch (error) {
    logger.error('监控性能失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/performance/bottlenecks', async (req, res) => {
  try {
    const bottlenecks = await performanceOptimizer.analyzeBottlenecks();
    res.json({ success: true, data: bottlenecks });
  } catch (error) {
    logger.error('分析性能瓶颈失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 安全监控增强
 */
router.get('/enhanced/security/threats', async (req, res) => {
  try {
    const threats = await securityMonitor.detectThreats();
    res.json({ success: true, data: threats });
  } catch (error) {
    logger.error('检测安全威胁失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/security/validate', (req, res) => {
  try {
    const { input, type } = req.body;
    if (!input) {
      return res.status(400).json({ success: false, error: '缺少输入参数' });
    }
    const validation = securityMonitor.validateInput(input, type);
    res.json({ success: true, data: validation });
  } catch (error) {
    logger.error('验证输入失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/enhanced/security/block-ip', (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return res.status(400).json({ success: false, error: '缺少IP参数' });
    }
    securityMonitor.blockIP(ip, reason || '安全威胁');
    res.json({ success: true, message: `IP ${ip} 已阻止` });
  } catch (error) {
    logger.error('阻止IP失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 智能报告生成
 */
router.get('/enhanced/reports/comprehensive', async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const report = await reportGenerator.generateComprehensiveReport(period);
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('生成综合报告失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/enhanced/reports/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = reportGenerator.getReportHistory(limit);
    res.json({ success: true, data: history });
  } catch (error) {
    logger.error('获取报告历史失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 系统升级相关API
 */
router.get('/upgrade/overview', (req, res) => {
  try {
    const overview = upgradeService.getUpgradeOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('获取升级概览失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/parts', (req, res) => {
  try {
    const parts = upgradeService.getAllParts();
    res.json({ success: true, data: parts });
  } catch (error) {
    logger.error('获取升级部分失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/parts/:partId', (req, res) => {
  try {
    const { partId } = req.params;
    const part = upgradeService.getPart(partId);
    if (!part) {
      return res.status(404).json({ success: false, error: '升级部分不存在' });
    }
    res.json({ success: true, data: part });
  } catch (error) {
    logger.error('获取升级部分详情失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/statistics', (req, res) => {
  try {
    const statistics = upgradeService.getStatistics();
    res.json({ success: true, data: statistics });
  } catch (error) {
    logger.error('获取升级统计失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/capabilities', (req, res) => {
  try {
    const capabilities = upgradeService.getCapabilities();
    res.json({ success: true, data: capabilities });
  } catch (error) {
    logger.error('获取升级能力失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/upgrade/details', (req, res) => {
  try {
    const details = upgradeService.getUpgradeDetails();
    res.json({ success: true, data: details });
  } catch (error) {
    logger.error('获取升级详情失败', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


