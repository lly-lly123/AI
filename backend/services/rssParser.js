const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const moment = require('moment');

class RSSParser {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['pubDate', 'pubDate'],
          ['description', 'description']
        ]
      }
    });
  }

  /**
   * 解析RSS feed
   * @param {string} url - RSS feed URL
   * @param {object} sourceConfig - 数据源配置
   * @returns {Promise<Array>} 解析后的数据
   */
  async parseFeed(url, sourceConfig) {
    try {
      logger.info(`开始解析RSS: ${url}`);
      
      // 获取RSS内容
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PigeonDataService/1.0)'
        }
      });
      
      // 解析RSS
      const feed = await this.parser.parseString(response.data);
      
      // 转换数据格式
      const items = feed.items.map(item => this.transformItem(item, sourceConfig));
      
      logger.info(`RSS解析成功: ${url}, 获取 ${items.length} 条数据`);
      return items;
      
    } catch (error) {
      logger.error(`RSS解析失败: ${url}`, error);
      throw error;
    }
  }

  /**
   * 转换RSS item为标准格式
   * @param {object} item - RSS item
   * @param {object} sourceConfig - 数据源配置
   * @returns {object} 标准格式的数据
   */
  transformItem(item, sourceConfig) {
    // 提取内容
    const content = this.extractContent(item.content || item.contentSnippet || item.description || '');
    
    // 解析发布时间
    const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
    const updateTime = moment(pubDate).toISOString();
    
    // 判断分类
    const category = this.detectCategory(item.title, content);
    
    // 判断是否为热门
    const hot = this.isHot(item);
    
    return {
      id: this.generateId(item.link, item.title),
      title: this.cleanTitle(item.title),
      source: sourceConfig.name,
      sourceUrl: item.link || '#',
      time: this.formatRelativeTime(updateTime),
      updateTime: updateTime,
      tags: this.extractTags(item.title, content),
      category: category,
      region: sourceConfig.region || 'national',
      content: content,
      hot: hot
    };
  }

  /**
   * 提取内容（去除HTML标签）
   */
  extractContent(html) {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $.text().trim().substring(0, 500); // 限制长度
  }

  /**
   * 清理标题
   */
  cleanTitle(title) {
    if (!title) return '无标题';
    return title.trim().replace(/\s+/g, ' ');
  }

  /**
   * 检测分类
   */
  detectCategory(title, content) {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('比赛') || text.includes('赛事') || text.includes('公棚') || 
        text.includes('赛程') || text.includes('成绩') || text.includes('冠军')) {
      return 'race';
    }
    if (text.includes('育种') || text.includes('配对') || text.includes('血统') || 
        text.includes('种鸽') || text.includes('繁殖')) {
      return 'breeding';
    }
    if (text.includes('健康') || text.includes('疾病') || text.includes('预防') || 
        text.includes('治疗') || text.includes('用药') || text.includes('疫苗')) {
      return 'health';
    }
    
    return 'race'; // 默认
  }

  /**
   * 提取标签
   */
  extractTags(title, content) {
    const text = (title + ' ' + content);
    const tags = [];
    
    // 地区标签
    const regions = ['贵州', '贵阳', '遵义', '毕节', '黔西', '全国', '西南'];
    regions.forEach(region => {
      if (text.includes(region)) {
        tags.push(region);
      }
    });
    
    // 赛事类型标签
    const types = ['公棚', '特比环', '春季', '秋季', '冬季', '500公里', '700公里', '1000公里'];
    types.forEach(type => {
      if (text.includes(type)) {
        tags.push(type);
      }
    });
    
    return tags.slice(0, 5); // 最多5个标签
  }

  /**
   * 判断是否为热门
   */
  isHot(item) {
    // 可以根据发布时间、评论数等判断
    const pubDate = item.pubDate || item.isoDate;
    if (pubDate) {
      const hoursAgo = moment().diff(moment(pubDate), 'hours');
      return hoursAgo < 24; // 24小时内发布的视为热门
    }
    return false;
  }

  /**
   * 生成唯一ID
   */
  generateId(link, title) {
    if (link) {
      return Buffer.from(link).toString('base64').substring(0, 32);
    }
    return Buffer.from(title + Date.now()).toString('base64').substring(0, 32);
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(isoTime) {
    const now = moment();
    const time = moment(isoTime);
    const diff = now.diff(time, 'minutes');
    
    if (diff < 60) {
      return `${diff}分钟前`;
    } else if (diff < 1440) {
      return `${Math.floor(diff / 60)}小时前`;
    } else {
      return `${Math.floor(diff / 1440)}天前`;
    }
  }
}

module.exports = new RSSParser();




















