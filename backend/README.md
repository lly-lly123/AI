# 赛鸽数据中转服务

提供稳定、可信、可控的赛鸽数据API服务。

## 功能特性

- ✅ RSS Feed解析（官方协会、专业媒体）
- ✅ 数据清洗和校验
- ✅ 智能缓存机制
- ✅ 定时自动更新
- ✅ RESTful API接口
- ✅ 完整的日志记录
- ✅ 数据统计和分析

## 快速开始

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动

## API接口

### 获取资讯列表

```
GET /api/news?region=local&category=race&limit=10
```

参数：
- `region`: local|national (可选)
- `category`: race|breeding|health (可选)
- `limit`: 数量限制 (可选)

### 获取赛事列表

```
GET /api/events?type=ongoing&region=local
```

参数：
- `type`: ongoing|upcoming|results (可选)
- `region`: local|national (可选)

### 刷新数据

```
POST /api/news/refresh
POST /api/events/refresh
```

### 健康检查

```
GET /api/health
```

### 统计信息

```
GET /api/stats
```

## 数据源配置

在 `.env` 文件中配置RSS源：

```
RSS_SOURCES=名称|URL|类型|地区
```

示例：
```
RSS_SOURCES=中国信鸽信息网|https://www.chinaxinge.com/rss|media|national
RSS_SOURCES+=贵州省信鸽协会|https://example.com/rss|association|local
```

## 定时任务

- **进行中的赛事**: 每5分钟自动更新
- **资讯数据**: 每小时自动更新
- **已结束的赛事**: 每30分钟自动更新

## 项目结构

```
backend/
├── config/          # 配置文件
├── routes/          # 路由
├── services/        # 业务逻辑
│   ├── rssParser.js      # RSS解析
│   ├── dataValidator.js  # 数据验证
│   ├── dataService.js    # 数据服务
│   └── cacheService.js   # 缓存服务
├── utils/           # 工具函数
│   └── logger.js        # 日志
├── logs/            # 日志文件
├── server.js        # 服务器入口
└── package.json     # 依赖配置
```

## 开发

### 添加新的数据源

1. 在 `.env` 中添加RSS源配置
2. 重启服务

### 扩展API接口

在 `routes/api.js` 中添加新路由

## 部署

### 使用PM2

```bash
npm install -g pm2
pm2 start server.js --name pigeon-api
pm2 save
pm2 startup
```

### 使用Docker

```bash
docker build -t pigeon-api .
docker run -d -p 3000:3000 --env-file .env pigeon-api
```

## 许可证

MIT




















