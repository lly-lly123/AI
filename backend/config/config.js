require('dotenv').config();

// 解析RSS源配置（支持分号分隔多个源）
function parseRssSources() {
  const rssSourcesEnv = process.env.RSS_SOURCES;
  
  if (!rssSourcesEnv) {
    // 默认配置 - 使用可用的RSS源
    return [
      {
        name: '赛鸽资讯',
        url: 'https://www.chinaxinge.com/rss.xml',
        type: 'media',
        region: 'national'
      }
    ];
  }
  
  const sources = [];
  // 使用分号分隔多个源
  const sourceStrings = rssSourcesEnv.split(';');
  
  sourceStrings.forEach(sourceStr => {
    const parts = sourceStr.split('|');
    if (parts.length >= 4) {
      sources.push({
        name: parts[0].trim(),
        url: parts[1].trim(),
        type: parts[2].trim(),
        region: parts[3].trim()
      });
    }
  });
  
  return sources.length > 0 ? sources : [
    {
      name: '赛鸽资讯',
      url: 'https://www.chinaxinge.com/rss.xml',
      type: 'media',
      region: 'national'
    }
  ];
}

module.exports = {
  server: {
    // Zeabur会自动设置PORT环境变量，必须使用它
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development'
  },
  
  // RSS源配置
  rssSources: parseRssSources(),
  
  // API配置
  api: {
    key: process.env.API_KEY || '',
    rateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10)
  },
  
  // 缓存配置（秒）
  cache: {
    ttl: {
      news: parseInt(process.env.CACHE_TTL_NEWS || '3600', 10),
      events: parseInt(process.env.CACHE_TTL_EVENTS || '300', 10),
      results: parseInt(process.env.CACHE_TTL_RESULTS || '7200', 10)
    }
  },
  
  // 更新频率（秒）
  updateInterval: {
    news: parseInt(process.env.UPDATE_INTERVAL_NEWS || '3600', 10),
    events: parseInt(process.env.UPDATE_INTERVAL_EVENTS || '300', 10),
    results: parseInt(process.env.UPDATE_INTERVAL_RESULTS || '1800', 10)
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // AI配置
  ai: {
    // Hugging Face API Key（可选，有API Key可以获得更高的免费额度）
    huggingFaceApiKey: process.env.HUGGING_FACE_API_KEY || null,
    // 智谱AI API Key - Evo智能助手使用（名称：智鸽）
    zhipuApiKey: process.env.ZHIPU_API_KEY_EVO || process.env.ZHIPU_API_KEY || null,
    // 智谱AI API Key - 中枢管家使用（名称：智鸽·中枢管家）
    zhipuApiKeyAdmin: process.env.ZHIPU_API_KEY_ADMIN || null,
    // 通义千问 API Key（阿里云，国内可访问）
    qwenApiKey: process.env.QWEN_API_KEY || null,
    // AI模型选择（可选，默认自动选择）
    model: process.env.AI_MODEL || 'auto'
  }
};












