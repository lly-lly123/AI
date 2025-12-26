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
  
  // 使用console.log确保在Zeabur日志中可见
  console.log('🔍 开始检测前端文件路径...');
  console.log('  __dirname:', __dirname);
  console.log('  process.cwd():', process.cwd());
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  
  logger.info('开始检测前端文件路径', {
    __dirname: __dirname,
    processCwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV
  });
  
  // 检查哪个路径包含index.html
  for (const testPath of possiblePaths) {
    const indexPath = path.join(testPath, 'index.html');
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    
    // 使用console.log确保在Zeabur日志中可见
    console.log(`  检测路径: ${testPath}`);
    console.log(`    indexPath: ${indexPathResolved}`);
    console.log(`    存在: ${exists ? '✅' : '❌'}`);
    
    logger.info('检测路径', {
      testPath: testPath,
      indexPath: indexPath,
      indexPathResolved: indexPathResolved,
      exists: exists
    });
    
    if (exists) {
      const files = fs.readdirSync(testPath).slice(0, 5);
      console.log(`✅ 找到前端文件路径: ${testPath}`);
      console.log(`   index.html路径: ${indexPathResolved}`);
      console.log(`   目录文件: ${files.join(', ')}`);
      
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
  console.log(`❌ 未找到index.html，使用默认路径: ${defaultPath}`);
  console.log(`  尝试过的路径:`);
  possiblePaths.forEach(p => {
    console.log(`    - ${path.join(p, 'index.html')}`);
  });
  
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

console.log('========================================');
console.log('📁 前端文件路径配置完成');
console.log('========================================');
console.log(`  环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`  前端路径: ${frontendPath}`);
console.log(`  index.html: ${finalIndexPathResolved}`);
console.log(`  存在: ${finalIndexExists ? '✅' : '❌'}`);
console.log('========================================');

logger.info('前端文件路径配置', {
  nodeEnv: process.env.NODE_ENV,
  frontendPath: frontendPath,
  __dirname: __dirname,
  indexPath: finalIndexPathResolved,
  exists: finalIndexExists
});

// 移动端设备检测和自动跳转（在静态文件服务之前）
app.get('/', (req, res, next) => {
  console.log('🌐 根路径请求:', req.path, req.url);
  
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
    console.log('📱 移动设备，重定向到 mobile.html');
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
  
  console.log('🔍 查找index.html，尝试路径:');
  for (const indexPath of possibleIndexPaths) {
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    console.log(`  ${exists ? '✅' : '❌'} ${indexPathResolved}`);
    
    if (exists) {
      console.log(`✅ 找到index.html，返回: ${indexPathResolved}`);
      logger.info('根路径请求 - 返回index.html', {
        path: req.path,
        indexPath: indexPathResolved,
        exists: true
      });
      return res.sendFile(indexPathResolved);
    }
  }
  
  // 如果都找不到，记录警告但继续（让静态文件服务或404处理）
  console.log('⚠️ 未找到index.html，继续到下一个中间件');
  logger.warn('根路径请求 - index.html不存在', {
    path: req.path,
    triedPaths: possibleIndexPaths
  });
  
  next();
});

// 专门处理HTML文件请求（在静态文件服务之前）
// 处理 /admin.html, /mobile.html 等
app.get(/^\/([^\/]+\.html)$/, (req, res, next) => {
  const htmlFileName = req.path.substring(1); // 移除开头的 /
  console.log(`📄 HTML文件请求: ${htmlFileName}`);
  
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
  
  console.log(`  尝试查找 ${htmlFileName}:`);
  for (const htmlPath of possibleHtmlPaths) {
    const htmlPathResolved = path.resolve(htmlPath);
    const exists = fs.existsSync(htmlPathResolved);
    console.log(`    ${exists ? '✅' : '❌'} ${htmlPathResolved}`);
    
    if (exists) {
      console.log(`  ✅ 找到 ${htmlFileName}，返回: ${htmlPathResolved}`);
      logger.info(`HTML文件请求 - 返回${htmlFileName}`, {
        path: req.path,
        htmlPath: htmlPathResolved
      });
      return res.sendFile(htmlPathResolved);
    }
  }
  
  console.log(`  ⚠️ 未找到 ${htmlFileName}，继续到下一个中间件`);
  logger.warn(`HTML文件请求 - ${htmlFileName}不存在`, {
    path: req.path,
    triedPaths: possibleHtmlPaths
  });
  
  next();
});

// 静态文件服务 - 提供前端页面
console.log('========================================');
console.log('📂 配置静态文件服务');
console.log('========================================');
console.log(`  前端路径: ${frontendPath}`);
console.log(`  路径存在: ${fs.existsSync(frontendPath) ? '✅' : '❌'}`);
console.log(`  index.html存在: ${fs.existsSync(path.join(frontendPath, 'index.html')) ? '✅' : '❌'}`);

if (fs.existsSync(frontendPath)) {
  const files = fs.readdirSync(frontendPath).slice(0, 10);
  console.log(`  目录文件 (前10个): ${files.join(', ')}`);
}

logger.info('配置静态文件服务', {
  frontendPath: frontendPath,
  exists: fs.existsSync(frontendPath),
  indexExists: fs.existsSync(path.join(frontendPath, 'index.html')),
  files: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath).slice(0, 10) : []
});

// 配置静态文件服务
// 注意：express.static 会自动处理 index.html，但如果找不到会继续到下一个中间件
app.use(express.static(frontendPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  },
  index: false,  // 禁用自动index，我们手动处理
  fallthrough: true  // 允许继续到下一个中间件（404处理）
}));

console.log('✅ 静态文件服务已配置');
console.log('========================================');

// 请求日志（在静态文件服务之后，只记录非静态文件请求）
app.use((req, res, next) => {
  // 跳过静态文件请求的日志（避免日志过多）
  if (!req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i)) {
    console.log(`📥 ${req.method} ${req.path}`);
    logger.info(`${req.method} ${req.path}`, {
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
  console.log('❌ 404 - 未匹配的请求:', req.method, req.path, req.url);
  
  // 如果是API请求，返回JSON错误
  if (req.path.startsWith('/api/')) {
    console.log('  → API请求，返回JSON错误');
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
    console.log(`  → HTML文件请求: ${htmlFileName}`);
    
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
    
    console.log(`  尝试查找 ${htmlFileName}:`);
    for (const htmlPath of possibleHtmlPaths) {
      const htmlPathResolved = path.resolve(htmlPath);
      const exists = fs.existsSync(htmlPathResolved);
      console.log(`    ${exists ? '✅' : '❌'} ${htmlPathResolved}`);
      
      if (exists) {
        console.log(`  ✅ 找到 ${htmlFileName}，返回: ${htmlPathResolved}`);
        logger.info(`404处理 - 返回${htmlFileName}`, {
          method: req.method,
          path: req.path,
          htmlPath: htmlPathResolved
        });
        return res.sendFile(htmlPathResolved);
      }
    }
    
    console.log(`  ❌ 所有路径都找不到 ${htmlFileName}`);
  }
  
  // 对于非API请求，尝试返回index.html（SPA路由支持）
  console.log('  → 非API请求，尝试返回index.html');
  
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
  
  console.log('  尝试路径:');
  for (const indexPath of possibleIndexPaths) {
    const indexPathResolved = path.resolve(indexPath);
    const exists = fs.existsSync(indexPathResolved);
    console.log(`    ${exists ? '✅' : '❌'} ${indexPathResolved}`);
    
    if (exists) {
      console.log(`  ✅ 找到index.html，返回: ${indexPathResolved}`);
      logger.info('404处理 - 返回index.html', {
        method: req.method,
        path: req.path,
        indexPath: indexPathResolved
      });
      return res.sendFile(indexPathResolved);
    }
  }
  
  // 如果所有路径都不存在，返回404 JSON
  console.log('  ❌ 所有路径都找不到index.html');
  logger.error('404处理 - 无法找到index.html', {
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
  const PORT = config.server.port || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  
  // 在启动前输出关键信息（确保能看到）
  console.log('========================================');
  console.log('🚀 服务器启动中...');
  console.log('========================================');
  console.log('工作目录:', process.cwd());
  console.log('__dirname:', __dirname);
  console.log('前端文件路径:', frontendPath);
  console.log('index.html路径:', path.join(frontendPath, 'index.html'));
  console.log('index.html存在:', fs.existsSync(path.join(frontendPath, 'index.html')));
  console.log('========================================');
  
  app.listen(PORT, HOST, async () => {
    logger.info(`服务器启动成功，监听地址: ${HOST}:${PORT}`);
    logger.info(`环境: ${config.server.env}`);
    console.log(`✅ 服务器启动成功: http://${HOST}:${PORT}`);
    console.log(`前端文件路径: ${frontendPath}`);
    console.log(`index.html: ${fs.existsSync(path.join(frontendPath, 'index.html')) ? '✅ 存在' : '❌ 不存在'}`);
    
    await initDefaultAdmin();
    try {
      logger.info('预加载数据...');
      await dataService.fetchNews();
      await dataService.fetchEvents();
      logger.info('数据预加载完成');
    } catch (error) {
      logger.error('数据预加载失败', error);
    }
  });

  process.on('SIGTERM', () => {
    logger.info('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
  });
} else {
  (async () => {
    await initDefaultAdmin();
  })();
}

module.exports = app;
