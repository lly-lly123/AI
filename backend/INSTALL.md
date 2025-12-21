# 安装和部署指南

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 安装步骤

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制配置示例文件：

```bash
cp config.example.env .env
```

编辑 `.env` 文件，配置以下内容：

- **RSS_SOURCES**: RSS源列表，格式：`名称|URL|类型|地区`
- **PORT**: 服务器端口（默认3000）
- **CACHE_TTL_***: 缓存时间（秒）
- **UPDATE_INTERVAL_***: 更新频率（秒）

### 3. 创建日志目录

```bash
mkdir -p logs
```

### 4. 启动服务

**开发模式：**
```bash
npm run dev
```

**生产模式：**
```bash
npm start
```

## 使用PM2部署

### 安装PM2

```bash
npm install -g pm2
```

### 启动服务

```bash
pm2 start server.js --name pigeon-api
```

### 查看状态

```bash
pm2 status
pm2 logs pigeon-api
```

### 设置开机自启

```bash
pm2 save
pm2 startup
```

## 使用Docker部署

### 创建Dockerfile

```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### 构建和运行

```bash
docker build -t pigeon-api .
docker run -d -p 3000:3000 --env-file .env --name pigeon-api pigeon-api
```

## 验证安装

访问 `http://localhost:3000/api/health` 应该返回：

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "uptime": 123.45
}
```

## 配置RSS源

在 `.env` 文件中添加RSS源，每行一个：

```
RSS_SOURCES=中国信鸽信息网|https://www.chinaxinge.com/rss|media|national
RSS_SOURCES+=贵州省信鸽协会|https://example.com/rss|association|local
```

格式说明：
- 名称：数据源名称
- URL：RSS feed地址
- 类型：media（媒体）或 association（协会）
- 地区：local（本地）或 national（全国）

## 常见问题

### 1. RSS解析失败

检查RSS URL是否可访问，确保URL格式正确。

### 2. 端口被占用

修改 `.env` 文件中的 `PORT` 配置。

### 3. 缓存不生效

检查 `logs/app.log` 查看详细错误信息。

## 更新前端配置

在前端HTML文件中，更新API地址：

```javascript
const apiConfig = {
  newsApiUrl: 'http://localhost:3000/api/news',
  eventsApiUrl: 'http://localhost:3000/api/events',
  apiKey: '' // 如果需要
};
```




















