/**
 * 本地存储服务 - 使用文件系统作为存储
 * 在没有云存储的情况下使用
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

// 数据存储目录
const DATA_DIR = path.join(__dirname, '../../data');

class LocalStorageService {
  constructor() {
    this.data = new Map();
    this.initialized = false;
  }

  async init() {
    try {
      // 确保数据目录存在
      await fs.mkdir(DATA_DIR, { recursive: true });
      this.initialized = true;
      logger.info('✅ 本地存储服务初始化成功');
    } catch (error) {
      logger.error('本地存储服务初始化失败:', error);
    }
  }

  async read(key) {
    try {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      logger.error(`读取本地存储失败: ${key}`, error);
      return [];
    }
  }

  async write(key, data) {
    try {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      logger.error(`写入本地存储失败: ${key}`, error);
      throw error;
    }
  }

  async backup() {
    try {
      const backupDir = path.join(DATA_DIR, 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      
      const allData = {};
      const files = await fs.readdir(DATA_DIR);
      
      for (const file of files) {
        if (file.endsWith('.json') && file !== 'backups') {
          const key = file.replace('.json', '');
          allData[key] = await this.read(key);
        }
      }
      
      await fs.writeFile(backupFile, JSON.stringify(allData, null, 2), 'utf8');
      logger.info(`✅ 备份完成: ${backupFile}`);
      return backupFile;
    } catch (error) {
      logger.error('备份失败:', error);
      throw error;
    }
  }
}

module.exports = new LocalStorageService();

