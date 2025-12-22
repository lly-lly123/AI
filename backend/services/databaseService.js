/**
 * 数据库服务
 * 支持PostgreSQL（Supabase）和文件存储的切换
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const storageService = require('./storageService');

class DatabaseService {
  constructor() {
    this.useSupabase = false;
    this.client = null;
    
    // 检查Supabase配置
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        this.client = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );
        this.useSupabase = true;
        logger.info('数据库服务：使用Supabase PostgreSQL');
      } catch (error) {
        logger.warn('Supabase初始化失败，使用文件存储', error.message);
        this.useSupabase = false;
      }
    } else {
      logger.info('数据库服务：使用文件存储（未配置Supabase）');
    }
  }
  
  /**
   * 查询数据
   */
  async query(table, filters = {}) {
    if (this.useSupabase && this.client) {
      try {
        let query = this.client.from(table).select('*');
        
        // 应用过滤条件
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error(`Supabase查询失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackQuery(table, filters);
      }
    }
    
    return this.fallbackQuery(table, filters);
  }
  
  /**
   * 插入数据
   */
  async insert(table, data) {
    if (this.useSupabase && this.client) {
      try {
        const { data: result, error } = await this.client
          .from(table)
          .insert(data)
          .select();
        
        if (error) throw error;
        return Array.isArray(result) ? result[0] : result;
      } catch (error) {
        logger.error(`Supabase插入失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackInsert(table, data);
      }
    }
    
    return this.fallbackInsert(table, data);
  }
  
  /**
   * 更新数据
   */
  async update(table, id, updates) {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(`未找到ID为 ${id} 的记录`);
        }
        return data[0];
      } catch (error) {
        logger.error(`Supabase更新失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackUpdate(table, id, updates);
      }
    }
    
    return this.fallbackUpdate(table, id, updates);
  }
  
  /**
   * 删除数据
   */
  async delete(table, id) {
    if (this.useSupabase && this.client) {
      try {
        const { error } = await this.client
          .from(table)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (error) {
        logger.error(`Supabase删除失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackDelete(table, id);
      }
    }
    
    return this.fallbackDelete(table, id);
  }
  
  /**
   * 批量插入
   */
  async batchInsert(table, items) {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .insert(items)
          .select();
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error(`Supabase批量插入失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackBatchInsert(table, items);
      }
    }
    
    return this.fallbackBatchInsert(table, items);
  }
  
  /**
   * 文件存储降级方法
   */
  async fallbackQuery(table, filters) {
    const data = await storageService.read(table) || [];
    if (Object.keys(filters).length === 0) {
      return data;
    }
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  async fallbackInsert(table, data) {
    return await storageService.add(table, data);
  }
  
  async fallbackUpdate(table, id, updates) {
    return await storageService.update(table, id, updates);
  }
  
  async fallbackDelete(table, id) {
    await storageService.delete(table, id);
    return true;
  }
  
  async fallbackBatchInsert(table, items) {
    const results = [];
    for (const item of items) {
      const result = await storageService.add(table, item);
      results.push(result);
    }
    return results;
  }
  
  /**
   * 检查数据库连接
   */
  async checkConnection() {
    if (this.useSupabase && this.client) {
      try {
        const { error } = await this.client.from('users').select('count').limit(1);
        return !error;
      } catch (error) {
        return false;
      }
    }
    return true; // 文件存储总是可用
  }
}

module.exports = new DatabaseService();






 * 数据库服务
 * 支持PostgreSQL（Supabase）和文件存储的切换
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const storageService = require('./storageService');

class DatabaseService {
  constructor() {
    this.useSupabase = false;
    this.client = null;
    
    // 检查Supabase配置
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        this.client = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );
        this.useSupabase = true;
        logger.info('数据库服务：使用Supabase PostgreSQL');
      } catch (error) {
        logger.warn('Supabase初始化失败，使用文件存储', error.message);
        this.useSupabase = false;
      }
    } else {
      logger.info('数据库服务：使用文件存储（未配置Supabase）');
    }
  }
  
  /**
   * 查询数据
   */
  async query(table, filters = {}) {
    if (this.useSupabase && this.client) {
      try {
        let query = this.client.from(table).select('*');
        
        // 应用过滤条件
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error(`Supabase查询失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackQuery(table, filters);
      }
    }
    
    return this.fallbackQuery(table, filters);
  }
  
  /**
   * 插入数据
   */
  async insert(table, data) {
    if (this.useSupabase && this.client) {
      try {
        const { data: result, error } = await this.client
          .from(table)
          .insert(data)
          .select();
        
        if (error) throw error;
        return Array.isArray(result) ? result[0] : result;
      } catch (error) {
        logger.error(`Supabase插入失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackInsert(table, data);
      }
    }
    
    return this.fallbackInsert(table, data);
  }
  
  /**
   * 更新数据
   */
  async update(table, id, updates) {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(`未找到ID为 ${id} 的记录`);
        }
        return data[0];
      } catch (error) {
        logger.error(`Supabase更新失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackUpdate(table, id, updates);
      }
    }
    
    return this.fallbackUpdate(table, id, updates);
  }
  
  /**
   * 删除数据
   */
  async delete(table, id) {
    if (this.useSupabase && this.client) {
      try {
        const { error } = await this.client
          .from(table)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (error) {
        logger.error(`Supabase删除失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackDelete(table, id);
      }
    }
    
    return this.fallbackDelete(table, id);
  }
  
  /**
   * 批量插入
   */
  async batchInsert(table, items) {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .insert(items)
          .select();
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error(`Supabase批量插入失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackBatchInsert(table, items);
      }
    }
    
    return this.fallbackBatchInsert(table, items);
  }
  
  /**
   * 文件存储降级方法
   */
  async fallbackQuery(table, filters) {
    const data = await storageService.read(table) || [];
    if (Object.keys(filters).length === 0) {
      return data;
    }
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  async fallbackInsert(table, data) {
    return await storageService.add(table, data);
  }
  
  async fallbackUpdate(table, id, updates) {
    return await storageService.update(table, id, updates);
  }
  
  async fallbackDelete(table, id) {
    await storageService.delete(table, id);
    return true;
  }
  
  async fallbackBatchInsert(table, items) {
    const results = [];
    for (const item of items) {
      const result = await storageService.add(table, item);
      results.push(result);
    }
    return results;
  }
  
  /**
   * 检查数据库连接
   */
  async checkConnection() {
    if (this.useSupabase && this.client) {
      try {
        const { error } = await this.client.from('users').select('count').limit(1);
        return !error;
      } catch (error) {
        return false;
      }
    }
    return true; // 文件存储总是可用
  }
}

module.exports = new DatabaseService();






 * 数据库服务
 * 支持PostgreSQL（Supabase）和文件存储的切换
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const storageService = require('./storageService');

class DatabaseService {
  constructor() {
    this.useSupabase = false;
    this.client = null;
    
    // 检查Supabase配置
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        this.client = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        );
        this.useSupabase = true;
        logger.info('数据库服务：使用Supabase PostgreSQL');
      } catch (error) {
        logger.warn('Supabase初始化失败，使用文件存储', error.message);
        this.useSupabase = false;
      }
    } else {
      logger.info('数据库服务：使用文件存储（未配置Supabase）');
    }
  }
  
  /**
   * 查询数据
   */
  async query(table, filters = {}) {
    if (this.useSupabase && this.client) {
      try {
        let query = this.client.from(table).select('*');
        
        // 应用过滤条件
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error(`Supabase查询失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackQuery(table, filters);
      }
    }
    
    return this.fallbackQuery(table, filters);
  }
  
  /**
   * 插入数据
   */
  async insert(table, data) {
    if (this.useSupabase && this.client) {
      try {
        const { data: result, error } = await this.client
          .from(table)
          .insert(data)
          .select();
        
        if (error) throw error;
        return Array.isArray(result) ? result[0] : result;
      } catch (error) {
        logger.error(`Supabase插入失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackInsert(table, data);
      }
    }
    
    return this.fallbackInsert(table, data);
  }
  
  /**
   * 更新数据
   */
  async update(table, id, updates) {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .update(updates)
          .eq('id', id)
          .select();
        
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(`未找到ID为 ${id} 的记录`);
        }
        return data[0];
      } catch (error) {
        logger.error(`Supabase更新失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackUpdate(table, id, updates);
      }
    }
    
    return this.fallbackUpdate(table, id, updates);
  }
  
  /**
   * 删除数据
   */
  async delete(table, id) {
    if (this.useSupabase && this.client) {
      try {
        const { error } = await this.client
          .from(table)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (error) {
        logger.error(`Supabase删除失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackDelete(table, id);
      }
    }
    
    return this.fallbackDelete(table, id);
  }
  
  /**
   * 批量插入
   */
  async batchInsert(table, items) {
    if (this.useSupabase && this.client) {
      try {
        const { data, error } = await this.client
          .from(table)
          .insert(items)
          .select();
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error(`Supabase批量插入失败: ${table}`, error);
        // 降级到文件存储
        return this.fallbackBatchInsert(table, items);
      }
    }
    
    return this.fallbackBatchInsert(table, items);
  }
  
  /**
   * 文件存储降级方法
   */
  async fallbackQuery(table, filters) {
    const data = await storageService.read(table) || [];
    if (Object.keys(filters).length === 0) {
      return data;
    }
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  async fallbackInsert(table, data) {
    return await storageService.add(table, data);
  }
  
  async fallbackUpdate(table, id, updates) {
    return await storageService.update(table, id, updates);
  }
  
  async fallbackDelete(table, id) {
    await storageService.delete(table, id);
    return true;
  }
  
  async fallbackBatchInsert(table, items) {
    const results = [];
    for (const item of items) {
      const result = await storageService.add(table, item);
      results.push(result);
    }
    return results;
  }
  
  /**
   * 检查数据库连接
   */
  async checkConnection() {
    if (this.useSupabase && this.client) {
      try {
        const { error } = await this.client.from('users').select('count').limit(1);
        return !error;
      } catch (error) {
        return false;
      }
    }
    return true; // 文件存储总是可用
  }
}

module.exports = new DatabaseService();






