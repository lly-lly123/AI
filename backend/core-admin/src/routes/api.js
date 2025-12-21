/**
 * API路由
 */

const express = require('express');
const router = express.Router();
const adminAgent = require('../core/admin-agent');
const apiSentinel = require('../api-sentinel/api-sentinel');
const truthValidator = require('../truth-validator/data-truth-validator');
const aiHub = require('../ai-hub/ai-hub');
const learningEngine = require('../learning/learning-engine');
const dataAnalyzer = require('../analytics/data-analyzer');
const autoMaintainer = require('../maintenance/auto-maintainer');
const logger = require('../utils/logger');

/**
 * 获取系统状态
 */
router.get('/status', async (req, res) => {
  try {
    const status = adminAgent.getStatus();
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
 * 获取管理建议
 */
router.get('/advice', async (req, res) => {
  try {
    const advice = await adminAgent.getManagementAdvice();
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

module.exports = router;


