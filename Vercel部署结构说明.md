# 🚀 Vercel 部署结构说明

## 📋 部署后的访问结构

当整个文件夹上传到 Vercel 后，**不会自动区分后台和主站**，而是根据文件路径和路由配置来访问：

### 🌐 主站（前端）
- **访问地址**：`https://你的域名.vercel.app/`
- **对应文件**：`index.html`
- **功能**：用户前端界面，赛鸽管理系统主页面

### 🔐 后台管理
- **访问地址**：`https://你的域名.vercel.app/admin.html`
- **简化访问**：`https://你的域名.vercel.app/admin`（会自动重定向）
- **对应文件**：`admin.html`
- **功能**：管理员后台界面

### 🔌 API 接口
- **访问地址**：`https://你的域名.vercel.app/api/*`
- **对应文件**：`api/index.js`（Serverless Function）
- **功能**：后端 API 服务，处理数据请求

---

## 🏗️ Vercel 部署机制

### 1. **静态文件部署**
Vercel 会自动部署所有静态文件：
- ✅ HTML 文件（`index.html`, `admin.html`）
- ✅ CSS、JavaScript 文件
- ✅ 图片、字体等资源文件
- ✅ JSON 配置文件

### 2. **Serverless Functions**
- ✅ `api/index.js` 会被部署为 Serverless Function
- ✅ 所有 `/api/*` 请求都会路由到 `api/index.js`
- ✅ `api/index.js` 内部会调用 `backend/server.js` 的逻辑

### 3. **路由规则**（根据 `vercel.json`）
```
/api/*          → api/index.js (Serverless Function)
/admin          → admin.html (重定向)
/admin.html     → admin.html (直接访问)
/*.html         → 对应的 HTML 文件
/               → index.html (主站)
其他请求        → api/index.js (作为 API 处理)
```

---

## ⚠️ 重要注意事项

### 1. **backend 文件夹的处理**
- ❌ `backend/server.js` **不会**作为独立服务器运行
- ✅ `backend/` 中的代码会被 `api/index.js` 引用
- ✅ 所有后端逻辑都通过 Serverless Functions 执行

### 2. **定时任务限制**
- ⚠️ Vercel Serverless Functions **不支持**长时间运行的定时任务（cron）
- ⚠️ `backend/server.js` 中的定时任务（如自动更新数据）**不会执行**
- 💡 **解决方案**：使用 Vercel Cron Jobs 或外部定时服务

### 3. **数据存储**
- ✅ `data/` 文件夹中的 JSON 文件会被部署
- ⚠️ 但 Serverless Functions 是**无状态**的，每次请求都是新的实例
- 💡 **建议**：使用 Supabase 或其他数据库存储数据

### 4. **环境变量**
- ✅ 需要在 Vercel 项目设置中配置环境变量
- ✅ 参考 `Vercel环境变量配置清单.md`

---

## 📁 文件结构说明

```
智鸽系统_副本/
├── index.html          → 主站前端（/）
├── admin.html          → 后台管理（/admin.html）
├── api/
│   └── index.js        → API Serverless Function（/api/*）
├── backend/            → 后端代码（被 api/index.js 引用）
│   ├── server.js       → Express 服务器（导出为 app）
│   ├── routes/         → API 路由
│   ├── services/       → 业务逻辑服务
│   └── ...
├── data/               → 数据文件（JSON）
├── vercel.json         → Vercel 配置文件
└── ...
```

---

## 🔧 如何访问不同部分

### 访问主站
```
https://你的域名.vercel.app/
或
https://你的域名.vercel.app/index.html
```

### 访问后台
```
https://你的域名.vercel.app/admin.html
或
https://你的域名.vercel.app/admin（自动重定向）
```

### 访问 API
```
https://你的域名.vercel.app/api/health
https://你的域名.vercel.app/api/news
https://你的域名.vercel.app/api/events
```

---

## ✅ 部署后验证清单

部署完成后，请验证以下内容：

- [ ] 主站可以访问：`https://你的域名.vercel.app/`
- [ ] 后台可以访问：`https://你的域名.vercel.app/admin.html`
- [ ] API 健康检查：`https://你的域名.vercel.app/api/health`
- [ ] API 返回数据：`https://你的域名.vercel.app/api/news`
- [ ] 静态资源加载正常（CSS、JS、图片等）

---

## 🎯 总结

**Vercel 不会自动区分后台和主站**，而是：

1. **根据文件路径**：`index.html` 是主站，`admin.html` 是后台
2. **根据路由配置**：`vercel.json` 定义了路由规则
3. **根据请求路径**：不同的 URL 访问不同的文件或 API

**所有内容都在同一个域名下**，通过不同的路径访问不同的功能。

---

## 📞 需要帮助？

如果部署后遇到问题：
1. 检查 Vercel 部署日志
2. 验证 `vercel.json` 配置是否正确
3. 检查环境变量是否已配置
4. 查看浏览器控制台的错误信息

























