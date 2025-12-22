# Vercel部署前检查清单

## ✅ 部署前必须完成的步骤

### 1. 配置文件修复 ✅
- [x] `vercel.json` - 已修复重复内容
- [x] `package.json` - 已修复重复内容
- [x] `api/index.js` - 已修复重复内容

### 2. Vercel部署页面设置

在Vercel部署页面，请确认以下设置：

#### 基本设置
- ✅ **项目名称**: `鸽子-ai-com` (或您想要的名称)
- ✅ **框架预设**: `Other` (已选择)
- ✅ **根目录**: `./` (已设置)

#### 构建和输出设置（需要展开检查）
- **构建命令**: 留空（Vercel会自动检测）
- **输出目录**: 留空
- **安装命令**: `npm install` (自动)

### 3. 环境变量配置（重要！）

在Vercel部署页面的"环境变量"部分，需要添加以下变量：

#### 必需的环境变量

```
NODE_ENV=production
PORT=3000
```

#### AI配置（至少配置一个）

**选项1：智谱AI（推荐）**
```
ZHIPU_API_KEY=你的智谱AI_API_Key
AI_MODEL=zhipu
```

**选项2：通义千问**
```
QWEN_API_KEY=你的通义千问_API_Key
AI_MODEL=qwen
```

**选项3：自动选择（如果配置了多个）**
```
AI_MODEL=auto
```

#### RSS数据源配置（可选）

```
RSS_SOURCES=中国信鸽信息网|https://www.chinaxinge.com/rss|media|national;贵州省信鸽协会|https://example.com/rss|association|local
```

#### 其他可选配置

```
LOG_LEVEL=info
CACHE_TTL_NEWS=3600
CACHE_TTL_EVENTS=300
UPDATE_INTERVAL_NEWS=3600
UPDATE_INTERVAL_EVENTS=300
```

### 4. 环境变量添加方法

在Vercel部署页面：

1. 找到"环境变量"部分
2. 点击"+ Add More"按钮
3. 在"Key"列输入变量名（如：`ZHIPU_API_KEY`）
4. 在"Value"列输入变量值（如：你的API Key）
5. 重复添加所有需要的环境变量

### 5. 部署前最后检查

- [ ] 确认所有配置文件已修复（已完成）
- [ ] 确认环境变量已添加（特别是AI API Key）
- [ ] 确认项目名称正确
- [ ] 确认根目录设置为 `./`
- [ ] 确认框架预设为 `Other`

## 🚀 现在可以点击"部署"了！

点击"部署"按钮后：

1. Vercel会自动：
   - 从GitHub拉取代码
   - 安装依赖（`npm install`）
   - 构建项目
   - 部署到生产环境

2. 部署过程大约需要2-5分钟

3. 部署成功后，您会看到：
   - 部署状态变为"Ready"
   - 获得一个Vercel域名（如：`鸽子-ai-com.vercel.app`）

## ⚠️ 注意事项

### 如果部署失败

1. **检查环境变量**
   - 确保所有必需的环境变量都已添加
   - 确保API Key格式正确（没有多余空格）

2. **检查构建日志**
   - 在Vercel部署页面点击"View Function Logs"
   - 查看错误信息

3. **常见问题**
   - 如果提示"找不到模块"，检查`package.json`中的依赖
   - 如果提示"端口错误"，检查环境变量`PORT`
   - 如果API调用失败，检查AI API Key是否正确

### 部署后的配置

部署成功后，建议：

1. **设置自定义域名**（可选）
   - 在Vercel项目设置中添加您的域名

2. **配置环境变量**
   - 在Vercel项目设置中管理环境变量
   - 可以分别为Production、Preview、Development设置不同的值

3. **测试功能**
   - 访问部署后的网站
   - 测试登录、注册功能
   - 测试AI助手功能
   - 测试数据同步功能

## 📝 快速部署步骤总结

1. ✅ 修复配置文件（已完成）
2. ⏳ 在Vercel页面添加环境变量（特别是`ZHIPU_API_KEY`）
3. ⏳ 确认项目设置（名称、根目录、框架预设）
4. ⏳ 点击"部署"按钮
5. ⏳ 等待部署完成（2-5分钟）
6. ⏳ 测试部署后的网站

---

**当前状态**: 配置文件已修复，可以开始部署！

**下一步**: 在Vercel部署页面添加环境变量，然后点击"部署"

































