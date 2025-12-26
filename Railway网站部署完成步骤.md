# Railway 网站部署完成步骤 🚀

## 📋 当前状态检查

首先确认你的部署状态：

### 在 Railway 项目页面检查：

1. **查看部署状态**
   - 点击 **"Deployments"（部署）** 标签页
   - 查看最新部署的状态：
     - ✅ **"Active"** 或 **"Success"** = 部署成功
     - ⏳ **"Building"** = 正在部署中
     - ❌ **"Failed"** = 部署失败

2. **检查服务状态**
   - 在项目主页，查看服务是否显示为绿色（运行中）

---

## 🎯 完成部署的步骤

### 步骤 1：确认根目录设置 ✅

1. **进入项目设置**
   - 点击项目页面顶部的 **"Settings"（设置）** 标签页

2. **检查根目录**
   - 找到 **"Root Directory"（根目录）**
   - 确认设置为：`backend`
   - 如果不是，修改为 `backend` 并保存

---

### 步骤 2：配置必需的环境变量 ✅

1. **进入变量设置**
   - 点击项目页面顶部的 **"Variables"（变量）** 标签页

2. **添加必需变量**

   **变量 1：运行环境**
   ```
   变量名: NODE_ENV
   变量值: production
   ```

   **变量 2：AI API Key（必需，至少一个）**
   ```
   变量名: ZHIPU_API_KEY_EVO
   变量值: 你的智谱AI密钥
   ```
   或
   ```
   变量名: ZHIPU_API_KEY_ADMIN
   变量值: 你的智谱AI密钥
   ```

3. **添加优化变量（降低 CPU 使用率）**

   **变量 3：日志级别**
   ```
   变量名: LOG_LEVEL
   变量值: warn
   ```

   **变量 4：更新频率（可选）**
   ```
   变量名: UPDATE_INTERVAL_EVENTS
   变量值: 1800
   ```

   ```
   变量名: UPDATE_INTERVAL_NEWS
   变量值: 7200
   ```

4. **保存变量**
   - 每添加一个变量后，点击 **"Add"（添加）**
   - Railway 会自动重新部署

---

### 步骤 3：获取网站访问地址 🌐

1. **进入项目设置**
   - 点击 **"Settings"（设置）** 标签页

2. **找到域名设置**
   - 找到 **"Domains"（域名）** 或 **"Generate Domain"（生成域名）** 选项
   - Railway 会自动生成一个公共 URL，例如：
     ```
     https://your-project-name.up.railway.app
     ```

3. **复制访问地址**
   - 点击域名旁边的复制按钮
   - **保存这个地址**，这是你的网站访问地址

---

### 步骤 4：验证网站部署 ✅

访问以下地址验证部署是否成功：

#### 4.1 健康检查
```
https://your-project-name.up.railway.app/api/health
```
**应该返回：**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

#### 4.2 前端主页
```
https://your-project-name.up.railway.app/
```
**应该看到：** 你的网站主页（智鸽系统）

#### 4.3 API 端点
```
https://your-project-name.up.railway.app/api
```
**应该返回：** API 信息或文档

#### 4.4 后台管理
```
https://your-project-name.up.railway.app/admin.html
```
**应该看到：** 后台管理登录页面

---

### 步骤 5：优化配置（降低 CPU 使用率）⚡

如果看到 CPU 使用率高的警告，添加以下环境变量：

1. **在 "Variables"（变量）标签页添加：**

   ```
   LOG_LEVEL=warn
   UPDATE_INTERVAL_EVENTS=1800
   UPDATE_INTERVAL_NEWS=7200
   ```

2. **等待重新部署**
   - Railway 会自动重新部署
   - 等待 1-2 分钟

3. **检查 CPU 使用率**
   - 点击 **"Observability"（可观测性）** 标签页
   - 查看 CPU 使用率是否降低

---

## ✅ 部署完成检查清单

完成以下所有步骤后，你的网站就部署完成了：

- [ ] ✅ Root Directory 已设置为 `backend`
- [ ] ✅ `NODE_ENV=production` 已添加
- [ ] ✅ AI API Key（至少一个）已添加
- [ ] ✅ 部署状态显示为 "Active" 或 "Success"
- [ ] ✅ 已获取并保存网站访问地址
- [ ] ✅ 健康检查端点返回成功
- [ ] ✅ 可以访问网站主页
- [ ] ✅ CPU 使用率正常（如果之前有警告）

---

## 🎉 部署完成后的操作

### 1. 测试网站功能

访问你的网站地址，测试：
- ✅ 主页是否正常显示
- ✅ 登录功能是否正常
- ✅ API 是否响应
- ✅ 后台管理是否可以访问

### 2. 配置默认管理员

首次访问后台管理：
- 默认用户名：`admin`
- 默认密码：`admin123`
- **建议首次登录后立即修改密码**

### 3. 分享网站地址

你的网站现在可以通过以下地址访问：
```
https://your-project-name.up.railway.app
```

---

## 🔧 后续优化（可选）

### 1. 配置自定义域名

如果需要使用自己的域名：
1. 在 Railway "Settings" → "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 2. 监控和日志

- **查看日志：** "Deployments" → 点击部署记录 → 查看日志
- **监控性能：** "Observability" → 查看 CPU、内存使用率

### 3. 自动部署

Railway 已自动配置：
- ✅ 当你推送代码到 GitHub 的 `main` 分支时
- ✅ Railway 会自动检测并重新部署

---

## 🆘 如果遇到问题

### 问题 1：部署失败

**检查：**
1. Root Directory 是否正确设置为 `backend`
2. 环境变量是否正确配置
3. 查看部署日志中的错误信息

### 问题 2：网站无法访问

**检查：**
1. 部署状态是否为 "Active"
2. 域名是否正确
3. 等待几分钟后重试（DNS 可能需要时间）

### 问题 3：CPU 使用率仍然很高

**解决：**
1. 添加 `LOG_LEVEL=warn` 环境变量
2. 增加更新间隔时间
3. 检查代码中的定时任务频率

---

## 📝 重要信息记录

**请保存以下信息：**

1. **网站访问地址：**
   ```
   https://your-project-name.up.railway.app
   ```

2. **后台管理地址：**
   ```
   https://your-project-name.up.railway.app/admin.html
   ```

3. **API 健康检查：**
   ```
   https://your-project-name.up.railway.app/api/health
   ```

4. **默认管理员账号：**
   - 用户名：`admin`
   - 密码：`admin123`（首次登录后请修改）

---

## 🎯 现在就开始

按照以下顺序操作：

1. ✅ **检查部署状态** → "Deployments" 标签页
2. ✅ **设置根目录** → "Settings" → Root Directory = `backend`
3. ✅ **添加环境变量** → "Variables" → 添加必需变量
4. ✅ **获取访问地址** → "Settings" → "Domains"
5. ✅ **验证网站** → 访问健康检查端点
6. ✅ **优化配置** → 添加 CPU 优化变量（如果需要）

完成这些步骤后，你的网站就成功部署了！🚀

---

需要帮助？告诉我你在哪一步遇到了问题！

















































