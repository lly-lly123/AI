# 📋 获取 Supabase 配置的详细步骤

## 🎯 目标
获取以下三个配置值：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_STORAGE_BUCKET`（固定值：`files`）

---

## 📝 操作步骤

### 第1步：访问 Supabase
1. 打开浏览器
2. 访问：https://supabase.com
3. 点击右上角 "Start your project" 或 "Sign In"

### 第2步：登录/注册
1. 使用 GitHub 账号登录（推荐，最简单）
2. 或使用邮箱注册

### 第3步：创建新项目
1. 登录后，点击 "New Project"（新建项目）
2. 填写项目信息：
   - **Name**: `pigeonai`（或你喜欢的名称）
   - **Database Password**: 设置一个强密码（**请保存好，以后会用到**）
   - **Region**: 选择 `Southeast Asia (Singapore)` 或 `East Asia (Tokyo)`（离中国更近）
3. 点击 "Create new project"
4. 等待 2-3 分钟，项目创建完成

### 第4步：获取配置值
1. 项目创建完成后，点击左侧菜单的 **"Settings"**（设置图标）
2. 点击 **"API"** 选项
3. 在 "Project API keys" 部分，找到：
   - **Project URL** → 这就是 `SUPABASE_URL`
     - 格式：`https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** key → 这就是 `SUPABASE_ANON_KEY`
     - 格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的一串）

### 第5步：复制到 Zeabur
在 Zeabur 的 "Variable" 页面，添加：

```
变量名: SUPABASE_URL
值: https://你的项目ID.supabase.co
```

```
变量名: SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（完整的key）
```

```
变量名: SUPABASE_STORAGE_BUCKET
值: files
```

---

## ✅ 验证配置

运行检查脚本：
```bash
cd /Users/macbookair/Desktop/AI
export SUPABASE_URL="你的URL"
export SUPABASE_ANON_KEY="你的Key"
bash check-storage-config.sh
```

---

## 🆘 如果遇到问题

1. **找不到 Settings？**
   - 确保已登录并进入项目页面
   - Settings 在左侧菜单的最下方

2. **找不到 API 选项？**
   - 在 Settings 页面，API 是第一个选项

3. **项目创建失败？**
   - 检查网络连接
   - 尝试更换 Region
   - 等待更长时间（有时需要 5 分钟）

---

## 📞 需要帮助？

如果步骤不清楚，告诉我具体在哪一步卡住了。






