# Railway 配置对应网站中文设置指南 📖

## 🎯 说明

根据你网站中的中文设置界面，这里是 Railway 部署配置的对应说明。

---

## 📋 Railway 配置与网站设置的对应关系

### 1. 根目录设置（Root Directory）

**网站中文界面：** 无直接对应（这是 Railway 部署专用设置）

**Railway 操作：**
- 在 Railway 项目页面 → **"Settings"（设置）** 标签页
- 找到 **"Root Directory"（根目录）**
- 设置为：`backend`

**为什么：**
- 你的网站后端代码在 `backend` 文件夹
- `server.js` 和 `package.json` 都在 `backend` 目录
- Railway 需要知道从哪里启动服务

---

### 2. 运行环境（NODE_ENV）

**网站中文界面：** 
- 后台管理 → 基础设置 → **"运行环境"**
- 选项：开发环境 / 生产环境

**Railway 操作：**
- 在 Railway 项目页面 → **"Variables"（变量）** 标签页
- 点击 **"+ New Variable"（新建变量）**
- 变量名：`NODE_ENV`
- 变量值：`production`（生产环境）

**对应关系：**
- 网站中的 **"生产环境"** = Railway 的 `NODE_ENV=production`
- 网站中的 **"开发环境"** = Railway 的 `NODE_ENV=development`

---

### 3. 服务器端口（PORT）

**网站中文界面：**
- 后台管理 → 基础设置 → **"服务器端口"**
- 默认：3000

**Railway 操作：**
- Railway 会自动提供 `PORT` 环境变量
- 如果需要显式设置：
  - 在 **"Variables"（变量）** 标签页
  - 添加：`PORT` = `3000`

**注意：**
- Railway 会自动分配端口，通常不需要手动设置
- 但可以显式设置为 3000

---

### 4. API 速率限制（API_RATE_LIMIT）

**网站中文界面：**
- 后台管理 → 基础设置 → **"API速率限制"**
- 说明：每分钟最大请求数
- 默认：100

**Railway 操作：**
- 在 **"Variables"（变量）** 标签页
- 添加：`API_RATE_LIMIT` = `100`

---

### 5. 日志级别（LOG_LEVEL）

**网站中文界面：**
- 后台管理 → 基础设置 → **"日志级别"**
- 选项：错误 / 警告 / 信息 / 调试

**Railway 操作：**
- 在 **"Variables"（变量）** 标签页
- 添加：`LOG_LEVEL` = `info`（信息）

**对应关系：**
- 错误 = `error`
- 警告 = `warn`
- 信息 = `info`
- 调试 = `debug`

---

### 6. AI API Key 配置

**网站中文界面：**
- 网站设置中没有直接显示（这是后台配置）

**Railway 操作：**
- 在 **"Variables"（变量）** 标签页
- 添加以下之一（至少一个）：
  - `ZHIPU_API_KEY_EVO` = 你的智谱AI密钥（用于主站Evo智能助手）
  - `ZHIPU_API_KEY_ADMIN` = 你的智谱AI密钥（用于后台中枢管家）

**获取密钥：**
- 访问：https://open.bigmodel.cn/
- 注册并获取 API Key

---

### 7. RSS 数据源配置（RSS_SOURCES）

**网站中文界面：**
- 后台管理 → RSS源管理 → **"RSS数据源管理"**
- 可以添加多个 RSS 源

**Railway 操作：**
- 在 **"Variables"（变量）** 标签页
- 添加：`RSS_SOURCES` = `中国信鸽信息网|https://www.chinaxinge.com/rss|media|national`

**格式说明：**
- 多个源用分号（`;`）分隔
- 每个源的格式：`名称|URL|类型|地区`
- 例如：`源1|URL1|media|national;源2|URL2|association|local`

---

### 8. 缓存配置

**网站中文界面：**
- 后台管理 → 缓存配置
- 包括：资讯缓存时间、赛事缓存时间、结果缓存时间

**Railway 操作：**
- 在 **"Variables"（变量）** 标签页
- 添加以下变量（可选）：
  - `CACHE_TTL_NEWS` = `3600`（资讯缓存时间，秒）
  - `CACHE_TTL_EVENTS` = `300`（赛事缓存时间，秒）
  - `CACHE_TTL_RESULTS` = `7200`（结果缓存时间，秒）

---

## 🚀 Railway 完整配置步骤（中文对照版）

### 第一步：创建项目

1. **在 Railway 页面**
   - 点击 **"New Project"（新建项目）**
   - 点击 **"Deploy Repository"（部署仓库）**
   - 选择 `lly-lly123/pigeon-ai`

### 第二步：设置根目录

1. **进入项目设置**
   - 点击项目页面顶部的 **"Settings"（设置）** 标签页

2. **设置根目录**
   - 找到 **"Root Directory"（根目录）**
   - 输入：`backend`
   - 点击 **"Save"（保存）**

### 第三步：配置环境变量

1. **进入变量设置**
   - 点击项目页面顶部的 **"Variables"（变量）** 标签页

2. **添加必需变量**

   **变量 1：运行环境**
   - 变量名：`NODE_ENV`
   - 变量值：`production`
   - 点击 **"Add"（添加）**

   **变量 2：AI API Key（至少一个）**
   - 变量名：`ZHIPU_API_KEY_EVO`
   - 变量值：你的智谱AI密钥
   - 点击 **"Add"（添加）**

3. **添加可选变量**

   **变量 3：API 速率限制**
   - 变量名：`API_RATE_LIMIT`
   - 变量值：`100`

   **变量 4：日志级别**
   - 变量名：`LOG_LEVEL`
   - 变量值：`info`

   **变量 5：RSS 数据源**
   - 变量名：`RSS_SOURCES`
   - 变量值：`中国信鸽信息网|https://www.chinaxinge.com/rss|media|national`

### 第四步：等待部署

1. **查看部署状态**
   - 点击 **"Deployments"（部署）** 标签页
   - 等待状态变为 **"Active"（活跃）** 或 **"Success"（成功）**

2. **获取访问地址**
   - 在 **"Settings"（设置）** → **"Domains"（域名）**
   - Railway 会自动生成一个地址，例如：
     ```
     https://your-project.up.railway.app
     ```

---

## 📊 配置对照表

| 网站中文设置 | Railway 变量名 | 变量值示例 | 是否必需 |
|------------|--------------|-----------|---------|
| 运行环境：生产环境 | `NODE_ENV` | `production` | ✅ 必需 |
| 服务器端口 | `PORT` | `3000` | ⚠️ Railway自动提供 |
| API速率限制 | `API_RATE_LIMIT` | `100` | ❌ 可选 |
| 日志级别：信息 | `LOG_LEVEL` | `info` | ❌ 可选 |
| AI API Key | `ZHIPU_API_KEY_EVO` | 你的密钥 | ✅ 必需（至少一个） |
| RSS数据源 | `RSS_SOURCES` | `名称\|URL\|类型\|地区` | ❌ 可选 |
| 资讯缓存时间 | `CACHE_TTL_NEWS` | `3600` | ❌ 可选 |
| 赛事缓存时间 | `CACHE_TTL_EVENTS` | `300` | ❌ 可选 |

---

## ✅ 最小必需配置

如果只想快速部署，最少需要配置：

1. **Root Directory** = `backend`
2. **NODE_ENV** = `production`
3. **ZHIPU_API_KEY_EVO** 或 **ZHIPU_API_KEY_ADMIN** = 你的AI密钥

其他配置可以后续在网站后台管理中设置。

---

## 🎯 操作提示

### Railway 界面中文对照：

- **"New Project"** = 新建项目
- **"Deploy Repository"** = 部署仓库
- **"Settings"** = 设置
- **"Variables"** = 变量（环境变量）
- **"Deployments"** = 部署
- **"Root Directory"** = 根目录
- **"+ New Variable"** = 新建变量
- **"Save"** = 保存
- **"Add"** = 添加

---

## 📝 配置检查清单

完成配置后，确认：

- [ ] Root Directory 已设置为 `backend`
- [ ] `NODE_ENV` = `production` 已添加
- [ ] AI API Key（至少一个）已添加
- [ ] 部署状态显示为 "Active" 或 "Success"
- [ ] 已获取访问地址

---

## 🆘 常见问题

### Q: Railway 界面是英文的，看不懂怎么办？
A: 参考上面的"Railway 界面中文对照"部分，找到对应的中文含义。

### Q: 网站后台的设置和 Railway 的设置有什么区别？
A: 
- **Railway 设置**：部署时的环境变量配置，影响整个服务运行
- **网站后台设置**：运行时的配置，可以通过网站界面修改

### Q: 在 Railway 配置后，还需要在网站后台设置吗？
A: 部分配置需要在 Railway 设置（如 AI API Key），部分可以在网站后台设置（如 RSS 源、缓存时间）。

---

祝你配置顺利！🚀
















































