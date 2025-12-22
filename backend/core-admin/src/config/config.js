/**
 * 智鸽·中枢管家配置文件
 */

require('dotenv').config();

const config = {
  // 智谱AI配置（使用独立的API Key：智鸽·中枢管家）
  zhipu: {
    // 优先使用ZHIPU_API_KEY_ADMIN（名称：智鸽·中枢管家），如果没有则使用ZHIPU_API_KEY作为兼容
    apiKey: process.env.ZHIPU_API_KEY_ADMIN || process.env.ZHIPU_API_KEY || null,
    model: process.env.ZHIPU_MODEL || 'glm-4',
    apiBase: process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4',
    enabled: process.env.AI_ENABLED !== 'false', // 默认启用
    maxCallsPerHour: parseInt(process.env.AI_MAX_CALLS_PER_HOUR || '100', 10),
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.7')
  },

  // 系统配置
  system: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'production',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // 数据库配置
  database: {
    path: process.env.DB_PATH || './data/core-admin.db'
  },

  // API监管配置
  apiSentinel: {
    checkInterval: parseInt(process.env.API_CHECK_INTERVAL || '60000', 10),
    timeout: parseInt(process.env.API_TIMEOUT || '5000', 10),
    retryTimes: parseInt(process.env.API_RETRY_TIMES || '3', 10)
  },

  // 数据真实性配置
  truthValidator: {
    enabled: process.env.TRUTH_CHECK_ENABLED === 'true',
    multiSourceRequired: process.env.MULTI_SOURCE_REQUIRED === 'true',
    minSourceCount: parseInt(process.env.MIN_SOURCE_COUNT || '2', 10)
  },

  // 学习系统配置
  learning: {
    enabled: process.env.LEARNING_ENABLED === 'true',
    memoryRetentionDays: parseInt(process.env.MEMORY_RETENTION_DAYS || '90', 10)
  },

  // 主站API端点（需要监管的API）
  mainSiteApis: {
    news: [
      'http://localhost:3000/api/news',
      'http://localhost:3000/api/news/latest'
    ],
    races: [
      'http://localhost:3000/api/races',
      'http://localhost:3000/api/races/live'
    ],
    events: [
      'http://localhost:3000/api/events',
      'http://localhost:3000/api/events/timeline'
    ]
  }
};

// 验证配置
if (!config.zhipu.apiKey && config.zhipu.enabled) {
  console.warn('⚠️  警告: 智谱API Key未配置，AI功能将降级运行');
}

module.exports = config;

