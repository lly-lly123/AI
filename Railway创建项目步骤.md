# Railway 创建项目步骤指南 🚀

## 📋 当前状态

- ✅ GitHub App 授权已完成
- ✅ 仓库 `lly-lly123/pigeon-ai` 已授权
- ⏳ 下一步：在 Railway 创建项目并连接 GitHub 仓库

---

## 🎯 步骤 1：创建新项目

### 在 Railway 页面操作：

1. **点击 "Create a New Project" 区域**
   - 你会看到几个选项图标

2. **选择 "Deploy a GitHub Repository"**
   - 点击 GitHub Octocat 图标（🐙）
   - 或者点击 "Deploy a GitHub Repository" 文字

3. **选择仓库**
   - Railway 会显示你已授权的仓库列表
   - 找到并选择：`lly-lly123/pigeon-ai`
   - 点击该仓库

---

## ⚙️ 步骤 2：配置项目设置

创建项目后，Railway 会进入项目配置页面，需要设置：

### 2.1 设置根目录（Root Directory）

1. 在项目设置中找到 **"Settings"** 标签页
2. 找到 **"Root Directory"** 选项
3. 设置为：`backend`
4. 点击 **"Save"** 保存

**为什么设置为 `backend`？**
- `server.js` 位于 `backend/` 目录
- `package.json` 位于 `backend/` 目录
- Railway 需要从包含 `package.json` 的目录启动

### 2.2 配置环境变量（Environment Variables）

1. 在项目页面，点击 **"Variables"** 标签页
2. 点击 **"+ New Variable"** 添加环境变量

**必需添加的环境变量：**

```
变量名: NODE_ENV
变量值: production
```

```
变量名: PORT
变量值: 3000
```
> 注意：Railway 会自动提供 PORT，但可以显式设置

**AI 配置（至少配置一个）：**

```
变量名: ZHIPU_API_KEY_EVO
变量值: 你的智谱AI密钥
```
或
```
变量名: ZHIPU_API_KEY_ADMIN
变量值: 你的智谱AI密钥
```

**其他可选配置：**

```
变量名: API_KEY
变量值: your-api-key-here
```

```
变量名: API_RATE_LIMIT
变量值: 100
```

```
变量名: RSS_SOURCES
变量值: 中国信鸽信息网|https://www.chinaxinge.com/rss|media|national
```

```
变量名: LOG_LEVEL
变量值: info
```

3. 每添加一个变量后，点击 **"Add"** 保存
4. 添加完所有变量后，Railway 会自动重新部署

---

## 🚀 步骤 3：部署和验证

### 3.1 自动部署

Railway 会自动：
- ✅ 检测到 `backend/package.json`
- ✅ 运行 `npm install` 安装依赖
- ✅ 运行 `npm start` 启动服务（对应 `node server.js`）

### 3.2 查看部署状态

1. 在项目页面，点击 **"Deployments"** 标签页
2. 查看最新的部署日志
3. 等待部署完成（通常需要 1-3 分钟）

### 3.3 获取访问地址

部署成功后：

1. 在项目页面，点击 **"Settings"** 标签页
2. 找到 **"Domains"** 或 **"Generate Domain"** 选项
3. Railway 会自动生成一个公共 URL，例如：
   ```
   https://your-project-name.up.railway.app
   ```

### 3.4 验证部署

访问以下端点验证部署是否成功：

**健康检查：**
```
https://your-project-name.up.railway.app/api/health
```
应该返回：
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

**API 根路径：**
```
https://your-project-name.up.railway.app/api
```

**前端页面：**
```
https://your-project-name.up.railway.app/
```

---

## 📸 操作截图说明

### 在 "Create a New Project" 页面：

1. **看到四个图标选项：**
   - 🐙 GitHub 图标 → 点击这个！
   - 🗄️ 数据库图标
   - 📦 应用图标
   - ➕ 加号图标

2. **点击 GitHub 图标后：**
   - Railway 会显示已授权的仓库列表
   - 选择 `lly-lly123/pigeon-ai`
   - 点击确认

---

## ✅ 检查清单

创建项目时确认：

- [ ] 已选择 "Deploy a GitHub Repository"
- [ ] 已选择仓库 `lly-lly123/pigeon-ai`
- [ ] Root Directory 已设置为 `backend`
- [ ] 已添加 `NODE_ENV=production`
- [ ] 已添加至少一个 AI API Key（`ZHIPU_API_KEY_EVO` 或 `ZHIPU_API_KEY_ADMIN`）
- [ ] 部署状态显示为 "Success" 或 "Active"
- [ ] 已获取公共访问 URL

---

## 🆘 常见问题

### Q: 找不到 "Deploy a GitHub Repository" 选项？
A: 确保你已经：
- 完成了 GitHub App 授权
- 在 GitHub 中保存了授权（点击了 "Save"）
- 刷新 Railway 页面

### Q: 部署失败怎么办？
A: 检查：
1. Root Directory 是否正确设置为 `backend`
2. 环境变量是否正确配置
3. 查看部署日志中的错误信息

### Q: 如何查看部署日志？
A: 在项目页面 → "Deployments" → 点击最新部署 → 查看日志

### Q: 如何更新代码？
A: Railway 会自动检测 GitHub 仓库的推送：
- 推送到 `main` 分支会自动触发重新部署
- 或者手动在 Railway 中点击 "Redeploy"

---

## 📚 相关文档

- `Railway部署配置指南.md` - 详细配置说明
- `Railway快速配置.txt` - 快速参考
- `Railway部署检查清单.md` - 完整检查清单

---

## 🎉 完成后的下一步

部署成功后，你可以：
1. 访问你的公共 URL
2. 测试 API 端点
3. 配置自定义域名（可选）
4. 设置自动部署（已默认启用）

祝你部署顺利！🚀


