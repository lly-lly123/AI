# 🤖 AI服务配置完整指南

## 📋 概述

系统支持多个AI服务提供商，**智谱AI**是推荐的方案（国内可访问，无需VPN）。

## 🔑 环境变量配置

### 重要提示

系统使用**两个不同的智谱API Key**，分别用于不同的功能：

1. **Evo智能助手**（主站AI聊天功能）
2. **中枢管家**（后台AI管理、数据分析）

### 环境变量名称

在Zeabur环境变量中，需要配置以下变量：

#### 选项1：分别配置（推荐）

```env
# Evo智能助手使用（名称：智鸽）
ZHIPU_API_KEY_EVO=你的Evo_API_Key

# 中枢管家使用（名称：智鸽·中枢管家）
ZHIPU_API_KEY_ADMIN=你的中枢管家_API_Key
```

#### 选项2：兼容配置（不推荐）

如果只配置了一个API Key，可以使用：

```env
# 兼容配置：Evo会使用这个Key
ZHIPU_API_KEY=你的API_Key
```

⚠️ **注意**：建议明确区分配置，避免混用。

## 🚀 配置步骤

### 步骤1：获取智谱API Key

1. 访问 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入"控制台" → "API管理" → "API Key"
4. 创建API Key（建议创建两个，分别用于Evo和中枢管家）
5. 复制API Key（**只显示一次，请立即保存！**）

### 步骤2：在Zeabur中配置

1. **登录Zeabur控制台**
   - 访问 https://zeabur.com
   - 选择你的项目

2. **进入环境变量设置**
   - 点击项目 → 选择服务 → 点击 "Variables" 标签

3. **添加环境变量**
   - 点击 "Add Variable"
   - 添加以下变量：

   ```
   变量名：ZHIPU_API_KEY_EVO
   值：你的Evo_API_Key
   描述：Evo智能助手使用（名称：智鸽）
   ```

   ```
   变量名：ZHIPU_API_KEY_ADMIN
   值：你的中枢管家_API_Key
   描述：中枢管家使用（名称：智鸽·中枢管家）
   ```

4. **保存并重新部署**
   - 点击 "Save"
   - Zeabur会自动重新部署（约需1-3分钟）

### 步骤3：验证配置

部署完成后，验证配置是否生效：

#### 方法1：通过后台管理系统

1. 访问后台：`https://your-project.zeabur.app/admin.html`
2. 登录系统（默认：`admin` / `admin123`）
3. 进入"系统设置" → "AI服务配置"
4. 查看配置状态：
   - ✅ **已配置**：显示"✅ 已配置"
   - ❌ **未配置**：显示"❌ 未配置"

#### 方法2：通过API测试

```bash
# 测试模型信息接口
curl https://your-project.zeabur.app/api/evo/model-info
```

应该返回：
```json
{
  "name": "智谱AI (GLM)",
  "provider": "ZhipuAI",
  "source": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  "description": "智能对话模型，支持中文对话",
  "free": true,
  "requiresApiKey": true
}
```

#### 方法3：测试Evo助手

1. 访问网站首页
2. 点击右下角的 **Evo助手** 图标
3. 发送消息："你好"
4. 查看回复：
   - ✅ **AI回复**：回复自然、有上下文理解
   - ❌ **本地逻辑**：回复像"我理解您的问题..."这样的模板

## 🔍 配置检查清单

### ✅ 配置正确时

- [ ] 环境变量已添加到Zeabur
- [ ] 变量名正确（`ZHIPU_API_KEY_EVO` 或 `ZHIPU_API_KEY_ADMIN`）
- [ ] API Key格式正确（通常是长字符串）
- [ ] 服务已重新部署
- [ ] 后台显示"✅ 已配置"
- [ ] Evo助手可以正常回复

### ❌ 配置错误时

- [ ] 环境变量未添加
- [ ] 变量名拼写错误
- [ ] API Key格式错误或已过期
- [ ] 服务未重新部署
- [ ] 后台显示"❌ 未配置"
- [ ] Evo助手使用本地逻辑回复

## 🛠️ 常见问题排查

### 问题1：环境变量已添加，但AI服务仍不可用

**可能原因：**
1. 服务未重新部署
2. 变量名拼写错误
3. API Key无效或已过期

**解决方案：**
1. 在Zeabur控制台检查部署日志
2. 确认变量名完全匹配（区分大小写）
3. 重新生成API Key并更新

### 问题2：Evo助手回复很模板化

**可能原因：**
1. API Key未正确配置
2. API调用失败，使用了本地逻辑

**解决方案：**
1. 检查后台"AI服务配置"状态
2. 查看浏览器控制台（F12）的错误信息
3. 检查后端日志

### 问题3：只配置了一个API Key

**情况说明：**
- 如果只配置了 `ZHIPU_API_KEY_EVO`，Evo助手可以使用
- 如果只配置了 `ZHIPU_API_KEY_ADMIN`，中枢管家可以使用
- 建议配置两个，功能更完整

**解决方案：**
- 在智谱AI平台创建两个API Key
- 分别配置到对应的环境变量

### 问题4：API Key在哪里找？

**智谱AI：**
1. 访问 https://open.bigmodel.cn/
2. 登录后进入"控制台"
3. 点击"API管理"
4. 找到"API Key"或"密钥管理"
5. 创建或查看API Key

## 📊 配置优先级

系统会按以下优先级选择AI服务：

1. **智谱AI**（如果配置了 `ZHIPU_API_KEY_EVO` 或 `ZHIPU_API_KEY`）
2. **通义千问**（如果配置了 `QWEN_API_KEY`）
3. **Hugging Face**（如果配置了 `HUGGING_FACE_API_KEY`，需要VPN）
4. **本地AI逻辑**（如果所有AI服务都不可用）

## 🔐 安全建议

1. **不要将API Key提交到Git仓库**
   - API Key是敏感信息
   - 只在环境变量中配置

2. **定期更换API Key**
   - 如果怀疑API Key泄露，立即更换
   - 在智谱AI平台删除旧Key，创建新Key

3. **区分不同用途的API Key**
   - Evo和中枢管家使用不同的Key
   - 便于管理和监控使用情况

## 📝 完整环境变量清单

在Zeabur中配置的完整环境变量：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# AI配置（必需）
ZHIPU_API_KEY_EVO=你的Evo_API_Key
ZHIPU_API_KEY_ADMIN=你的中枢管家_API_Key

# AI模型选择（可选，默认auto）
AI_MODEL=auto

# 其他配置（可选）
LOG_LEVEL=info
API_KEY=6ed04e0834817cfe8da1da6d7003959f

# Supabase配置（推荐，用于数据持久化）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_STORAGE_BUCKET=files
```

## ✅ 验证配置是否生效

### 快速验证命令

```bash
# 检查模型信息
curl https://your-project.zeabur.app/api/evo/model-info

# 应该返回包含 "智谱AI" 的JSON响应
```

### 在浏览器中验证

1. 打开网站首页
2. 按F12打开开发者工具
3. 在Console中运行：
   ```javascript
   fetch('/api/evo/model-info')
     .then(r => r.json())
     .then(console.log)
   ```
4. 查看返回的模型信息

## 🎯 下一步

配置完成后：

1. ✅ 测试Evo助手功能
2. ✅ 测试中枢管家AI功能
3. ✅ 检查后台"AI服务配置"状态
4. ✅ 查看使用情况（在智谱AI平台查看API调用统计）

---

**配置完成后，AI服务将自动生效，无需重启服务（Zeabur会自动重新部署）。**

**如果遇到问题，请检查：**
- Zeabur部署日志
- 浏览器控制台错误信息
- 后台"AI服务配置"状态


























