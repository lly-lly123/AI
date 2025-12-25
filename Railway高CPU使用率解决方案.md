# Railway 高 CPU 使用率解决方案 ⚠️

## 🔴 当前问题

Railway 显示警告：
```
High CPU Usage
backend's CPU is close to maximum capacity—service may crash.
```

这表示你的后端服务 CPU 使用率过高，可能导致服务崩溃。

---

## 🔍 问题原因分析

### 可能的原因：

1. **代码中有无限循环或频繁的定时任务**
2. **数据处理任务过于繁重**
3. **API 请求处理效率低**
4. **日志记录过于频繁**
5. **缓存未正确配置**
6. **RSS 数据源更新过于频繁**

---

## 🛠️ 解决方案

### 方案 1：优化代码（推荐）

#### 1.1 检查定时任务频率

检查 `backend/server.js` 中的定时任务：

```javascript
// 检查这些定时任务的频率
cron.schedule('*/5 * * * *', ...)  // 每5分钟
cron.schedule('*/1 * * * *', ...)  // 每分钟（可能太频繁）
```

**建议：**
- RSS 更新：改为每 30 分钟或 1 小时一次
- 数据预加载：减少频率或移除
- 缓存清理：改为每天一次

#### 1.2 优化日志记录

在 Railway 环境变量中设置：

```
LOG_LEVEL=warn
```

只记录警告和错误，减少日志输出。

#### 1.3 启用缓存

确保缓存配置正确：

```
CACHE_TTL_NEWS=3600
CACHE_TTL_EVENTS=300
CACHE_TTL_RESULTS=7200
```

---

### 方案 2：增加资源（临时方案）

#### 在 Railway 中增加副本：

1. **点击 "Add Replicas" 按钮**
   - 在警告框中点击这个按钮
   - Railway 会创建多个服务实例分担负载

2. **或者手动增加：**
   - 进入项目 → "Settings"（设置）
   - 找到 "Scaling"（扩展）选项
   - 增加副本数量

**注意：** 这可能会增加费用（如果超出免费额度）

---

### 方案 3：优化环境变量配置

在 Railway 的 "Variables"（变量）中添加：

```
# 减少更新频率
UPDATE_INTERVAL_NEWS=7200      # 2小时更新一次（原来是3600秒）
UPDATE_INTERVAL_EVENTS=1800    # 30分钟更新一次（原来是300秒）
UPDATE_INTERVAL_RESULTS=14400  # 4小时更新一次（原来是1800秒）

# 减少日志输出
LOG_LEVEL=warn                 # 只记录警告和错误

# 增加缓存时间
CACHE_TTL_NEWS=7200           # 2小时缓存（原来是3600秒）
CACHE_TTL_EVENTS=600          # 10分钟缓存（原来是300秒）
```

---

### 方案 4：检查代码中的性能问题

#### 检查以下文件：

1. **`backend/server.js`**
   - 查看定时任务（cron jobs）的频率
   - 检查数据预加载逻辑

2. **`backend/services/dataService.js`**
   - 检查 RSS 解析和数据处理
   - 确保有适当的错误处理和超时设置

3. **`backend/routes/api.js`**
   - 检查 API 路由是否有性能问题
   - 确保有适当的缓存机制

---

## 🔧 立即操作步骤

### 步骤 1：添加环境变量优化配置

1. **在 Railway 项目页面**
   - 点击 **"Variables"（变量）** 标签页

2. **添加以下变量：**

   ```
   变量名: UPDATE_INTERVAL_NEWS
   变量值: 7200
   ```

   ```
   变量名: UPDATE_INTERVAL_EVENTS
   变量值: 1800
   ```

   ```
   变量名: LOG_LEVEL
   变量值: warn
   ```

3. **保存后重新部署**
   - Railway 会自动重新部署
   - 等待部署完成

### 步骤 2：检查代码中的定时任务

让我帮你检查代码中的定时任务配置：

---

## 📋 检查清单

完成以下检查：

- [ ] 已添加 `LOG_LEVEL=warn` 环境变量
- [ ] 已增加 `UPDATE_INTERVAL_*` 的值（减少更新频率）
- [ ] 已检查代码中的定时任务频率
- [ ] 已确认缓存配置正确
- [ ] CPU 使用率是否降低

---

## 🎯 快速修复（最小改动）

**立即添加这些环境变量：**

```
LOG_LEVEL=warn
UPDATE_INTERVAL_NEWS=7200
UPDATE_INTERVAL_EVENTS=1800
```

这可以快速降低 CPU 使用率，无需修改代码。

---

## 📊 监控 CPU 使用率

### 在 Railway 中查看：

1. **进入项目页面**
2. **点击 "Observability"（可观测性）** 标签页
3. **查看 CPU 使用率图表**
4. **确认优化后是否降低**

---

## 🆘 如果问题持续

### 进一步优化：

1. **禁用不必要的功能**
   - 如果不需要 RSS 更新，可以暂时禁用
   - 减少数据预加载

2. **代码优化**
   - 优化数据库查询
   - 减少不必要的计算
   - 使用更高效的算法

3. **考虑升级计划**
   - Railway 免费版有资源限制
   - 如果项目需要更多资源，考虑升级

---

## 💡 预防措施

### 部署前检查：

1. **测试本地性能**
   - 在本地运行服务
   - 监控 CPU 和内存使用
   - 优化后再部署

2. **设置合理的更新频率**
   - RSS 更新：每小时或更少
   - 数据同步：按需而不是定时

3. **启用缓存**
   - 减少重复计算
   - 减少数据库查询

---

## 📝 相关配置

### 推荐的 Railway 环境变量配置：

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# AI 配置（必需）
ZHIPU_API_KEY_EVO=你的密钥

# 更新频率（优化后）
UPDATE_INTERVAL_NEWS=7200        # 2小时
UPDATE_INTERVAL_EVENTS=1800      # 30分钟
UPDATE_INTERVAL_RESULTS=14400    # 4小时

# 缓存配置
CACHE_TTL_NEWS=7200             # 2小时
CACHE_TTL_EVENTS=600            # 10分钟
CACHE_TTL_RESULTS=14400         # 4小时

# 日志配置（减少输出）
LOG_LEVEL=warn                   # 只记录警告和错误

# API 配置
API_RATE_LIMIT=100
```

---

## ✅ 优化后验证

完成优化后，检查：

1. **CPU 使用率是否降低**
   - 在 Railway "Observability" 中查看
   - 应该降到 50% 以下

2. **服务是否稳定运行**
   - 检查日志是否有错误
   - 确认服务没有崩溃

3. **功能是否正常**
   - 测试 API 端点
   - 确认数据更新正常

---

需要我帮你检查代码中的定时任务配置吗？告诉我，我可以帮你优化！🚀






























