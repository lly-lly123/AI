# 🚀 免费部署指南 - Zeabur（国内可访问）

> **完全免费 | 国内无需VPN | 长期运行 | 云端存储支持**

## 📋 方案概述

本指南将帮助您将网站部署到 **Zeabur**，这是一个：
- ✅ **完全免费**：免费额度充足，适合中小型项目
- ✅ **国内可访问**：无需VPN，访问速度快
- ✅ **长期运行**：支持24/7运行，不会休眠
- ✅ **云端存储**：集成Supabase免费云数据库和存储

---

## 🎯 第一步：注册Zeabur账号

1. **访问Zeabur官网**
   - 网址：https://zeabur.com
   - 点击右上角 **"Sign Up"** 或 **"注册"**

2. **选择注册方式**
   - 推荐使用 **GitHub账号** 登录（最方便）
   - 也可以使用邮箱注册

3. **完成注册**
   - 按照提示完成账号验证

---

## 🔧 第二步：准备项目配置

### 2.1 创建Zeabur配置文件

在项目根目录创建 `zeabur.json` 配置文件（已自动创建，见下方）

### 2.2 配置环境变量

准备以下环境变量（稍后在Zeabur控制台配置）：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# Supabase云端存储配置（免费版）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AI配置（可选）
ZHIPU_API_KEY_EVO=your_zhipu_key
ZHIPU_API_KEY_ADMIN=your_zhipu_key
AI_MODEL=auto

# 其他配置
API_KEY=your_api_key
LOG_LEVEL=info
```

---

## 📦 第三步：创建Supabase免费云存储

### 3.1 注册Supabase账号

1. 访问：https://supabase.com
2. 点击 **"Start your project"**
3. 使用GitHub账号登录（推荐）

### 3.2 创建新项目

1. 点击 **"New Project"**
2. 填写项目信息：
   - **Name**: pigeonai（或您喜欢的名称）
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择 **Southeast Asia (Singapore)** 或 **East Asia (Tokyo)**（离中国更近）
3. 点击 **"Create new project"**
4. 等待项目创建完成（约2-3分钟）

### 3.3 获取Supabase配置信息

1. 在项目页面，点击左侧 **"Settings"**（设置）
2. 点击 **"API"**
3. 找到以下信息：
   - **Project URL** → 这就是 `SUPABASE_URL`
   - **anon public** key → 这就是 `SUPABASE_ANON_KEY`

### 3.4 创建数据库表

1. 点击左侧 **"SQL Editor"**
2. 点击 **"New query"**
3. 复制并执行以下SQL（创建所需的数据表）：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建鸽子数据表
CREATE TABLE IF NOT EXISTS pigeons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  ring_number TEXT,
  breed TEXT,
  color TEXT,
  gender TEXT,
  birth_date DATE,
  parent_male TEXT,
  parent_female TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建训练记录表
CREATE TABLE IF NOT EXISTS training (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pigeon_id TEXT NOT NULL,
  date DATE NOT NULL,
  distance REAL,
  duration INTEGER,
  weather TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建比赛表
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE,
  distance REAL,
  location TEXT,
  category TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建管理员日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  username TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建令牌表
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'access',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建资讯源表
CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  region TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  details JSONB,
  source TEXT,
  page TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户数据表
CREATE TABLE IF NOT EXISTS user_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data_type TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建备份表
CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  users JSONB,
  user_data JSONB,
  total_users INTEGER,
  total_data_records INTEGER
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_pigeons_user_id ON pigeons(user_id);
CREATE INDEX IF NOT EXISTS idx_training_user_id ON training(user_id);
CREATE INDEX IF NOT EXISTS idx_training_pigeon_id ON training(pigeon_id);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON admin_logs(user_id);
```

4. 点击 **"Run"** 执行SQL
5. 确认所有表创建成功

---

## 🚀 第四步：部署到Zeabur

### 4.1 将代码推送到GitHub

如果您的代码还没有在GitHub上：

1. 在GitHub创建新仓库
2. 将代码推送到GitHub：

```bash
cd /Users/macbookair/Desktop/AI
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 4.2 在Zeabur创建项目

1. 登录Zeabur控制台：https://zeabur.com
2. 点击 **"New Project"**（新建项目）
3. 输入项目名称：`pigeonai`（或您喜欢的名称）
4. 点击 **"Create"**

### 4.3 连接GitHub仓库

1. 在项目页面，点击 **"Add Service"**
2. 选择 **"GitHub"**
3. 授权Zeabur访问您的GitHub账号（如果首次使用）
4. 选择您的仓库
5. 点击 **"Deploy"**

### 4.4 配置部署设置

Zeabur会自动检测到Node.js项目，但需要确认以下设置：

1. **Root Directory**: 留空（项目根目录）
2. **Build Command**: `cd backend && npm install`
3. **Start Command**: `cd backend && npm start`
4. **Node Version**: 选择 `18.x` 或 `20.x`

### 4.5 配置环境变量

1. 在服务页面，点击 **"Variables"**（环境变量）
2. 添加以下环境变量：

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=你的Supabase_URL
SUPABASE_ANON_KEY=你的Supabase_Anon_Key
ZHIPU_API_KEY_EVO=你的智谱AI_Key（可选）
ZHIPU_API_KEY_ADMIN=你的智谱AI_Key（可选）
AI_MODEL=auto
API_KEY=your_api_key_here
LOG_LEVEL=info
```

3. 点击 **"Save"** 保存

### 4.6 等待部署完成

1. Zeabur会自动开始构建和部署
2. 等待约3-5分钟
3. 部署完成后，会显示一个公网访问地址，例如：
   - `https://your-project.zeabur.app`

---

## ✅ 第五步：验证部署

### 5.1 访问网站

1. 在Zeabur控制台，找到您的服务
2. 点击服务名称，查看 **"Domains"**（域名）
3. 点击公网地址访问网站

### 5.2 测试功能

1. **访问首页**：`https://your-project.zeabur.app`
2. **访问管理后台**：`https://your-project.zeabur.app/admin.html`
3. **测试API**：`https://your-project.zeabur.app/api/health`（如果有）

### 5.3 检查日志

1. 在Zeabur控制台，点击服务
2. 点击 **"Logs"**（日志）
3. 查看是否有错误信息

---

## 🔄 第六步：配置自动部署

### 6.1 启用自动部署

Zeabur默认已启用自动部署：
- 当您推送代码到GitHub的 `main` 分支时
- Zeabur会自动检测并重新部署

### 6.2 手动触发部署

如果需要手动触发：

1. 在Zeabur控制台，点击服务
2. 点击 **"Redeploy"**（重新部署）

---

## 💾 云端存储说明

### 数据存储方式

项目使用 **Supabase** 作为云端存储：

1. **数据库存储**：所有业务数据存储在Supabase PostgreSQL数据库
2. **自动同步**：本地数据自动同步到云端
3. **数据备份**：Supabase自动备份数据

### 免费额度

Supabase免费版提供：
- ✅ 500MB 数据库存储
- ✅ 1GB 文件存储
- ✅ 2GB 带宽/月
- ✅ 50,000 月活跃用户
- ✅ 无限API请求

对于中小型项目完全够用！

---

## 🛠️ 常见问题

### Q1: 部署失败怎么办？

**A**: 检查以下几点：
1. 查看Zeabur日志，找到错误信息
2. 确认环境变量配置正确
3. 确认 `package.json` 中的启动脚本正确
4. 确认Node.js版本兼容

### Q2: 如何更新代码？

**A**: 
1. 修改本地代码
2. 推送到GitHub：`git push origin main`
3. Zeabur会自动检测并重新部署

### Q3: 如何查看日志？

**A**: 
1. 在Zeabur控制台，点击服务
2. 点击 **"Logs"** 标签页
3. 实时查看应用日志

### Q4: 如何配置自定义域名？

**A**: 
1. 在Zeabur控制台，点击服务
2. 点击 **"Domains"**
3. 添加您的自定义域名
4. 按照提示配置DNS记录

### Q5: Supabase连接失败？

**A**: 检查：
1. `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确
2. Supabase项目是否已创建
3. 数据库表是否已创建
4. 网络连接是否正常

---

## 📊 费用说明

### Zeabur免费额度

- ✅ **免费额度**：每月 $5 免费额度
- ✅ **适合项目**：中小型项目完全够用
- ✅ **超出后**：按使用量付费，价格透明

### Supabase免费额度

- ✅ **完全免费**：免费版功能已足够
- ✅ **无时间限制**：永久免费
- ✅ **升级可选**：需要更多资源时可升级

---

## 🎉 完成！

恭喜！您的网站已成功部署到Zeabur，现在可以：

1. ✅ **国内访问**：无需VPN，访问速度快
2. ✅ **长期运行**：24/7运行，不会休眠
3. ✅ **云端存储**：数据安全存储在Supabase
4. ✅ **自动部署**：代码更新自动部署

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看Zeabur文档：https://zeabur.com/docs
2. 查看Supabase文档：https://supabase.com/docs
3. 查看项目日志排查问题

祝您使用愉快！🎊

















