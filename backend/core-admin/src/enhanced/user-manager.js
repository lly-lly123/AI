/**
 * 用户管理增强模块
 * 自动检测异常用户、行为分析、自动处理
 */

const logger = require('../utils/logger');
const path = require('path');
// 注意：需要从backend目录引用storageService
const storageService = require(path.join(__dirname, '../../../services/storageService'));
const aiHub = require('../ai-hub/ai-hub');

class UserManager {
  constructor() {
    this.anomalyThresholds = {
      // 异常登录检测阈值
      loginAttempts: 5, // 5次失败登录尝试
      loginTimeRange: 3600000, // 1小时内
      
      // 异常行为检测阈值
      dataUploadSpike: 100, // 1小时内上传超过100条数据
      apiCallSpike: 200, // 1小时内API调用超过200次
      
      // 账户异常检测
      inactiveDays: 90, // 90天未登录
      noDataDays: 30, // 30天无数据上传
    };
    
    this.actions = [];
    this.userProfiles = new Map(); // 用户行为画像
  }

  /**
   * 检测异常用户
   */
  async detectAnomalousUsers() {
    try {
      const users = await storageService.read('users') || [];
      const loginLogs = await storageService.read('login_logs') || [];
      const adminLogs = await storageService.read('admin_logs') || [];
      
      const anomalies = [];
      const now = Date.now();
      
      // 分析每个用户
      for (const user of users) {
        const userAnomalies = [];
        
        // 1. 检测异常登录
        const recentLogins = loginLogs.filter(log => 
          log.userId === user.id && 
          (now - new Date(log.timestamp).getTime()) < this.anomalyThresholds.loginTimeRange
        );
        
        const failedLogins = recentLogins.filter(log => !log.success);
        if (failedLogins.length >= this.anomalyThresholds.loginAttempts) {
          userAnomalies.push({
            type: 'suspicious_login',
            severity: 'high',
            message: `用户 ${user.username} 在1小时内失败登录${failedLogins.length}次`,
            details: {
              failedAttempts: failedLogins.length,
              lastAttempt: failedLogins[failedLogins.length - 1].timestamp,
              ipAddresses: [...new Set(failedLogins.map(l => l.ip))]
            }
          });
        }
        
        // 2. 检测异常数据上传
        const recentUploads = adminLogs.filter(log =>
          log.userId === user.id &&
          log.action === 'upload' &&
          (now - new Date(log.timestamp).getTime()) < this.anomalyThresholds.loginTimeRange
        );
        
        if (recentUploads.length >= this.anomalyThresholds.dataUploadSpike) {
          userAnomalies.push({
            type: 'data_upload_spike',
            severity: 'medium',
            message: `用户 ${user.username} 在1小时内上传${recentUploads.length}条数据`,
            details: {
              uploadCount: recentUploads.length,
              uploadTypes: this.groupByType(recentUploads)
            }
          });
        }
        
        // 3. 检测长期未活跃用户
        if (user.lastLogin) {
          const daysSinceLogin = (now - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceLogin >= this.anomalyThresholds.inactiveDays) {
            userAnomalies.push({
              type: 'inactive_user',
              severity: 'low',
              message: `用户 ${user.username} 已${Math.floor(daysSinceLogin)}天未登录`,
              details: {
                daysInactive: Math.floor(daysSinceLogin),
                lastLogin: user.lastLogin
              }
            });
          }
        }
        
        // 4. 检测无数据用户
        const userData = await storageService.read('user_data') || [];
        const userDataRecords = userData.filter(d => d.userId === user.id);
        
        if (userDataRecords.length === 0) {
          const daysSinceRegister = user.createdAt 
            ? (now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            : 0;
          
          if (daysSinceRegister >= this.anomalyThresholds.noDataDays) {
            userAnomalies.push({
              type: 'no_data_user',
              severity: 'low',
              message: `用户 ${user.username} 注册${Math.floor(daysSinceRegister)}天但无任何数据`,
              details: {
                daysSinceRegister: Math.floor(daysSinceRegister),
                registeredAt: user.createdAt
              }
            });
          }
        }
        
        if (userAnomalies.length > 0) {
          anomalies.push({
            userId: user.id,
            username: user.username,
            email: user.email,
            anomalies: userAnomalies,
            riskScore: this.calculateRiskScore(userAnomalies)
          });
        }
      }
      
      // 按风险评分排序
      anomalies.sort((a, b) => b.riskScore - a.riskScore);
      
      return {
        total: anomalies.length,
        highRisk: anomalies.filter(a => a.riskScore >= 0.7).length,
        mediumRisk: anomalies.filter(a => a.riskScore >= 0.4 && a.riskScore < 0.7).length,
        lowRisk: anomalies.filter(a => a.riskScore < 0.4).length,
        users: anomalies
      };
    } catch (error) {
      logger.error('检测异常用户失败', error);
      throw error;
    }
  }

  /**
   * 分析用户行为模式
   */
  async analyzeUserBehavior(userId) {
    try {
      const loginLogs = await storageService.read('login_logs') || [];
      const adminLogs = await storageService.read('admin_logs') || [];
      const userData = await storageService.read('user_data') || [];
      
      const userLogins = loginLogs.filter(log => log.userId === userId);
      const userActions = adminLogs.filter(log => log.userId === userId);
      const userDataRecords = userData.filter(d => d.userId === userId);
      
      // 计算行为指标
      const behavior = {
        userId,
        loginFrequency: this.calculateLoginFrequency(userLogins),
        activeHours: this.calculateActiveHours(userActions),
        dataUploadPattern: this.analyzeUploadPattern(userActions),
        featureUsage: this.analyzeFeatureUsage(userActions),
        dataGrowth: this.analyzeDataGrowth(userDataRecords),
        riskIndicators: this.identifyRiskIndicators(userLogins, userActions)
      };
      
      // 更新用户画像
      this.userProfiles.set(userId, {
        ...behavior,
        lastUpdated: Date.now()
      });
      
      return behavior;
    } catch (error) {
      logger.error('分析用户行为失败', error);
      throw error;
    }
  }

  /**
   * 自动处理异常用户
   */
  async autoHandleAnomalousUser(userId, anomaly) {
    try {
      const actions = [];
      const user = await storageService.read('users').then(users => 
        users.find(u => u.id === userId)
      ) || {};
      
      // 根据异常类型自动处理
      switch (anomaly.type) {
        case 'suspicious_login':
          // 高风险：自动禁用账户
          if (anomaly.severity === 'high') {
            await storageService.update('users', userId, { 
              status: 'inactive',
              disabledReason: '异常登录行为',
              disabledAt: new Date().toISOString()
            });
            actions.push({
              type: 'auto_disable',
              reason: '检测到异常登录行为',
              timestamp: Date.now()
            });
          }
          break;
          
        case 'data_upload_spike':
          // 中等风险：发送警告
          actions.push({
            type: 'warning',
            message: '检测到异常数据上传，请确认是否为正常操作',
            timestamp: Date.now()
          });
          break;
          
        case 'inactive_user':
          // 低风险：标记为不活跃
          await storageService.update('users', userId, {
            tags: [...(user.tags || []), 'inactive']
          });
          break;
      }
      
      // 记录处理动作
      this.actions.push({
        userId,
        anomaly,
        actions,
        timestamp: Date.now()
      });
      
      return actions;
    } catch (error) {
      logger.error('自动处理异常用户失败', error);
      throw error;
    }
  }

  /**
   * 生成用户管理建议
   */
  async generateUserManagementAdvice() {
    try {
      const anomalies = await this.detectAnomalousUsers();
      
      if (anomalies.total === 0) {
        return {
          summary: '未检测到异常用户',
          recommendations: []
        };
      }
      
      // 调用AI生成建议
      const aiResult = await aiHub.analyze('user_management_advice', null, {
        complexity: 'complex',
        needsAnalysis: true,
        data: {
          anomalies,
          thresholds: this.anomalyThresholds
        }
      });
      
      if (aiResult.used && aiResult.result) {
        try {
          const advice = JSON.parse(aiResult.result.content);
          return {
            summary: advice.summary || '检测到异常用户，建议处理',
            recommendations: advice.recommendations || [],
            priority: advice.priority || 'medium',
            confidence: aiResult.result.confidence || 0.7
          };
        } catch (e) {
          return {
            summary: aiResult.result.content,
            recommendations: [],
            priority: 'medium',
            confidence: 0.7
          };
        }
      }
      
      // 本地建议
      const recommendations = [];
      
      if (anomalies.highRisk > 0) {
        recommendations.push({
          type: 'urgent',
          message: `发现${anomalies.highRisk}个高风险用户，建议立即处理`,
          action: 'review_high_risk_users'
        });
      }
      
      if (anomalies.mediumRisk > 0) {
        recommendations.push({
          type: 'warning',
          message: `发现${anomalies.mediumRisk}个中等风险用户，建议审查`,
          action: 'review_medium_risk_users'
        });
      }
      
      return {
        summary: `检测到${anomalies.total}个异常用户`,
        recommendations,
        priority: anomalies.highRisk > 0 ? 'high' : 'medium',
        confidence: 0.8
      };
    } catch (error) {
      logger.error('生成用户管理建议失败', error);
      throw error;
    }
  }

  // ========== 辅助方法 ==========

  calculateRiskScore(anomalies) {
    let score = 0;
    anomalies.forEach(anomaly => {
      switch (anomaly.severity) {
        case 'high': score += 0.4; break;
        case 'medium': score += 0.2; break;
        case 'low': score += 0.1; break;
      }
    });
    return Math.min(1.0, score);
  }

  calculateLoginFrequency(logins) {
    if (logins.length === 0) return 0;
    const sorted = logins.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const first = new Date(sorted[0].timestamp);
    const last = new Date(sorted[sorted.length - 1].timestamp);
    const days = (last - first) / (1000 * 60 * 60 * 24) || 1;
    return logins.length / days;
  }

  calculateActiveHours(actions) {
    const hours = new Set();
    actions.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      hours.add(hour);
    });
    return Array.from(hours).sort((a, b) => a - b);
  }

  analyzeUploadPattern(actions) {
    const uploads = actions.filter(a => a.action === 'upload');
    const byHour = {};
    uploads.forEach(upload => {
      const hour = new Date(upload.timestamp).getHours();
      byHour[hour] = (byHour[hour] || 0) + 1;
    });
    return byHour;
  }

  analyzeFeatureUsage(actions) {
    const features = {};
    actions.forEach(action => {
      features[action.action] = (features[action.action] || 0) + 1;
    });
    return Object.entries(features)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }));
  }

  analyzeDataGrowth(dataRecords) {
    if (dataRecords.length === 0) return { growth: 0, trend: 'stable' };
    
    const sorted = dataRecords.sort((a, b) => 
      new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)
    );
    
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstHalfAvg = firstHalf.length / 30; // 假设30天
    const secondHalfAvg = secondHalf.length / 30;
    
    const growth = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    return {
      growth: growth || 0,
      trend: growth > 10 ? 'increasing' : growth < -10 ? 'decreasing' : 'stable',
      totalRecords: dataRecords.length
    };
  }

  identifyRiskIndicators(logins, actions) {
    const indicators = [];
    
    // 检测异常IP
    const ipCounts = {};
    logins.forEach(login => {
      if (login.ip) {
        ipCounts[login.ip] = (ipCounts[login.ip] || 0) + 1;
      }
    });
    const uniqueIPs = Object.keys(ipCounts).length;
    if (uniqueIPs > 5) {
      indicators.push('multiple_ips');
    }
    
    // 检测异常时间
    const nightActions = actions.filter(a => {
      const hour = new Date(a.timestamp).getHours();
      return hour >= 0 && hour < 6;
    });
    if (nightActions.length > actions.length * 0.3) {
      indicators.push('unusual_hours');
    }
    
    return indicators;
  }

  groupByType(items) {
    const grouped = {};
    items.forEach(item => {
      const type = item.type || item.dataType || 'unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return grouped;
  }

  /**
   * 获取用户管理统计
   */
  getStats() {
    return {
      totalActions: this.actions.length,
      userProfiles: this.userProfiles.size,
      recentActions: this.actions.filter(a => 
        Date.now() - a.timestamp < 86400000
      ).length
    };
  }
}

module.exports = new UserManager();

