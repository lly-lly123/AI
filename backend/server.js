const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// 安全头设置 - 禁用CSP以允许内联事件处理器（应用中有大量onclick等内联事件）
app.use(helmet({
  contentSecurityPolicy: false,  // 完全禁用CSP，因为应用使用大量内联事件处理器
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点（在限流之前，确保Zeabur等平台可以检查服务状态）
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'pigeon-data-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: config.server.port,
    env: config.server.env
  });
});

// API限流
app.use('/api/', apiLimiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);
app.use('/api/evo/', aiLimiter);

// API路由（必须在静态文件服务之前）
app.use('/api', apiRoutes);

// 静态文件路径配置
// 自动检测前端文件位置
function findFrontendPath() {
  // Zeabur配置：rootDirectory=".", startCommand="cd backend && npm start"
  // 所以：工作目录是项目根目录，但server.js在backend目录运行
  // 因此index.html应该在项目根目录（__dirname的上级）
  
  const possiblePaths = [
    path.join(__dirname, '..'),  // Zeabur/本地开发: 项目根目录（最可能）
    __dirname,  // Docker: /app (与server.js同级)
    process.cwd(),  // 当前工作目录（Zeabur中可能是项目根目录）
    path.join(process.cwd(), '..'),  // 工作目录的上级
    path.resolve(__dirname, '..'),  // 绝对路径：项目根目录
    path.resolve(process.cwd())  // 绝对路径：当前工作目录
  ];
  
  logger.info('🔍 开始检测前端文件路径', {
    __dirname: __dirname,
    processCwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV
  });
  
  // 检查哪个路径包含index.html
  for (const testPath of possiblePaths) {
    const indexPath = path.join(testPath, 'index.html');
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    
    logger.debug('检测路径', {
      testPath: testPath,
      indexPath: indexPath,
      indexPathResolved: indexPathResolved,
      exists: exists
    });
    
    if (exists) {
      const files = fs.readdirSync(testPath).slice(0, 5);
      logger.info('✅ 找到前端文件路径', { 
        path: testPath, 
        indexPath: indexPathResolved,
        files: files
      });
      return testPath;
    }
  }
  
  // 如果都找不到，默认使用上级目录
  const defaultPath = path.join(__dirname, '..');
  logger.error('❌ 未找到index.html，使用默认路径', { 
    defaultPath: defaultPath,
    triedPaths: possiblePaths.map(p => path.join(p, 'index.html'))
  });
  return defaultPath;
}

const frontendPath = findFrontendPath();

// 记录路径信息（用于调试）
const finalIndexPath = path.join(frontendPath, 'index.html');
const finalIndexPathResolved = path.resolve(finalIndexPath);
const finalIndexExists = fs.existsSync(finalIndexPathResolved);

logger.info('📁 前端文件路径配置完成', {
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendPath: frontendPath,
  __dirname: __dirname,
  indexPath: finalIndexPathResolved,
  exists: finalIndexExists
});

// 移动端设备检测和自动跳转（在静态文件服务之前）
app.get('/', (req, res, next) => {
  logger.debug('🌐 根路径请求', { path: req.path, url: req.url });
  
  const userAgent = req.get('user-agent') || '';
  const ua = userAgent.toLowerCase();
  
  // 检测移动设备
  const mobileKeywords = [
    'iphone', 'ipad', 'ipod',
    'android',
    'mobile', 'tablet',
    'blackberry', 'windows phone',
    'opera mini', 'opera mobi',
    'iemobile'
  ];
  
  const isMobile = mobileKeywords.some(keyword => ua.includes(keyword));
  
  // 如果是移动设备且不是访问 mobile.html，重定向到 mobile.html
  if (isMobile && !req.path.includes('mobile.html')) {
    logger.info('📱 移动设备，重定向到 mobile.html');
    return res.redirect('/mobile.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  }
  
  // 对于PC端，明确返回index.html
  // 尝试多个可能的路径
  const possibleIndexPaths = [
    path.resolve(frontendPath, 'index.html'),
    path.resolve(__dirname, '..', 'index.html'),
    path.resolve(process.cwd(), 'index.html'),
    path.join(frontendPath, 'index.html'),
    path.join(__dirname, '..', 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];
  
  for (const indexPath of possibleIndexPaths) {
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    
    if (exists) {
      logger.info('✅ 根路径请求 - 返回index.html', {
        path: req.path,
        indexPath: indexPathResolved,
        exists: true
      });
      return res.sendFile(indexPathResolved);
    }
  }
  
  // 如果都找不到，记录警告但继续（让静态文件服务或404处理）
  logger.warn('⚠️ 根路径请求 - index.html不存在', {
    path: req.path,
    triedPaths: possibleIndexPaths
  });
  
  next();
});

// 处理简化路由（在HTML文件路由之前）
// /admin -> 直接返回 admin.html（不重定向，避免路由问题）
app.all('/admin', (req, res, next) => {
  logger.debug('🔄 [路由处理] /admin -> 直接返回 admin.html', {
    method: req.method,
    path: req.path,
    url: req.url
  });
  
  // 尝试所有可能的路径查找admin.html
  const possibleAdminPaths = [
    path.resolve(frontendPath, 'admin.html'),
    path.resolve(__dirname, '..', 'admin.html'),
    path.resolve(process.cwd(), 'admin.html'),
    path.join(frontendPath, 'admin.html'),
    path.join(__dirname, '..', 'admin.html'),
    path.join(process.cwd(), 'admin.html'),
    path.join(__dirname, 'admin.html'),
    path.resolve(__dirname, 'admin.html')
  ];
  
  for (const adminPath of possibleAdminPaths) {
    const adminPathResolved = path.resolve(adminPath);
    const exists = fs.existsSync(adminPathResolved);
    
    if (exists) {
      logger.info('✅ [Admin路由] 找到 admin.html', {
        method: req.method,
        path: req.path,
        adminPath: adminPathResolved
      });
      // 确保设置正确的Content-Type
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(adminPathResolved);
    }
  }
  
  logger.warn('⚠️ [Admin路由] 未找到 admin.html', {
    method: req.method,
    path: req.path,
    triedPaths: possibleAdminPaths
  });
  
  next();
});

// 专门处理HTML文件请求（在静态文件服务之前，使用use确保所有HTTP方法都匹配）
// 处理 /admin.html, /mobile.html 等
app.use(/^\/([^\/]+\.html)$/, (req, res, next) => {
  const htmlFileName = req.path.substring(1); // 移除开头的 /
  logger.debug(`📄 [HTML路由] 请求: ${htmlFileName}`, { method: req.method });
  
  // 尝试所有可能的路径查找HTML文件
  const possibleHtmlPaths = [
    path.resolve(frontendPath, htmlFileName),
    path.resolve(__dirname, '..', htmlFileName),
    path.resolve(process.cwd(), htmlFileName),
    path.join(frontendPath, htmlFileName),
    path.join(__dirname, '..', htmlFileName),
    path.join(process.cwd(), htmlFileName),
    path.join(__dirname, htmlFileName),
    path.resolve(__dirname, htmlFileName)
  ];
  
  for (const htmlPath of possibleHtmlPaths) {
    const htmlPathResolved = path.resolve(htmlPath);
    const exists = fs.existsSync(htmlPathResolved);
    
    if (exists) {
      logger.info(`✅ [HTML路由] 找到 ${htmlFileName}`, {
        path: req.path,
        method: req.method,
        htmlPath: htmlPathResolved
      });
      // 确保设置正确的Content-Type
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(htmlPathResolved);
    }
  }
  
  logger.warn(`⚠️ [HTML路由] 未找到 ${htmlFileName}`, {
    path: req.path,
    method: req.method,
    triedPaths: possibleHtmlPaths
  });
  
  next();
});

// 静态文件服务 - 提供前端页面
logger.info('📂 配置静态文件服务', {
  frontendPath: frontendPath,
  exists: fs.existsSync(frontendPath),
  indexExists: fs.existsSync(path.join(frontendPath, 'index.html')),
  files: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath).slice(0, 10) : []
});

// 配置静态文件服务
// 创建静态文件中间件
const staticMiddleware = express.static(frontendPath, {
  index: false,  // 禁用自动index，我们手动处理
  fallthrough: true  // 允许继续到下一个中间件（404处理）
});

// 包装静态文件服务，排除HTML文件（让专门的路由处理HTML文件）
app.use((req, res, next) => {
  // 如果是HTML文件请求，跳过静态文件服务，让专门的路由处理
  if (req.path.match(/\.html$/)) {
    return next();
  }
  // 对于非HTML文件，使用静态文件服务
  staticMiddleware(req, res, next);
});

logger.info('✅ 静态文件服务已配置');

// 请求日志（在静态文件服务之后，只记录非静态文件请求）
app.use((req, res, next) => {
  // 跳过静态文件请求的日志（避免日志过多）
  if (!req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i)) {
    logger.debug(`📥 ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }
  next();
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error('服务器错误', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: config.server.env === 'development' ? err.message : '请稍后重试'
  });
});

// 404处理 - 最后一个中间件，处理所有未匹配的请求
app.use((req, res) => {
  logger.warn('❌ 404 - 未匹配的请求', { method: req.method, path: req.path, url: req.url });
  
  // 如果是API请求，返回JSON错误
  if (req.path.startsWith('/api/')) {
    logger.warn('404 - API请求不存在', {
      method: req.method,
      path: req.path,
      url: req.url
    });
    return res.status(404).json({
      success: false,
      error: '接口不存在'
    });
  }
  
  // 检查是否是HTML文件请求（如 /admin.html, /mobile.html 等）
  const htmlFileMatch = req.path.match(/^\/([^\/]+\.html)$/);
  if (htmlFileMatch) {
    const htmlFileName = htmlFileMatch[1];
    logger.debug(`404处理 - HTML文件请求: ${htmlFileName}`);
    
    // 尝试所有可能的路径查找HTML文件
    const possibleHtmlPaths = [
      path.resolve(frontendPath, htmlFileName),
      path.resolve(__dirname, '..', htmlFileName),
      path.resolve(process.cwd(), htmlFileName),
      path.join(frontendPath, htmlFileName),
      path.join(__dirname, '..', htmlFileName),
      path.join(process.cwd(), htmlFileName),
      path.join(__dirname, htmlFileName),
      path.resolve(__dirname, htmlFileName)
    ];
    
    for (const htmlPath of possibleHtmlPaths) {
      const htmlPathResolved = path.resolve(htmlPath);
      const exists = fs.existsSync(htmlPathResolved);
      
      if (exists) {
        logger.info(`✅ 404处理 - 找到 ${htmlFileName}`, {
          method: req.method,
          path: req.path,
          htmlPath: htmlPathResolved
        });
        return res.sendFile(htmlPathResolved);
      }
    }
    
    logger.warn(`❌ 404处理 - 所有路径都找不到 ${htmlFileName}`);
  }
  
  // 对于非API请求，尝试返回index.html（SPA路由支持）
  logger.debug('404处理 - 非API请求，尝试返回index.html');
  
  // 尝试所有可能的路径
  const possibleIndexPaths = [
    path.resolve(frontendPath, 'index.html'),
    path.resolve(__dirname, '..', 'index.html'),
    path.resolve(process.cwd(), 'index.html'),
    path.join(frontendPath, 'index.html'),
    path.join(__dirname, '..', 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(__dirname, 'index.html'),
    path.resolve(__dirname, 'index.html')
  ];
  
  for (const indexPath of possibleIndexPaths) {
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    
    if (exists) {
      logger.info('✅ 404处理 - 找到index.html', {
        method: req.method,
        path: req.path,
        indexPath: indexPathResolved
      });
      return res.sendFile(indexPathResolved);
    }
  }
  
  // 如果所有路径都不存在，返回404 JSON
  logger.error('❌ 404处理 - 所有路径都找不到index.html', {
    method: req.method,
    path: req.path,
    url: req.url,
    triedPaths: possibleIndexPaths.map(p => path.resolve(p))
  });
  
  res.status(404).json({
    success: false,
    error: '页面不存在',
    debug: process.env.NODE_ENV === 'development' ? {
      frontendPath,
      __dirname,
      processCwd: process.cwd(),
      triedPaths: possibleIndexPaths.map(p => path.resolve(p))
    } : undefined
  });
});

// 定时任务：自动更新数据
cron.schedule('*/5 * * * *', async () => {
  logger.info('定时任务：更新进行中的赛事');
  try {
    await dataService.refreshEvents();
  } catch (error) {
    logger.error('定时更新赛事失败', error);
  }
});

cron.schedule('0 * * * *', async () => {
  logger.info('定时任务：更新资讯');
  try {
    await dataService.refreshNews();
  } catch (error) {
    logger.error('定时更新资讯失败', error);
  }
});

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

    const backupKey = `backup_${Date.now()}`;
    const backups = await storageService.read('backups') || [];
    backups.push({ id: backupKey, ...backup });
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
  try {
    const PORT = config.server.port || 3000;
    const HOST = process.env.HOST || '0.0.0.0';
    
    // 在启动前输出关键信息（确保能看到）
    // 使用 console.log 确保在 Zeabur 日志中可见
    console.log('========================================');
    console.log('🚀 服务器启动中...');
    console.log('========================================');
    console.log('启动信息:', {
      workDir: process.cwd(),
      __dirname: __dirname,
      frontendPath: frontendPath,
      indexPath: path.join(frontendPath, 'index.html'),
      indexExists: fs.existsSync(path.join(frontendPath, 'index.html')),
      port: PORT,
      host: HOST,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL
    });
    console.log('========================================');
    
    logger.info('========================================');
    logger.info('🚀 服务器启动中...');
    logger.info('========================================');
    logger.info('启动信息', {
      workDir: process.cwd(),
      __dirname: __dirname,
      frontendPath: frontendPath,
      indexPath: path.join(frontendPath, 'index.html'),
      indexExists: fs.existsSync(path.join(frontendPath, 'index.html'))
    });
    logger.info('========================================');
    
    // 创建服务器实例
    console.log(`准备启动服务器: ${HOST}:${PORT}`);
    const server = app.listen(PORT, HOST, () => {
    // 使用 console.log 确保在 Zeabur 日志中可见
    console.log('========================================');
    console.log(`✅ 服务器启动成功: http://${HOST}:${PORT}`);
    console.log(`环境: ${config.server.env}`);
    console.log(`进程ID: ${process.pid}`);
    console.log('服务器启动信息:', {
      frontendPath: frontendPath,
      indexExists: fs.existsSync(path.join(frontendPath, 'index.html'))
    });
    console.log('========================================');
    
    logger.info('========================================');
    logger.info(`✅ 服务器启动成功: http://${HOST}:${PORT}`);
    logger.info(`环境: ${config.server.env}`);
    logger.info(`进程ID: ${process.pid}`);
    logger.info('服务器启动信息', {
      frontendPath: frontendPath,
      indexExists: fs.existsSync(path.join(frontendPath, 'index.html'))
    });
    logger.info('========================================');
    
    // 异步初始化（不阻塞服务器启动）
    (async () => {
      try {
        await initDefaultAdmin();
      } catch (error) {
        logger.error('初始化默认管理员账户失败（非致命错误）', error);
      }
      
      try {
        logger.info('预加载数据...');
        await dataService.fetchNews();
        await dataService.fetchEvents();
        logger.info('数据预加载完成');
      } catch (error) {
        logger.error('数据预加载失败（非致命错误）', error);
      }
    })();
  });

  // 处理服务器错误
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ 端口 ${PORT} 已被占用`);
      process.exit(1);
    } else {
      logger.error('❌ 服务器启动失败', error);
      process.exit(1);
    }
  });

  // 确保服务器正确监听
  server.on('listening', () => {
    const addr = server.address();
    // 使用 console.log 确保在 Zeabur 日志中可见
    console.log(`📡 服务器正在监听: ${addr.address}:${addr.port}`);
    logger.info(`📡 服务器正在监听: ${addr.address}:${addr.port}`);
  });

  // 全局错误处理
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝', { reason, promise });
    // 不退出进程，只记录错误
  });

  process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常', error);
    // 记录错误后优雅退出
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    logger.info('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
  });
  } catch (error) {
    // 捕获启动过程中的任何错误
    console.error('❌ 服务器启动失败:', error);
    console.error('错误堆栈:', error.stack);
    logger.error('❌ 服务器启动失败', error);
    process.exit(1);
  }
} else {
  (async () => {
    await initDefaultAdmin();
  })();
}

module.exports = app;
