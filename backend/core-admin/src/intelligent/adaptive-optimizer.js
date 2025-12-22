/**
 * 自适应优化模块
 * 根据系统状态自动调整配置和策略
 */

const logger = require('../utils/logger');
const learningEngine = require('../learning/learning-engine');

class AdaptiveOptimizer {
  constructor() {
    this.optimizationHistory = [];
    this.currentConfig = this.getDefaultConfig();
    this.performanceBaseline = null;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      cache: {
        ttl: {
          news: 3600,
          events: 300,
          results: 7200
        },
        maxSize: 1000
      },
      api: {
        timeout: 10000,
        retryCount: 3,
        retryDelay: 1000
      },
      performance: {
        maxConcurrent: 10,
        rateLimit: 100
      },
      monitoring: {
        healthCheckInterval: 300000, // 5分钟
        detailedLogging: false
      }
    };
  }

  /**
   * 自适应优化主入口
   */
  async optimize(context) {
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. 分析当前性能
      const performance = await this.analyzePerformance(context);
      
      // 2. 与基线比较
      const deviation = this.compareWithBaseline(performance);
      
      // 3. 确定优化方向
      const optimizationAreas = this.identifyOptimizationAreas(deviation);
      
      // 4. 生成优化建议
      const recommendations = await this.generateRecommendations(optimizationAreas, performance);
      
      // 5. 应用优化（如果置信度高）
      const applied = [];
      for (const rec of recommendations) {
        if (rec.confidence > 0.7 && rec.autoApply) {
          const result = await this.applyOptimization(rec);
          if (result.success) {
            applied.push(rec);
          }
        }
      }
      
      // 6. 记录优化历史
      const record = {
        id: optimizationId,
        timestamp: Date.now(),
        performance,
        deviation,
        recommendations,
        applied,
        expectedImprovement: this.calculateExpectedImprovement(applied)
      };
      
      this.optimizationHistory.push(record);
      
      // 只保留最近100条记录
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory.shift();
      }
      
      logger.info(`自适应优化完成`, {
        areas: optimizationAreas.length,
        applied: applied.length
      });
      
      return record;
    } catch (error) {
      logger.error('自适应优化失败', error);
      throw error;
    }
  }

  /**
   * 分析性能
   */
  async analyzePerformance(context) {
    return {
      responseTime: context.avgResponseTime || 0,
      errorRate: context.errorRate || 0,
      throughput: context.throughput || 0,
      resourceUsage: {
        memory: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpu: 0 // 需要实际CPU监控
      },
      cacheHitRate: context.cacheHitRate || 0,
      apiHealth: context.apiHealth || 1.0
    };
  }

  /**
   * 与基线比较
   */
  compareWithBaseline(performance) {
    if (!this.performanceBaseline) {
      this.performanceBaseline = performance;
      return {
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        resourceUsage: { memory: 0, cpu: 0 },
        cacheHitRate: 0
      };
    }
    
    return {
      responseTime: (performance.responseTime - this.performanceBaseline.responseTime) / this.performanceBaseline.responseTime,
      errorRate: (performance.errorRate - this.performanceBaseline.errorRate) / (this.performanceBaseline.errorRate || 0.01),
      throughput: (performance.throughput - this.performanceBaseline.throughput) / (this.performanceBaseline.throughput || 1),
      resourceUsage: {
        memory: performance.resourceUsage.memory - this.performanceBaseline.resourceUsage.memory,
        cpu: performance.resourceUsage.cpu - this.performanceBaseline.resourceUsage.cpu
      },
      cacheHitRate: performance.cacheHitRate - this.performanceBaseline.cacheHitRate
    };
  }

  /**
   * 识别优化领域
   */
  identifyOptimizationAreas(deviation) {
    const areas = [];
    
    // 响应时间优化
    if (deviation.responseTime > 0.2) {
      areas.push({
        type: 'response_time',
        priority: 'high',
        current: deviation.responseTime,
        target: -0.1
      });
    }
    
    // 错误率优化
    if (deviation.errorRate > 0.1) {
      areas.push({
        type: 'error_rate',
        priority: 'high',
        current: deviation.errorRate,
        target: -0.05
      });
    }
    
    // 缓存优化
    if (deviation.cacheHitRate < -0.1) {
      areas.push({
        type: 'cache',
        priority: 'medium',
        current: deviation.cacheHitRate,
        target: 0.1
      });
    }
    
    // 资源使用优化
    if (deviation.resourceUsage.memory > 0.2) {
      areas.push({
        type: 'memory',
        priority: 'medium',
        current: deviation.resourceUsage.memory,
        target: -0.1
      });
    }
    
    return areas;
  }

  /**
   * 生成优化建议
   */
  async generateRecommendations(areas, performance) {
    const recommendations = [];
    
    for (const area of areas) {
      const rec = this.generateRecommendationForArea(area, performance);
      if (rec) {
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }

  /**
   * 为特定领域生成建议
   */
  generateRecommendationForArea(area, performance) {
    switch (area.type) {
      case 'response_time':
        return {
          type: 'response_time',
          action: 'increase_cache_ttl',
          config: {
            cache: {
              ttl: {
                news: this.currentConfig.cache.ttl.news * 1.5,
                events: this.currentConfig.cache.ttl.events * 1.5
              }
            }
          },
          confidence: 0.8,
          autoApply: true,
          expectedImprovement: 0.15
        };
        
      case 'error_rate':
        return {
          type: 'error_rate',
          action: 'increase_retry_count',
          config: {
            api: {
              retryCount: this.currentConfig.api.retryCount + 1,
              retryDelay: this.currentConfig.api.retryDelay * 1.5
            }
          },
          confidence: 0.75,
          autoApply: true,
          expectedImprovement: 0.1
        };
        
      case 'cache':
        return {
          type: 'cache',
          action: 'increase_cache_size',
          config: {
            cache: {
              maxSize: this.currentConfig.cache.maxSize * 1.5
            }
          },
          confidence: 0.7,
          autoApply: true,
          expectedImprovement: 0.2
        };
        
      case 'memory':
        return {
          type: 'memory',
          action: 'reduce_cache_ttl',
          config: {
            cache: {
              ttl: {
                news: this.currentConfig.cache.ttl.news * 0.8,
                events: this.currentConfig.cache.ttl.events * 0.8
              }
            }
          },
          confidence: 0.75,
          autoApply: true,
          expectedImprovement: 0.1
        };
    }
    
    return null;
  }

  /**
   * 应用优化
   */
  async applyOptimization(recommendation) {
    try {
      logger.info(`应用优化: ${recommendation.type} - ${recommendation.action}`);
      
      // 更新配置
      this.currentConfig = this.mergeConfig(this.currentConfig, recommendation.config);
      
      // 记录到学习引擎
      learningEngine.recordEvent('optimization_applied', {
        type: recommendation.type,
        action: recommendation.action,
        config: recommendation.config
      });
      
      return {
        success: true,
        config: this.currentConfig
      };
    } catch (error) {
      logger.error('应用优化失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 合并配置
   */
  mergeConfig(current, updates) {
    const merged = JSON.parse(JSON.stringify(current));
    
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        merged[key] = this.mergeConfig(merged[key] || {}, updates[key]);
      } else {
        merged[key] = updates[key];
      }
    });
    
    return merged;
  }

  /**
   * 计算预期改进
   */
  calculateExpectedImprovement(applied) {
    return applied.reduce((sum, rec) => sum + (rec.expectedImprovement || 0), 0);
  }

  /**
   * 验证优化效果
   */
  async validateOptimization(optimizationId, actualPerformance) {
    const optimization = this.optimizationHistory.find(o => o.id === optimizationId);
    if (!optimization) return;
    
    const improvement = this.calculateActualImprovement(
      optimization.performance,
      actualPerformance
    );
    
    optimization.actualImprovement = improvement;
    optimization.validated = true;
    optimization.validatedAt = Date.now();
    
    // 更新基线（如果优化成功）
    if (improvement > 0) {
      this.performanceBaseline = actualPerformance;
    }
    
    logger.info(`优化效果验证: ${optimizationId}`, {
      expected: optimization.expectedImprovement,
      actual: improvement
    });
  }

  /**
   * 计算实际改进
   */
  calculateActualImprovement(before, after) {
    const responseTimeImprovement = (before.responseTime - after.responseTime) / before.responseTime;
    const errorRateImprovement = (before.errorRate - after.errorRate) / (before.errorRate || 0.01);
    
    return (responseTimeImprovement + errorRateImprovement) / 2;
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig() {
    return this.currentConfig;
  }

  /**
   * 获取优化统计
   */
  getStats() {
    const validated = this.optimizationHistory.filter(o => o.validated);
    const successful = validated.filter(o => o.actualImprovement > 0);
    
    return {
      total: this.optimizationHistory.length,
      validated: validated.length,
      successful: successful.length,
      successRate: validated.length > 0 ? successful.length / validated.length : 0,
      averageImprovement: this.calculateAverageImprovement(validated)
    };
  }

  /**
   * 计算平均改进
   */
  calculateAverageImprovement(validated) {
    if (validated.length === 0) return 0;
    const sum = validated.reduce((s, o) => s + (o.actualImprovement || 0), 0);
    return sum / validated.length;
  }
}

module.exports = new AdaptiveOptimizer();






 * 自适应优化模块
 * 根据系统状态自动调整配置和策略
 */

const logger = require('../utils/logger');
const learningEngine = require('../learning/learning-engine');

class AdaptiveOptimizer {
  constructor() {
    this.optimizationHistory = [];
    this.currentConfig = this.getDefaultConfig();
    this.performanceBaseline = null;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      cache: {
        ttl: {
          news: 3600,
          events: 300,
          results: 7200
        },
        maxSize: 1000
      },
      api: {
        timeout: 10000,
        retryCount: 3,
        retryDelay: 1000
      },
      performance: {
        maxConcurrent: 10,
        rateLimit: 100
      },
      monitoring: {
        healthCheckInterval: 300000, // 5分钟
        detailedLogging: false
      }
    };
  }

  /**
   * 自适应优化主入口
   */
  async optimize(context) {
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. 分析当前性能
      const performance = await this.analyzePerformance(context);
      
      // 2. 与基线比较
      const deviation = this.compareWithBaseline(performance);
      
      // 3. 确定优化方向
      const optimizationAreas = this.identifyOptimizationAreas(deviation);
      
      // 4. 生成优化建议
      const recommendations = await this.generateRecommendations(optimizationAreas, performance);
      
      // 5. 应用优化（如果置信度高）
      const applied = [];
      for (const rec of recommendations) {
        if (rec.confidence > 0.7 && rec.autoApply) {
          const result = await this.applyOptimization(rec);
          if (result.success) {
            applied.push(rec);
          }
        }
      }
      
      // 6. 记录优化历史
      const record = {
        id: optimizationId,
        timestamp: Date.now(),
        performance,
        deviation,
        recommendations,
        applied,
        expectedImprovement: this.calculateExpectedImprovement(applied)
      };
      
      this.optimizationHistory.push(record);
      
      // 只保留最近100条记录
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory.shift();
      }
      
      logger.info(`自适应优化完成`, {
        areas: optimizationAreas.length,
        applied: applied.length
      });
      
      return record;
    } catch (error) {
      logger.error('自适应优化失败', error);
      throw error;
    }
  }

  /**
   * 分析性能
   */
  async analyzePerformance(context) {
    return {
      responseTime: context.avgResponseTime || 0,
      errorRate: context.errorRate || 0,
      throughput: context.throughput || 0,
      resourceUsage: {
        memory: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpu: 0 // 需要实际CPU监控
      },
      cacheHitRate: context.cacheHitRate || 0,
      apiHealth: context.apiHealth || 1.0
    };
  }

  /**
   * 与基线比较
   */
  compareWithBaseline(performance) {
    if (!this.performanceBaseline) {
      this.performanceBaseline = performance;
      return {
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        resourceUsage: { memory: 0, cpu: 0 },
        cacheHitRate: 0
      };
    }
    
    return {
      responseTime: (performance.responseTime - this.performanceBaseline.responseTime) / this.performanceBaseline.responseTime,
      errorRate: (performance.errorRate - this.performanceBaseline.errorRate) / (this.performanceBaseline.errorRate || 0.01),
      throughput: (performance.throughput - this.performanceBaseline.throughput) / (this.performanceBaseline.throughput || 1),
      resourceUsage: {
        memory: performance.resourceUsage.memory - this.performanceBaseline.resourceUsage.memory,
        cpu: performance.resourceUsage.cpu - this.performanceBaseline.resourceUsage.cpu
      },
      cacheHitRate: performance.cacheHitRate - this.performanceBaseline.cacheHitRate
    };
  }

  /**
   * 识别优化领域
   */
  identifyOptimizationAreas(deviation) {
    const areas = [];
    
    // 响应时间优化
    if (deviation.responseTime > 0.2) {
      areas.push({
        type: 'response_time',
        priority: 'high',
        current: deviation.responseTime,
        target: -0.1
      });
    }
    
    // 错误率优化
    if (deviation.errorRate > 0.1) {
      areas.push({
        type: 'error_rate',
        priority: 'high',
        current: deviation.errorRate,
        target: -0.05
      });
    }
    
    // 缓存优化
    if (deviation.cacheHitRate < -0.1) {
      areas.push({
        type: 'cache',
        priority: 'medium',
        current: deviation.cacheHitRate,
        target: 0.1
      });
    }
    
    // 资源使用优化
    if (deviation.resourceUsage.memory > 0.2) {
      areas.push({
        type: 'memory',
        priority: 'medium',
        current: deviation.resourceUsage.memory,
        target: -0.1
      });
    }
    
    return areas;
  }

  /**
   * 生成优化建议
   */
  async generateRecommendations(areas, performance) {
    const recommendations = [];
    
    for (const area of areas) {
      const rec = this.generateRecommendationForArea(area, performance);
      if (rec) {
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }

  /**
   * 为特定领域生成建议
   */
  generateRecommendationForArea(area, performance) {
    switch (area.type) {
      case 'response_time':
        return {
          type: 'response_time',
          action: 'increase_cache_ttl',
          config: {
            cache: {
              ttl: {
                news: this.currentConfig.cache.ttl.news * 1.5,
                events: this.currentConfig.cache.ttl.events * 1.5
              }
            }
          },
          confidence: 0.8,
          autoApply: true,
          expectedImprovement: 0.15
        };
        
      case 'error_rate':
        return {
          type: 'error_rate',
          action: 'increase_retry_count',
          config: {
            api: {
              retryCount: this.currentConfig.api.retryCount + 1,
              retryDelay: this.currentConfig.api.retryDelay * 1.5
            }
          },
          confidence: 0.75,
          autoApply: true,
          expectedImprovement: 0.1
        };
        
      case 'cache':
        return {
          type: 'cache',
          action: 'increase_cache_size',
          config: {
            cache: {
              maxSize: this.currentConfig.cache.maxSize * 1.5
            }
          },
          confidence: 0.7,
          autoApply: true,
          expectedImprovement: 0.2
        };
        
      case 'memory':
        return {
          type: 'memory',
          action: 'reduce_cache_ttl',
          config: {
            cache: {
              ttl: {
                news: this.currentConfig.cache.ttl.news * 0.8,
                events: this.currentConfig.cache.ttl.events * 0.8
              }
            }
          },
          confidence: 0.75,
          autoApply: true,
          expectedImprovement: 0.1
        };
    }
    
    return null;
  }

  /**
   * 应用优化
   */
  async applyOptimization(recommendation) {
    try {
      logger.info(`应用优化: ${recommendation.type} - ${recommendation.action}`);
      
      // 更新配置
      this.currentConfig = this.mergeConfig(this.currentConfig, recommendation.config);
      
      // 记录到学习引擎
      learningEngine.recordEvent('optimization_applied', {
        type: recommendation.type,
        action: recommendation.action,
        config: recommendation.config
      });
      
      return {
        success: true,
        config: this.currentConfig
      };
    } catch (error) {
      logger.error('应用优化失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 合并配置
   */
  mergeConfig(current, updates) {
    const merged = JSON.parse(JSON.stringify(current));
    
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        merged[key] = this.mergeConfig(merged[key] || {}, updates[key]);
      } else {
        merged[key] = updates[key];
      }
    });
    
    return merged;
  }

  /**
   * 计算预期改进
   */
  calculateExpectedImprovement(applied) {
    return applied.reduce((sum, rec) => sum + (rec.expectedImprovement || 0), 0);
  }

  /**
   * 验证优化效果
   */
  async validateOptimization(optimizationId, actualPerformance) {
    const optimization = this.optimizationHistory.find(o => o.id === optimizationId);
    if (!optimization) return;
    
    const improvement = this.calculateActualImprovement(
      optimization.performance,
      actualPerformance
    );
    
    optimization.actualImprovement = improvement;
    optimization.validated = true;
    optimization.validatedAt = Date.now();
    
    // 更新基线（如果优化成功）
    if (improvement > 0) {
      this.performanceBaseline = actualPerformance;
    }
    
    logger.info(`优化效果验证: ${optimizationId}`, {
      expected: optimization.expectedImprovement,
      actual: improvement
    });
  }

  /**
   * 计算实际改进
   */
  calculateActualImprovement(before, after) {
    const responseTimeImprovement = (before.responseTime - after.responseTime) / before.responseTime;
    const errorRateImprovement = (before.errorRate - after.errorRate) / (before.errorRate || 0.01);
    
    return (responseTimeImprovement + errorRateImprovement) / 2;
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig() {
    return this.currentConfig;
  }

  /**
   * 获取优化统计
   */
  getStats() {
    const validated = this.optimizationHistory.filter(o => o.validated);
    const successful = validated.filter(o => o.actualImprovement > 0);
    
    return {
      total: this.optimizationHistory.length,
      validated: validated.length,
      successful: successful.length,
      successRate: validated.length > 0 ? successful.length / validated.length : 0,
      averageImprovement: this.calculateAverageImprovement(validated)
    };
  }

  /**
   * 计算平均改进
   */
  calculateAverageImprovement(validated) {
    if (validated.length === 0) return 0;
    const sum = validated.reduce((s, o) => s + (o.actualImprovement || 0), 0);
    return sum / validated.length;
  }
}

module.exports = new AdaptiveOptimizer();






 * 自适应优化模块
 * 根据系统状态自动调整配置和策略
 */

const logger = require('../utils/logger');
const learningEngine = require('../learning/learning-engine');

class AdaptiveOptimizer {
  constructor() {
    this.optimizationHistory = [];
    this.currentConfig = this.getDefaultConfig();
    this.performanceBaseline = null;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig() {
    return {
      cache: {
        ttl: {
          news: 3600,
          events: 300,
          results: 7200
        },
        maxSize: 1000
      },
      api: {
        timeout: 10000,
        retryCount: 3,
        retryDelay: 1000
      },
      performance: {
        maxConcurrent: 10,
        rateLimit: 100
      },
      monitoring: {
        healthCheckInterval: 300000, // 5分钟
        detailedLogging: false
      }
    };
  }

  /**
   * 自适应优化主入口
   */
  async optimize(context) {
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. 分析当前性能
      const performance = await this.analyzePerformance(context);
      
      // 2. 与基线比较
      const deviation = this.compareWithBaseline(performance);
      
      // 3. 确定优化方向
      const optimizationAreas = this.identifyOptimizationAreas(deviation);
      
      // 4. 生成优化建议
      const recommendations = await this.generateRecommendations(optimizationAreas, performance);
      
      // 5. 应用优化（如果置信度高）
      const applied = [];
      for (const rec of recommendations) {
        if (rec.confidence > 0.7 && rec.autoApply) {
          const result = await this.applyOptimization(rec);
          if (result.success) {
            applied.push(rec);
          }
        }
      }
      
      // 6. 记录优化历史
      const record = {
        id: optimizationId,
        timestamp: Date.now(),
        performance,
        deviation,
        recommendations,
        applied,
        expectedImprovement: this.calculateExpectedImprovement(applied)
      };
      
      this.optimizationHistory.push(record);
      
      // 只保留最近100条记录
      if (this.optimizationHistory.length > 100) {
        this.optimizationHistory.shift();
      }
      
      logger.info(`自适应优化完成`, {
        areas: optimizationAreas.length,
        applied: applied.length
      });
      
      return record;
    } catch (error) {
      logger.error('自适应优化失败', error);
      throw error;
    }
  }

  /**
   * 分析性能
   */
  async analyzePerformance(context) {
    return {
      responseTime: context.avgResponseTime || 0,
      errorRate: context.errorRate || 0,
      throughput: context.throughput || 0,
      resourceUsage: {
        memory: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
        cpu: 0 // 需要实际CPU监控
      },
      cacheHitRate: context.cacheHitRate || 0,
      apiHealth: context.apiHealth || 1.0
    };
  }

  /**
   * 与基线比较
   */
  compareWithBaseline(performance) {
    if (!this.performanceBaseline) {
      this.performanceBaseline = performance;
      return {
        responseTime: 0,
        errorRate: 0,
        throughput: 0,
        resourceUsage: { memory: 0, cpu: 0 },
        cacheHitRate: 0
      };
    }
    
    return {
      responseTime: (performance.responseTime - this.performanceBaseline.responseTime) / this.performanceBaseline.responseTime,
      errorRate: (performance.errorRate - this.performanceBaseline.errorRate) / (this.performanceBaseline.errorRate || 0.01),
      throughput: (performance.throughput - this.performanceBaseline.throughput) / (this.performanceBaseline.throughput || 1),
      resourceUsage: {
        memory: performance.resourceUsage.memory - this.performanceBaseline.resourceUsage.memory,
        cpu: performance.resourceUsage.cpu - this.performanceBaseline.resourceUsage.cpu
      },
      cacheHitRate: performance.cacheHitRate - this.performanceBaseline.cacheHitRate
    };
  }

  /**
   * 识别优化领域
   */
  identifyOptimizationAreas(deviation) {
    const areas = [];
    
    // 响应时间优化
    if (deviation.responseTime > 0.2) {
      areas.push({
        type: 'response_time',
        priority: 'high',
        current: deviation.responseTime,
        target: -0.1
      });
    }
    
    // 错误率优化
    if (deviation.errorRate > 0.1) {
      areas.push({
        type: 'error_rate',
        priority: 'high',
        current: deviation.errorRate,
        target: -0.05
      });
    }
    
    // 缓存优化
    if (deviation.cacheHitRate < -0.1) {
      areas.push({
        type: 'cache',
        priority: 'medium',
        current: deviation.cacheHitRate,
        target: 0.1
      });
    }
    
    // 资源使用优化
    if (deviation.resourceUsage.memory > 0.2) {
      areas.push({
        type: 'memory',
        priority: 'medium',
        current: deviation.resourceUsage.memory,
        target: -0.1
      });
    }
    
    return areas;
  }

  /**
   * 生成优化建议
   */
  async generateRecommendations(areas, performance) {
    const recommendations = [];
    
    for (const area of areas) {
      const rec = this.generateRecommendationForArea(area, performance);
      if (rec) {
        recommendations.push(rec);
      }
    }
    
    return recommendations;
  }

  /**
   * 为特定领域生成建议
   */
  generateRecommendationForArea(area, performance) {
    switch (area.type) {
      case 'response_time':
        return {
          type: 'response_time',
          action: 'increase_cache_ttl',
          config: {
            cache: {
              ttl: {
                news: this.currentConfig.cache.ttl.news * 1.5,
                events: this.currentConfig.cache.ttl.events * 1.5
              }
            }
          },
          confidence: 0.8,
          autoApply: true,
          expectedImprovement: 0.15
        };
        
      case 'error_rate':
        return {
          type: 'error_rate',
          action: 'increase_retry_count',
          config: {
            api: {
              retryCount: this.currentConfig.api.retryCount + 1,
              retryDelay: this.currentConfig.api.retryDelay * 1.5
            }
          },
          confidence: 0.75,
          autoApply: true,
          expectedImprovement: 0.1
        };
        
      case 'cache':
        return {
          type: 'cache',
          action: 'increase_cache_size',
          config: {
            cache: {
              maxSize: this.currentConfig.cache.maxSize * 1.5
            }
          },
          confidence: 0.7,
          autoApply: true,
          expectedImprovement: 0.2
        };
        
      case 'memory':
        return {
          type: 'memory',
          action: 'reduce_cache_ttl',
          config: {
            cache: {
              ttl: {
                news: this.currentConfig.cache.ttl.news * 0.8,
                events: this.currentConfig.cache.ttl.events * 0.8
              }
            }
          },
          confidence: 0.75,
          autoApply: true,
          expectedImprovement: 0.1
        };
    }
    
    return null;
  }

  /**
   * 应用优化
   */
  async applyOptimization(recommendation) {
    try {
      logger.info(`应用优化: ${recommendation.type} - ${recommendation.action}`);
      
      // 更新配置
      this.currentConfig = this.mergeConfig(this.currentConfig, recommendation.config);
      
      // 记录到学习引擎
      learningEngine.recordEvent('optimization_applied', {
        type: recommendation.type,
        action: recommendation.action,
        config: recommendation.config
      });
      
      return {
        success: true,
        config: this.currentConfig
      };
    } catch (error) {
      logger.error('应用优化失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 合并配置
   */
  mergeConfig(current, updates) {
    const merged = JSON.parse(JSON.stringify(current));
    
    Object.keys(updates).forEach(key => {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        merged[key] = this.mergeConfig(merged[key] || {}, updates[key]);
      } else {
        merged[key] = updates[key];
      }
    });
    
    return merged;
  }

  /**
   * 计算预期改进
   */
  calculateExpectedImprovement(applied) {
    return applied.reduce((sum, rec) => sum + (rec.expectedImprovement || 0), 0);
  }

  /**
   * 验证优化效果
   */
  async validateOptimization(optimizationId, actualPerformance) {
    const optimization = this.optimizationHistory.find(o => o.id === optimizationId);
    if (!optimization) return;
    
    const improvement = this.calculateActualImprovement(
      optimization.performance,
      actualPerformance
    );
    
    optimization.actualImprovement = improvement;
    optimization.validated = true;
    optimization.validatedAt = Date.now();
    
    // 更新基线（如果优化成功）
    if (improvement > 0) {
      this.performanceBaseline = actualPerformance;
    }
    
    logger.info(`优化效果验证: ${optimizationId}`, {
      expected: optimization.expectedImprovement,
      actual: improvement
    });
  }

  /**
   * 计算实际改进
   */
  calculateActualImprovement(before, after) {
    const responseTimeImprovement = (before.responseTime - after.responseTime) / before.responseTime;
    const errorRateImprovement = (before.errorRate - after.errorRate) / (before.errorRate || 0.01);
    
    return (responseTimeImprovement + errorRateImprovement) / 2;
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig() {
    return this.currentConfig;
  }

  /**
   * 获取优化统计
   */
  getStats() {
    const validated = this.optimizationHistory.filter(o => o.validated);
    const successful = validated.filter(o => o.actualImprovement > 0);
    
    return {
      total: this.optimizationHistory.length,
      validated: validated.length,
      successful: successful.length,
      successRate: validated.length > 0 ? successful.length / validated.length : 0,
      averageImprovement: this.calculateAverageImprovement(validated)
    };
  }

  /**
   * 计算平均改进
   */
  calculateAverageImprovement(validated) {
    if (validated.length === 0) return 0;
    const sum = validated.reduce((s, o) => s + (o.actualImprovement || 0), 0);
    return sum / validated.length;
  }
}

module.exports = new AdaptiveOptimizer();






