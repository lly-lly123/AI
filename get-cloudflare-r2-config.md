# 📋 获取 Cloudflare R2 配置的详细步骤

## 🎯 目标
获取以下配置值：
- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`（自己命名，如：`pigeonai`）
- `CLOUDFLARE_R2_ENDPOINT`（自动生成）

---

## 📝 操作步骤

### 第1步：访问 Cloudflare
1. 打开浏览器
2. 访问：https://dash.cloudflare.com/
3. 登录账号（如果没有，先注册）

### 第2步：进入 R2 服务
1. 登录后，点击左侧菜单的 **"R2"**
2. 如果是第一次使用，点击 "Get started" 或 "Enable R2"

### 第3步：创建 API Token
1. 在 R2 页面，点击 **"Manage R2 API Tokens"**
2. 点击 **"Create API Token"**
3. 填写信息：
   - **Token name**: `pigeonai`（或任意名称）
   - **Permissions**: 选择 **"Admin Read & Write"**
4. 点击 **"Create API Token"**
5. **重要**：立即复制显示的三个值（只显示一次）：
   - **Account ID** → `CLOUDFLARE_R2_ACCOUNT_ID`
   - **Access Key ID** → `CLOUDFLARE_R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

### 第4步：创建 Bucket
1. 在 R2 页面，点击 **"Create bucket"**
2. 填写信息：
   - **Bucket name**: `pigeonai`（或你喜欢的名称）
   - **Location**: 选择离你最近的区域
3. 点击 **"Create bucket"**
4. 创建后，会显示 Endpoint（格式：`https://你的account-id.r2.cloudflarestorage.com`）

### 第5步：复制到 Zeabur
在 Zeabur 的 "Variable" 页面，添加：

```
变量名: CLOUDFLARE_R2_ACCOUNT_ID
值: 你的AccountID
```

```
变量名: CLOUDFLARE_R2_ACCESS_KEY_ID
值: 你的AccessKeyID
```

```
变量名: CLOUDFLARE_R2_SECRET_ACCESS_KEY
值: 你的SecretAccessKey
```

```
变量名: CLOUDFLARE_R2_BUCKET_NAME
值: pigeonai
```

```
变量名: CLOUDFLARE_R2_ENDPOINT
值: https://你的account-id.r2.cloudflarestorage.com
```

---

## ✅ 验证配置

运行检查脚本：
```bash
cd /Users/macbookair/Desktop/AI
export CLOUDFLARE_R2_ACCOUNT_ID="你的AccountID"
export CLOUDFLARE_R2_ACCESS_KEY_ID="你的AccessKey"
export CLOUDFLARE_R2_SECRET_ACCESS_KEY="你的SecretKey"
bash check-storage-config.sh
```

---

## 🆘 如果遇到问题

1. **找不到 R2？**
   - 确保已登录 Cloudflare 账号
   - R2 在左侧菜单中

2. **API Token 创建失败？**
   - 检查权限设置
   - 确保选择了 "Admin Read & Write"

3. **找不到 Endpoint？**
   - Endpoint 在 Bucket 创建后的详情页面
   - 格式：`https://你的account-id.r2.cloudflarestorage.com`

---

## 💡 提示

- Cloudflare R2 永久免费 10GB
- 超出后按使用量付费
- 适合大容量存储需求







