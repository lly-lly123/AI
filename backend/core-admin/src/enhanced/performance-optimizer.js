/**
 * 性能优化模块
 * 自动性能分析、资源监控、优化建议
 */

const logger = require('../utils/logger');
const aiHub = require('../ai-hub/ai-hub');

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      apiLatency: {},
      errorRate: {}
    };
    
    this.optimizationHistory = [];
    this.thresholds = {
      responseTime: 2000, // 2秒
      memoryUsage: 0.9, // 90%
      cpuUsage: 0.8, // 80%
      errorRate: 0.05, // 5%
      apiLatency: 5000 // 5秒
    };
  }

  /**
   * 监控系统性能
   */
  async monitorPerformance() {
    try {
      const metrics = {
        timestamp: Date.now(),
        memory: this.getMemoryMetrics(),
        cpu: await this.getCpuMetrics(),
        responseTime: this.getAverageResponseTime(),
        apiPerformance: this.getApiPerformanceMetrics(),
        errorRate: this.getErrorRate()
      };
      
      // 记录指标
      this.metrics.memoryUsage.push({
        timestamp: metrics.timestamp,
        value: metrics.memory.heapUsedPercent
      });
      
      // 只保留最近1000条记录
      if (this.metrics.memoryUsage.length > 1000) {
        this.metrics.memoryUsage.shift();
      }
      
      // 检测性能问题
      const issues = this.detectPerformanceIssues(metrics);
      
      return {
        metrics,
        issues,
        recommendations: issues.length > 0 ? await this.generateOptimizationRecommendations(issues) : []
      };
    } catch (error) {
      logger.error('监控性能失败', error);
      throw error;
    }
  }

  /**
   * 记录API响应时间
   */
  recordApiResponseTime(endpoint, responseTime) {
    if (!this.metrics.apiLatency[endpoint]) {
      this.metrics.apiLatency[endpoint] = [];
    }
    
    this.metrics.apiLatency[endpoint].push({
      timestamp: Date.now(),
      responseTime
    });
    
    // 只保留最近100条记录
    if (this.metrics.apiLatency[endpoint].length > 100) {
      this.metrics.apiLatency[endpoint].shift();
    }
  }

  /**
   * 记录错误
   */
  recordError(endpoint, error) {
    if (!this.metrics.errorRate[endpoint]) {
      this.metrics.errorRate[endpoint] = {
        total: 0,
        errors: 0,
        errorsByType: {}
      };
    }
    
    this.metrics.errorRate[endpoint].total++;
    this.metrics.errorRate[endpoint].errors++;
    
    const errorType = error.type || error.name || 'unknown';
    this.metrics.errorRate[endpoint].errorsByType[errorType] = 
      (this.metrics.errorRate[endpoint].errorsByType[errorType] || 0) + 1;
  }

  /**
   * 分析性能瓶颈
   */
  async analyzeBottlenecks() {
    try {
      const bottlenecks = [];
      
      // 分析API性能
      Object.entries(this.metrics.apiLatency).forEach(([endpoint, times]) => {
        if (times.length === 0) return;
        
        const avgTime = times.reduce((sum, t) => sum + t.responseTime, 0) / times.length;
        const maxTime = Math.max(...times.map(t => t.responseTime));
        
        if (avgTime > this.thresholds.apiLatency) {
          bottlenecks.push({
            type: 'api_latency',
            endpoint,
            severity: avgTime > this.thresholds.apiLatency * 2 ? 'high' : 'medium',
            metrics: {
              average: avgTime,
              max: maxTime,
              samples: times.length
            },
            recommendation: this.getApiOptimizationRecommendation(endpoint, avgTime)
          });
        }
      });
      
      // 分析错误率
      Object.entries(this.metrics.errorRate).forEach(([endpoint, stats]) => {
        const errorRate = stats.total > 0 ? stats.errors / stats.total : 0;
        
        if (errorRate > this.thresholds.errorRate) {
          bottlenecks.push({
            type: 'error_rate',
            endpoint,
            severity: errorRate > this.thresholds.errorRate * 2 ? 'high' : 'medium',
            metrics: {
              errorRate,
              total: stats.total,
              errors: stats.errors,
              errorsByType: stats.errorsByType
            },
            recommendation: this.getErrorOptimizationRecommendation(endpoint, stats)
          });
        }
      });
      
      // 分析内存使用
      if (this.metrics.memoryUsage.length > 0) {
        const recentMemory = this.metrics.memoryUsage.slice(-10);
        const avgMemory = recentMemory.reduce((sum, m) => sum + m.value, 0) / recentMemory.length;
        
        if (avgMemory > this.thresholds.memoryUsage) {
          bottlenecks.push({
            type: 'memory_usage',
            severity: avgMemory > 0.95 ? 'high' : 'medium',
            metrics: {
              average: avgMemory,
              threshold: this.thresholds.memoryUsage
            },
            recommendation: {
              action: 'optimize_memory',
              suggestions: [
                '检查内存泄漏',
                '优化数据结构',
                '清理缓存',
                '考虑增加内存限制'
              ]
            }
          });
        }
      }
      
      // 调用AI分析复杂瓶颈
      if (bottlenecks.length > 0) {
        const aiAnalysis = await aiHub.analyze('performance_bottleneck', null, {
          complexity: 'complex',
          needsAnalysis: true,
          data: {
            bottlenecks,
            metrics: this.metrics
          }
        });
        
        if (aiAnalysis.used && aiAnalysis.result) {
          try {
            const analysis = JSON.parse(aiAnalysis.result.content);
            bottlenecks.forEach((b, index) => {
              if (analysis.recommendations && analysis.recommendations[index]) {
                b.aiRecommendation = analysis.recommendations[index];
              }
            });
          } catch (e) {
            // AI返回不是JSON，忽略
          }
        }
      }
      
      return bottlenecks;
    } catch (error) {
      logger.error('分析性能瓶颈失败', error);
      throw error;
    }
  }

  /**
   * 生成优化建议
   */
  async generateOptimizationRecommendations(issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'memory':
          recommendations.push({
            priority: 'high',
            action: 'optimize_memory',
            message: '内存使用率过高，建议优化',
            details: issue
          });
          break;
          
        case 'response_time':
          recommendations.push({
            priority: 'medium',
            action: 'optimize_response_time',
            message: '响应时间过长，建议优化',
            details: issue
          });
          break;
          
        case 'error_rate':
          recommendations.push({
            priority: 'high',
            action: 'fix_errors',
            message: '错误率过高，建议检查',
            details: issue
          });
          break;
      }
    });
    
    return recommendations;
  }

  // ========== 辅助方法 ==========

  getMemoryMetrics() {
    const usage = process.memoryUsage();
    return {
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external,
      rss: usage.rss,
      heapUsedPercent: usage.heapUsed / usage.heapTotal
    };
  }

  async getCpuMetrics() {
    // 简单的CPU使用率估算
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    
    const totalMicroseconds = endUsage.user + endUsage.system;
    return {
      user: endUsage.user,
      system: endUsage.system,
      total: totalMicroseconds,
      percent: Math.min(1, totalMicroseconds / 100000) // 粗略估算
    };
  }

  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    const recent = this.metrics.responseTime.slice(-100);
    return recent.reduce((sum, t) => sum + t, 0) / recent.length;
  }

  getApiPerformanceMetrics() {
    const metrics = {};
    Object.entries(this.metrics.apiLatency).forEach(([endpoint, times]) => {
      if (times.length === 0) return;
      const avg = times.reduce((sum, t) => sum + t.responseTime, 0) / times.length;
      const max = Math.max(...times.map(t => t.responseTime));
      const min = Math.min(...times.map(t => t.responseTime));
      
      metrics[endpoint] = {
        average: avg,
        max,
        min,
        samples: times.length
      };
    });
    return metrics;
  }

  getErrorRate() {
    const rates = {};
    Object.entries(this.metrics.errorRate).forEach(([endpoint, stats]) => {
      rates[endpoint] = stats.total > 0 ? stats.errors / stats.total : 0;
    });
    return rates;
  }

  detectPerformanceIssues(metrics) {
    const issues = [];
    
    // 内存问题
    if (metrics.memory.heapUsedPercent > this.thresholds.memoryUsage) {
      issues.push({
        type: 'memory',
        severity: metrics.memory.heapUsedPercent > 0.95 ? 'high' : 'medium',
        value: metrics.memory.heapUsedPercent,
        threshold: this.thresholds.memoryUsage
      });
    }
    
    // CPU问题
    if (metrics.cpu.percent > this.thresholds.cpuUsage) {
      issues.push({
        type: 'cpu',
        severity: 'medium',
        value: metrics.cpu.percent,
        threshold: this.thresholds.cpuUsage
      });
    }
    
    // 响应时间问题
    if (metrics.responseTime > this.thresholds.responseTime) {
      issues.push({
        type: 'response_time',
        severity: 'medium',
        value: metrics.responseTime,
        threshold: this.thresholds.responseTime
      });
    }
    
    return issues;
  }

  getApiOptimizationRecommendation(endpoint, avgTime) {
    return {
      action: 'optimize_api',
      endpoint,
      suggestions: [
        '检查数据库查询是否优化',
        '考虑添加缓存',
        '检查是否有不必要的计算',
        '考虑异步处理'
      ]
    };
  }

  getErrorOptimizationRecommendation(endpoint, stats) {
    const topErrorType = Object.entries(stats.errorsByType)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      action: 'fix_errors',
      endpoint,
      suggestions: [
        `主要错误类型: ${topErrorType ? topErrorType[0] : 'unknown'}`,
        '检查错误日志',
        '验证输入数据',
        '添加错误处理'
      ]
    };
  }

  /**
   * 获取性能统计
   */
  getStats() {
    return {
      apiEndpoints: Object.keys(this.metrics.apiLatency).length,
      totalApiCalls: Object.values(this.metrics.apiLatency)
        .reduce((sum, times) => sum + times.length, 0),
      totalErrors: Object.values(this.metrics.errorRate)
        .reduce((sum, stats) => sum + stats.errors, 0),
      optimizationHistory: this.optimizationHistory.length
    };
  }
}

module.exports = new PerformanceOptimizer();

























