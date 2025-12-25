/**
 * 云端存储配置分析服务 - 集成AI智能分析
 * 提供配置检查、问题诊断和优化建议
 */

const aiService = require('./aiService');
const cloudStorageService = require('./cloudStorageService');
const logger = require('../utils/logger');

class StorageConfigAnalyzer {
  constructor() {
    this.analysisCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 检查云端存储配置状态
   */
  async checkConfiguration() {
    const config = {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY,
        bucket: process.env.SUPABASE_STORAGE_BUCKET || 'files',
        configured: false,
        available: false
      },
      cloudflareR2: {
        accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
        accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? '***已配置***' : null,
        bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        configured: false,
        available: false
      },
      minio: {
        endpoint: process.env.MINIO_ENDPOINT,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY ? '***已配置***' : null,
        bucket: process.env.MINIO_BUCKET,
        configured: false,
        available: false
      }
    };

    // 检查Supabase配置
    if (config.supabase.url && 
        !config.supabase.url.includes('your-project') &&
        config.supabase.key && 
        !config.supabase.key.includes('your-anon-key')) {
      config.supabase.configured = true;
      config.supabase.available = cloudStorageService.isAvailable();
    }

    // 检查Cloudflare R2配置
    if (config.cloudflareR2.accountId && config.cloudflareR2.accessKey) {
      config.cloudflareR2.configured = true;
    }

    // 检查MinIO配置
    if (config.minio.endpoint && config.minio.accessKey) {
      config.minio.configured = true;
    }

    return config;
  }

  /**
   * 使用AI分析存储配置并提供建议
   */
  async analyzeWithAI(config) {
    try {
      const cacheKey = JSON.stringify(config);
      const cached = this.analysisCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }

      const prompt = this.buildAnalysisPrompt(config);
      const aiResponse = await aiService.chat(prompt, [], {
        task: 'storage_config_analysis',
        context: {
          config,
          timestamp: new Date().toISOString()
        }
      });

      const analysis = {
        summary: this.extractSummary(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
        warnings: this.extractWarnings(aiResponse),
        score: this.calculateConfigScore(config),
        timestamp: new Date().toISOString()
      };

      // 缓存结果
      this.analysisCache.set(cacheKey, {
        result: analysis,
        timestamp: Date.now()
      });

      return analysis;
    } catch (error) {
      logger.error('AI分析存储配置失败', error);
      return {
        summary: 'AI分析暂时不可用，使用基础分析',
        recommendations: this.getBasicRecommendations(config),
        warnings: this.getBasicWarnings(config),
        score: this.calculateConfigScore(config),
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  /**
   * 构建AI分析提示词
   */
  buildAnalysisPrompt(config) {
    const configuredServices = [];
    const unconfiguredServices = [];

    if (config.supabase.configured) {
      configuredServices.push('Supabase（推荐，永久免费500MB数据库+1GB文件存储）');
    } else {
      unconfiguredServices.push('Supabase');
    }

    if (config.cloudflareR2.configured) {
      configuredServices.push('Cloudflare R2（永久免费10GB）');
    } else {
      unconfiguredServices.push('Cloudflare R2');
    }

    if (config.minio.configured) {
      configuredServices.push('MinIO（自建，完全免费开源）');
    } else {
      unconfiguredServices.push('MinIO');
    }

    return `请分析以下云端存储配置情况，并提供专业的优化建议：

【当前配置状态】
${configuredServices.length > 0 ? `✅ 已配置服务：${configuredServices.join('、')}` : '❌ 未配置任何云端存储服务'}
${unconfiguredServices.length > 0 ? `⚠️ 未配置服务：${unconfiguredServices.join('、')}` : ''}

【Supabase状态】
- 配置状态：${config.supabase.configured ? '✅ 已配置' : '❌ 未配置'}
- 服务可用性：${config.supabase.available ? '✅ 可用' : '❌ 不可用'}
${config.supabase.configured ? `- URL：${config.supabase.url ? '已设置' : '未设置'}` : ''}
${config.supabase.configured ? `- Key：${config.supabase.key ? '已设置' : '未设置'}` : ''}

【Cloudflare R2状态】
- 配置状态：${config.cloudflareR2.configured ? '✅ 已配置' : '❌ 未配置'}

【MinIO状态】
- 配置状态：${config.minio.configured ? '✅ 已配置' : '❌ 未配置'}

请提供：
1. 配置状态总结（用一句话概括）
2. 3-5条具体的优化建议（按优先级排序）
3. 潜在风险和警告（如果有）
4. 推荐的最佳实践

请用中文回答，格式清晰易读。`;
  }

  /**
   * 从AI回复中提取总结
   */
  extractSummary(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return '配置分析完成';
    }

    // 提取第一段作为总结
    const lines = aiResponse.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 20 && !trimmed.startsWith('【') && !trimmed.startsWith('##')) {
        return trimmed.substring(0, 200);
      }
    }

    return aiResponse.substring(0, 200);
  }

  /**
   * 从AI回复中提取建议
   */
  extractRecommendations(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return [];
    }

    const recommendations = [];
    const lines = aiResponse.split('\n');
    let inRecommendations = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('建议') || trimmed.includes('推荐') || trimmed.includes('优化')) {
        inRecommendations = true;
        continue;
      }

      if (inRecommendations) {
        if (trimmed.match(/^[0-9]+[\.、]/) || 
            trimmed.startsWith('-') || 
            trimmed.startsWith('•') ||
            trimmed.startsWith('*')) {
          const cleaned = trimmed
            .replace(/^[0-9]+[\.、]\s*/, '')
            .replace(/^[-•*]\s*/, '')
            .trim();
          if (cleaned.length > 10) {
            recommendations.push(cleaned);
          }
        }
      }

      // 如果遇到其他章节，停止提取
      if (trimmed.startsWith('【') || trimmed.startsWith('##')) {
        if (inRecommendations && recommendations.length > 0) {
          break;
        }
      }
    }

    return recommendations.length > 0 ? recommendations : [
      '建议配置至少一个云端存储服务以确保数据安全',
      '推荐使用Supabase作为主要存储方案（永久免费）',
      '定期检查存储服务可用性和数据同步状态'
    ];
  }

  /**
   * 从AI回复中提取警告
   */
  extractWarnings(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return [];
    }

    const warnings = [];
    const lines = aiResponse.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('警告') || 
          trimmed.includes('风险') || 
          trimmed.includes('⚠️') ||
          trimmed.includes('注意')) {
        const cleaned = trimmed
          .replace(/^[⚠️❌]\s*/, '')
          .replace(/^(警告|风险|注意)[:：]\s*/, '')
          .trim();
        if (cleaned.length > 10) {
          warnings.push(cleaned);
        }
      }
    }

    return warnings;
  }

  /**
   * 计算配置评分（0-100）
   */
  calculateConfigScore(config) {
    let score = 0;

    // Supabase配置（40分）
    if (config.supabase.configured) {
      score += 20;
      if (config.supabase.available) {
        score += 20;
      }
    }

    // Cloudflare R2配置（30分）
    if (config.cloudflareR2.configured) {
      score += 30;
    }

    // MinIO配置（30分）
    if (config.minio.configured) {
      score += 30;
    }

    return Math.min(100, score);
  }

  /**
   * 基础建议（AI不可用时的备选）
   */
  getBasicRecommendations(config) {
    const recommendations = [];

    if (!config.supabase.configured && !config.cloudflareR2.configured && !config.minio.configured) {
      recommendations.push('建议立即配置云端存储服务，推荐使用Supabase（永久免费）');
      recommendations.push('配置云端存储后，数据会自动同步，多设备登录时数据会自动同步');
    } else if (!config.supabase.configured) {
      recommendations.push('建议配置Supabase作为主要存储方案（永久免费500MB数据库+1GB文件存储）');
    }

    if (config.supabase.configured && !config.supabase.available) {
      recommendations.push('Supabase已配置但服务不可用，请检查URL和Key是否正确');
    }

    if (config.cloudflareR2.configured || config.minio.configured) {
      recommendations.push('建议同时配置Supabase作为备用存储方案，提高数据安全性');
    }

    return recommendations;
  }

  /**
   * 基础警告（AI不可用时的备选）
   */
  getBasicWarnings(config) {
    const warnings = [];

    if (!config.supabase.configured && !config.cloudflareR2.configured && !config.minio.configured) {
      warnings.push('⚠️ 未配置任何云端存储服务，数据仅保存在本地，存在丢失风险');
    }

    if (config.supabase.configured && !config.supabase.available) {
      warnings.push('⚠️ Supabase配置可能有问题，请检查环境变量是否正确');
    }

    return warnings;
  }

  /**
   * 综合分析（配置检查 + AI分析）
   */
  async comprehensiveAnalysis() {
    try {
      const config = await this.checkConfiguration();
      const aiAnalysis = await this.analyzeWithAI(config);

      return {
        success: true,
        config,
        analysis: aiAnalysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('综合分析失败', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new StorageConfigAnalyzer();












