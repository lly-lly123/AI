const storageService = require('./storageService');
const logger = require('../utils/logger');
const moment = require('moment');

class TrainingService {
  /**
   * 创建训练记录
   */
  async createTraining(userId, pigeonId, trainingData) {
    try {
      const training = {
        userId,
        pigeonId,
        date: trainingData.date || new Date().toISOString().split('T')[0],
        distance: trainingData.distance, // 公里
        duration: trainingData.duration, // 分钟
        weather: trainingData.weather || 'unknown',
        temperature: trainingData.temperature,
        windSpeed: trainingData.windSpeed,
        direction: trainingData.direction, // 方向
        releaseTime: trainingData.releaseTime, // 放飞时间
        returnTime: trainingData.returnTime, // 归巢时间
        speed: this.calculateSpeed(trainingData.distance, trainingData.duration),
        notes: trainingData.notes || '',
        status: 'completed' // completed, cancelled
      };

      const saved = await storageService.add('training', training);
      
      // 自动更新统计和分析
      await this.updateTrainingStats(pigeonId);
      await this.analyzeTrainingData(pigeonId);
      
      return saved;
    } catch (error) {
      logger.error('创建训练记录失败', error);
      throw error;
    }
  }

  /**
   * 获取鸽子的训练记录
   */
  async getTrainingRecords(pigeonId, limit = 50) {
    try {
      const allRecords = await storageService.filter('training', 
        record => record.pigeonId === pigeonId && record.status === 'completed'
      );
      
      // 按日期倒序排列
      allRecords.sort((a, b) => moment(b.date).valueOf() - moment(a.date).valueOf());
      
      return limit ? allRecords.slice(0, limit) : allRecords;
    } catch (error) {
      logger.error('获取训练记录失败', error);
      throw error;
    }
  }

  /**
   * 更新训练记录
   */
  async updateTraining(trainingId, updates) {
    try {
      // 如果更新了距离或时间，重新计算速度
      if (updates.distance || updates.duration) {
        const training = await storageService.find('training', t => t.id === trainingId);
        if (training) {
          const distance = updates.distance || training.distance;
          const duration = updates.duration || training.duration;
          updates.speed = this.calculateSpeed(distance, duration);
        }
      }

      const updated = await storageService.update('training', trainingId, updates);
      
      // 自动更新统计和分析
      if (updated.pigeonId) {
        await this.updateTrainingStats(updated.pigeonId);
        await this.analyzeTrainingData(updated.pigeonId);
      }
      
      return updated;
    } catch (error) {
      logger.error('更新训练记录失败', error);
      throw error;
    }
  }

  /**
   * 删除训练记录
   */
  async deleteTraining(trainingId) {
    try {
      const training = await storageService.find('training', t => t.id === trainingId);
      await storageService.delete('training', trainingId);
      
      if (training && training.pigeonId) {
        await this.updateTrainingStats(training.pigeonId);
        await this.analyzeTrainingData(training.pigeonId);
      }
      
      return true;
    } catch (error) {
      logger.error('删除训练记录失败', error);
      throw error;
    }
  }

  /**
   * 计算速度（公里/小时）
   */
  calculateSpeed(distance, duration) {
    if (!distance || !duration || duration === 0) {
      return 0;
    }
    return (distance / duration) * 60; // 转换为公里/小时
  }

  /**
   * 更新训练统计
   */
  async updateTrainingStats(pigeonId) {
    try {
      const records = await this.getTrainingRecords(pigeonId);
      
      if (records.length === 0) {
        return null;
      }

      const stats = {
        pigeonId,
        totalTrainings: records.length,
        totalDistance: records.reduce((sum, r) => sum + (r.distance || 0), 0),
        totalDuration: records.reduce((sum, r) => sum + (r.duration || 0), 0),
        averageSpeed: records.reduce((sum, r) => sum + (r.speed || 0), 0) / records.length,
        maxSpeed: Math.max(...records.map(r => r.speed || 0)),
        minSpeed: Math.min(...records.map(r => r.speed || 0)),
        lastTrainingDate: records[0]?.date,
        recentTrainings: records.slice(0, 10).map(r => ({
          date: r.date,
          distance: r.distance,
          speed: r.speed
        })),
        updatedAt: new Date().toISOString()
      };

      // 保存统计到鸽子数据中
      const pigeons = await storageService.read('pigeons');
      const pigeonIndex = pigeons.findIndex(p => p.id === pigeonId);
      
      if (pigeonIndex !== -1) {
        pigeons[pigeonIndex].trainingStats = stats;
        await storageService.write('pigeons', pigeons);
      }

      return stats;
    } catch (error) {
      logger.error('更新训练统计失败', error);
      throw error;
    }
  }

  /**
   * 分析训练数据
   */
  async analyzeTrainingData(pigeonId) {
    try {
      const records = await this.getTrainingRecords(pigeonId, 30); // 最近30次训练
      
      if (records.length < 3) {
        return {
          pigeonId,
          analysis: {
            speedTrend: 'insufficient_data',
            recovery: 'insufficient_data',
            overtrainingRisk: 'low',
            summary: '训练数据不足，无法进行有效分析'
          }
        };
      }

      // 速度趋势分析
      const speedTrend = this.analyzeSpeedTrend(records);
      
      // 恢复能力分析
      const recovery = this.analyzeRecovery(records);
      
      // 过度训练风险评估
      const overtrainingRisk = this.assessOvertrainingRisk(records);
      
      // 生成总结
      const summary = this.generateSummary(speedTrend, recovery, overtrainingRisk);

      const analysis = {
        pigeonId,
        analysis: {
          speedTrend,
          recovery,
          overtrainingRisk,
          summary,
          recommendations: this.generateRecommendations(speedTrend, recovery, overtrainingRisk),
          updatedAt: new Date().toISOString()
        }
      };

      // 保存分析结果到鸽子数据
      const pigeons = await storageService.read('pigeons');
      const pigeonIndex = pigeons.findIndex(p => p.id === pigeonId);
      
      if (pigeonIndex !== -1) {
        pigeons[pigeonIndex].trainingAnalysis = analysis.analysis;
        await storageService.write('pigeons', pigeons);
      }

      return analysis;
    } catch (error) {
      logger.error('分析训练数据失败', error);
      throw error;
    }
  }

  /**
   * 分析速度趋势
   */
  analyzeSpeedTrend(records) {
    if (records.length < 3) {
      return { trend: 'insufficient_data', value: 0 };
    }

    const recent = records.slice(0, Math.min(5, records.length));
    const older = records.slice(Math.min(5, records.length), Math.min(10, records.length));
    
    if (older.length === 0) {
      return { trend: 'stable', value: recent.reduce((sum, r) => sum + r.speed, 0) / recent.length };
    }

    const recentAvg = recent.reduce((sum, r) => sum + r.speed, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.speed, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) {
      return { trend: 'improving', value: change, currentAvg: recentAvg };
    } else if (change < -5) {
      return { trend: 'declining', value: change, currentAvg: recentAvg };
    } else {
      return { trend: 'stable', value: change, currentAvg: recentAvg };
    }
  }

  /**
   * 分析恢复能力
   */
  analyzeRecovery(records) {
    if (records.length < 3) {
      return { status: 'insufficient_data' };
    }

    // 检查连续训练之间的间隔
    const intervals = [];
    for (let i = 0; i < records.length - 1; i++) {
      const daysDiff = moment(records[i].date).diff(moment(records[i + 1].date), 'days');
      intervals.push(daysDiff);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    
    // 检查速度恢复情况
    const speedRecovery = [];
    for (let i = 0; i < records.length - 1; i++) {
      if (records[i].speed > records[i + 1].speed) {
        speedRecovery.push(true);
      } else {
        speedRecovery.push(false);
      }
    }

    const recoveryRate = speedRecovery.filter(r => r).length / speedRecovery.length;

    if (avgInterval >= 2 && recoveryRate > 0.7) {
      return { status: 'excellent', avgInterval, recoveryRate };
    } else if (avgInterval >= 1 && recoveryRate > 0.5) {
      return { status: 'good', avgInterval, recoveryRate };
    } else if (avgInterval < 1) {
      return { status: 'poor', avgInterval, recoveryRate, warning: '训练间隔过短' };
    } else {
      return { status: 'fair', avgInterval, recoveryRate };
    }
  }

  /**
   * 评估过度训练风险
   */
  assessOvertrainingRisk(records) {
    if (records.length < 5) {
      return { level: 'low', reason: '训练数据不足' };
    }

    const recent = records.slice(0, 7); // 最近7次训练
    
    // 检查训练频率
    const daysDiff = moment(recent[0].date).diff(moment(recent[recent.length - 1].date), 'days');
    const frequency = recent.length / Math.max(daysDiff, 1);
    
    // 检查速度下降趋势
    const speeds = recent.map(r => r.speed);
    const speedDecline = (speeds[0] - speeds[speeds.length - 1]) / speeds[speeds.length - 1];
    
    // 检查平均速度
    const avgSpeed = speeds.reduce((sum, s) => sum + s, 0) / speeds.length;
    const baselineSpeed = records.slice(7, 14).reduce((sum, r) => sum + r.speed, 0) / Math.min(7, records.length - 7);
    const speedDrop = baselineSpeed > 0 ? ((baselineSpeed - avgSpeed) / baselineSpeed) * 100 : 0;

    if (frequency > 0.8 && speedDecline > 0.15) {
      return { level: 'high', reason: '训练频率过高且速度明显下降', frequency, speedDecline };
    } else if (frequency > 0.6 && speedDrop > 10) {
      return { level: 'medium', reason: '训练频率较高且速度下降', frequency, speedDrop };
    } else if (frequency > 0.8) {
      return { level: 'medium', reason: '训练频率过高', frequency };
    } else {
      return { level: 'low', reason: '训练安排合理', frequency };
    }
  }

  /**
   * 生成总结
   */
  generateSummary(speedTrend, recovery, overtrainingRisk) {
    const points = [];
    
    // 速度趋势
    if (speedTrend.trend === 'improving') {
      points.push('速度呈上升趋势，训练效果良好');
    } else if (speedTrend.trend === 'declining') {
      points.push('速度呈下降趋势，需要关注');
    }
    
    // 恢复能力
    if (recovery.status === 'excellent') {
      points.push('恢复能力优秀');
    } else if (recovery.status === 'poor') {
      points.push('恢复能力不足，建议增加休息时间');
    }
    
    // 过度训练风险
    if (overtrainingRisk.level === 'high') {
      points.push('存在过度训练风险，建议减少训练频率');
    } else if (overtrainingRisk.level === 'medium') {
      points.push('需要注意训练强度，避免过度训练');
    }

    return points.length > 0 ? points.join('；') : '训练数据正常，继续保持';
  }

  /**
   * 生成建议
   */
  generateRecommendations(speedTrend, recovery, overtrainingRisk) {
    const recommendations = [];
    
    if (speedTrend.trend === 'declining') {
      recommendations.push('建议适当降低训练强度，增加恢复时间');
    }
    
    if (recovery.status === 'poor') {
      recommendations.push('建议训练间隔至少2天，确保充分恢复');
    }
    
    if (overtrainingRisk.level === 'high') {
      recommendations.push('建议暂停训练1-2周，让鸽子充分休息');
    } else if (overtrainingRisk.level === 'medium') {
      recommendations.push('建议减少训练频率，每周训练不超过3次');
    }
    
    if (speedTrend.trend === 'improving' && recovery.status === 'excellent' && overtrainingRisk.level === 'low') {
      recommendations.push('训练状态良好，可以保持当前训练计划');
    }

    return recommendations.length > 0 ? recommendations : ['继续保持当前训练计划'];
  }
}

module.exports = new TrainingService();


















