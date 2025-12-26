const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 确保日志目录存在
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'pigeon-data-service' },
  transports: [
    // 错误日志文件
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // 所有日志文件
    new winston.transports.File({ 
      filename: config.logging.file 
    })
  ]
});

// 始终输出到控制台（Zeabur等云平台需要控制台输出）
// 使用简单格式以便在日志查看器中更容易阅读
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      let msg = `${timestamp} [${level.toUpperCase()}] ${message}`;
      if (Object.keys(meta).length > 0 && meta.service !== 'pigeon-data-service') {
        msg += ` ${JSON.stringify(meta)}`;
      }
      return msg;
    })
  )
}));

module.exports = logger;




















