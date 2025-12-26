# Railway 定时任务优化方案 🔧

## 🔍 问题分析

在 `backend/server.js` 中发现以下定时任务：

1. **每 5 分钟运行一次**（可能太频繁）
   ```javascript
   cron.schedule('*/5 * * * *', async () => {
     await dataService.refreshEvents(); // 更新赛事
   });
   ```

2. **每小时运行一次**
   ```javascript
   cron.schedule('0 * * * *', async () => {
     await dataService.refreshNews(); // 更新资讯
   });
   ```

3. **每天凌晨 3 点运行**（正常）
   ```javascript
   cron.schedule('0 3 * * *', async () => {
     // 自动备份数据
   });
   ```

**问题：** 每 5 分钟更新一次赛事数据，在 Railway 免费版上可能导致 CPU 使用率过高。

---

## 🛠️ 优化方案

### 方案 1：通过环境变量控制定时任务（推荐）

修改代码，让定时任务频率可以通过环境变量配置。

#### 步骤 1：修改 `backend/server.js`

将定时任务改为可配置：

```javascript
// 从环境变量读取更新间隔（分钟）
const EVENT_UPDATE_INTERVAL = parseInt(process.env.EVENT_UPDATE_INTERVAL || '30', 10);
const NEWS_UPDATE_INTERVAL = parseInt(process.env.NEWS_UPDATE_INTERVAL || '60', 10);

// 定时任务：自动更新数据（使用环境变量配置的频率）
if (EVENT_UPDATE_INTERVAL > 0) {
  cron.schedule(`*/${EVENT_UPDATE_INTERVAL} * * * *`, async () => {
    logger.info('定时任务：更新进行中的赛事');
    try {
      await dataService.refreshEvents();
    } catch (error) {
      logger.error('定时更新赛事失败', error);
    }
  });
}

if (NEWS_UPDATE_INTERVAL > 0) {
  cron.schedule(`*/${NEWS_UPDATE_INTERVAL} * * * *`, async () => {
    logger.info('定时任务：更新资讯');
    try {
      await dataService.refreshNews();
    } catch (error) {
      logger.error('定时更新资讯失败', error);
    }
  });
}
```

#### 步骤 2：在 Railway 添加环境变量

在 Railway 的 "Variables"（变量）中添加：

```
EVENT_UPDATE_INTERVAL=30    # 30分钟更新一次赛事（原来是5分钟）
NEWS_UPDATE_INTERVAL=120    # 2小时更新一次资讯（原来是1小时）
```

---

### 方案 2：直接修改代码（简单快速）

直接修改 `backend/server.js` 中的定时任务频率。

#### 修改前：
```javascript
cron.schedule('*/5 * * * *', async () => {  // 每5分钟
```

#### 修改后：
```javascript
cron.schedule('*/30 * * * *', async () => {  // 每30分钟
```

---

## 🚀 立即操作步骤

### 快速修复（方案 2 - 直接修改代码）

1. **打开文件：** `backend/server.js`

2. **找到第 82 行，修改：**
   ```javascript
   // 修改前
   cron.schedule('*/5 * * * *', async () => {
   
   // 修改后
   cron.schedule('*/30 * * * *', async () => {
   ```

3. **保存文件并提交到 GitHub**
   ```bash
   git add backend/server.js
   git commit -m "优化定时任务频率，降低CPU使用率"
   git push
   ```

4. **Railway 会自动重新部署**
   - Railway 检测到代码更新会自动部署
   - 等待部署完成

---

### 完整优化（方案 1 - 使用环境变量）

如果你想要更灵活的配置，我可以帮你修改代码支持环境变量控制。

---

## 📋 推荐的更新频率

### 对于 Railway 免费版：

| 任务类型 | 原频率 | 推荐频率 | 说明 |
|---------|-------|---------|------|
| 赛事更新 | 每 5 分钟 | 每 30 分钟 | 减少 CPU 使用 |
| 资讯更新 | 每小时 | 每 2-4 小时 | 资讯更新不需要太频繁 |
| 数据备份 | 每天凌晨 3 点 | 保持不变 | 频率合理 |

---

## ✅ 优化后检查

完成优化后：

1. **等待 Railway 重新部署完成**
2. **查看 CPU 使用率**
   - 进入 Railway 项目 → "Observability"（可观测性）
   - 确认 CPU 使用率是否降低

3. **确认功能正常**
   - 测试 API 端点
   - 确认数据仍然会更新（只是频率降低）

---

## 🎯 其他优化建议

### 1. 减少日志输出

在 Railway "Variables" 中添加：
```
LOG_LEVEL=warn
```

### 2. 增加缓存时间

在 Railway "Variables" 中添加：
```
CACHE_TTL_NEWS=7200        # 2小时
CACHE_TTL_EVENTS=1800      # 30分钟
```

### 3. 禁用不必要的功能

如果不需要自动更新，可以设置：
```
EVENT_UPDATE_INTERVAL=0    # 禁用赛事自动更新
NEWS_UPDATE_INTERVAL=0     # 禁用资讯自动更新
```

---

## 📝 修改代码示例

如果你选择方案 1（环境变量控制），我可以帮你修改代码。告诉我你的选择：

1. **方案 1**：修改代码支持环境变量（更灵活）
2. **方案 2**：直接修改定时任务频率（更简单）

---

需要我帮你修改代码吗？告诉我你的选择！🚀



















































