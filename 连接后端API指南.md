# 连接后端API指南

## 快速开始

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

后端服务将在 `http://localhost:3000` 启动

### 2. 打开前端页面

直接打开 `信鸽信息采集系统 2_副本.html` 文件

### 3. 查看连接状态

打开浏览器控制台（F12），应该看到：

```
✅ 已设置默认API配置: {newsApiUrl: "http://localhost:3000/api/news", eventsApiUrl: "http://localhost:3000/api/events", apiKey: ""}
✅ 资讯API连接成功: http://localhost:3000/api/news
   返回数据: X 条资讯
✅ 赛事API连接成功: http://localhost:3000/api/events
   返回数据: {ongoing: X, upcoming: Y, results: Z}
```

## API配置

### 默认配置

前端已自动配置默认API地址：
- **资讯API**: `http://localhost:3000/api/news`
- **赛事API**: `http://localhost:3000/api/events`

### 修改配置

如果需要修改API地址，可以在浏览器控制台执行：

```javascript
const config = {
  newsApiUrl: 'http://your-api-server.com/api/news',
  eventsApiUrl: 'http://your-api-server.com/api/events',
  apiKey: '' // 如果需要API密钥
};
localStorage.setItem('pigeon_api_config', JSON.stringify(config));
location.reload();
```

## 数据流程

1. **页面加载** → 初始化API配置
2. **测试连接** → 验证API是否可访问
3. **获取数据** → 从后端API获取资讯和赛事数据
4. **数据验证** → 验证和过滤数据
5. **渲染页面** → 显示数据到页面

## API接口说明

### 资讯API

**请求**: `GET /api/news`

**查询参数**:
- `region` (可选): `local` | `national`
- `category` (可选): `race` | `breeding` | `health`
- `limit` (可选): 数量限制

**响应格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "唯一ID",
      "title": "资讯标题",
      "source": "来源",
      "sourceUrl": "原文链接",
      "time": "相对时间",
      "updateTime": "ISO时间",
      "tags": ["标签1", "标签2"],
      "category": "race|breeding|health",
      "region": "local|national",
      "content": "详细内容",
      "hot": true/false
    }
  ],
  "count": 10,
  "timestamp": "2025-01-XX..."
}
```

### 赛事API

**请求**: `GET /api/events`

**查询参数**:
- `type` (可选): `ongoing` | `upcoming` | `results`
- `region` (可选): `local` | `national`

**响应格式**:
```json
{
  "success": true,
  "data": {
    "ongoing": [
      {
        "id": "唯一ID",
        "name": "赛事名称",
        "organizer": "组织者",
        "source": "来源",
        "sourceUrl": "原文链接",
        "releaseTime": "放飞时间",
        "releaseTimeFull": "ISO时间",
        "distance": "距离",
        "region": "local|national",
        "returned": 已归巢数,
        "total": 总数,
        "weather": "天气",
        "updateTime": "ISO时间"
      }
    ],
    "upcoming": [...],
    "results": [...]
  },
  "timestamp": "2025-01-XX..."
}
```

## 故障排除

### 问题1: API连接失败

**症状**: 控制台显示 "⚠️ 资讯API连接错误" 或 "⚠️ 赛事API连接错误"

**解决方法**:
1. 检查后端服务是否启动
2. 检查端口是否正确（默认3000）
3. 检查防火墙设置
4. 尝试在浏览器直接访问 `http://localhost:3000/api/health`

### 问题2: CORS错误

**症状**: 控制台显示 "CORS policy" 错误

**解决方法**:
- 后端已配置CORS，如果仍有问题，检查后端 `server.js` 中的CORS配置

### 问题3: 数据格式错误

**症状**: 控制台显示 "API返回的数据格式不正确"

**解决方法**:
1. 检查后端API返回格式是否符合要求
2. 查看后端日志确认数据解析是否成功
3. 检查RSS源配置是否正确

### 问题4: 没有数据

**症状**: 页面显示"暂无资讯"或"暂无赛事"

**解决方法**:
1. 检查后端RSS源配置（`.env` 文件）
2. 查看后端日志确认数据获取是否成功
3. 尝试手动刷新：点击"刷新资讯"或"刷新"按钮
4. 检查后端是否有数据：访问 `http://localhost:3000/api/stats`

## 测试API

### 使用curl测试

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试获取资讯
curl http://localhost:3000/api/news

# 测试获取赛事
curl http://localhost:3000/api/events

# 测试刷新赛事
curl -X POST http://localhost:3000/api/events/refresh
```

### 使用浏览器测试

直接在浏览器地址栏访问：
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/news`
- `http://localhost:3000/api/events`
- `http://localhost:3000/api/stats`

## 生产环境部署

### 修改API地址

如果部署到生产环境，需要修改API地址：

1. **方法1**: 在浏览器控制台设置
```javascript
localStorage.setItem('pigeon_api_config', JSON.stringify({
  newsApiUrl: 'https://your-domain.com/api/news',
  eventsApiUrl: 'https://your-domain.com/api/events',
  apiKey: ''
}));
location.reload();
```

2. **方法2**: 修改代码中的默认值
在 `getApiConfig()` 函数中修改 `defaultBaseUrl` 变量

### 使用HTTPS

生产环境建议使用HTTPS，确保数据传输安全。

## 监控和日志

### 前端日志

打开浏览器控制台查看：
- API连接状态
- 数据获取情况
- 错误信息

### 后端日志

查看后端日志文件：
```bash
tail -f backend/logs/app.log
```

## 性能优化

1. **缓存机制**: 前端使用localStorage缓存数据，减少API调用
2. **定时更新**: 自动定时更新数据，无需手动刷新
3. **智能更新**: 进行中的赛事每5分钟更新，其他数据每小时更新

## 支持

如有问题，请检查：
1. 后端服务是否正常运行
2. API地址配置是否正确
3. 浏览器控制台的错误信息
4. 后端日志文件



















