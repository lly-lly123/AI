/**
 * 数据共享分析服务 - 集成AI智能建议
 * 分析用户数据共享设置，提供安全和隐私建议
 */

const aiService = require('./aiService');
const storageService = require('./storageService');
const logger = require('../utils/logger');

class SharingAnalyzer {
  constructor() {
    this.analysisCache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10分钟缓存
  }

  /**
   * 分析用户数据共享设置
   */
  async analyzeUserSharing(userId) {
    try {
      const userDataList = await storageService.read('user_data') || [];
      const userData = userDataList.find(d => d.userId === userId);

      if (!userData) {
        return {
          success: false,
          error: '用户数据不存在'
        };
      }

      const sharing = userData.sharing || {
        visibility: 'private',
        allowedUserIds: []
      };

      const dataStats = {
        pigeons: (userData.data?.pigeons || []).length,
        races: (userData.data?.races || []).length,
        trainingRecords: (userData.data?.trainingRecords || []).length,
        healthRecords: (userData.data?.healthRecords || []).length
      };

      // 使用AI分析
      const aiAnalysis = await this.analyzeWithAI(sharing, dataStats, userData);

      return {
        success: true,
        sharing,
        dataStats,
        analysis: aiAnalysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('分析用户共享设置失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 分析所有用户的共享设置（管理员）
   */
  async analyzeAllUsersSharing() {
    try {
      const userDataList = await storageService.read('user_data') || [];
      const users = await storageService.read('users') || [];

      const statistics = {
        total: userDataList.length,
        private: 0,
        shared: 0,
        public: 0,
        users: []
      };

      for (const userData of userDataList) {
        const sharing = userData.sharing || { visibility: 'private' };
        const user = users.find(u => u.id === userData.userId);

        statistics[sharing.visibility] = (statistics[sharing.visibility] || 0) + 1;

        statistics.users.push({
          userId: userData.userId,
          username: user?.username || '未知',
          visibility: sharing.visibility,
          allowedUserIds: sharing.allowedUserIds || [],
          dataCount: {
            pigeons: (userData.data?.pigeons || []).length,
            races: (userData.data?.races || []).length
          }
        });
      }

      // 使用AI分析整体共享情况
      const aiAnalysis = await this.analyzeAllWithAI(statistics);

      return {
        success: true,
        statistics,
        analysis: aiAnalysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('分析所有用户共享设置失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 使用AI分析单个用户的共享设置
   */
  async analyzeWithAI(sharing, dataStats, userData) {
    try {
      const cacheKey = `${sharing.visibility}-${JSON.stringify(dataStats)}`;
      const cached = this.analysisCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.result;
      }

      const prompt = this.buildAnalysisPrompt(sharing, dataStats);
      const aiResponse = await aiService.chat(prompt, [], {
        task: 'sharing_analysis',
        context: {
          sharing,
          dataStats,
          timestamp: new Date().toISOString()
        }
      });

      const analysis = {
        summary: this.extractSummary(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
        securityWarnings: this.extractSecurityWarnings(aiResponse),
        privacyScore: this.calculatePrivacyScore(sharing, dataStats),
        timestamp: new Date().toISOString()
      };

      // 缓存结果
      this.analysisCache.set(cacheKey, {
        result: analysis,
        timestamp: Date.now()
      });

      return analysis;
    } catch (error) {
      logger.error('AI分析共享设置失败', error);
      return {
        summary: 'AI分析暂时不可用，使用基础分析',
        recommendations: this.getBasicRecommendations(sharing, dataStats),
        securityWarnings: this.getBasicSecurityWarnings(sharing, dataStats),
        privacyScore: this.calculatePrivacyScore(sharing, dataStats),
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  /**
   * 使用AI分析所有用户的共享情况
   */
  async analyzeAllWithAI(statistics) {
    try {
      const prompt = `请分析以下用户数据共享统计情况，并提供管理建议：

【共享统计】
- 总用户数：${statistics.total}
- 私有数据（private）：${statistics.private} 用户
- 共享数据（shared）：${statistics.shared} 用户
- 公开数据（public）：${statistics.public} 用户

【共享比例】
- 私有比例：${((statistics.private / statistics.total) * 100).toFixed(1)}%
- 共享比例：${((statistics.shared / statistics.total) * 100).toFixed(1)}%
- 公开比例：${((statistics.public / statistics.total) * 100).toFixed(1)}%

请提供：
1. 共享情况总结
2. 3-5条数据安全和隐私管理建议
3. 潜在风险和注意事项
4. 推荐的最佳实践

请用中文回答，格式清晰易读。`;

      const aiResponse = await aiService.chat(prompt, [], {
        task: 'sharing_management_analysis',
        context: {
          statistics,
          timestamp: new Date().toISOString()
        }
      });

      return {
        summary: this.extractSummary(aiResponse),
        recommendations: this.extractRecommendations(aiResponse),
        warnings: this.extractSecurityWarnings(aiResponse),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('AI分析所有用户共享情况失败', error);
      return {
        summary: 'AI分析暂时不可用',
        recommendations: this.getBasicManagementRecommendations(statistics),
        warnings: [],
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  /**
   * 构建AI分析提示词
   */
  buildAnalysisPrompt(sharing, dataStats) {
    return `请分析以下用户数据共享设置，并提供安全和隐私建议：

【当前共享设置】
- 共享模式：${sharing.visibility === 'private' ? '私有（仅自己可见）' : sharing.visibility === 'shared' ? '共享（指定用户可见）' : '公开（所有人可见）'}
- 允许访问的用户数：${sharing.allowedUserIds?.length || 0} 个

【数据规模】
- 鸽子数量：${dataStats.pigeons} 只
- 比赛记录：${dataStats.races} 条
- 训练记录：${dataStats.trainingRecords} 条
- 健康记录：${dataStats.healthRecords} 条

请提供：
1. 当前共享设置的安全性评估（用一句话概括）
2. 3-5条具体的隐私和安全建议（按重要性排序）
3. 潜在风险和警告（如果有）
4. 推荐的最佳实践

请用中文回答，格式清晰易读。`;
  }

  /**
   * 从AI回复中提取总结
   */
  extractSummary(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return '共享设置分析完成';
    }

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

      if (trimmed.startsWith('【') || trimmed.startsWith('##')) {
        if (inRecommendations && recommendations.length > 0) {
          break;
        }
      }
    }

    return recommendations.length > 0 ? recommendations : this.getBasicRecommendations({ visibility: 'private' }, {});
  }

  /**
   * 从AI回复中提取安全警告
   */
  extractSecurityWarnings(aiResponse) {
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
          trimmed.includes('注意') ||
          trimmed.includes('安全')) {
        const cleaned = trimmed
          .replace(/^[⚠️❌]\s*/, '')
          .replace(/^(警告|风险|注意|安全)[:：]\s*/, '')
          .trim();
        if (cleaned.length > 10) {
          warnings.push(cleaned);
        }
      }
    }

    return warnings;
  }

  /**
   * 计算隐私评分（0-100，分数越高越安全）
   */
  calculatePrivacyScore(sharing, dataStats) {
    let score = 100;

    // 根据共享模式扣分
    if (sharing.visibility === 'public') {
      score -= 50; // 公开数据隐私风险高
    } else if (sharing.visibility === 'shared') {
      score -= 20; // 共享数据有一定风险
    }

    // 根据数据规模调整
    const totalData = dataStats.pigeons + dataStats.races + dataStats.trainingRecords;
    if (totalData > 100 && sharing.visibility !== 'private') {
      score -= 10; // 数据量大时，非私有模式风险更高
    }

    // 根据允许访问的用户数调整
    if (sharing.allowedUserIds && sharing.allowedUserIds.length > 10) {
      score -= 5; // 允许访问的用户过多
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 基础建议（AI不可用时的备选）
   */
  getBasicRecommendations(sharing, dataStats) {
    const recommendations = [];

    if (sharing.visibility === 'public') {
      recommendations.push('⚠️ 数据已设置为公开，所有人可见，建议改为私有或共享模式');
    } else if (sharing.visibility === 'shared') {
      recommendations.push('数据设置为共享模式，建议定期检查允许访问的用户列表');
      recommendations.push('确保只允许信任的用户访问您的数据');
    } else {
      recommendations.push('✅ 数据设置为私有模式，隐私保护良好');
    }

    if (dataStats.pigeons > 50 || dataStats.races > 100) {
      recommendations.push('数据量较大，建议定期备份到云端');
    }

    return recommendations;
  }

  /**
   * 基础安全警告（AI不可用时的备选）
   */
  getBasicSecurityWarnings(sharing, dataStats) {
    const warnings = [];

    if (sharing.visibility === 'public') {
      warnings.push('⚠️ 数据已公开，任何人都可以查看，请谨慎考虑');
    }

    if (sharing.allowedUserIds && sharing.allowedUserIds.length > 20) {
      warnings.push('⚠️ 允许访问的用户数量较多，建议定期审查');
    }

    return warnings;
  }

  /**
   * 基础管理建议（AI不可用时的备选）
   */
  getBasicManagementRecommendations(statistics) {
    const recommendations = [];

    const publicRatio = (statistics.public / statistics.total) * 100;
    if (publicRatio > 20) {
      recommendations.push('公开数据的用户比例较高，建议提醒用户注意隐私保护');
    }

    if (statistics.private < statistics.total * 0.5) {
      recommendations.push('私有数据的用户比例较低，建议推广隐私保护意识');
    }

    recommendations.push('建议定期审查用户共享设置，确保数据安全');
    recommendations.push('为管理员提供数据共享统计和监控功能');

    return recommendations;
  }
}

module.exports = new SharingAnalyzer();














