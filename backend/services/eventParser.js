const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const logger = require('../utils/logger');

class EventParser {
  /**
   * 从RSS原始数据解析赛事
   */
  async parseEventsFromRSSFeed(feedUrl, sourceConfig) {
    const Parser = require('rss-parser');
    const parser = new Parser();
    const axios = require('axios');
    
    try {
      const response = await axios.get(feedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PigeonDataService/1.0)'
        }
      });
      
      const feed = await parser.parseString(response.data);
      return this.parseEventsFromRSS(feed.items, sourceConfig);
    } catch (error) {
      logger.error(`解析RSS feed失败: ${feedUrl}`, error);
      return { ongoing: [], upcoming: [], results: [] };
    }
  }

  /**
   * 从RSS items解析赛事数据
   */
  parseEventsFromRSS(rssItems, sourceConfig) {
    const events = {
      ongoing: [],
      upcoming: [],
      results: []
    };
    
    for (const item of rssItems) {
      try {
        const event = this.parseEventFromItem(item, sourceConfig);
        if (event) {
          // 根据时间判断赛事状态
          const now = moment();
          const releaseTime = event.releaseTimeFull ? moment(event.releaseTimeFull) : null;
          const endTime = event.endTimeFull ? moment(event.endTimeFull) : null;
          
          if (endTime && endTime.isBefore(now)) {
            // 已结束
            events.results.push(event);
          } else if (releaseTime && releaseTime.isBefore(now) && (!endTime || endTime.isAfter(now))) {
            // 进行中
            events.ongoing.push(event);
          } else if (releaseTime && releaseTime.isAfter(now)) {
            // 即将开始
            events.upcoming.push(event);
          }
        }
      } catch (error) {
        logger.warn(`解析赛事项失败: ${item.title}`, error);
      }
    }
    
    return events;
  }

  /**
   * 从RSS item解析赛事
   */
  parseEventFromItem(item, sourceConfig) {
    const title = item.title || '';
    const content = item.content || item.contentSnippet || item.description || '';
    const text = title + ' ' + content;
    
    // 提取赛事名称
    const name = this.extractEventName(title, content);
    if (!name) return null;
    
    // 提取组织者
    const organizer = this.extractOrganizer(text) || sourceConfig.name;
    
    // 提取距离
    const distance = this.extractDistance(text);
    
    // 提取时间
    const times = this.extractTimes(item, text);
    
    // 提取参赛数量
    const participants = this.extractParticipants(text);
    
    // 提取归巢信息（进行中的赛事）
    const returnInfo = this.extractReturnInfo(text);
    
    // 提取冠军信息（已结束的赛事）
    const championInfo = this.extractChampionInfo(text);
    
    return {
      id: this.generateEventId(item.link || item.guid || item.title),
      name: name,
      organizer: organizer,
      source: sourceConfig.name,
      sourceUrl: item.link || '#',
      releaseTime: times.releaseTime,
      releaseTimeFull: times.releaseTimeFull,
      startTime: times.startTime,
      startTimeFull: times.startTimeFull,
      endTime: times.endTime,
      endTimeFull: times.endTimeFull,
      distance: distance,
      region: sourceConfig.region || 'national',
      participants: participants,
      returned: returnInfo.returned,
      total: returnInfo.total,
      weather: this.extractWeather(text),
      champion: championInfo.champion,
      championRing: championInfo.ring,
      championTime: championInfo.time,
      updateTime: item.pubDate || item.isoDate || new Date().toISOString()
    };
  }

  /**
   * 提取赛事名称
   */
  extractEventName(title, content) {
    // 尝试从标题提取
    const titleMatch = title.match(/(\d{4}年.*?赛|.*?公棚.*?赛|.*?特比环.*?赛|.*?精英赛)/);
    if (titleMatch) {
      return titleMatch[1];
    }
    
    // 如果标题包含"赛事"、"比赛"等关键词，使用标题
    if (title.includes('赛') || title.includes('比赛') || title.includes('赛事')) {
      return title.substring(0, 100);
    }
    
    return null;
  }

  /**
   * 提取组织者
   */
  extractOrganizer(text) {
    const patterns = [
      /([^，。\s]+(?:协会|俱乐部|联盟|公棚))/,
      /主办[方单位]?[：:]([^，。\s]+)/,
      /组织[方单位]?[：:]([^，。\s]+)/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * 提取距离
   */
  extractDistance(text) {
    const match = text.match(/(\d+)\s*公里/);
    if (match) {
      return match[1] + '公里';
    }
    return '未知距离';
  }

  /**
   * 提取时间信息
   */
  extractTimes(item, text) {
    const now = moment();
    const pubDate = item.pubDate || item.isoDate;
    
    // 提取日期
    const datePatterns = [
      /(\d{4}年\d{1,2}月\d{1,2}日)/,
      /(\d{1,2}月\d{1,2}日)/,
      /(\d{1,2}日)/
    ];
    
    let releaseTime = null;
    let releaseTimeFull = null;
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        releaseTime = match[1];
        // 尝试解析完整日期
        try {
          releaseTimeFull = moment(match[1], 'YYYY年MM月DD日').toISOString();
        } catch (e) {
          releaseTimeFull = pubDate || now.toISOString();
        }
        break;
      }
    }
    
    if (!releaseTimeFull && pubDate) {
      releaseTimeFull = moment(pubDate).toISOString();
      releaseTime = moment(pubDate).format('YYYY年MM月DD日 HH:mm');
    }
    
    return {
      releaseTime: releaseTime || '未知时间',
      releaseTimeFull: releaseTimeFull || now.toISOString(),
      startTime: releaseTime,
      startTimeFull: releaseTimeFull,
      endTime: null,
      endTimeFull: null
    };
  }

  /**
   * 提取参赛数量
   */
  extractParticipants(text) {
    const match = text.match(/(\d+)\s*[只羽]?[参赛]/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  /**
   * 提取归巢信息
   */
  extractReturnInfo(text) {
    const match = text.match(/(\d+)\s*[/／]\s*(\d+)\s*[只羽]?[归巢已]/);
    if (match) {
      return {
        returned: parseInt(match[1], 10),
        total: parseInt(match[2], 10)
      };
    }
    return { returned: 0, total: 0 };
  }

  /**
   * 提取冠军信息
   */
  extractChampionInfo(text) {
    const championMatch = text.match(/冠军[：:]([^，。\s]+)/);
    const ringMatch = text.match(/(CHN\d{4}-\d{4})/);
    const timeMatch = text.match(/(\d+[小时时分]\d+[分])/);
    
    return {
      champion: championMatch ? championMatch[1] : null,
      ring: ringMatch ? ringMatch[1] : null,
      time: timeMatch ? timeMatch[1] : null
    };
  }

  /**
   * 提取天气
   */
  extractWeather(text) {
    const weatherPatterns = ['晴', '多云', '阴', '雨', '雪'];
    for (const pattern of weatherPatterns) {
      if (text.includes(pattern)) {
        return pattern;
      }
    }
    return '未知';
  }

  /**
   * 生成赛事ID
   */
  generateEventId(identifier) {
    if (identifier) {
      return Buffer.from(identifier).toString('base64').substring(0, 32);
    }
    return Buffer.from(Date.now().toString()).toString('base64').substring(0, 32);
  }
}

module.exports = new EventParser();

