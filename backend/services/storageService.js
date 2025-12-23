const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const cloudStorageService = require('./cloudStorageService');

// 数据存储目录
const DATA_DIR = path.join(__dirname, '../../data');
const STORAGE_FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  pigeons: path.join(DATA_DIR, 'pigeons.json'),
  training: path.join(DATA_DIR, 'training.json'),
  races: path.join(DATA_DIR, 'races.json'),
  adminLogs: path.join(DATA_DIR, 'admin_logs.json'),
  loginLogs: path.join(DATA_DIR, 'login_logs.json'),
  tokens: path.join(DATA_DIR, 'tokens.json'),
  newsSources: path.join(DATA_DIR, 'news_sources.json'),
  usageStats: path.join(DATA_DIR, 'usage_stats.json'),
  user_data: path.join(DATA_DIR, 'user_data.json'),
  backups: path.join(DATA_DIR, 'backups.json'),
  evo_settings: path.join(DATA_DIR, 'evo_settings.json'),
  // AI密钥与模型配置（用于Evo与中枢管家）
  ai_settings: path.join(DATA_DIR, 'ai_settings.json'),
  // 用户意见与反馈
  feedbacks: path.join(DATA_DIR, 'feedbacks.json')
};

function defaultContentFor(key) {
  // ai_settings 需要对象，其余默认数组
  return key === 'ai_settings' ? {} : [];
}

class StorageService {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // 确保数据目录存在
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      // 初始化所有存储文件
      for (const [key, filePath] of Object.entries(STORAGE_FILES)) {
        try {
          await fs.access(filePath);
          // 文件存在，检查是否为空
          const data = await fs.readFile(filePath, 'utf8');
          if (!data || data.trim() === '' || data.trim() === '[]' || data.trim() === '{}') {
            // 文件为空，尝试从云端恢复
            await this.restoreFromCloud(key);
          }
        } catch {
          // 文件不存在，先尝试从云端恢复，失败则创建空文件
          const restored = await this.restoreFromCloud(key);
          if (!restored) {
            await fs.writeFile(filePath, JSON.stringify(defaultContentFor(key), null, 2), 'utf8');
          }
        }
      }
      
      logger.info('存储服务初始化完成');
    } catch (error) {
      logger.error('存储服务初始化失败', error);
    }
  }

  /**
   * 从云端恢复数据
   */
  async restoreFromCloud(fileKey) {
    try {
      if (!cloudStorageService.isAvailable()) {
        return false;
      }

      logger.info(`尝试从云端恢复数据: ${fileKey}`);
      const cloudData = await cloudStorageService.loadFromCloud(fileKey);
      
      if (cloudData && cloudData.length > 0) {
        const filePath = STORAGE_FILES[fileKey];
        await fs.writeFile(filePath, JSON.stringify(cloudData, null, 2), 'utf8');
        logger.info(`✅ 已从云端恢复 ${fileKey}，共 ${cloudData.length} 条记录`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.warn(`从云端恢复 ${fileKey} 失败:`, error.message);
      return false;
    }
  }

  async read(fileKey) {
    try {
      const filePath = STORAGE_FILES[fileKey];
      if (!filePath) {
        throw new Error(`未知的存储键: ${fileKey}`);
      }
      
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      logger.error(`读取存储失败: ${fileKey}`, error);
      throw error;
    }
  }

  async write(fileKey, data) {
    try {
      const filePath = STORAGE_FILES[fileKey];
      if (!filePath) {
        throw new Error(`未知的存储键: ${fileKey}`);
      }
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      // 自动同步到云端
      if (cloudStorageService.isAvailable()) {
        cloudStorageService.queueSync(fileKey, data, 'upsert');
      }
      
      return true;
    } catch (error) {
      logger.error(`写入存储失败: ${fileKey}`, error);
      throw error;
    }
  }

  async find(fileKey, predicate) {
    const data = await this.read(fileKey);
    return data.find(predicate);
  }

  async filter(fileKey, predicate) {
    const data = await this.read(fileKey);
    return data.filter(predicate);
  }

  async add(fileKey, item) {
    const data = await this.read(fileKey);
    const newItem = {
      ...item,
      id: item.id || this.generateId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newItem);
    await this.write(fileKey, data);
    
    // 同步单个新项到云端
    if (cloudStorageService.isAvailable()) {
      cloudStorageService.queueSync(fileKey, newItem, 'upsert');
    }
    
    return newItem;
  }

  async update(fileKey, id, updates) {
    const data = await this.read(fileKey);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`未找到ID为 ${id} 的记录`);
    }
    
    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.write(fileKey, data);
    return data[index];
  }

  async delete(fileKey, id) {
    const data = await this.read(fileKey);
    const itemToDelete = data.find(item => item.id === id);
    const filtered = data.filter(item => item.id !== id);
    await this.write(fileKey, filtered);
    
    // 同步删除操作到云端
    if (cloudStorageService.isAvailable() && itemToDelete) {
      cloudStorageService.queueSync(fileKey, itemToDelete, 'delete');
    }
    
    return true;
  }

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new StorageService();


















