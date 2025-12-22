const storageService = require('./storageService');
const trainingService = require('./trainingService');
const aiService = require('./aiService');
const logger = require('../utils/logger');
const moment = require('moment');

class QualificationService {
  /**
   * 综合分析鸽子是否具备参赛资格
   */
  async analyzeQualification(pigeonId, raceDistance) {
    try {
      const pigeons = await storageService.read('pigeons');
      const pigeon = pigeons.find(p => p.id === pigeonId);
      
      if (!pigeon) {
        throw new Error('鸽子不存在');
      }

      // 获取训练记录
      const trainingRecords = await trainingService.getTrainingRecords(pigeonId, 50);
      
      // 获取比赛记录
      const raceRecords = await storageService.filter('races', 
        r => r.pigeonId === pigeonId && r.status === 'completed'
      );

      // 获取本地协会成绩数据（模拟）
      const localAssociationData = await this.getLocalAssociationData(raceDistance);
      
      // 获取全国同距离赛事数据（模拟）
      const nationalRaceData = await this.getNationalRaceData(raceDistance);

      // 综合分析
      const analysis = {
        pigeonId,
        pigeonRing: pigeon.ring,
        raceDistance,
        analysisDate: new Date().toISOString(),
        trainingAnalysis: this.analyzeTrainingForRace(trainingRecords, raceDistance),
        raceHistoryAnalysis: this.analyzeRaceHistory(raceRecords, raceDistance),
        comparisonAnalysis: this.compareWithBenchmarks(
          trainingRecords,
          localAssociationData,
          nationalRaceData,
          raceDistance
        ),
        qualification: this.determineQualification(trainingRecords, raceRecords, raceDistance),
        recommendations: []
      };

      // 生成建议
      analysis.recommendations = this.generateRecommendations(analysis);

      // 调用AI进行综合评估
      let aiAnalysis = null;
      try {
        aiAnalysis = await this.getAIAnalysis(analysis, pigeon, localAssociationData, nationalRaceData);
        if (aiAnalysis && aiAnalysis.success) {
          analysis.aiAnalysis = aiAnalysis.data;
          // 如果AI提供了建议，合并到建议列表
          if (aiAnalysis.data.recommendations && Array.isArray(aiAnalysis.data.recommendations)) {
            analysis.recommendations = [...analysis.recommendations, ...aiAnalysis.data.recommendations];
          }
        }
      } catch (error) {
        logger.warn('AI综合分析失败，使用规则分析结果:', error.message);
      }

      return {
        success: true,
        data: analysis,
        disclaimer: '本分析结果仅供参考，实际参赛资格以赛事组委会规定为准。数据来源于训练记录、历史比赛记录、当地及全国赛鸽数据，并结合AI智能分析，可能存在误差。'
      };
    } catch (error) {
      logger.error('分析参赛资格失败', error);
      throw error;
    }
  }

  /**
   * 分析训练数据是否适合参赛
   */
  analyzeTrainingForRace(trainingRecords, raceDistance) {
    if (trainingRecords.length === 0) {
      return {
        status: 'insufficient',
        message: '无训练记录，无法评估',
        score: 0
      };
    }

    // 找到最接近比赛距离的训练
    const relevantTrainings = trainingRecords.filter(t => 
      Math.abs(t.distance - raceDistance) <= raceDistance * 0.3
    );

    if (relevantTrainings.length === 0) {
      return {
        status: 'mismatch',
        message: '训练距离与比赛距离差异较大',
        score: 30
      };
    }

    // 计算平均速度
    const avgSpeed = relevantTrainings.reduce((sum, t) => sum + t.speed, 0) / relevantTrainings.length;
    
    // 计算训练频率（最近30天）
    const recentTrainings = trainingRecords.filter(t => 
      moment(t.date).isAfter(moment().subtract(30, 'days'))
    );

    // 评估分数
    let score = 50; // 基础分
    
    // 速度评估（假设优秀速度为60-80公里/小时）
    if (avgSpeed >= 60 && avgSpeed <= 80) {
      score += 30;
    } else if (avgSpeed >= 50 && avgSpeed < 60) {
      score += 20;
    } else if (avgSpeed >= 40 && avgSpeed < 50) {
      score += 10;
    }

    // 训练频率评估
    if (recentTrainings.length >= 8) {
      score += 20;
    } else if (recentTrainings.length >= 5) {
      score += 10;
    }

    let status = 'good';
    if (score >= 80) {
      status = 'excellent';
    } else if (score >= 60) {
      status = 'good';
    } else if (score >= 40) {
      status = 'fair';
    } else {
      status = 'poor';
    }

    return {
      status,
      score,
      avgSpeed,
      recentTrainingCount: recentTrainings.length,
      relevantTrainingCount: relevantTrainings.length,
      message: this.getTrainingMessage(status, avgSpeed, recentTrainings.length)
    };
  }

  /**
   * 分析历史比赛记录
   */
  analyzeRaceHistory(raceRecords, raceDistance) {
    if (raceRecords.length === 0) {
      return {
        status: 'no_history',
        message: '无历史比赛记录',
        score: 0
      };
    }

    // 筛选同距离或相近距离的比赛
    const relevantRaces = raceRecords.filter(r => 
      Math.abs(r.distance - raceDistance) <= raceDistance * 0.2
    );

    if (relevantRaces.length === 0) {
      return {
        status: 'distance_mismatch',
        message: '无相同距离的比赛记录',
        score: 20
      };
    }

    // 计算平均排名
    const avgRank = relevantRaces.reduce((sum, r) => sum + (r.rank || 999), 0) / relevantRaces.length;
    const completionRate = relevantRaces.filter(r => r.status === 'completed').length / relevantRaces.length;

    let score = 50;
    if (avgRank <= 100) {
      score += 30;
    } else if (avgRank <= 500) {
      score += 20;
    } else if (avgRank <= 1000) {
      score += 10;
    }

    score = score * completionRate;

    let status = 'good';
    if (score >= 70 && avgRank <= 100) {
      status = 'excellent';
    } else if (score >= 50) {
      status = 'good';
    } else {
      status = 'fair';
    }

    return {
      status,
      score,
      avgRank,
      completionRate,
      raceCount: relevantRaces.length,
      message: `历史${relevantRaces.length}场同距离比赛，平均排名${Math.round(avgRank)}，完赛率${(completionRate * 100).toFixed(0)}%`
    };
  }

  /**
   * 与基准数据对比
   */
  compareWithBenchmarks(trainingRecords, localData, nationalData, raceDistance) {
    if (trainingRecords.length === 0) {
      return {
        status: 'insufficient_data',
        message: '训练数据不足，无法对比'
      };
    }

    const recentTrainings = trainingRecords.slice(0, 10);
    const avgSpeed = recentTrainings.reduce((sum, t) => sum + t.speed, 0) / recentTrainings.length;

    // 与本地协会数据对比
    const localComparison = {
      avgSpeed: avgSpeed,
      benchmarkSpeed: localData.avgSpeed || 65,
      difference: avgSpeed - (localData.avgSpeed || 65),
      percentile: this.calculatePercentile(avgSpeed, localData.speedDistribution || [])
    };

    // 与全国数据对比
    const nationalComparison = {
      avgSpeed: avgSpeed,
      benchmarkSpeed: nationalData.avgSpeed || 68,
      difference: avgSpeed - (nationalData.avgSpeed || 68),
      percentile: this.calculatePercentile(avgSpeed, nationalData.speedDistribution || [])
    };

    let status = 'average';
    if (localComparison.percentile >= 80 && nationalComparison.percentile >= 75) {
      status = 'excellent';
    } else if (localComparison.percentile >= 60 || nationalComparison.percentile >= 60) {
      status = 'good';
    } else if (localComparison.percentile < 40 || nationalComparison.percentile < 40) {
      status = 'below_average';
    }

    return {
      status,
      localComparison,
      nationalComparison,
      message: `训练速度${avgSpeed.toFixed(1)}公里/小时，${status === 'excellent' ? '优于' : status === 'below_average' ? '低于' : '接近'}平均水平`
    };
  }

  /**
   * 确定参赛资格
   */
  determineQualification(trainingRecords, raceRecords, raceDistance) {
    const trainingAnalysis = this.analyzeTrainingForRace(trainingRecords, raceDistance);
    const raceAnalysis = this.analyzeRaceHistory(raceRecords, raceDistance);

    const totalScore = (trainingAnalysis.score || 0) * 0.6 + (raceAnalysis.score || 0) * 0.4;

    let qualification = 'not_qualified';
    let confidence = 0;

    if (totalScore >= 75) {
      qualification = 'highly_qualified';
      confidence = 0.9;
    } else if (totalScore >= 60) {
      qualification = 'qualified';
      confidence = 0.7;
    } else if (totalScore >= 45) {
      qualification = 'conditionally_qualified';
      confidence = 0.5;
    } else {
      qualification = 'not_qualified';
      confidence = 0.3;
    }

    return {
      status: qualification,
      score: totalScore,
      confidence,
      message: this.getQualificationMessage(qualification, totalScore)
    };
  }

  /**
   * 生成建议
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.trainingAnalysis.status === 'insufficient' || analysis.trainingAnalysis.status === 'poor') {
      recommendations.push('建议增加训练次数，特别是与比赛距离相近的训练');
    }

    if (analysis.trainingAnalysis.avgSpeed < 50) {
      recommendations.push('建议加强速度训练，提高平均飞行速度');
    }

    if (analysis.qualification.status === 'conditionally_qualified') {
      recommendations.push('建议在赛前进行针对性训练，提高参赛成功率');
    }

    if (analysis.qualification.status === 'not_qualified') {
      recommendations.push('当前状态不建议参赛，建议继续训练后再评估');
    }

    if (analysis.comparisonAnalysis.status === 'below_average') {
      recommendations.push('训练水平低于平均水平，需要加强训练');
    }

    return recommendations.length > 0 ? recommendations : ['训练状态良好，可以参赛'];
  }

  /**
   * 获取本地协会数据（模拟）
   */
  async getLocalAssociationData(distance) {
    // 这里应该从实际数据源获取，目前返回模拟数据
    return {
      avgSpeed: 65,
      speedDistribution: [50, 55, 60, 65, 70, 75, 80],
      completionRate: 0.85,
      avgRank: 500
    };
  }

  /**
   * 获取全国赛事数据（模拟）
   */
  async getNationalRaceData(distance) {
    // 这里应该从实际数据源获取，目前返回模拟数据
    return {
      avgSpeed: 68,
      speedDistribution: [55, 60, 65, 68, 72, 75, 82],
      completionRate: 0.88,
      avgRank: 800
    };
  }

  /**
   * 计算百分位数
   */
  calculatePercentile(value, distribution) {
    if (!distribution || distribution.length === 0) {
      return 50; // 默认中位数
    }
    
    const sorted = [...distribution].sort((a, b) => a - b);
    const below = sorted.filter(v => v < value).length;
    return (below / sorted.length) * 100;
  }

  /**
   * 获取训练消息
   */
  getTrainingMessage(status, avgSpeed, count) {
    const messages = {
      excellent: `训练状态优秀，平均速度${avgSpeed.toFixed(1)}公里/小时，最近30天训练${count}次`,
      good: `训练状态良好，平均速度${avgSpeed.toFixed(1)}公里/小时，最近30天训练${count}次`,
      fair: `训练状态一般，平均速度${avgSpeed.toFixed(1)}公里/小时，建议增加训练`,
      poor: `训练状态不佳，平均速度${avgSpeed.toFixed(1)}公里/小时，需要加强训练`,
      insufficient: '训练数据不足',
      mismatch: '训练距离与比赛距离不匹配'
    };
    return messages[status] || '无法评估';
  }

  /**
   * 获取资格消息
   */
  getQualificationMessage(status, score) {
    const messages = {
      highly_qualified: `综合评分${score.toFixed(1)}分，具备参赛资格，建议参赛`,
      qualified: `综合评分${score.toFixed(1)}分，具备参赛资格`,
      conditionally_qualified: `综合评分${score.toFixed(1)}分，条件性具备参赛资格，建议加强训练`,
      not_qualified: `综合评分${score.toFixed(1)}分，暂不具备参赛资格，建议继续训练`
    };
    return messages[status] || '无法评估';
  }

  /**
   * 调用AI进行综合分析
   */
  async getAIAnalysis(analysis, pigeon, localData, nationalData) {
    try {
      const prompt = `请综合分析以下信鸽的参赛能力：

【鸽子基本信息】
- 足环号：${pigeon.ring}
- 名称：${pigeon.name || '未命名'}
- 性别：${pigeon.gender || '未知'}
- 类型：${pigeon.type || '未知'}

【训练分析结果】
- 训练状态：${analysis.trainingAnalysis.status}
- 训练评分：${analysis.trainingAnalysis.score}/100
- 平均速度：${analysis.trainingAnalysis.avgSpeed || '未知'}公里/小时
- 最近训练次数：${analysis.trainingAnalysis.recentTrainingCount}
- 训练评估：${analysis.trainingAnalysis.message}

【历史比赛分析】
- 比赛状态：${analysis.raceHistoryAnalysis.status}
- 比赛评分：${analysis.raceHistoryAnalysis.score}/100
- 平均排名：${analysis.raceHistoryAnalysis.avgRank || '无'}
- 完赛率：${(analysis.raceHistoryAnalysis.completionRate * 100).toFixed(0) || 0}%
- 比赛评估：${analysis.raceHistoryAnalysis.message}

【对比分析】
- 与当地协会对比：${analysis.comparisonAnalysis.localComparison ? `速度${analysis.comparisonAnalysis.localComparison.avgSpeed}公里/小时，百分位${analysis.comparisonAnalysis.localComparison.percentile.toFixed(0)}%` : '无数据'}
- 与全国数据对比：${analysis.comparisonAnalysis.nationalComparison ? `速度${analysis.comparisonAnalysis.nationalComparison.avgSpeed}公里/小时，百分位${analysis.comparisonAnalysis.nationalComparison.percentile.toFixed(0)}%` : '无数据'}

【当地协会基准数据】
- 平均速度：${localData.avgSpeed}公里/小时
- 完赛率：${(localData.completionRate * 100).toFixed(0)}%
- 平均排名：${localData.avgRank}

【全国赛事基准数据】
- 平均速度：${nationalData.avgSpeed}公里/小时
- 完赛率：${(nationalData.completionRate * 100).toFixed(0)}%
- 平均排名：${nationalData.avgRank}

【综合评估结果】
- 参赛资格：${analysis.qualification.status}
- 综合评分：${analysis.qualification.score.toFixed(1)}/100
- 置信度：${(analysis.qualification.confidence * 100).toFixed(0)}%

请基于以上数据，提供：
1. 综合能力评估（考虑训练、历史比赛、与基准数据对比）
2. 参赛建议（是否适合参赛，需要注意什么）
3. 改进建议（如何提高参赛成功率）
4. 风险评估（参赛可能面临的风险）

请以专业、客观的角度分析，并明确说明这是基于数据的评估，仅供参考。`;

      const context = {
        totalPigeons: 1,
        analysisType: 'qualification',
        raceDistance: analysis.raceDistance
      };

      const aiResult = await aiService.chat(prompt, [], context);

      if (aiResult && aiResult.text) {
        return {
          success: true,
          data: {
            summary: aiResult.text,
            recommendations: this.extractRecommendations(aiResult.text),
            model: aiResult.model || 'AI分析',
            provider: aiResult.provider || 'AI服务'
          }
        };
      }

      return { success: false };
    } catch (error) {
      logger.error('AI综合分析失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 从AI回复中提取建议
   */
  extractRecommendations(aiText) {
    const recommendations = [];
    const lines = aiText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[0-9]+[\.、]/) || trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('建议')) {
        recommendations.push(trimmed.replace(/^[0-9]+[\.、]\s*/, '').replace(/^[-•]\s*/, '').replace(/^建议[:：]\s*/, ''));
      }
    }

    return recommendations.length > 0 ? recommendations : [aiText.substring(0, 200)];
  }
}

module.exports = new QualificationService();


















