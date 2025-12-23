# 🚀 网站部署说明

## 📌 推荐部署方案：Zeabur + Supabase

**完全免费 | 国内无需VPN | 长期运行 | 云端存储支持**

---

## 🎯 为什么选择这个方案？

✅ **Zeabur** - 免费云平台
- 每月 $5 免费额度
- 国内可访问，无需VPN
- 支持24/7长期运行
- 自动部署，代码推送即更新

✅ **Supabase** - 免费云数据库
- 500MB 数据库存储
- 1GB 文件存储
- 2GB 带宽/月
- 永久免费

---

## 📚 部署文档

1. **📖 详细部署指南**：`免费部署指南-Zeabur.md`
   - 完整的步骤说明
   - 包含截图和详细配置

2. **⚡ 快速参考**：`部署快速参考.md`
   - 5分钟快速部署
   - 常见问题速查

3. **🔧 一键部署脚本**：`一键部署-Zeabur.sh`
   - 自动化部署流程
   - 检查配置和代码

---

## 🚀 快速开始

### 方法1：使用一键部署脚本（推荐）

```bash
./一键部署-Zeabur.sh
```

### 方法2：手动部署

1. **准备Supabase**
   - 访问 https://supabase.com 注册
   - 创建项目
   - 执行 `supabase-init.sql` 创建表

2. **部署到Zeabur**
   - 访问 https://zeabur.com 注册
   - 创建项目并连接GitHub仓库
   - 配置环境变量

3. **完成**
   - 等待部署完成（3-5分钟）
   - 访问生成的公网地址

---

## 🔑 必需配置

### Supabase配置
- `SUPABASE_URL` - 项目URL
- `SUPABASE_ANON_KEY` - 匿名密钥

### Zeabur环境变量
```env
PORT=3000
NODE_ENV=production
SUPABASE_URL=你的Supabase_URL
SUPABASE_ANON_KEY=你的Supabase_Anon_Key
```

---

## 📁 项目结构

```
AI/
├── backend/              # 后端代码
│   ├── server.js        # 服务器入口
│   └── package.json     # 依赖配置
├── 免费部署指南-Zeabur.md  # 详细部署指南
├── 部署快速参考.md        # 快速参考
├── 一键部署-Zeabur.sh    # 一键部署脚本
├── supabase-init.sql    # 数据库初始化SQL
├── zeabur.json          # Zeabur配置
└── Procfile             # 进程配置
```

---

## ✅ 部署检查清单

- [ ] Supabase项目已创建
- [ ] 数据库表已创建
- [ ] GitHub仓库已设置
- [ ] Zeabur项目已创建
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 网站可访问

---

## 🆘 需要帮助？

1. 查看详细指南：`免费部署指南-Zeabur.md`
2. 查看快速参考：`部署快速参考.md`
3. 检查Zeabur日志排查问题

---

**祝您部署顺利！** 🎉

