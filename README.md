# 智鸽系统 - PigeonAI

> 每只鸽子，皆是赛级 ｜ Every Pigeon, Race-Grade

## 🎯 系统简介

智鸽系统是一个智能赛鸽管理平台，具备以下核心功能：

- ✅ **智能数据管理**：鸽子信息、训练记录、比赛记录
- ✅ **AI智能分析**：自动预测、数据分析、智能总结
- ✅ **云端数据同步**：自动备份，长期保存
- ✅ **后台智能管家**：自动管理、监控、维护
- ✅ **响应式设计**：支持桌面、平板、移动端

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
cd backend
npm install

# 启动服务
npm start

# 访问
http://localhost:3000
```

### 云端部署

详细部署指南请查看：[部署指南.md](./部署指南.md)

## 📋 功能清单

### 核心功能
- [x] 新增/编辑/删除鸽子信息
- [x] 训练记录管理
- [x] 比赛记录管理
- [x] 智能搜索
- [x] 数据统计和分析
- [x] 用户登录/注册
- [x] 数据导出

### AI功能
- [x] AI智能助手
- [x] 自动预测分析
- [x] 数据智能总结
- [x] 智能建议

### 后台管理
- [x] 系统监控
- [x] API监管
- [x] 数据验证
- [x] 自动维护
- [x] 日志管理

### 云存储
- [x] 自动数据同步
- [x] 云端备份
- [x] 数据恢复

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Node.js, Express
- **数据库**：Supabase (PostgreSQL)
- **AI**：智谱AI (GLM-4)
- **部署**：Vercel

## 📁 项目结构

```
智鸽系统_副本/
├── index.html              # 主站前端
├── admin.html              # 后台管理界面
├── backend/                # 后端服务
│   ├── server.js          # 服务器入口
│   ├── services/          # 业务服务
│   ├── routes/            # API路由
│   └── core-admin/        # 后台管家系统
├── data/                   # 本地数据存储
├── api/                    # Vercel部署入口
├── vercel.json            # Vercel配置
└── supabase-schema.sql    # 数据库结构
```

## 🔧 环境变量

```env
# Supabase配置
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI配置（可选）
ZHIPU_API_KEY=your-api-key

# 服务器配置
NODE_ENV=production
PORT=3000
```

## 📖 文档

- [部署指南](./部署指南.md) - 详细的部署步骤
- [测试报告](./测试部署.md) - 功能测试清单
- [后台搭建说明](./后台搭建完成说明.md) - 后台系统说明

## 🎨 界面预览

- **主站**：现代化的卡片式布局，支持暗色模式
- **后台**：专业的管理界面，实时监控
- **移动端**：完全响应式，触摸优化

## 🔒 安全特性

- 数据加密存储
- API密钥保护
- 用户认证授权
- 数据真实性验证
- 自动安全扫描

## 📊 性能优化

- CDN加速
- 数据缓存
- 懒加载
- 代码压缩
- 图片优化

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🌐 在线访问

部署后访问：`https://pigeonai.vercel.app`

---

**智鸽系统** - 让每只鸽子都成为赛级选手！

