// 立即输出，确保在 Zeabur 日志中可见
console.log('========================================');
console.log('📦 server.js 开始加载...');
console.log('时间:', new Date().toISOString());
console.log('工作目录:', process.cwd());
console.log('========================================');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const config = require('./config/config');
const logger = require('./utils/logger');

console.log('✅ 所有模块加载完成');

// 使用try-catch包装所有require，确保错误能被捕获
let apiRoutes, cron, dataService, authService, storageService, apiLimiter, strictLimiter, aiLimiter;

try {
  apiRoutes = require('./routes/api');
  console.log('✅ API路由加载成功');
} catch (error) {
  console.error('❌ API路由加载失败:', error);
  throw error;
}

try {
  cron = require('node-cron');
  dataService = require('./services/dataService');
  authService = require('./services/authService');
  storageService = require('./services/storageService');
  const rateLimiterModule = require('./middleware/rateLimiter');
  apiLimiter = rateLimiterModule.apiLimiter;
  strictLimiter = rateLimiterModule.strictLimiter;
  aiLimiter = rateLimiterModule.aiLimiter;
  console.log('✅ 所有服务模块加载成功');
} catch (error) {
  console.error('❌ 服务模块加载失败:', error);
  throw error;
}

const app = express();

// 设置信任代理（Zeabur等云平台需要）
// 这允许Express正确读取X-Forwarded-For等代理头
app.set('trust proxy', true);

// 安全头设置 - 禁用CSP以允许内联事件处理器（应用中有大量onclick等内联事件）
app.use(helmet({
  contentSecurityPolicy: false,  // 完全禁用CSP，因为应用使用大量内联事件处理器
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 请求日志中间件（在所有路由之前，用于诊断）
app.use((req, res, next) => {
  console.log('📥 收到请求:', req.method, req.path, req.url);
  console.log('📥 请求头:', {
    'user-agent': req.get('user-agent'),
    'host': req.get('host'),
    'x-forwarded-for': req.get('x-forwarded-for'),
    'x-forwarded-proto': req.get('x-forwarded-proto')
  });
  next();
});

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点（在限流之前，确保Zeabur等平台可以检查服务状态）
app.get('/health', (req, res) => {
  console.log('🏥 健康检查请求:', req.method, req.path);
  console.log('🏥 请求头:', JSON.stringify(req.headers, null, 2));
  const healthData = {
    success: true,
    status: 'healthy',
    service: 'pigeon-data-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: config.server.port,
    env: config.server.env,
    nodeVersion: process.version,
    platform: process.platform,
    listening: true
  };
  console.log('🏥 健康检查响应:', healthData);
  res.status(200).setHeader('Content-Type', 'application/json').json(healthData);
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

// 根路径处理 - 必须在所有其他路由之前
app.get('/', (req, res) => {
  console.log('🌐 [根路径] 收到请求:', req.method, req.path, req.url);
  console.log('🌐 [根路径] User-Agent:', req.get('user-agent'));
  console.log('🌐 [根路径] 前端路径:', frontendPath);
  console.log('🌐 [根路径] __dirname:', __dirname);
  console.log('🌐 [根路径] process.cwd():', process.cwd());
  
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
  
  // 如果是移动设备，重定向到 mobile.html
  if (isMobile) {
    console.log('📱 [根路径] 移动设备，重定向到 mobile.html');
    return res.redirect('/mobile.html' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''));
  }
  
  // 对于PC端，返回index.html
  // 尝试多个可能的路径
  const possibleIndexPaths = [
    path.resolve(frontendPath, 'index.html'),
    path.resolve(__dirname, '..', 'index.html'),
    path.resolve(process.cwd(), 'index.html'),
    path.join(frontendPath, 'index.html'),
    path.join(__dirname, '..', 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];
  
  console.log('🔍 [根路径] 尝试查找index.html，路径列表:', possibleIndexPaths);
  
  for (const indexPath of possibleIndexPaths) {
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    
    console.log(`🔍 [根路径] 检查路径: ${indexPathResolved}, 存在: ${exists}`);
    
    if (exists) {
      console.log('✅ [根路径] 找到index.html，准备返回:', indexPathResolved);
      logger.info('✅ 根路径请求 - 返回index.html', {
        path: req.path,
        indexPath: indexPathResolved,
        exists: true
      });
      // 确保设置正确的Content-Type
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(indexPathResolved);
    }
  }
  
  // 如果都找不到，返回错误信息
  console.error('❌ [根路径] 所有路径都找不到index.html');
  logger.error('❌ 根路径请求 - index.html不存在', {
    path: req.path,
    triedPaths: possibleIndexPaths,
    frontendPath: frontendPath,
    __dirname: __dirname,
    processCwd: process.cwd()
  });
  
  // 返回详细的错误信息
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>错误 - 找不到index.html</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>服务器配置错误</h1>
      <p>无法找到 index.html 文件</p>
      <h2>尝试的路径：</h2>
      <ul>
        ${possibleIndexPaths.map(p => `<li>${p}</li>`).join('')}
      </ul>
      <h2>调试信息：</h2>
      <ul>
        <li>前端路径: ${frontendPath}</li>
        <li>__dirname: ${__dirname}</li>
        <li>process.cwd(): ${process.cwd()}</li>
      </ul>
    </body>
    </html>
  `);
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
console.log('📂 [静态文件] 配置静态文件服务');
console.log('📂 [静态文件] 前端路径:', frontendPath);
console.log('📂 [静态文件] 路径存在:', fs.existsSync(frontendPath));
console.log('📂 [静态文件] index.html存在:', fs.existsSync(path.join(frontendPath, 'index.html')));

if (fs.existsSync(frontendPath)) {
  try {
    const files = fs.readdirSync(frontendPath).slice(0, 10);
    console.log('📂 [静态文件] 目录中的文件:', files);
  } catch (e) {
    console.error('📂 [静态文件] 读取目录失败:', e.message);
  }
}

logger.info('📂 配置静态文件服务', {
  frontendPath: frontendPath,
  exists: fs.existsSync(frontendPath),
  indexExists: fs.existsSync(path.join(frontendPath, 'index.html'))
});

// 配置静态文件服务 - 简化版本，直接使用express.static
// 设置index为index.html，这样访问根路径时会自动返回index.html
app.use(express.static(frontendPath, {
  index: 'index.html',
  fallthrough: false,
  setHeaders: (res, filePath) => {
    // 确保HTML文件设置正确的Content-Type
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

console.log('✅ [静态文件] 静态文件服务已配置');
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
    // 优先使用Zeabur设置的PORT环境变量（必须）
    const PORT = parseInt(process.env.PORT || config.server.port || '3000', 10);
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
      envPort: process.env.PORT,
      configPort: config.server.port,
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
    console.log(`PORT环境变量: ${process.env.PORT || '未设置'}`);
    console.log(`最终使用端口: ${PORT}`);
    console.log(`监听地址: ${HOST}`);
    
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

  // 全局错误处理 - 增强版本，确保所有错误都被记录
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [未处理的Promise拒绝]', reason);
    console.error('❌ [Promise对象]', promise);
    if (reason instanceof Error) {
      console.error('❌ [错误堆栈]', reason.stack);
    }
    logger.error('未处理的Promise拒绝', { reason, promise });
    // 不退出进程，只记录错误（避免服务器崩溃）
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ [未捕获的异常]', error);
    console.error('❌ [错误堆栈]', error.stack);
    logger.error('未捕获的异常', error);
    // 记录错误后优雅退出
    setTimeout(() => {
      process.exit(1);
    }, 1000);
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
    console.error('========================================');
    console.error('❌ 服务器启动失败');
    console.error('========================================');
    console.error('错误信息:', error.message);
    console.error('错误类型:', error.name);
    console.error('错误堆栈:', error.stack);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    console.error('========================================');
    
    try {
      logger.error('❌ 服务器启动失败', error);
    } catch (logError) {
      console.error('❌ 日志记录也失败了:', logError);
    }
    
    process.exit(1);
  }
} else {
  (async () => {
    await initDefaultAdmin();
  })();
}

module.exports = app;
