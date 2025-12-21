const validator = require('validator');
const moment = require('moment');
const logger = require('../utils/logger');

class DataValidator {
  /**
   * 验证资讯数据
   */
  validateNews(news) {
    const errors = [];
    
    // 必填字段验证
    if (!news.title || news.title.trim().length === 0) {
      errors.push('标题不能为空');
    }
    
    if (!news.source || news.source.trim().length === 0) {
      errors.push('来源不能为空');
    }
    
    if (!news.updateTime) {
      errors.push('更新时间不能为空');
    }
    
    // 时间验证
    if (news.updateTime && !moment(news.updateTime).isValid()) {
      errors.push('更新时间格式不正确');
    }
    
    // URL验证
    if (news.sourceUrl && !validator.isURL(news.sourceUrl)) {
      errors.push('来源URL格式不正确');
    }
    
    // 分类验证
    const validCategories = ['race', 'breeding', 'health'];
    if (news.category && !validCategories.includes(news.category)) {
      errors.push('分类不正确');
    }
    
    // 地区验证
    const validRegions = ['local', 'national'];
    if (news.region && !validRegions.includes(news.region)) {
      errors.push('地区不正确');
    }
    
    // 内容长度验证
    if (news.content && news.content.length > 10000) {
      errors.push('内容过长');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证赛事数据
   */
  validateEvent(event, type) {
    const errors = [];
    const now = moment();
    
    // 必填字段验证
    if (!event.name || event.name.trim().length === 0) {
      errors.push('赛事名称不能为空');
    }
    
    if (!event.organizer || event.organizer.trim().length === 0) {
      errors.push('组织者不能为空');
    }
    
    if (!event.source || event.source.trim().length === 0) {
      errors.push('来源不能为空');
    }
    
    // 时间验证
    if (type === 'ongoing') {
      if (!event.releaseTimeFull) {
        errors.push('进行中的赛事必须有放飞时间');
      } else {
        const releaseTime = moment(event.releaseTimeFull);
        if (releaseTime.isAfter(now)) {
          errors.push('进行中的赛事放飞时间不能是未来');
        }
        if (releaseTime.isBefore(now.subtract(24, 'hours'))) {
          errors.push('进行中的赛事放飞时间不能超过24小时前');
        }
      }
      
      if (event.endTimeFull) {
        const endTime = moment(event.endTimeFull);
        if (endTime.isBefore(now)) {
          errors.push('进行中的赛事不能已结束');
        }
      }
    } else if (type === 'upcoming') {
      if (!event.startTimeFull) {
        errors.push('即将开始的赛事必须有开始时间');
      } else {
        const startTime = moment(event.startTimeFull);
        if (startTime.isBefore(now)) {
          errors.push('即将开始的赛事开始时间必须是未来');
        }
      }
    } else if (type === 'results') {
      if (!event.endTimeFull) {
        errors.push('已结束的赛事必须有结束时间');
      } else {
        const endTime = moment(event.endTimeFull);
        if (endTime.isAfter(now)) {
          errors.push('已结束的赛事结束时间不能是未来');
        }
      }
    }
    
    // 更新时间验证
    if (event.updateTime) {
      const updateTime = moment(event.updateTime);
      if (!updateTime.isValid()) {
        errors.push('更新时间格式不正确');
      } else {
        const hoursSinceUpdate = now.diff(updateTime, 'hours');
        if (type === 'ongoing' && hoursSinceUpdate > 2) {
          errors.push('进行中的赛事更新时间不能超过2小时前');
        } else if (hoursSinceUpdate > 24) {
          errors.push('赛事更新时间不能超过24小时前');
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 清洗资讯数据
   */
  cleanNews(news) {
    return {
      ...news,
      title: (news.title || '').trim().substring(0, 200),
      source: (news.source || '').trim().substring(0, 100),
      sourceUrl: news.sourceUrl || '#',
      content: (news.content || '').trim().substring(0, 5000),
      tags: Array.isArray(news.tags) ? news.tags.slice(0, 10) : [],
      category: news.category || 'race',
      region: news.region || 'national',
      hot: Boolean(news.hot)
    };
  }

  /**
   * 清洗赛事数据
   */
  cleanEvent(event) {
    return {
      ...event,
      name: (event.name || '').trim().substring(0, 200),
      organizer: (event.organizer || '').trim().substring(0, 100),
      source: (event.source || '').trim().substring(0, 100),
      sourceUrl: event.sourceUrl || '#',
      distance: (event.distance || '').trim().substring(0, 50),
      weather: (event.weather || '').trim().substring(0, 50),
      region: event.region || 'national'
    };
  }
}

module.exports = new DataValidator();




















