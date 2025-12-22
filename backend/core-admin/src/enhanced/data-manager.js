/**
 * 数据管理增强模块
 * 自动数据清理、质量监控、智能备份
 */

const logger = require('../utils/logger');
const path = require('path');
const storageService = require(path.join(__dirname, '../../../services/storageService'));
const fs = require('fs').promises;

class DataManager {
  constructor() {
    this.qualityRules = {
      // 数据完整性规则
      requiredFields: {
        pigeons: ['ringNumber', 'name', 'type'],
        races: ['name', 'date', 'location'],
        training: ['pigeonId', 'date', 'distance']
      },
      
      // 数据质量阈值
      duplicateThreshold: 0.95, // 相似度超过95%视为重复
      completenessThreshold: 0.8, // 完整度低于80%视为不完整
      
      // 数据保留策略
      retentionDays: {
        logs: 90, // 日志保留90天
        backups: 365, // 备份保留365天
        temp: 7 // 临时文件保留7天
      }
    };
    
    this.backupSchedule = {
      frequency: 'daily', // daily, weekly, monthly
      time: '02:00', // 备份时间
      maxBackups: 30 // 最多保留30个备份
    };
    
    this.qualityReports = [];
  }

  /**
   * 检查数据质量
   */
  async checkDataQuality() {
    try {
      const reports = {
        pigeons: await this.checkPigeonDataQuality(),
        races: await this.checkRaceDataQuality(),
        training: await this.checkTrainingDataQuality(),
        users: await this.checkUserDataQuality()
      };
      
      const overallScore = this.calculateOverallScore(reports);
      
      const report = {
        timestamp: Date.now(),
        overallScore,
        reports,
        issues: this.collectIssues(reports),
        recommendations: this.generateQualityRecommendations(reports)
      };
      
      this.qualityReports.push(report);
      
      // 只保留最近100个报告
      if (this.qualityReports.length > 100) {
        this.qualityReports.shift();
      }
      
      return report;
    } catch (error) {
      logger.error('检查数据质量失败', error);
      throw error;
    }
  }

  /**
   * 检查鸽子数据质量
   */
  async checkPigeonDataQuality() {
    const pigeons = await storageService.read('pigeons') || [];
    const issues = [];
    let completeCount = 0;
    
    pigeons.forEach((pigeon, index) => {
      const required = this.qualityRules.requiredFields.pigeons;
      const missing = required.filter(field => !pigeon[field]);
      
      if (missing.length > 0) {
        issues.push({
          type: 'missing_fields',
          recordId: pigeon.id || index,
          fields: missing,
          severity: 'medium'
        });
      } else {
        completeCount++;
      }
      
      // 检查数据合理性
      if (pigeon.birthDate) {
        const birthDate = new Date(pigeon.birthDate);
        if (birthDate > new Date()) {
          issues.push({
            type: 'invalid_date',
            recordId: pigeon.id || index,
            field: 'birthDate',
            value: pigeon.birthDate,
            severity: 'high'
          });
        }
      }
    });
    
    const completeness = pigeons.length > 0 ? completeCount / pigeons.length : 0;
    
    return {
      total: pigeons.length,
      complete: completeCount,
      incomplete: pigeons.length - completeCount,
      completeness,
      issues,
      score: completeness * 0.7 + (issues.length === 0 ? 0.3 : Math.max(0, 0.3 - issues.length * 0.05))
    };
  }

  /**
   * 检查比赛数据质量
   */
  async checkRaceDataQuality() {
    const races = await storageService.read('races') || [];
    const issues = [];
    let completeCount = 0;
    
    races.forEach((race, index) => {
      const required = this.qualityRules.requiredFields.races;
      const missing = required.filter(field => !race[field]);
      
      if (missing.length > 0) {
        issues.push({
          type: 'missing_fields',
          recordId: race.id || index,
          fields: missing,
          severity: 'medium'
        });
      } else {
        completeCount++;
      }
      
      // 检查日期逻辑
      if (race.startDate && race.endDate) {
        const start = new Date(race.startDate);
        const end = new Date(race.endDate);
        if (start > end) {
          issues.push({
            type: 'invalid_date_range',
            recordId: race.id || index,
            severity: 'high'
          });
        }
      }
    });
    
    const completeness = races.length > 0 ? completeCount / races.length : 0;
    
    return {
      total: races.length,
      complete: completeCount,
      incomplete: races.length - completeCount,
      completeness,
      issues,
      score: completeness * 0.7 + (issues.length === 0 ? 0.3 : Math.max(0, 0.3 - issues.length * 0.05))
    };
  }

  /**
   * 检查训练数据质量
   */
  async checkTrainingDataQuality() {
    const training = await storageService.read('training') || [];
    const issues = [];
    let completeCount = 0;
    
    training.forEach((record, index) => {
      const required = this.qualityRules.requiredFields.training;
      const missing = required.filter(field => !record[field]);
      
      if (missing.length > 0) {
        issues.push({
          type: 'missing_fields',
          recordId: record.id || index,
          fields: missing,
          severity: 'medium'
        });
      } else {
        completeCount++;
      }
      
      // 检查距离合理性
      if (record.distance && (record.distance < 0 || record.distance > 2000)) {
        issues.push({
          type: 'invalid_value',
          recordId: record.id || index,
          field: 'distance',
          value: record.distance,
          severity: 'medium'
        });
      }
    });
    
    const completeness = training.length > 0 ? completeCount / training.length : 0;
    
    return {
      total: training.length,
      complete: completeCount,
      incomplete: training.length - completeCount,
      completeness,
      issues,
      score: completeness * 0.7 + (issues.length === 0 ? 0.3 : Math.max(0, 0.3 - issues.length * 0.05))
    };
  }

  /**
   * 检查用户数据质量
   */
  async checkUserDataQuality() {
    const users = await storageService.read('users') || [];
    const issues = [];
    
    users.forEach((user, index) => {
      // 检查必需字段
      if (!user.username || !user.email) {
        issues.push({
          type: 'missing_fields',
          recordId: user.id || index,
          fields: !user.username ? ['username'] : ['email'],
          severity: 'high'
        });
      }
      
      // 检查邮箱格式
      if (user.email && !this.isValidEmail(user.email)) {
        issues.push({
          type: 'invalid_email',
          recordId: user.id || index,
          value: user.email,
          severity: 'medium'
        });
      }
    });
    
    const validCount = users.length - issues.length;
    const completeness = users.length > 0 ? validCount / users.length : 0;
    
    return {
      total: users.length,
      valid: validCount,
      invalid: issues.length,
      completeness,
      issues,
      score: completeness
    };
  }

  /**
   * 检测重复数据
   */
  async detectDuplicates(dataType) {
    try {
      const data = await storageService.read(dataType) || [];
      const duplicates = [];
      
      // 使用简单的相似度算法检测重复
      for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
          const similarity = this.calculateSimilarity(data[i], data[j]);
          if (similarity >= this.qualityRules.duplicateThreshold) {
            duplicates.push({
              record1: { id: data[i].id || i, data: data[i] },
              record2: { id: data[j].id || j, data: data[j] },
              similarity
            });
          }
        }
      }
      
      return {
        total: data.length,
        duplicates: duplicates.length,
        pairs: duplicates
      };
    } catch (error) {
      logger.error('检测重复数据失败', error);
      throw error;
    }
  }

  /**
   * 自动清理过期数据
   */
  async autoCleanup() {
    try {
    const cleanupReport = {
      timestamp: Date.now(),
      cleaned: {},
      errors: []
    };
    
    // 清理过期日志
    try {
      const logs = await storageService.read('admin_logs') || [];
      const cutoffDate = Date.now() - (this.qualityRules.retentionDays.logs * 24 * 60 * 60 * 1000);
      const filtered = logs.filter(log => 
        new Date(log.timestamp).getTime() > cutoffDate
      );
      
      if (filtered.length < logs.length) {
        await storageService.write('admin_logs', filtered);
        cleanupReport.cleaned.logs = logs.length - filtered.length;
      }
    } catch (error) {
      cleanupReport.errors.push({ type: 'logs', error: error.message });
    }
    
    // 清理过期备份
    try {
      const backupDir = path.join(__dirname, '../../../data/backups');
      const files = await fs.readdir(backupDir).catch(() => []);
      const cutoffDate = Date.now() - (this.qualityRules.retentionDays.backups * 24 * 60 * 60 * 1000);
      
      let cleanedBackups = 0;
      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath).catch(() => null);
        if (stats && stats.mtime.getTime() < cutoffDate) {
          await fs.unlink(filePath);
          cleanedBackups++;
        }
      }
      
      cleanupReport.cleaned.backups = cleanedBackups;
    } catch (error) {
      cleanupReport.errors.push({ type: 'backups', error: error.message });
    }
    
    return cleanupReport;
    } catch (error) {
      logger.error('自动清理失败', error);
      throw error;
    }
  }

  /**
   * 智能备份
   */
  async performBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(__dirname, '../../../data/backups');
      
      // 确保备份目录存在
      await fs.mkdir(backupDir, { recursive: true });
      
      // 备份所有数据文件
      const dataFiles = ['pigeons', 'races', 'training', 'users', 'user_data'];
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        files: {}
      };
      
      for (const file of dataFiles) {
        try {
          const data = await storageService.read(file);
          backup.files[file] = data || [];
        } catch (error) {
          logger.warn(`备份文件 ${file} 失败`, error);
        }
      }
      
      // 保存备份文件
      const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
      await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
      
      // 清理旧备份
      await this.cleanupOldBackups();
      
      return {
        success: true,
        backupPath,
        timestamp: backup.timestamp,
        fileCount: Object.keys(backup.files).length
      };
    } catch (error) {
      logger.error('执行备份失败', error);
      throw error;
    }
  }

  /**
   * 清理旧备份
   */
  async cleanupOldBackups() {
    try {
      const backupDir = path.join(__dirname, '../../../data/backups');
      const files = await fs.readdir(backupDir).catch(() => []);
      
      // 按修改时间排序
      const fileStats = await Promise.all(
        files.map(async file => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath).catch(() => null);
          return { file, path: filePath, mtime: stats?.mtime.getTime() || 0 };
        })
      );
      
      fileStats.sort((a, b) => b.mtime - a.mtime);
      
      // 删除超出限制的备份
      if (fileStats.length > this.backupSchedule.maxBackups) {
        const toDelete = fileStats.slice(this.backupSchedule.maxBackups);
        for (const file of toDelete) {
          await fs.unlink(file.path);
        }
        return toDelete.length;
      }
      
      return 0;
    } catch (error) {
      logger.error('清理旧备份失败', error);
      return 0;
    }
  }

  // ========== 辅助方法 ==========

  calculateOverallScore(reports) {
    const scores = Object.values(reports).map(r => r.score || 0);
    return scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
  }

  collectIssues(reports) {
    const issues = [];
    Object.values(reports).forEach(report => {
      if (report.issues) {
        issues.push(...report.issues);
      }
    });
    return issues;
  }

  generateQualityRecommendations(reports) {
    const recommendations = [];
    
    Object.entries(reports).forEach(([type, report]) => {
      if (report.completeness < this.qualityRules.completenessThreshold) {
        recommendations.push({
          type: 'completeness',
          dataType: type,
          priority: 'high',
          message: `${type}数据完整度较低(${(report.completeness * 100).toFixed(1)}%)，建议补充缺失字段`,
          action: `review_${type}_data`
        });
      }
      
      if (report.issues && report.issues.length > 0) {
        const highSeverityIssues = report.issues.filter(i => i.severity === 'high');
        if (highSeverityIssues.length > 0) {
          recommendations.push({
            type: 'data_quality',
            dataType: type,
            priority: 'high',
            message: `${type}数据存在${highSeverityIssues.length}个高严重性问题`,
            action: `fix_${type}_issues`
          });
        }
      }
    });
    
    return recommendations;
  }

  calculateSimilarity(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const commonKeys = keys1.filter(k => keys2.includes(k));
    
    if (commonKeys.length === 0) return 0;
    
    let matches = 0;
    commonKeys.forEach(key => {
      if (obj1[key] === obj2[key]) {
        matches++;
      } else if (typeof obj1[key] === 'string' && typeof obj2[key] === 'string') {
        // 字符串相似度
        const similarity = this.stringSimilarity(obj1[key], obj2[key]);
        if (similarity > 0.8) matches += similarity;
      }
    });
    
    return matches / commonKeys.length;
  }

  stringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * 获取数据管理统计
   */
  getStats() {
    return {
      qualityReports: this.qualityReports.length,
      lastReport: this.qualityReports[this.qualityReports.length - 1] || null,
      backupSchedule: this.backupSchedule
    };
  }
}

module.exports = new DataManager();

