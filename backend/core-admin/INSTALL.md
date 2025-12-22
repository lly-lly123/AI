# 智鸽·中枢管家安装指南

## 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0

## 安装步骤

1. **进入目录**
```bash
cd backend/core-admin
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# .env 文件已包含智谱API Key，可直接使用
# 如需修改，编辑 .env 文件
```

4. **启动服务**
```bash
npm start
```

5. **验证安装**
访问 http://localhost:3001/health 应该返回：
```json
{
  "status": "ok",
  "service": "core-admin",
  "uptime": 1234,
  "timestamp": 1234567890
}
```

## API端点

- `GET /health` - 健康检查
- `GET /api/status` - 系统状态
- `GET /api/health` - 详细健康检查
- `GET /api/advice` - 获取管理建议
- `GET /api/apis` - 获取API列表
- `GET /api/apis/:id` - 获取API详情
- `POST /api/apis/:id/check` - 检查API健康
- `GET /api/apis/stats/overall` - 获取API统计
- `POST /api/validate/truth` - 验证数据真实性
- `GET /api/ai/stats` - 获取AI统计
- `GET /api/learning/stats` - 获取学习统计

## 日志

日志文件位于 `logs/` 目录：
- `combined.log` - 所有日志
- `error.log` - 错误日志

## 故障排查

1. **端口被占用**
   - 修改 `.env` 中的 `PORT` 值

2. **AI调用失败**
   - 检查 `.env` 中的 `ZHIPU_API_KEY_ADMIN` 是否正确（中枢管家专用）
   - 检查网络连接

3. **API监控不工作**
   - 检查主站API地址是否正确
   - 检查 `config.js` 中的 `mainSiteApis` 配置












