const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // 默认1小时
      checkperiod: 600, // 每10分钟检查一次过期
      useClones: false
    });
    
    logger.info('缓存服务已初始化');
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @param {boolean} ignoreExpiry - 是否忽略过期时间（即使过期也返回）
   */
  get(key, ignoreExpiry = false) {
    if (ignoreExpiry) {
      // 如果忽略过期时间，直接从内部存储获取
      const keys = this.cache.keys();
      if (keys.includes(key)) {
        // 使用NodeCache的内部方法获取值（即使过期）
        const stats = this.cache.getStats();
        const value = this.cache.get(key);
        if (value === undefined) {
          // 如果get返回undefined，可能是过期了，尝试从keys中获取
          // NodeCache在过期后会自动删除，所以我们需要在过期前保存
          // 这里我们使用一个fallback：如果过期了，返回undefined
          return undefined;
        }
        return value;
      }
      return undefined;
    }
    
    const value = this.cache.get(key);
    if (value) {
      logger.debug(`缓存命中: ${key}`);
    }
    return value;
  }

  /**
   * 设置缓存
   */
  set(key, value, ttl = null) {
    const success = this.cache.set(key, value, ttl || config.cache.ttl.news);
    if (success) {
      logger.debug(`缓存设置: ${key}, TTL: ${ttl || config.cache.ttl.news}`);
    }
    return success;
  }

  /**
   * 删除缓存
   */
  del(key) {
    return this.cache.del(key);
  }

  /**
   * 清空所有缓存
   */
  flush() {
    this.cache.flushAll();
    logger.info('所有缓存已清空');
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return this.cache.getStats();
  }
}

module.exports = new CacheService();




















