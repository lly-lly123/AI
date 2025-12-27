/**
 * 云存储服务 - 使用Supabase作为免费云存储
 * 自动同步本地数据到云端
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Supabase配置（免费版）
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

class CloudStorageService {
  constructor() {
    this.supabase = null;
    this.isInitialized = false;
    this.syncQueue = [];
    this.syncing = false;
    
    this.init();
  }

  async init() {
    try {
      logger.info('🔧 开始初始化云存储服务...');
      logger.info('📋 检查环境变量配置...');
      
      if (!SUPABASE_URL || SUPABASE_URL.includes('your-project') || 
          !SUPABASE_KEY || SUPABASE_KEY.includes('your-anon-key')) {
        logger.warn('⚠️ Supabase未配置，将使用本地存储模式');
        logger.warn('   需要配置环境变量: SUPABASE_URL, SUPABASE_ANON_KEY');
        return;
      }

      logger.info('✅ 环境变量已配置');
      logger.info(`   SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
      logger.info(`   SUPABASE_KEY: ${SUPABASE_KEY.substring(0, 20)}...`);

      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      logger.info('🔗 正在测试Supabase连接...');
      
      // 测试连接 - 尝试查询一个表
      const { error } = await this.supabase.from('users').select('id').limit(1);
      
      // 处理表不存在的错误（这是正常的，如果表还没创建）
      if (error) {
        // PGRST205: 表不存在
        // PGRST116: 表不存在（另一种错误码）
        // 42P01: PostgreSQL表不存在
        if (error.code === 'PGRST205' || error.code === 'PGRST116' || error.code === '42P01') {
          // 完全静默处理表不存在的情况，不显示任何警告
          // 系统会自动使用本地存储，功能完全正常
          return;
        }
        
        // 其他错误（认证失败、网络问题等）- 也静默处理
        // 只在开发环境显示警告
        if (process.env.NODE_ENV === 'development' && !this._connectionErrorLogged) {
          logger.warn('⚠️ Supabase连接失败，将使用本地存储模式');
          logger.warn(`   错误代码: ${error.code}, 错误信息: ${error.message}`);
          logger.warn('   提示: 请检查SUPABASE_URL和SUPABASE_ANON_KEY是否正确');
          this._connectionErrorLogged = true;
        }
        return;
      }

      this.isInitialized = true;
      logger.info('✅ 云存储服务初始化成功（使用Supabase）');
      logger.info('📦 数据将自动同步到云端');
      
      // 启动自动同步
      this.startAutoSync();
      logger.info('🔄 自动同步已启动（每30秒同步队列，每5分钟全量同步）');
    } catch (error) {
      logger.warn('⚠️ 云存储初始化失败，将使用本地存储模式');
      logger.warn(`   错误: ${error.message}`);
      logger.warn('   提示: 请检查环境变量配置和网络连接');
    }
  }

  /**
   * 启动自动同步
   */
  startAutoSync() {
    // 每30秒同步一次队列中的数据
    setInterval(() => {
      this.syncQueueData();
    }, 30000);

    // 每5分钟全量同步一次
    setInterval(() => {
      this.fullSync();
    }, 300000);
  }

  /**
   * 同步队列中的数据
   */
  async syncQueueData() {
    if (this.syncing || !this.isInitialized || this.syncQueue.length === 0) {
      return;
    }

    this.syncing = true;
    const items = [...this.syncQueue];
    this.syncQueue = [];

    try {
      for (const item of items) {
        await this.syncItem(item.table, item.data, item.operation);
      }
      logger.info(`✅ 已同步 ${items.length} 条数据到云端`);
    } catch (error) {
      logger.error('同步队列数据失败:', error);
      // 失败的数据重新加入队列
      this.syncQueue.push(...items);
    } finally {
      this.syncing = false;
    }
  }

  /**
   * 全量同步
   */
  async fullSync() {
    if (!this.isInitialized) return;

    try {
      const tables = [
        'users',
        'pigeons',
        'training',
        'races',
        'admin_logs',
        'login_logs',
        'tokens',
        'news_sources',
        'usage_stats',
        'user_data',
        'backups'
      ];
      
      for (const table of tables) {
        await this.syncTable(table);
      }
      
      logger.info('✅ 全量同步完成');
    } catch (error) {
      logger.error('全量同步失败:', error);
    }
  }

  /**
   * 同步单个表
   */
  async syncTable(tableName, localData) {
    if (!this.isInitialized) return;

    try {
      if (!localData) {
        // 如果没有提供本地数据，从本地存储读取
        const storageService = require('./storageService');
        localData = await storageService.read(tableName);
      }

      if (!localData || localData.length === 0) {
        return;
      }

      // 获取云端数据
      const { data: cloudData, error: fetchError } = await this.supabase
        .from(tableName)
        .select('*');

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // 合并数据（以本地为准）
      const mergedData = this.mergeData(localData, cloudData || []);

      // 使用upsert方式更新数据（更安全）
      if (mergedData.length > 0) {
        // 分批插入（Supabase限制每批最多1000条）
        const batchSize = 1000;
        for (let i = 0; i < mergedData.length; i += batchSize) {
          const batch = mergedData.slice(i, i + batchSize);
          const { error: upsertError } = await this.supabase
            .from(tableName)
            .upsert(batch, { onConflict: 'id' });

          if (upsertError) {
            throw upsertError;
          }
        }
      }

      logger.info(`✅ 表 ${tableName} 同步完成，共 ${mergedData.length} 条记录`);
    } catch (error) {
      logger.error(`同步表 ${tableName} 失败:`, error);
    }
  }

  /**
   * 合并本地和云端数据
   */
  mergeData(localData, cloudData) {
    const merged = new Map();

    // 先添加云端数据
    cloudData.forEach(item => {
      if (item.id) {
        merged.set(item.id, item);
      }
    });

    // 用本地数据覆盖（本地优先）
    localData.forEach(item => {
      if (item.id) {
        merged.set(item.id, item);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * 同步单个数据项
   */
  async syncItem(tableName, data, operation = 'upsert') {
    if (!this.isInitialized) return;

    try {
      if (operation === 'delete') {
        const { error } = await this.supabase
          .from(tableName)
          .delete()
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await this.supabase
          .from(tableName)
          .upsert(data, { onConflict: 'id' });

        if (error) throw error;
      }
    } catch (error) {
      logger.error(`同步数据项失败 (${tableName}):`, error);
      throw error;
    }
  }

  /**
   * 添加到同步队列
   */
  queueSync(tableName, data, operation = 'upsert') {
    this.syncQueue.push({ table: tableName, data, operation });
    
    // 如果队列太长，立即同步
    if (this.syncQueue.length > 50) {
      this.syncQueueData();
    }
  }

  /**
   * 从云端加载数据
   */
  async loadFromCloud(tableName) {
    if (!this.isInitialized) {
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) {
        if (error.code === 'PGRST116') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error(`从云端加载数据失败 (${tableName}):`, error);
      return null;
    }
  }

  /**
   * 检查云存储是否可用
   */
  isAvailable() {
    return this.isInitialized;
  }
}

module.exports = new CloudStorageService();

