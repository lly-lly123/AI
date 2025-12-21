# 实时赛事模块 API 配置说明

## 配置步骤

### 1. 启动后端服务

首先确保后端服务已启动：

```bash
cd backend
npm install
npm start
```

后端服务默认运行在 `http://localhost:3000`

### 2. 前端自动配置

前端已自动配置默认API地址：
- **资讯API**: `http://localhost:3000/api/news`
- **赛事API**: `http://localhost:3000/api/events`

首次打开页面时，系统会自动设置这些默认值。

### 3. 手动配置（可选）

如果需要修改API地址，可以：

1. 在首页点击"刷新资讯"或"刷新"按钮
2. 如果API未配置，会弹出配置提示
3. 点击"配置API"按钮
4. 输入新的API地址

### 4. 验证配置

打开浏览器控制台（F12），查看是否有以下日志：
- `已设置默认API配置: {...}`
- `赛事更新成功，共获取 X 场有效赛事`

## API接口说明

### 获取赛事数据

**接口**: `GET /api/events`

**查询参数**:
- `type` (可选): `ongoing` | `upcoming` | `results`
- `region` (可选): `local` | `national`

**响应格式**:
```json
{
  "success": true,
  "data": {
    "ongoing": [...],
    "upcoming": [...],
    "results": [...]
  },
  "timestamp": "2025-01-XX..."
}
```

### 刷新赛事数据

**接口**: `POST /api/events/refresh`

**响应格式**:
```json
{
  "success": true,
  "message": "赛事数据已刷新",
  "data": {
    "ongoing": 5,
    "upcoming": 3,
    "results": 10
  }
}
```

## 数据格式要求

### 赛事数据格式

```json
{
  "id": "唯一ID",
  "name": "赛事名称",
  "organizer": "组织者",
  "source": "数据来源",
  "sourceUrl": "原文链接",
  "releaseTime": "放飞时间（显示）",
  "releaseTimeFull": "ISO时间字符串",
  "startTime": "开始时间（显示）",
  "startTimeFull": "ISO时间字符串",
  "endTime": "结束时间（显示）",
  "endTimeFull": "ISO时间字符串",
  "distance": "距离",
  "status": "ongoing|upcoming|completed",
  "region": "local|national",
  "returned": 已归巢数,
  "total": 总数,
  "participants": 参赛数,
  "weather": "天气",
  "champion": "冠军名称",
  "championRing": "冠军环号",
  "championTime": "冠军用时",
  "updateTime": "ISO时间字符串"
}
```

## 常见问题

### 1. API连接失败

**问题**: 控制台显示 "API请求失败"

**解决**:
- 检查后端服务是否启动
- 检查API地址是否正确
- 检查是否有CORS问题（后端已配置CORS）

### 2. 数据格式错误

**问题**: 控制台显示 "API返回的数据格式不正确"

**解决**:
- 检查后端API返回格式是否符合要求
- 查看后端日志确认数据解析是否成功

### 3. 没有数据

**问题**: 页面显示"暂无赛事"

**解决**:
- 检查后端RSS源配置是否正确
- 查看后端日志确认数据获取是否成功
- 尝试手动刷新：点击"刷新"按钮

## 测试API

可以使用以下命令测试API：

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试获取赛事
curl http://localhost:3000/api/events

# 测试刷新赛事
curl -X POST http://localhost:3000/api/events/refresh
```

## 生产环境配置

如果部署到生产环境，需要修改API地址：

1. 打开浏览器控制台
2. 执行以下代码设置API地址：

```javascript
const config = {
  newsApiUrl: 'https://your-domain.com/api/news',
  eventsApiUrl: 'https://your-domain.com/api/events',
  apiKey: '' // 如果需要
};
localStorage.setItem('pigeon_api_config', JSON.stringify(config));
location.reload();
```

或者在前端代码中直接修改 `getApiConfig()` 函数的默认值。



## 配置步骤

### 1. 启动后端服务

首先确保后端服务已启动：

```bash
cd backend
npm install
npm start
```

后端服务默认运行在 `http://localhost:3000`

### 2. 前端自动配置

前端已自动配置默认API地址：
- **资讯API**: `http://localhost:3000/api/news`
- **赛事API**: `http://localhost:3000/api/events`

首次打开页面时，系统会自动设置这些默认值。

### 3. 手动配置（可选）

如果需要修改API地址，可以：

1. 在首页点击"刷新资讯"或"刷新"按钮
2. 如果API未配置，会弹出配置提示
3. 点击"配置API"按钮
4. 输入新的API地址

### 4. 验证配置

打开浏览器控制台（F12），查看是否有以下日志：
- `已设置默认API配置: {...}`
- `赛事更新成功，共获取 X 场有效赛事`

## API接口说明

### 获取赛事数据

**接口**: `GET /api/events`

**查询参数**:
- `type` (可选): `ongoing` | `upcoming` | `results`
- `region` (可选): `local` | `national`

**响应格式**:
```json
{
  "success": true,
  "data": {
    "ongoing": [...],
    "upcoming": [...],
    "results": [...]
  },
  "timestamp": "2025-01-XX..."
}
```

### 刷新赛事数据

**接口**: `POST /api/events/refresh`

**响应格式**:
```json
{
  "success": true,
  "message": "赛事数据已刷新",
  "data": {
    "ongoing": 5,
    "upcoming": 3,
    "results": 10
  }
}
```

## 数据格式要求

### 赛事数据格式

```json
{
  "id": "唯一ID",
  "name": "赛事名称",
  "organizer": "组织者",
  "source": "数据来源",
  "sourceUrl": "原文链接",
  "releaseTime": "放飞时间（显示）",
  "releaseTimeFull": "ISO时间字符串",
  "startTime": "开始时间（显示）",
  "startTimeFull": "ISO时间字符串",
  "endTime": "结束时间（显示）",
  "endTimeFull": "ISO时间字符串",
  "distance": "距离",
  "status": "ongoing|upcoming|completed",
  "region": "local|national",
  "returned": 已归巢数,
  "total": 总数,
  "participants": 参赛数,
  "weather": "天气",
  "champion": "冠军名称",
  "championRing": "冠军环号",
  "championTime": "冠军用时",
  "updateTime": "ISO时间字符串"
}
```

## 常见问题

### 1. API连接失败

**问题**: 控制台显示 "API请求失败"

**解决**:
- 检查后端服务是否启动
- 检查API地址是否正确
- 检查是否有CORS问题（后端已配置CORS）

### 2. 数据格式错误

**问题**: 控制台显示 "API返回的数据格式不正确"

**解决**:
- 检查后端API返回格式是否符合要求
- 查看后端日志确认数据解析是否成功

### 3. 没有数据

**问题**: 页面显示"暂无赛事"

**解决**:
- 检查后端RSS源配置是否正确
- 查看后端日志确认数据获取是否成功
- 尝试手动刷新：点击"刷新"按钮

## 测试API

可以使用以下命令测试API：

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试获取赛事
curl http://localhost:3000/api/events

# 测试刷新赛事
curl -X POST http://localhost:3000/api/events/refresh
```

## 生产环境配置

如果部署到生产环境，需要修改API地址：

1. 打开浏览器控制台
2. 执行以下代码设置API地址：

```javascript
const config = {
  newsApiUrl: 'https://your-domain.com/api/news',
  eventsApiUrl: 'https://your-domain.com/api/events',
  apiKey: '' // 如果需要
};
localStorage.setItem('pigeon_api_config', JSON.stringify(config));
location.reload();
```

或者在前端代码中直接修改 `getApiConfig()` 函数的默认值。



## 配置步骤

### 1. 启动后端服务

首先确保后端服务已启动：

```bash
cd backend
npm install
npm start
```

后端服务默认运行在 `http://localhost:3000`

### 2. 前端自动配置

前端已自动配置默认API地址：
- **资讯API**: `http://localhost:3000/api/news`
- **赛事API**: `http://localhost:3000/api/events`

首次打开页面时，系统会自动设置这些默认值。

### 3. 手动配置（可选）

如果需要修改API地址，可以：

1. 在首页点击"刷新资讯"或"刷新"按钮
2. 如果API未配置，会弹出配置提示
3. 点击"配置API"按钮
4. 输入新的API地址

### 4. 验证配置

打开浏览器控制台（F12），查看是否有以下日志：
- `已设置默认API配置: {...}`
- `赛事更新成功，共获取 X 场有效赛事`

## API接口说明

### 获取赛事数据

**接口**: `GET /api/events`

**查询参数**:
- `type` (可选): `ongoing` | `upcoming` | `results`
- `region` (可选): `local` | `national`

**响应格式**:
```json
{
  "success": true,
  "data": {
    "ongoing": [...],
    "upcoming": [...],
    "results": [...]
  },
  "timestamp": "2025-01-XX..."
}
```

### 刷新赛事数据

**接口**: `POST /api/events/refresh`

**响应格式**:
```json
{
  "success": true,
  "message": "赛事数据已刷新",
  "data": {
    "ongoing": 5,
    "upcoming": 3,
    "results": 10
  }
}
```

## 数据格式要求

### 赛事数据格式

```json
{
  "id": "唯一ID",
  "name": "赛事名称",
  "organizer": "组织者",
  "source": "数据来源",
  "sourceUrl": "原文链接",
  "releaseTime": "放飞时间（显示）",
  "releaseTimeFull": "ISO时间字符串",
  "startTime": "开始时间（显示）",
  "startTimeFull": "ISO时间字符串",
  "endTime": "结束时间（显示）",
  "endTimeFull": "ISO时间字符串",
  "distance": "距离",
  "status": "ongoing|upcoming|completed",
  "region": "local|national",
  "returned": 已归巢数,
  "total": 总数,
  "participants": 参赛数,
  "weather": "天气",
  "champion": "冠军名称",
  "championRing": "冠军环号",
  "championTime": "冠军用时",
  "updateTime": "ISO时间字符串"
}
```

## 常见问题

### 1. API连接失败

**问题**: 控制台显示 "API请求失败"

**解决**:
- 检查后端服务是否启动
- 检查API地址是否正确
- 检查是否有CORS问题（后端已配置CORS）

### 2. 数据格式错误

**问题**: 控制台显示 "API返回的数据格式不正确"

**解决**:
- 检查后端API返回格式是否符合要求
- 查看后端日志确认数据解析是否成功

### 3. 没有数据

**问题**: 页面显示"暂无赛事"

**解决**:
- 检查后端RSS源配置是否正确
- 查看后端日志确认数据获取是否成功
- 尝试手动刷新：点击"刷新"按钮

## 测试API

可以使用以下命令测试API：

```bash
# 测试健康检查
curl http://localhost:3000/api/health

# 测试获取赛事
curl http://localhost:3000/api/events

# 测试刷新赛事
curl -X POST http://localhost:3000/api/events/refresh
```

## 生产环境配置

如果部署到生产环境，需要修改API地址：

1. 打开浏览器控制台
2. 执行以下代码设置API地址：

```javascript
const config = {
  newsApiUrl: 'https://your-domain.com/api/news',
  eventsApiUrl: 'https://your-domain.com/api/events',
  apiKey: '' // 如果需要
};
localStorage.setItem('pigeon_api_config', JSON.stringify(config));
location.reload();
```

或者在前端代码中直接修改 `getApiConfig()` 函数的默认值。




















