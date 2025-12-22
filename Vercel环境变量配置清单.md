# Vercel环境变量配置清单

## 🔑 API Key配置（重要：请区分两个不同的API Key）

### 1. Evo智能助手 API Key（名称：智鸽）

```
ZHIPU_API_KEY_EVO=你的Evo_API_Key
```

- **用途**：主站Evo智能助手使用
- **使用位置**：主站AI聊天功能
- **获取地址**：https://open.bigmodel.cn/
- **在智谱AI平台中的名称**：智鸽

### 2. 中枢管家 API Key（名称：智鸽·中枢管家）

```
ZHIPU_API_KEY_ADMIN=你的中枢管家_API_Key
```

- **用途**：后台中枢管家系统使用
- **使用位置**：后台AI管理、数据分析、建议生成
- **获取地址**：https://open.bigmodel.cn/
- **在智谱AI平台中的名称**：智鸽·中枢管家

## 📋 完整环境变量清单

### 必需配置

```
# 服务器配置
NODE_ENV=production
PORT=3000

# Evo智能助手 API Key（名称：智鸽）
ZHIPU_API_KEY_EVO=你的Evo_API_Key

# 中枢管家 API Key（名称：智鸽·中枢管家）
ZHIPU_API_KEY_ADMIN=你的中枢管家_API_Key
```

### 可选配置

```
# 数据库配置（推荐配置，确保数据持久化）
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_ANON_KEY=你的anon_key

# RSS数据源配置
RSS_SOURCES=中国信鸽信息网|https://www.chinaxinge.com/rss|media|national

# 其他AI服务（可选）
QWEN_API_KEY=你的通义千问_API_Key
HUGGING_FACE_API_KEY=你的HuggingFace_API_Key
AI_MODEL=auto

# 缓存配置（可选）
CACHE_TTL_NEWS=3600
CACHE_TTL_EVENTS=300
CACHE_TTL_RESULTS=7200

# 更新频率（可选）
UPDATE_INTERVAL_NEWS=3600
UPDATE_INTERVAL_EVENTS=300
UPDATE_INTERVAL_RESULTS=1800

# 日志配置（可选）
LOG_LEVEL=info
```

## ⚠️ 重要注意事项

### 1. API Key区分

- ✅ **必须配置两个不同的API Key**
- ✅ **在Vercel中清楚标注每个API Key的用途**
- ❌ **不要将两个API Key混用**

### 2. 命名规范

在Vercel环境变量中，建议添加描述：

```
ZHIPU_API_KEY_EVO (描述: Evo智能助手使用 - 名称：智鸽)
ZHIPU_API_KEY_ADMIN (描述: 中枢管家使用 - 名称：智鸽·中枢管家)
```

### 3. 配置验证

部署后，可以在后台"系统设置" → "AI配置"中查看：
- Evo智能助手 API Key 配置状态
- 中枢管家 API Key 配置状态

## 🚀 配置步骤

### 步骤1：获取API Key

1. 访问 https://open.bigmodel.cn/
2. 注册/登录账户
3. 创建两个API Key：
   - 第一个命名为"智鸽"（用于Evo）
   - 第二个命名为"智鸽·中枢管家"（用于中枢管家）

### 步骤2：在Vercel中配置

1. 进入Vercel项目
2. 进入"Settings" → "Environment Variables"
3. 添加以下变量：

```
Key: ZHIPU_API_KEY_EVO
Value: 你的Evo_API_Key
Description: Evo智能助手使用 - 名称：智鸽

Key: ZHIPU_API_KEY_ADMIN
Value: 你的中枢管家_API_Key
Description: 中枢管家使用 - 名称：智鸽·中枢管家
```

### 步骤3：部署验证

1. 重新部署项目
2. 访问后台管理系统
3. 进入"系统设置" → "AI配置"
4. 验证两个API Key的配置状态

## 📊 配置状态检查

在后台"系统设置" → "AI配置"中：

- ✅ **Evo智能助手 API Key**：显示"***已配置***"表示配置成功
- ✅ **中枢管家 API Key**：显示"***已配置***"表示配置成功

## 🔍 故障排查

### 问题1：Evo无法使用AI功能

- 检查 `ZHIPU_API_KEY_EVO` 是否已配置
- 检查API Key是否正确
- 检查API Key是否在智谱AI平台中命名为"智鸽"

### 问题2：中枢管家无法使用AI功能

- 检查 `ZHIPU_API_KEY_ADMIN` 是否已配置
- 检查API Key是否正确
- 检查API Key是否在智谱AI平台中命名为"智鸽·中枢管家"

### 问题3：两个功能都不可用

- 检查两个API Key是否都已配置
- 检查API Key是否有效
- 检查网络连接是否正常

---

**重要提醒**：请务必区分两个API Key，避免混用！

































