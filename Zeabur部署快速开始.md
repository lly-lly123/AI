# 🚀 Zeabur部署快速开始指南

> **代码已成功推送到GitHub！现在可以开始部署到Zeabur了！**

## ✅ 当前状态

- ✅ **代码已提交**：所有部署代码已保存
- ✅ **代码已推送**：已成功推送到GitHub仓库
- ✅ **仓库地址**：https://github.com/lly-lly123/AI.git
- ✅ **分支**：main

---

## 🎯 立即开始部署（5步完成）

### 第1步：登录Zeabur并创建项目

1. **访问Zeabur**：https://zeabur.com
2. **登录账号**：
   - 点击右上角 **"Sign In"** 或 **"登录"**
   - 使用GitHub账号登录（推荐，最方便）
3. **创建项目**：
   - 点击 **"New Project"**（新建项目）
   - 项目名称：`pigeonai`（或您喜欢的名称）
   - 点击 **"Create"**

---

### 第2步：连接GitHub仓库

1. **添加服务**：
   - 在项目页面，点击 **"Add Service"**（添加服务）
   - 选择 **"GitHub"**
2. **授权和选择仓库**：
   - 如果首次使用，授权Zeabur访问您的GitHub账号
   - 选择仓库：`lly-lly123/AI`
   - 点击 **"Deploy"**（部署）
3. **等待自动检测**：
   - Zeabur会自动检测到Node.js项目
   - 会自动设置Build Command和Start Command

---

### 第3步：配置构建命令（如果需要）

如果Build Plan Preview中显示Build Command和Start Command为空：

1. 点击 **"Configure"** 按钮
2. 手动设置：
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `.`（项目根目录）
   - **Node Version**: `18.x` 或 `20.x`
3. 点击 **"Deploy"**

---

### 第4步：配置环境变量

在Zeabur服务页面：

1. **打开环境变量设置**：
   - 点击服务名称
   - 点击 **"Variables"**（环境变量）标签页

2. **添加必需的环境变量**：
   - 点击 **"Add Variable"**（添加变量）
   - 依次添加以下变量：

#### 基础配置

```env
PORT=3000
NODE_ENV=production
```

#### Cloudflare R2配置（10GB永久免费）

```env
CLOUDFLARE_R2_ACCOUNT_ID=你的AccountID
CLOUDFLARE_R2_ACCESS_KEY_ID=你的AccessKey
CLOUDFLARE_R2_SECRET_ACCESS_KEY=你的SecretKey
CLOUDFLARE_R2_BUCKET_NAME=pigeonai
```

#### Supabase配置（数据库1GB）

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_STORAGE_BUCKET=files
```

#### MinIO配置（开源存储，稍后部署）

```env
MINIO_ENDPOINT=http://your-minio-service.zeabur.app:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=你的强密码
MINIO_BUCKET=pigeonai
MINIO_USE_SSL=false
```

#### TeraBox配置（1TB永久免费，可选）

```env
TERABOX_ACCESS_TOKEN=你的token（如果已获取）
TERABOX_REFRESH_TOKEN=你的refresh_token（如果已获取）
```

#### AI配置（可选）

```env
ZHIPU_API_KEY_EVO=你的智谱AI_Key（可选）
ZHIPU_API_KEY_ADMIN=你的智谱AI_Key（可选）
AI_MODEL=auto
```

#### 其他配置

```env
API_KEY=your_api_key_here
LOG_LEVEL=info
```

3. **保存配置**：
   - 添加完所有变量后，点击 **"Save"** 或 **"Deploy"**

---

### 第5步：等待部署完成

1. **查看部署进度**：
   - Zeabur会自动开始构建和部署
   - 在服务页面可以看到部署日志

2. **部署时间**：
   - 首次部署约3-5分钟
   - 可以看到构建日志实时更新

3. **部署完成**：
   - 部署成功后，会显示一个公网访问地址
   - 例如：`https://your-project-xxxxx.zeabur.app`

---

## ✅ 部署完成后的验证

### 1. 访问网站

1. 在Zeabur服务页面，找到 **"Domains"**（域名）
2. 点击公网地址访问网站
3. 应该能看到网站首页

### 2. 测试API

访问以下地址测试API是否正常工作：

- 健康检查：`https://your-project.zeabur.app/api/health`
- 存储状态：`https://your-project.zeabur.app/api/storage/status`

### 3. 检查日志

1. 在Zeabur服务页面，点击 **"Logs"**（日志）
2. 查看是否有错误信息
3. 确认服务正常运行

---

## 🔄 后续：部署MinIO（可选，扩展存储容量）

如果需要更大的存储容量，可以部署MinIO服务：

### 在Zeabur上部署MinIO

1. **添加新服务**：
   - 在Zeabur项目中，点击 **"Add Service"**
   - 选择 **"Docker"** 或 **"Public Docker Image"**

2. **配置MinIO**：
   - **镜像名称**：`minio/minio:latest`
   - **命令**：`server /data --console-address ":9001"`
   - **环境变量**：
     ```
     MINIO_ROOT_USER=minioadmin
     MINIO_ROOT_PASSWORD=你的强密码
     ```

3. **获取MinIO地址**：
   - 部署完成后，会生成一个Zeabur地址
   - 例如：`http://your-minio-service.zeabur.app:9000`

4. **更新环境变量**：
   - 在主服务的环境变量中更新：
     ```
     MINIO_ENDPOINT=http://your-minio-service.zeabur.app:9000
     ```
   - 重新部署主服务

---

## 📋 部署检查清单

### 代码准备
- [x] 代码已提交到本地仓库
- [x] 代码已推送到GitHub
- [x] GitHub仓库地址正确

### Zeabur配置
- [ ] Zeabur账号已登录
- [ ] 项目已创建
- [ ] GitHub仓库已连接
- [ ] Build Command已配置
- [ ] Start Command已配置
- [ ] 环境变量已配置
- [ ] 部署已启动

### 存储服务配置
- [ ] Cloudflare R2已注册并配置
- [ ] Supabase已创建并配置
- [ ] MinIO已部署（可选）
- [ ] TeraBox已注册（可选）

### 部署验证
- [ ] 网站可以访问
- [ ] API正常工作
- [ ] 日志无错误
- [ ] 存储服务连接正常

---

## 🎉 完成！

部署完成后，您的网站将拥有：

- ✅ **永久免费运行** - Zeabur免费额度充足
- ✅ **超大容量存储** - 1TB+永久免费存储
- ✅ **完全免费** - 无任何隐藏费用
- ✅ **无需VPN** - 国内可访问
- ✅ **访问速度快** - Cloudflare CDN加速
- ✅ **自动部署** - 代码更新后自动重新部署

---

## 📖 相关文档

- **详细部署指南**：`最终部署方案检查报告.md`
- **存储配置说明**：`超大容量存储方案.md`
- **立即开始配置**：`立即开始部署指南.md`

---

**🚀 现在就开始在Zeabur上部署您的网站吧！**












