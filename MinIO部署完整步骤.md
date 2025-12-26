# MinIO部署完整步骤指南

## 📋 当前状态

您已经选择了MinIO自托管方案，脚本正在等待您输入MinIO Endpoint。

## 🚀 完整部署步骤

### 步骤1：在Zeabur上部署MinIO服务

#### 1.1 登录Zeabur控制台

1. 访问：https://zeabur.com
2. 使用GitHub账号登录
3. 进入您的项目（如果没有项目，先创建一个）

#### 1.2 添加MinIO服务

1. 在项目中点击 **"Add Service"** 或 **"添加服务"**
2. 选择 **"Docker"** 或 **"Public Docker Image"**
3. 配置如下：

   **镜像名称：**
   ```
   minio/minio:latest
   ```

   **启动命令：**
   ```
   server /data --console-address ":9001"
   ```

   **端口配置：**
   - 端口 `9000` - MinIO API端口
   - 端口 `9001` - MinIO控制台端口

#### 1.3 设置环境变量

在服务设置中添加以下环境变量：

```
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=你的强密码（至少8位，建议包含大小写字母、数字和特殊字符）
```

**示例密码：**
```
MinIO@2024!Secure
```

#### 1.4 配置存储卷（如果Zeabur支持）

- 挂载路径：`/data`
- 这是MinIO存储数据的位置

#### 1.5 部署服务

1. 点击 **"Deploy"** 或 **"部署"**
2. 等待部署完成（通常需要1-3分钟）
3. 部署成功后，Zeabur会显示服务的访问地址

---

### 步骤2：获取MinIO Endpoint地址

#### 2.1 查看服务地址

部署完成后，在Zeabur控制台中：

1. 找到MinIO服务
2. 查看服务详情
3. 找到 **"Public URL"** 或 **"访问地址"**

**API地址格式：**
```
http://your-minio-service.zeabur.app:9000
或
https://your-minio-service.zeabur.app:9000
```

**控制台地址格式：**
```
http://your-minio-service.zeabur.app:9001
或
https://your-minio-service.zeabur.app:9001
```

#### 2.2 记录Endpoint地址

复制API地址（端口9000），格式如下：
```
http://minio-xxxxx.zeabur.app:9000
```

---

### 步骤3：访问MinIO控制台并创建存储桶

#### 3.1 登录MinIO控制台

1. 在浏览器中访问控制台地址（端口9001）
2. 使用以下凭据登录：
   - **用户名**：`minioadmin`（或您设置的MINIO_ROOT_USER）
   - **密码**：您设置的MINIO_ROOT_PASSWORD

#### 3.2 创建存储桶（Bucket）

1. 登录后，点击左侧菜单 **"Buckets"**
2. 点击 **"Create Bucket"** 或 **"创建存储桶"**
3. 输入存储桶名称：`pigeonai`
4. 点击 **"Create Bucket"**

---

### 步骤4：回到终端继续配置

#### 4.1 输入MinIO Endpoint

在终端中，当脚本提示：
```
请输入 MinIO Endpoint (例如: http://minio-service.zeabur.app:9000):
```

输入您从Zeabur获取的API地址，例如：
```
http://minio-xxxxx.zeabur.app:9000
```

#### 4.2 继续完成配置

脚本会继续询问：
- MinIO Access Key（通常是 `minioadmin`）
- MinIO Secret Key（您设置的密码）
- MinIO Bucket（通常是 `pigeonai`）

按照提示完成配置。

---

### 步骤5：在主服务中配置环境变量

#### 5.1 在Zeabur主服务中添加环境变量

在您的主应用服务（不是MinIO服务）中添加以下环境变量：

```env
MINIO_ENDPOINT=http://your-minio-service.zeabur.app:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=你的强密码
MINIO_BUCKET=pigeonai
MINIO_USE_SSL=false
```

#### 5.2 重启主服务

1. 在Zeabur控制台中
2. 找到您的主应用服务
3. 点击 **"Restart"** 或 **"重启"**

---

### 步骤6：验证配置

#### 6.1 检查日志

1. 在Zeabur控制台查看主服务日志
2. 应该看到：
   ```
   ✅ 文件存储服务已初始化，使用: minio
   📦 可用存储提供商: minio
   ```

#### 6.2 测试文件上传

1. 登录您的应用
2. 上传一张图片（例如：添加鸽子时上传图片）
3. 检查浏览器控制台，应该看到：
   ```
   ✅ 文件上传成功: 图片名称
   provider: minio
   ```

#### 6.3 在MinIO控制台验证

1. 访问MinIO控制台
2. 进入 `pigeonai` 存储桶
3. 应该能看到上传的文件

---

## ⚠️ 常见问题

### 问题1：无法访问MinIO服务

**解决方案：**
1. 检查Zeabur服务是否正常运行
2. 检查端口配置是否正确（9000和9001）
3. 检查防火墙设置

### 问题2：无法登录MinIO控制台

**解决方案：**
1. 确认用户名和密码正确
2. 检查环境变量是否已正确设置
3. 尝试重启MinIO服务

### 问题3：文件上传失败

**解决方案：**
1. 检查MinIO服务是否正常运行
2. 检查环境变量配置是否正确
3. 检查存储桶是否已创建
4. 查看Zeabur日志中的错误信息

---

## 📝 快速参考

### MinIO配置信息汇总

```env
# MinIO服务地址（从Zeabur获取）
MINIO_ENDPOINT=http://your-minio-service.zeabur.app:9000

# MinIO访问凭证
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=你的强密码

# MinIO存储桶名称
MINIO_BUCKET=pigeonai

# 是否使用SSL（Zeabur通常不需要）
MINIO_USE_SSL=false
```

### MinIO控制台访问

- **控制台地址**：`http://your-minio-service.zeabur.app:9001`
- **用户名**：`minioadmin`
- **密码**：您设置的MINIO_ROOT_PASSWORD

---

## ✅ 完成检查清单

- [ ] MinIO服务已在Zeabur上部署
- [ ] MinIO服务正常运行
- [ ] 已获取MinIO Endpoint地址
- [ ] 已登录MinIO控制台
- [ ] 已创建存储桶（pigeonai）
- [ ] 已在主服务中配置环境变量
- [ ] 主服务已重启
- [ ] 日志显示MinIO已初始化
- [ ] 测试文件上传成功
- [ ] 在MinIO控制台能看到上传的文件

---

## 🎯 下一步

完成以上步骤后，您的系统将：

1. ✅ 自动使用MinIO存储文件（图片、附件等）
2. ✅ 文件上传时自动保存到MinIO
3. ✅ 容量取决于Zeabur的存储限制（通常5-20GB）

**注意：** 如果还需要数据同步功能（鸽子数据、比赛数据等），建议同时配置Supabase。

---

**祝您配置顺利！如有问题，请查看Zeabur日志或联系我。**




















