/**
 * 智鸽·中枢管家主入口
 */

const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const adminAgent = require('./core/admin-agent');
const routes = require('./routes/api');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'core-admin',
    uptime: Date.now() - adminAgent.startTime,
    timestamp: Date.now()
  });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error('请求处理错误', err);
  res.status(500).json({
    error: '内部服务器错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
async function start() {
  try {
    // 初始化管理员代理
    const initialized = await adminAgent.initialize();
    if (!initialized) {
      logger.error('管理员代理初始化失败，系统无法启动');
      process.exit(1);
    }

    // 启动HTTP服务器
    app.listen(config.system.port, () => {
      logger.info(`智鸽·中枢管家已启动`);
      logger.info(`服务运行在 http://localhost:${config.system.port}`);
      logger.info(`API文档: http://localhost:${config.system.port}/api/docs`);
    });

  } catch (error) {
    logger.error('启动失败', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭...');
  adminAgent.status = 'shutting_down';
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭...');
  adminAgent.status = 'shutting_down';
  process.exit(0);
});

// 启动
start();









