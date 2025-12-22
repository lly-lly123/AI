const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const config = require('./config/config');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');
const cron = require('node-cron');
const dataService = require('./services/dataService');
const authService = require('./services/authService');
const storageService = require('./services/storageService');
const { apiLimiter, strictLimiter, aiLimiter } = require('./middleware/rateLimiter');

const app = express();

// 安全头设置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API限流
app.use('/api/', apiLimiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);
app.use('/api/evo/', aiLimiter);

// 静态文件服务 - 提供前端页面（指向上级目录）
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API路由（必须在静态文件服务之前）
app.use('/api', apiRoutes);

// 错误处理
app.use((err, req, res, next) => {
  logger.error('服务器错误', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: config.server.env === 'development' ? err.message : '请稍后重试'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 定时任务：自动更新数据
// 每5分钟更新一次进行中的赛事
cron.schedule('*/5 * * * *', async () => {
  logger.info('定时任务：更新进行中的赛事');
  try {
    await dataService.refreshEvents();
  } catch (error) {
    logger.error('定时更新赛事失败', error);
  }
});

// 每小时更新一次资讯
cron.schedule('0 * * * *', async () => {
  logger.info('定时任务：更新资讯');
  try {
    await dataService.refreshNews();
  } catch (error) {
    logger.error('定时更新资讯失败', error);
  }
});

// 每天凌晨3点自动备份数据
cron.schedule('0 3 * * *', async () => {
  logger.info('定时任务：自动备份数据');
  try {
    const userDataList = await storageService.read('user_data') || [];
    const users = await storageService.read('users') || [];
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      }),
      userData: userDataList,
      totalUsers: users.length,
      totalDataRecords: userDataList.length
    };

    // 保存备份
    const backupKey = `backup_${Date.now()}`;
    const backups = await storageService.read('backups') || [];
    backups.push({
      id: backupKey,
      ...backup
    });

    // 只保留最近30个备份
    if (backups.length > 30) {
      backups.shift();
    }

    await storageService.write('backups', backups);

    logger.info('数据备份完成', {
      backupId: backupKey,
      totalUsers: backup.totalUsers,
      totalDataRecords: backup.totalDataRecords
    });
  } catch (error) {
    logger.error('自动备份失败', error);
  }
});

// 初始化默认管理员账户
async function initDefaultAdmin() {
  try {
    const existingAdmin = await storageService.find('users', u => u.username === 'admin');
    
    if (!existingAdmin) {
      logger.info('创建默认管理员账户...');
      await authService.createUser({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      logger.info('✅ 默认管理员账户已创建');
      logger.info('   用户名: admin');
      logger.info('   密码: admin123');
      logger.info('   ⚠️  请首次登录后立即修改密码！');
    } else {
      logger.info('默认管理员账户已存在');
    }
  } catch (error) {
    logger.error('初始化默认管理员账户失败', error);
  }
}

// 启动服务器（仅在非Vercel环境）
if (!process.env.VERCEL) {
  const PORT = config.server.port || 3000;
  app.listen(PORT, async () => {
    logger.info(`服务器启动成功，端口: ${PORT}`);
    logger.info(`环境: ${config.server.env}`);
    
    // 初始化默认管理员账户
    await initDefaultAdmin();
    
    // 启动时预加载数据
    try {
      logger.info('预加载数据...');
      await dataService.fetchNews();
      await dataService.fetchEvents();
      logger.info('数据预加载完成');
    } catch (error) {
      logger.error('数据预加载失败', error);
    }
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    logger.info('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
  });
} else {
  // Vercel环境：初始化但不启动服务器
  (async () => {
    await initDefaultAdmin();
  })();
}

module.exports = app;


















      logger.info('   用户名: admin');
      logger.info('   密码: admin123');
      logger.info('   ⚠️  请首次登录后立即修改密码！');
    } else {
      logger.info('默认管理员账户已存在');
    }
  } catch (error) {
    logger.error('初始化默认管理员账户失败', error);
  }
}

// 启动服务器（仅在非Vercel环境）
if (!process.env.VERCEL) {
  const PORT = config.server.port || 3000;
  app.listen(PORT, async () => {
    logger.info(`服务器启动成功，端口: ${PORT}`);
    logger.info(`环境: ${config.server.env}`);
    
    // 初始化默认管理员账户
    await initDefaultAdmin();
    
    // 启动时预加载数据
    try {
      logger.info('预加载数据...');
      await dataService.fetchNews();
      await dataService.fetchEvents();
      logger.info('数据预加载完成');
    } catch (error) {
      logger.error('数据预加载失败', error);
    }
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    logger.info('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
  });
} else {
  // Vercel环境：初始化但不启动服务器
  (async () => {
    await initDefaultAdmin();
  })();
}

module.exports = app;


















      logger.info('   用户名: admin');
      logger.info('   密码: admin123');
      logger.info('   ⚠️  请首次登录后立即修改密码！');
    } else {
      logger.info('默认管理员账户已存在');
    }
  } catch (error) {
    logger.error('初始化默认管理员账户失败', error);
  }
}

// 启动服务器（仅在非Vercel环境）
if (!process.env.VERCEL) {
  const PORT = config.server.port || 3000;
  app.listen(PORT, async () => {
    logger.info(`服务器启动成功，端口: ${PORT}`);
    logger.info(`环境: ${config.server.env}`);
    
    // 初始化默认管理员账户
    await initDefaultAdmin();
    
    // 启动时预加载数据
    try {
      logger.info('预加载数据...');
      await dataService.fetchNews();
      await dataService.fetchEvents();
      logger.info('数据预加载完成');
    } catch (error) {
      logger.error('数据预加载失败', error);
    }
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    logger.info('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
  });
} else {
  // Vercel环境：初始化但不启动服务器
  (async () => {
    await initDefaultAdmin();
  })();
}

module.exports = app;

















