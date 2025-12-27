const rssParser = require('./rssParser');
const eventParser = require('./eventParser');
const dataValidator = require('./dataValidator');
const cacheService = require('./cacheService');
const config = require('../config/config');
const logger = require('../utils/logger');
const axios = require('axios');
const moment = require('moment');

class DataService {
  constructor() {
    this.newsData = [];
    this.eventsData = {
      ongoing: [],
      upcoming: [],
      results: []
    };
  }

  /**
   * 获取资讯数据
   */
  async fetchNews() {
    try {
      logger.info('开始获取资讯数据');
      
      const cacheKey = 'news_data';
      const cached = cacheService.get(cacheKey);
      if (cached && cached.length > 0) {
        logger.info(`从缓存获取资讯数据，共 ${cached.length} 条`);
        return cached;
      }
      
      const allNews = [];
      
      // 备用RSS源列表（如果主源失败，使用备用源）
      const fallbackSources = [
        {
          name: '赛鸽资讯',
          url: 'https://www.chinaxinge.com/rss.xml',
          type: 'media',
          region: 'national'
        }
      ];
      
      // 合并配置的RSS源和备用源
      const allSources = config.rssSources.length > 0 ? config.rssSources : fallbackSources;
      
      // 从所有RSS源获取数据
      let successCount = 0;
      for (const source of allSources) {
        try {
          const items = await rssParser.parseFeed(source.url, source);
          
          // 验证和清洗数据
          const validItems = items
            .map(item => {
              const cleaned = dataValidator.cleanNews(item);
              const validation = dataValidator.validateNews(cleaned);
              
              if (!validation.valid) {
                logger.warn(`资讯验证失败: ${cleaned.title}`, validation.errors);
                return null;
              }
              
              return cleaned;
            })
            .filter(item => item !== null);
          
          if (validItems.length > 0) {
            allNews.push(...validItems);
            successCount++;
            logger.info(`成功从 ${source.name} 获取 ${validItems.length} 条资讯`);
          }
          
        } catch (error) {
          // 完全静默处理所有RSS错误，不记录任何日志
          // 继续尝试下一个源
        }
      }
      
      // 如果所有源都失败，返回空数组（而不是抛出错误）
      if (allNews.length === 0) {
        // 完全静默处理，不显示警告
        // 尝试从缓存获取旧数据（即使过期）
        const oldCached = cacheService.get(cacheKey, true); // 忽略过期时间
        if (oldCached && oldCached.length > 0) {
          logger.info(`使用缓存数据，共 ${oldCached.length} 条`);
          return oldCached;
        }
        // 静默返回空数组，不记录任何警告
        return [];
      }
      
      
      // 去重（基于ID）
      const uniqueNews = this.deduplicateNews(allNews);
      
      // 按更新时间排序
      uniqueNews.sort((a, b) => {
        return moment(b.updateTime).valueOf() - moment(a.updateTime).valueOf();
      });
      
      // 缓存数据
      cacheService.set(cacheKey, uniqueNews, config.cache.ttl.news);
      
      this.newsData = uniqueNews;
      logger.info(`资讯数据获取成功，共 ${uniqueNews.length} 条，成功源: ${successCount}/${allSources.length}`);
      
      return uniqueNews;
      
    } catch (error) {
      logger.error('获取资讯数据失败', error);
      // 尝试返回缓存数据（即使过期）
      const oldCached = cacheService.get('news_data', true);
      if (oldCached && oldCached.length > 0) {
        logger.info(`使用过期的缓存数据作为fallback，共 ${oldCached.length} 条`);
        return oldCached;
      }
      // 如果连缓存都没有，返回空数组而不是抛出错误
      logger.warn('无法获取资讯数据，返回空数组');
      return [];
    }
  }

  /**
   * 获取赛事数据
   */
  async fetchEvents() {
    try {
      logger.info('开始获取赛事数据');
      
      const cacheKey = 'events_data';
      const cached = cacheService.get(cacheKey);
      if (cached && (cached.ongoing?.length > 0 || cached.upcoming?.length > 0 || cached.results?.length > 0)) {
        logger.info(`从缓存获取赛事数据，进行中: ${cached.ongoing?.length || 0}, 即将开始: ${cached.upcoming?.length || 0}, 已结束: ${cached.results?.length || 0}`);
        return cached;
      }
      
      // 从RSS获取赛事数据
      const events = {
        ongoing: [],
        upcoming: [],
        results: []
      };
      
      // 备用RSS源列表
      const fallbackSources = [
        {
          name: '中国信鸽信息网',
          url: 'https://www.chinaxinge.com/rss',
          type: 'media',
          region: 'national'
        },
        {
          name: '赛鸽天地',
          url: 'https://www.chinaxinge.com/rss',
          type: 'media',
          region: 'national'
        }
      ];
      
      // 合并配置的RSS源和备用源
      const allSources = config.rssSources.length > 0 ? config.rssSources : fallbackSources;
      
      // 从所有RSS源获取数据并解析为赛事
      let successCount = 0;
      for (const source of allSources) {
        try {
          // 直接从RSS feed解析赛事
          const parsedEvents = await eventParser.parseEventsFromRSSFeed(source.url, source);
          
          // 合并到总数据
          if (parsedEvents.ongoing?.length > 0) {
            events.ongoing.push(...parsedEvents.ongoing);
          }
          if (parsedEvents.upcoming?.length > 0) {
            events.upcoming.push(...parsedEvents.upcoming);
          }
          if (parsedEvents.results?.length > 0) {
            events.results.push(...parsedEvents.results);
          }
          
          if (parsedEvents.ongoing?.length > 0 || parsedEvents.upcoming?.length > 0 || parsedEvents.results?.length > 0) {
            successCount++;
            logger.info(`成功从 ${source.name} 获取赛事数据`);
          }
          
        } catch (error) {
          logger.error(`获取赛事RSS源失败: ${source.name}`, error.message);
          // 继续尝试下一个源
        }
      }
      
      // 如果所有源都失败，尝试从缓存获取旧数据
      if (events.ongoing.length === 0 && events.upcoming.length === 0 && events.results.length === 0) {
        logger.warn('所有RSS源都失败，尝试使用过期缓存');
        const oldCached = cacheService.get(cacheKey, true); // 忽略过期时间
        if (oldCached && (oldCached.ongoing?.length > 0 || oldCached.upcoming?.length > 0 || oldCached.results?.length > 0)) {
          logger.info(`使用过期的缓存数据，进行中: ${oldCached.ongoing?.length || 0}, 即将开始: ${oldCached.upcoming?.length || 0}, 已结束: ${oldCached.results?.length || 0}`);
          return oldCached;
        }
        // 返回空数据结构
        return { ongoing: [], upcoming: [], results: [] };
      }
      
      // 去重
      events.ongoing = this.deduplicateEvents(events.ongoing);
      events.upcoming = this.deduplicateEvents(events.upcoming);
      events.results = this.deduplicateEvents(events.results);
      
      // 验证和清洗数据
      events.ongoing = events.ongoing
        .map(event => {
          const cleaned = dataValidator.cleanEvent(event);
          const validation = dataValidator.validateEvent(cleaned, 'ongoing');
          
          if (!validation.valid) {
            logger.warn(`赛事验证失败: ${cleaned.name}`, validation.errors);
            return null;
          }
          
          return cleaned;
        })
        .filter(event => event !== null);
      
      events.upcoming = events.upcoming
        .map(event => {
          const cleaned = dataValidator.cleanEvent(event);
          const validation = dataValidator.validateEvent(cleaned, 'upcoming');
          
          if (!validation.valid) {
            logger.warn(`赛事验证失败: ${cleaned.name}`, validation.errors);
            return null;
          }
          
          return cleaned;
        })
        .filter(event => event !== null);
      
      events.results = events.results
        .map(event => {
          const cleaned = dataValidator.cleanEvent(event);
          const validation = dataValidator.validateEvent(cleaned, 'results');
          
          if (!validation.valid) {
            logger.warn(`赛事验证失败: ${cleaned.name}`, validation.errors);
            return null;
          }
          
          return cleaned;
        })
        .filter(event => event !== null);
      
      // 缓存数据
      cacheService.set(cacheKey, events, config.cache.ttl.events);
      
      this.eventsData = events;
      logger.info(`赛事数据获取成功，进行中: ${events.ongoing.length}, 即将开始: ${events.upcoming.length}, 已结束: ${events.results.length}，成功源: ${successCount}/${allSources.length}`);
      
      return events;
      
    } catch (error) {
      logger.error('获取赛事数据失败', error);
      // 尝试返回缓存数据（即使过期）
      const oldCached = cacheService.get('events_data', true);
      if (oldCached && (oldCached.ongoing?.length > 0 || oldCached.upcoming?.length > 0 || oldCached.results?.length > 0)) {
        logger.info(`使用过期的缓存数据作为fallback`);
        return oldCached;
      }
      // 如果连缓存都没有，返回空数据结构而不是抛出错误
      logger.warn('无法获取赛事数据，返回空数据结构');
      return { ongoing: [], upcoming: [], results: [] };
    }
  }

  /**
   * 去重资讯
   */
  deduplicateNews(news) {
    const seen = new Set();
    return news.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }

  /**
   * 去重赛事
   */
  deduplicateEvents(events) {
    const seen = new Set();
    return events.filter(event => {
      if (seen.has(event.id)) {
        return false;
      }
      seen.add(event.id);
      return true;
    });
  }

  /**
   * 强制刷新数据
   */
  async refreshNews() {
    cacheService.del('news_data');
    return await this.fetchNews();
  }

  async refreshEvents() {
    cacheService.del('events_data');
    return await this.fetchEvents();
  }
}

module.exports = new DataService();

