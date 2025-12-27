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
        timeout: 15000, // 增加超时时间
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });
      
      // 清理XML内容，修复常见的格式问题
      let xmlContent = response.data;
      if (typeof xmlContent === 'string') {
        // 修复未引用的属性值（Unquoted attribute value）
        xmlContent = xmlContent.replace(/(\w+)=([^"'\s>]+)(?=\s|>)/g, '$1="$2"');
        // 修复其他常见的XML格式问题
        xmlContent = xmlContent.replace(/&(?![a-zA-Z]+;)/g, '&amp;');
        // 移除控制字符
        xmlContent = xmlContent.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      }
      
      // 解析RSS - 使用更宽松的解析选项
      let feed;
      try {
        feed = await this.parser.parseString(xmlContent);
      } catch (parseError) {
        // 如果解析失败，尝试使用更宽松的解析器
        logger.warn(`标准解析失败，尝试宽松模式: ${parseError.message}`);
        const lenientParser = new Parser({
          xml: {
            normalize: true,
            normalizeTags: true,
            trim: true
          },
          customFields: {
            item: [
              ['pubDate', 'pubDate'],
              ['description', 'description']
            ]
          }
        });
        feed = await lenientParser.parseString(xmlContent);
      }
      
      // 验证feed是否有效
      if (!feed || !feed.items || !Array.isArray(feed.items)) {
        logger.warn(`RSS feed格式无效: ${url}`);
        return [];
      }
      
      // 转换数据格式
      const items = feed.items
        .filter(item => item && (item.title || item.link)) // 过滤无效项
        .map(item => {
          try {
            return this.transformItem(item, sourceConfig);
          } catch (transformError) {
            logger.warn(`转换RSS项失败: ${item.title || '未知'}`, transformError.message);
            return null;
          }
        })
        .filter(item => item !== null); // 移除转换失败的项
      
      if (items.length === 0) {
        logger.warn(`RSS解析成功但无有效数据: ${url}`);
        return [];
      }
      
      logger.info(`RSS解析成功: ${url}, 获取 ${items.length} 条数据`);
      return items;
      
    } catch (error) {
      // 改进错误处理，提供更详细的错误信息
      const errorMessage = error.message || String(error);
      const errorDetails = {
        url,
        error: errorMessage,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText
        } : null
      };
      
      // 根据错误类型提供不同的日志级别
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        logger.warn(`RSS请求超时: ${url}`, errorDetails);
      } else if (error.response && error.response.status >= 400) {
        logger.warn(`RSS请求失败 (HTTP ${error.response.status}): ${url}`, errorDetails);
      } else if (errorMessage.includes('Unquoted attribute') || errorMessage.includes('XML')) {
        logger.warn(`RSS XML格式错误: ${url}`, errorDetails);
      } else {
        logger.error(`RSS解析失败: ${url}`, errorDetails);
      }
      
      // 不抛出错误，返回空数组，让调用者继续处理
      return [];
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




















