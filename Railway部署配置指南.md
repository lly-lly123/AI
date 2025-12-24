# Railway 部署配置指南

## 📋 配置步骤

### 1. 设置根目录（Root Directory）

在 Railway 项目设置中，将 **Root Directory** 设置为：
```
backend
```

这是因为：
- `server.js` 位于 `backend/` 目录
- `package.json` 位于 `backend/` 目录
- 所有后端依赖都在 `backend/` 目录

### 2. 配置环境变量（Environment Variables）

在 Railway 项目的 **Variables** 标签页中，添加以下环境变量：

#### 🔧 必需配置

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据源配置（RSS源列表，使用分号分隔）
RSS_SOURCES=中国信鸽信息网|https://www.chinaxinge.com/rss|media|national;贵州省信鸽协会|https://example.com/rss|association|local;赛鸽天地|https://example.com/rss|media|national

# API配置
API_KEY=your-api-key-here
API_RATE_LIMIT=100

# 缓存配置
CACHE_TTL_NEWS=3600
CACHE_TTL_EVENTS=300
CACHE_TTL_RESULTS=7200

# 更新频率（秒）
UPDATE_INTERVAL_NEWS=3600
UPDATE_INTERVAL_EVENTS=300
UPDATE_INTERVAL_RESULTS=1800

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### 🤖 AI 配置（至少配置一个）

**选项1：智谱AI - Evo智能助手使用**
```env
ZHIPU_API_KEY_EVO=your-zhipu-api-key-here
```

**选项2：智谱AI - 中枢管家使用**
```env
ZHIPU_API_KEY_ADMIN=your-zhipu-api-key-here
```

**选项3：通义千问（备选）**
```env
QWEN_API_KEY=your-qwen-api-key-here
```

**AI模型选择（可选）**
```env
AI_MODEL=auto
# 可选值：auto, zhipu, qwen, huggingface
```

#### ☁️ Supabase 配置（如果使用）

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 启动命令

Railway 会自动检测 `package.json` 中的 `start` 脚本：
```json
"start": "node server.js"
```

无需额外配置，Railway 会自动运行 `npm start`。

### 4. 构建命令

Railway 会自动运行 `npm install`，无需额外配置。

## ✅ 检查清单

部署前请确认：

- [ ] Root Directory 设置为 `backend`
- [ ] 已配置 `PORT` 环境变量（Railway 会自动提供 `PORT`，但可以显式设置）
- [ ] 已配置至少一个 AI API Key（`ZHIPU_API_KEY_EVO` 或 `ZHIPU_API_KEY_ADMIN`）
- [ ] 已配置 `NODE_ENV=production`
- [ ] 如果使用 Supabase，已配置相关环境变量
- [ ] 已保存所有环境变量配置

## 🚀 部署后验证

部署成功后，Railway 会提供一个公共 URL，例如：
```
https://your-project-name.up.railway.app
```

访问以下端点验证部署：
- 健康检查：`https://your-project-name.up.railway.app/api/health`
- API 根路径：`https://your-project-name.up.railway.app/api`
- 前端页面：`https://your-project-name.up.railway.app/`

## 📝 注意事项

1. **端口配置**：Railway 会自动提供 `PORT` 环境变量，你的 `server.js` 应该使用 `process.env.PORT || 3000`
2. **静态文件**：后端服务会提供前端静态文件（从 `backend/../` 目录）
3. **日志文件**：确保 `logs/` 目录存在，或使用 Railway 的日志查看功能
4. **数据持久化**：如果需要数据持久化，考虑使用 Railway 的 PostgreSQL 插件或 Supabase

## 🔗 相关文件

- `backend/config.example.env` - 环境变量示例
- `backend/server.js` - 服务器入口
- `backend/package.json` - 项目配置

















