# API Key 配置说明

## 🔑 重要提示

系统使用**两个不同的智谱AI API Key**，请务必区分配置，避免混用！

## 📋 API Key 列表

### 1. Evo智能助手 API Key（名称：智鸽）

- **环境变量名**：`ZHIPU_API_KEY_EVO`
- **用途**：主站Evo智能助手使用
- **使用位置**：主站AI聊天功能
- **获取地址**：https://open.bigmodel.cn/
- **配置位置**：Vercel环境变量

### 2. 中枢管家 API Key（名称：智鸽·中枢管家）

- **环境变量名**：`ZHIPU_API_KEY_ADMIN`
- **用途**：后台中枢管家系统使用
- **使用位置**：后台AI管理、数据分析、建议生成
- **获取地址**：https://open.bigmodel.cn/
- **配置位置**：Vercel环境变量

## 🚀 Vercel部署配置

在Vercel环境变量中添加以下配置：

```
# Evo智能助手使用（名称：智鸽）
ZHIPU_API_KEY_EVO=你的Evo_API_Key

# 中枢管家使用（名称：智鸽·中枢管家）
ZHIPU_API_KEY_ADMIN=你的中枢管家_API_Key
```

## ⚠️ 注意事项

1. **必须区分配置**
   - ❌ 不要将两个API Key混用
   - ✅ 明确配置两个不同的环境变量
   - ✅ 在Vercel中清楚标注用途

2. **命名规范**
   - Evo使用：`ZHIPU_API_KEY_EVO`（名称：智鸽）
   - 中枢管家使用：`ZHIPU_API_KEY_ADMIN`（名称：智鸽·中枢管家）

3. **兼容性说明**
   - 如果只配置了`ZHIPU_API_KEY`，Evo会使用它（不推荐）
   - 建议明确配置两个不同的API Key

4. **配置验证**
   - 配置后可以在后台"系统设置"中查看配置状态
   - 已配置的API Key会显示为"***已配置***"

## 📝 配置步骤

### 步骤1：获取API Key

1. 访问 https://open.bigmodel.cn/
2. 注册/登录账户
3. 创建两个不同的API Key：
   - 一个命名为"智鸽"（用于Evo）
   - 一个命名为"智鸽·中枢管家"（用于中枢管家）

### 步骤2：在Vercel中配置

1. 进入Vercel项目设置
2. 找到"Environment Variables"
3. 添加以下变量：

```
ZHIPU_API_KEY_EVO=你的Evo_API_Key
ZHIPU_API_KEY_ADMIN=你的中枢管家_API_Key
```

### 步骤3：验证配置

1. 部署后访问后台管理系统
2. 进入"系统设置" → "AI配置"
3. 检查两个API Key的配置状态

## 🔍 代码中的使用

### Evo智能助手（主站）

```javascript
// backend/services/aiService.js
// 使用 ZHIPU_API_KEY_EVO
zhipuApiKey: process.env.ZHIPU_API_KEY_EVO || process.env.ZHIPU_API_KEY
```

### 中枢管家（后台）

```javascript
// backend/core-admin/src/config/config.js
// 使用 ZHIPU_API_KEY_ADMIN
apiKey: process.env.ZHIPU_API_KEY_ADMIN || process.env.ZHIPU_API_KEY
```

## ✅ 配置检查清单

- [ ] 已创建两个不同的API Key
- [ ] 已在Vercel环境变量中配置`ZHIPU_API_KEY_EVO`
- [ ] 已在Vercel环境变量中配置`ZHIPU_API_KEY_ADMIN`
- [ ] 已在Vercel中清楚标注每个API Key的用途
- [ ] 已部署并验证配置生效
- [ ] 已在后台"系统设置"中确认配置状态

---

**重要提醒**：请务必区分两个API Key，避免混用导致功能异常！

































