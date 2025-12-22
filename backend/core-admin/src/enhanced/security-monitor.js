/**
 * 安全监控模块
 * 威胁检测、异常访问监控、自动防护
 */

const logger = require('../utils/logger');
const path = require('path');
const storageService = require(path.join(__dirname, '../../../services/storageService'));

class SecurityMonitor {
  constructor() {
    this.threatPatterns = {
      // SQL注入模式
      sqlInjection: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /('|(\\')|(;)|(--)|(\/\*)|(\*\/)|(\+)|(\%)/i
      ],
      // XSS模式
      xss: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/i,
        /on\w+\s*=/i
      ],
      // 路径遍历
      pathTraversal: [
        /\.\.\//,
        /\.\.\\/,
        /\/etc\/passwd/,
        /\/proc\/self/
      ]
    };
    
    this.suspiciousActivities = [];
    this.blockedIPs = new Set();
    this.rateLimits = new Map(); // IP -> { count, resetTime }
  }

  /**
   * 检测安全威胁
   */
  async detectThreats() {
    try {
      const loginLogs = await storageService.read('login_logs') || [];
      const adminLogs = await storageService.read('admin_logs') || [];
      
      const threats = [];
      const now = Date.now();
      
      // 分析登录日志
      const recentLogins = loginLogs.filter(log => 
        now - new Date(log.timestamp).getTime() < 3600000 // 1小时内
      );
      
      // 检测暴力破解
      const bruteForce = this.detectBruteForce(recentLogins);
      if (bruteForce) {
        threats.push(bruteForce);
      }
      
      // 检测异常IP
      const suspiciousIPs = this.detectSuspiciousIPs(recentLogins);
      threats.push(...suspiciousIPs);
      
      // 检测异常访问模式
      const accessPatterns = this.detectAbnormalAccessPatterns(adminLogs);
      threats.push(...accessPatterns);
      
      return {
        timestamp: now,
        total: threats.length,
        high: threats.filter(t => t.severity === 'high').length,
        medium: threats.filter(t => t.severity === 'medium').length,
        low: threats.filter(t => t.severity === 'low').length,
        threats
      };
    } catch (error) {
      logger.error('检测安全威胁失败', error);
      throw error;
    }
  }

  /**
   * 检测暴力破解
   */
  detectBruteForce(logins) {
    const failedByIP = {};
    const failedByUser = {};
    
    logins.forEach(log => {
      if (!log.success) {
        // 按IP统计
        if (log.ip) {
          failedByIP[log.ip] = (failedByIP[log.ip] || 0) + 1;
        }
        // 按用户统计
        if (log.userId) {
          failedByUser[log.userId] = (failedByUser[log.userId] || 0) + 1;
        }
      }
    });
    
    // 检查是否有IP或用户失败次数过多
    const suspiciousIP = Object.entries(failedByIP).find(([ip, count]) => count >= 10);
    const suspiciousUser = Object.entries(failedByUser).find(([userId, count]) => count >= 5);
    
    if (suspiciousIP || suspiciousUser) {
      return {
        type: 'brute_force',
        severity: 'high',
        message: suspiciousIP 
          ? `检测到IP ${suspiciousIP[0]} 暴力破解尝试`
          : `检测到用户暴力破解尝试`,
        details: {
          ip: suspiciousIP ? suspiciousIP[0] : null,
          userId: suspiciousUser ? suspiciousUser[0] : null,
          attempts: suspiciousIP ? suspiciousIP[1] : suspiciousUser[1]
        },
        recommendation: {
          action: 'block_ip_or_user',
          immediate: true
        }
      };
    }
    
    return null;
  }

  /**
   * 检测可疑IP
   */
  detectSuspiciousIPs(logins) {
    const ipStats = {};
    const threats = [];
    
    logins.forEach(log => {
      if (!log.ip) return;
      
      if (!ipStats[log.ip]) {
        ipStats[log.ip] = {
          attempts: 0,
          successes: 0,
          failures: 0,
          users: new Set(),
          timestamps: []
        };
      }
      
      ipStats[log.ip].attempts++;
      ipStats[log.ip].timestamps.push(new Date(log.timestamp).getTime());
      if (log.success) {
        ipStats[log.ip].successes++;
      } else {
        ipStats[log.ip].failures++;
      }
      if (log.userId) {
        ipStats[log.ip].users.add(log.userId);
      }
    });
    
    // 检测异常IP
    Object.entries(ipStats).forEach(([ip, stats]) => {
      // 多个用户从同一IP登录
      if (stats.users.size > 3) {
        threats.push({
          type: 'multiple_users_same_ip',
          severity: 'medium',
          message: `IP ${ip} 有${stats.users.size}个不同用户登录`,
          details: { ip, userCount: stats.users.size }
        });
      }
      
      // 失败率过高
      const failureRate = stats.attempts > 0 ? stats.failures / stats.attempts : 0;
      if (failureRate > 0.8 && stats.attempts >= 5) {
        threats.push({
          type: 'high_failure_rate',
          severity: 'high',
          message: `IP ${ip} 登录失败率${(failureRate * 100).toFixed(1)}%`,
          details: { ip, failureRate, attempts: stats.attempts }
        });
      }
    });
    
    return threats;
  }

  /**
   * 检测异常访问模式
   */
  detectAbnormalAccessPatterns(logs) {
    const threats = [];
    const now = Date.now();
    const recentLogs = logs.filter(log => 
      now - new Date(log.timestamp).getTime() < 3600000
    );
    
    // 检测异常时间访问
    const nightAccess = recentLogs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour >= 0 && hour < 6;
    });
    
    if (nightAccess.length > recentLogs.length * 0.5) {
      threats.push({
        type: 'unusual_time_access',
        severity: 'low',
        message: '检测到大量深夜访问',
        details: { count: nightAccess.length, total: recentLogs.length }
      });
    }
    
    // 检测异常操作频率
    const actionCounts = {};
    recentLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count > 100) {
        threats.push({
          type: 'excessive_actions',
          severity: 'medium',
          message: `操作 ${action} 在1小时内执行${count}次`,
          details: { action, count }
        });
      }
    });
    
    return threats;
  }

  /**
   * 验证输入安全性
   */
  validateInput(input, type = 'general') {
    const threats = [];
    
    if (typeof input !== 'string') return { safe: true, threats: [] };
    
    // 检测SQL注入
    this.threatPatterns.sqlInjection.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push({
          type: 'sql_injection',
          severity: 'high',
          pattern: pattern.toString()
        });
      }
    });
    
    // 检测XSS
    this.threatPatterns.xss.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push({
          type: 'xss',
          severity: 'high',
          pattern: pattern.toString()
        });
      }
    });
    
    // 检测路径遍历
    this.threatPatterns.pathTraversal.forEach(pattern => {
      if (pattern.test(input)) {
        threats.push({
          type: 'path_traversal',
          severity: 'high',
          pattern: pattern.toString()
        });
      }
    });
    
    return {
      safe: threats.length === 0,
      threats
    };
  }

  /**
   * 检查速率限制
   */
  checkRateLimit(ip, limit = 100, window = 3600000) {
    const now = Date.now();
    
    if (!this.rateLimits.has(ip)) {
      this.rateLimits.set(ip, { count: 1, resetTime: now + window });
      return { allowed: true, remaining: limit - 1 };
    }
    
    const limitData = this.rateLimits.get(ip);
    
    // 重置窗口
    if (now > limitData.resetTime) {
      limitData.count = 1;
      limitData.resetTime = now + window;
      return { allowed: true, remaining: limit - 1 };
    }
    
    // 检查是否超过限制
    if (limitData.count >= limit) {
      return { allowed: false, remaining: 0 };
    }
    
    limitData.count++;
    return { allowed: true, remaining: limit - limitData.count };
  }

  /**
   * 阻止IP
   */
  blockIP(ip, reason) {
    this.blockedIPs.add(ip);
    logger.warn(`IP已阻止: ${ip}`, { reason });
    
    // 24小时后自动解封
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      logger.info(`IP已解封: ${ip}`);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 检查IP是否被阻止
   */
  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  /**
   * 获取安全统计
   */
  getStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      rateLimitEntries: this.rateLimits.size,
      suspiciousActivities: this.suspiciousActivities.length
    };
  }
}

module.exports = new SecurityMonitor();

