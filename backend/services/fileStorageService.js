/**
 * 大容量文件存储服务
 * 支持多种存储后端：Supabase Storage、七牛云、阿里云OSS等
 * 自动选择可用的存储服务，支持故障转移
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const path = require('path');
const crypto = require('crypto');

class FileStorageService {
  constructor() {
    this.storageProviders = [];
    this.activeProvider = null;
    this.init();
  }

  async init() {
    logger.info('🔧 开始初始化文件存储服务...');
    logger.info('📋 检查云存储配置...');
    
    // 初始化MinIO（推荐，完全免费开源）
    if (this.initMinIO()) {
      this.storageProviders.push('minio');
      logger.info('✅ MinIO配置已加载');
    } else {
      logger.info('ℹ️ MinIO未配置（需要: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY）');
    }

    // 初始化Cloudflare R2（永久免费10GB）
    if (this.initCloudflareR2()) {
      this.storageProviders.push('cloudflare-r2');
      logger.info('✅ Cloudflare R2配置已加载');
    }

    // 初始化Supabase Storage（永久免费1GB）
    if (this.initSupabaseStorage()) {
      this.storageProviders.push('supabase');
      logger.info('✅ Supabase Storage配置已加载');
    } else {
      logger.info('ℹ️ Supabase Storage未配置（需要: SUPABASE_URL, SUPABASE_ANON_KEY）');
    }

    // 初始化七牛云存储（免费10GB，非永久）
    if (this.initQiniuStorage()) {
      this.storageProviders.push('qiniu');
      logger.info('✅ 七牛云存储配置已加载');
    }

    // 初始化阿里云OSS（可选）
    if (this.initAliyunOSS()) {
      this.storageProviders.push('aliyun');
      logger.info('✅ 阿里云OSS配置已加载');
    }

    // 选择第一个可用的存储提供商（优先使用永久免费的开源方案）
    if (this.storageProviders.length > 0) {
      this.activeProvider = this.storageProviders[0];
      logger.info(`✅ 文件存储服务已初始化，使用: ${this.activeProvider}`);
      logger.info(`📦 可用存储提供商: ${this.storageProviders.join(', ')}`);
    } else {
      logger.warn('⚠️ 未配置任何云存储服务，文件将存储在本地');
      logger.warn('   提示: 请在Zeabur环境变量中配置云存储服务');
    }
  }

  /**
   * 初始化MinIO（完全免费开源对象存储）
   * 容量：无限制（取决于部署平台）
   * GitHub: https://github.com/minio/minio
   */
  initMinIO() {
    try {
      const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
      const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
      const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
      const MINIO_BUCKET = process.env.MINIO_BUCKET || 'pigeonai';
      const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';

      if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
        return false;
      }

      this.minioConfig = {
        endPoint: MINIO_ENDPOINT.replace(/^https?:\/\//, '').split(':')[0],
        port: parseInt(MINIO_ENDPOINT.split(':').pop() || (MINIO_USE_SSL ? '443' : '9000')),
        useSSL: MINIO_USE_SSL,
        accessKey: MINIO_ACCESS_KEY,
        secretKey: MINIO_SECRET_KEY,
        bucket: MINIO_BUCKET
      };
      
      logger.info(`📦 MinIO配置详情: Endpoint=${this.minioConfig.endPoint}:${this.minioConfig.port}, Bucket=${MINIO_BUCKET}, SSL=${MINIO_USE_SSL}`);
      return true;
    } catch (error) {
      logger.warn('MinIO初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 初始化Cloudflare R2（永久免费10GB）
   * 完全免费，无出站费用
   * 文档: https://developers.cloudflare.com/r2/
   */
  initCloudflareR2() {
    try {
      const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
      const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
      const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
      const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'pigeonai';
      const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;

      if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        return false;
      }

      this.r2Config = {
        accountId: R2_ACCOUNT_ID,
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
        bucket: R2_BUCKET,
        endpoint: R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      };
      return true;
    } catch (error) {
      logger.warn('Cloudflare R2初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 初始化Supabase Storage
   * 免费版：1GB存储空间（永久免费）
   * 付费版：25GB起
   */
  initSupabaseStorage() {
    try {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
      const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'files';

      if (!SUPABASE_URL || SUPABASE_URL.includes('your-project') ||
          !SUPABASE_KEY || SUPABASE_KEY.includes('your-anon-key')) {
        return false;
      }

      this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      this.supabaseStorage = this.supabase.storage;
      this.supabaseBucket = SUPABASE_BUCKET;
      
      logger.info(`📦 Supabase Storage配置: ${SUPABASE_URL.substring(0, 30)}..., Bucket: ${SUPABASE_BUCKET}`);
      return true;
    } catch (error) {
      logger.warn('Supabase Storage初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 初始化七牛云存储
   * 免费版：10GB存储空间，国内访问速度快
   * 注册地址：https://www.qiniu.com/
   */
  initQiniuStorage() {
    try {
      const QINIU_ACCESS_KEY = process.env.QINIU_ACCESS_KEY;
      const QINIU_SECRET_KEY = process.env.QINIU_SECRET_KEY;
      const QINIU_BUCKET = process.env.QINIU_BUCKET || 'pigeonai';
      const QINIU_DOMAIN = process.env.QINIU_DOMAIN;

      if (!QINIU_ACCESS_KEY || !QINIU_SECRET_KEY) {
        return false;
      }

      // 七牛云SDK需要单独安装：npm install qiniu
      // 这里先标记为可用，实际使用时再加载
      this.qiniuConfig = {
        accessKey: QINIU_ACCESS_KEY,
        secretKey: QINIU_SECRET_KEY,
        bucket: QINIU_BUCKET,
        domain: QINIU_DOMAIN
      };
      return true;
    } catch (error) {
      logger.warn('七牛云存储初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 初始化阿里云OSS（可选）
   * 免费版：有免费额度，国内访问速度快
   */
  initAliyunOSS() {
    try {
      const ALIYUN_OSS_ACCESS_KEY_ID = process.env.ALIYUN_OSS_ACCESS_KEY_ID;
      const ALIYUN_OSS_ACCESS_KEY_SECRET = process.env.ALIYUN_OSS_ACCESS_KEY_SECRET;
      const ALIYUN_OSS_BUCKET = process.env.ALIYUN_OSS_BUCKET;
      const ALIYUN_OSS_REGION = process.env.ALIYUN_OSS_REGION || 'oss-cn-hangzhou';
      const ALIYUN_OSS_ENDPOINT = process.env.ALIYUN_OSS_ENDPOINT;

      if (!ALIYUN_OSS_ACCESS_KEY_ID || !ALIYUN_OSS_ACCESS_KEY_SECRET || !ALIYUN_OSS_BUCKET) {
        return false;
      }

      this.aliyunConfig = {
        accessKeyId: ALIYUN_OSS_ACCESS_KEY_ID,
        accessKeySecret: ALIYUN_OSS_ACCESS_KEY_SECRET,
        bucket: ALIYUN_OSS_BUCKET,
        region: ALIYUN_OSS_REGION,
        endpoint: ALIYUN_OSS_ENDPOINT
      };
      return true;
    } catch (error) {
      logger.warn('阿里云OSS初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 上传文件
   * @param {Buffer|string} file - 文件内容（Buffer）或本地文件路径
   * @param {string} fileName - 文件名
   * @param {string} folder - 存储文件夹（可选）
   * @returns {Promise<{url: string, key: string}>}
   */
  async uploadFile(file, fileName, folder = '') {
    if (!this.activeProvider) {
      throw new Error('未配置云存储服务');
    }

    // 生成唯一文件名
    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt);
    const uniqueName = `${baseName}_${Date.now()}${fileExt}`;
    const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

    try {
      switch (this.activeProvider) {
        case 'minio':
          return await this.uploadToMinIO(file, filePath);
        case 'cloudflare-r2':
          return await this.uploadToCloudflareR2(file, filePath);
        case 'supabase':
          return await this.uploadToSupabase(file, filePath);
        case 'qiniu':
          return await this.uploadToQiniu(file, filePath);
        case 'aliyun':
          return await this.uploadToAliyun(file, filePath);
        default:
          throw new Error(`不支持的存储提供商: ${this.activeProvider}`);
      }
    } catch (error) {
      logger.error(`上传到${this.activeProvider}失败:`, error);
      // 尝试故障转移到其他提供商
      return await this.failoverUpload(file, filePath);
    }
  }

  /**
   * 上传到MinIO（完全免费开源）
   */
  async uploadToMinIO(file, filePath) {
    try {
      const Minio = require('minio');
      const client = new Minio.Client({
        endPoint: this.minioConfig.endPoint,
        port: this.minioConfig.port,
        useSSL: this.minioConfig.useSSL,
        accessKey: this.minioConfig.accessKey,
        secretKey: this.minioConfig.secretKey
      });

      let fileBuffer = file;
      if (typeof file === 'string') {
        const fs = require('fs').promises;
        fileBuffer = await fs.readFile(file);
      }

      // 确保bucket存在
      const bucketExists = await client.bucketExists(this.minioConfig.bucket);
      if (!bucketExists) {
        await client.makeBucket(this.minioConfig.bucket, 'us-east-1');
      }

      await client.putObject(
        this.minioConfig.bucket,
        filePath,
        fileBuffer,
        fileBuffer.length,
        { 'Content-Type': this.getContentType(filePath) }
      );

      const protocol = this.minioConfig.useSSL ? 'https' : 'http';
      const url = `${protocol}://${this.minioConfig.endPoint}:${this.minioConfig.port}/${this.minioConfig.bucket}/${filePath}`;

      return {
        url: url,
        key: filePath,
        provider: 'minio'
      };
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('MinIO SDK未安装，请运行: npm install minio');
      }
      throw error;
    }
  }

  /**
   * 上传到Cloudflare R2（永久免费10GB）
   */
  async uploadToCloudflareR2(file, filePath) {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const client = new S3Client({
        region: 'auto',
        endpoint: this.r2Config.endpoint,
        credentials: {
          accessKeyId: this.r2Config.accessKeyId,
          secretAccessKey: this.r2Config.secretAccessKey
        }
      });

      let fileBuffer = file;
      if (typeof file === 'string') {
        const fs = require('fs').promises;
        fileBuffer = await fs.readFile(file);
      }

      await client.send(new PutObjectCommand({
        Bucket: this.r2Config.bucket,
        Key: filePath,
        Body: fileBuffer,
        ContentType: this.getContentType(filePath)
      }));

      // R2公共URL格式
      const url = `https://pub-${this.r2Config.accountId}.r2.dev/${filePath}`;

      return {
        url: url,
        key: filePath,
        provider: 'cloudflare-r2'
      };
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('AWS SDK未安装，请运行: npm install @aws-sdk/client-s3');
      }
      throw error;
    }
  }

  /**
   * 上传到Supabase Storage
   */
  async uploadToSupabase(file, filePath) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'files';
    
    // 如果file是字符串路径，读取文件
    let fileBuffer = file;
    if (typeof file === 'string') {
      const fs = require('fs').promises;
      fileBuffer = await fs.readFile(file);
    }

    const { data, error } = await this.supabaseStorage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: this.getContentType(filePath),
        upsert: true
      });

    if (error) throw error;

    // 获取公共URL
    const { data: urlData } = this.supabaseStorage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      key: filePath,
      provider: 'supabase'
    };
  }

  /**
   * 上传到七牛云
   */
  async uploadToQiniu(file, filePath) {
    // 动态加载qiniu模块（如果已安装）
    try {
      const qiniu = require('qiniu');
      const mac = new qiniu.auth.digest.Mac(this.qiniuConfig.accessKey, this.qiniuConfig.secretKey);
      const config = new qiniu.conf.Config();
      const bucketManager = new qiniu.rs.BucketManager(mac, config);
      const formUploader = new qiniu.form_up.FormUploader(config);
      const putPolicy = new qiniu.rs.PutPolicy({ scope: this.qiniuConfig.bucket });
      const uploadToken = putPolicy.uploadToken(mac);

      // 读取文件
      let fileBuffer = file;
      if (typeof file === 'string') {
        const fs = require('fs').promises;
        fileBuffer = await fs.readFile(file);
      }

      return new Promise((resolve, reject) => {
        formUploader.put(uploadToken, filePath, fileBuffer, null, (err, body, info) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (info.statusCode === 200) {
            const url = this.qiniuConfig.domain 
              ? `https://${this.qiniuConfig.domain}/${filePath}`
              : `https://${this.qiniuConfig.bucket}.s3-cn-south-1.qiniucs.com/${filePath}`;
            
            resolve({
              url,
              key: filePath,
              provider: 'qiniu'
            });
          } else {
            reject(new Error(`上传失败: ${info.statusCode}`));
          }
        });
      });
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('七牛云SDK未安装，请运行: npm install qiniu');
      }
      throw error;
    }
  }

  /**
   * 上传到阿里云OSS
   */
  async uploadToAliyun(file, filePath) {
    // 动态加载ali-oss模块（如果已安装）
    try {
      const OSS = require('ali-oss');
      const client = new OSS({
        region: this.aliyunConfig.region,
        accessKeyId: this.aliyunConfig.accessKeyId,
        accessKeySecret: this.aliyunConfig.accessKeySecret,
        bucket: this.aliyunConfig.bucket,
        endpoint: this.aliyunConfig.endpoint
      });

      // 读取文件
      let fileBuffer = file;
      if (typeof file === 'string') {
        const fs = require('fs').promises;
        fileBuffer = await fs.readFile(file);
      }

      const result = await client.put(filePath, fileBuffer);
      return {
        url: result.url,
        key: filePath,
        provider: 'aliyun'
      };
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('阿里云OSS SDK未安装，请运行: npm install ali-oss');
      }
      throw error;
    }
  }

  /**
   * 故障转移上传
   */
  async failoverUpload(file, filePath) {
    const otherProviders = this.storageProviders.filter(p => p !== this.activeProvider);
    
    for (const provider of otherProviders) {
      try {
        const previousProvider = this.activeProvider;
        this.activeProvider = provider;
        logger.info(`尝试故障转移到: ${provider}`);
        
        switch (provider) {
          case 'minio':
            return await this.uploadToMinIO(file, filePath);
          case 'cloudflare-r2':
            return await this.uploadToCloudflareR2(file, filePath);
          case 'supabase':
            return await this.uploadToSupabase(file, filePath);
          case 'qiniu':
            return await this.uploadToQiniu(file, filePath);
          case 'aliyun':
            return await this.uploadToAliyun(file, filePath);
        }
      } catch (error) {
        logger.warn(`${provider}上传也失败:`, error.message);
        continue;
      }
    }
    
    throw new Error('所有存储提供商均不可用');
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath) {
    if (!this.activeProvider) {
      throw new Error('未配置云存储服务');
    }

    try {
      switch (this.activeProvider) {
        case 'minio':
          return await this.deleteFromMinIO(filePath);
        case 'cloudflare-r2':
          return await this.deleteFromCloudflareR2(filePath);
        case 'supabase':
          return await this.deleteFromSupabase(filePath);
        case 'qiniu':
          return await this.deleteFromQiniu(filePath);
        case 'aliyun':
          return await this.deleteFromAliyun(filePath);
      }
    } catch (error) {
      logger.error(`删除文件失败:`, error);
      throw error;
    }
  }

  async deleteFromMinIO(filePath) {
    const Minio = require('minio');
    const client = new Minio.Client({
      endPoint: this.minioConfig.endPoint,
      port: this.minioConfig.port,
      useSSL: this.minioConfig.useSSL,
      accessKey: this.minioConfig.accessKey,
      secretKey: this.minioConfig.secretKey
    });

    await client.removeObject(this.minioConfig.bucket, filePath);
    return true;
  }

  async deleteFromCloudflareR2(filePath) {
    const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({
      region: 'auto',
      endpoint: this.r2Config.endpoint,
      credentials: {
        accessKeyId: this.r2Config.accessKeyId,
        secretAccessKey: this.r2Config.secretAccessKey
      }
    });

    await client.send(new DeleteObjectCommand({
      Bucket: this.r2Config.bucket,
      Key: filePath
    }));
    return true;
  }

  async deleteFromSupabase(filePath) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'files';
    const { error } = await this.supabaseStorage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  }

  async deleteFromQiniu(filePath) {
    const qiniu = require('qiniu');
    const mac = new qiniu.auth.digest.Mac(this.qiniuConfig.accessKey, this.qiniuConfig.secretKey);
    const config = new qiniu.conf.Config();
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    
    return new Promise((resolve, reject) => {
      bucketManager.delete(this.qiniuConfig.bucket, filePath, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(respInfo.statusCode === 200);
      });
    });
  }

  async deleteFromAliyun(filePath) {
    const OSS = require('ali-oss');
    const client = new OSS({
      region: this.aliyunConfig.region,
      accessKeyId: this.aliyunConfig.accessKeyId,
      accessKeySecret: this.aliyunConfig.accessKeySecret,
      bucket: this.aliyunConfig.bucket
    });

    await client.delete(filePath);
    return true;
  }

  /**
   * 获取文件URL
   */
  getFileUrl(filePath) {
    if (!this.activeProvider) {
      return null;
    }

    switch (this.activeProvider) {
      case 'minio':
        const protocol = this.minioConfig.useSSL ? 'https' : 'http';
        return `${protocol}://${this.minioConfig.endPoint}:${this.minioConfig.port}/${this.minioConfig.bucket}/${filePath}`;
      case 'cloudflare-r2':
        return `https://pub-${this.r2Config.accountId}.r2.dev/${filePath}`;
      case 'supabase':
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'files';
        const { data } = this.supabaseStorage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
      case 'qiniu':
        return this.qiniuConfig.domain
          ? `https://${this.qiniuConfig.domain}/${filePath}`
          : `https://${this.qiniuConfig.bucket}.s3-cn-south-1.qiniucs.com/${filePath}`;
      case 'aliyun':
        return `https://${this.aliyunConfig.bucket}.${this.aliyunConfig.region}.aliyuncs.com/${filePath}`;
      default:
        return null;
    }
  }

  /**
   * 获取文件内容类型
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * 检查存储服务是否可用
   */
  isAvailable() {
    return this.activeProvider !== null;
  }

  /**
   * 获取当前使用的存储提供商
   */
  getActiveProvider() {
    return this.activeProvider;
  }

  /**
   * 获取所有可用的存储提供商
   */
  getAvailableProviders() {
    return this.storageProviders;
  }
}

module.exports = new FileStorageService();
