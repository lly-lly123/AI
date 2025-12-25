# 新手小白MinIO配置指南（超简单版）

## 🎯 目标

通过简单的终端命令，完成MinIO的所有配置，无需在网页上复杂操作。

---

## 📋 完整步骤（只需3步）

### 步骤1：运行一键配置脚本

在终端中运行：

```bash
cd /Users/macbookair/Desktop/AI
./一键配置MinIO.sh
```

脚本会问您几个简单问题，只需输入从Zeabur获取的信息即可。

---

### 步骤2：从Zeabur获取信息（只需复制粘贴）

#### 2.1 获取服务地址

1. 在Zeabur中，点击MinIO服务
2. 点击顶部 "Networking" 标签
3. 找到 "Public URL" 或访问地址
4. **复制这个地址**（例如：`http://minio-xxxxx.zeabur.app:9000`）

#### 2.2 获取用户名和密码

1. 在MinIO服务的 "Overview" 页面
2. 找到 "Instructions" 部分
3. 点击 "Default Username" 右侧的眼睛图标 👁️
4. **复制用户名**
5. 点击 "Default Password" 右侧的眼睛图标 👁️
6. **复制密码**

#### 2.3 获取存储桶名称（可选）

1. 在 "Instructions" 部分
2. 点击 "Default Bucket" 右侧的眼睛图标 👁️
3. **复制存储桶名称**（如果没有，使用默认的 `pigeonai`）

---

### 步骤3：在终端中输入信息

运行脚本后，按提示输入：

```
请输入MinIO服务地址: [粘贴从Networking复制的地址]
请输入MinIO用户名: [粘贴用户名]
请输入MinIO密码: [粘贴密码]
请输入存储桶名称: [粘贴存储桶名称，或直接按回车使用默认值]
```

**就这么简单！** ✅

---

## 🎁 脚本会自动做什么？

1. ✅ 收集所有配置信息
2. ✅ 生成环境变量配置文件
3. ✅ 显示下一步操作说明
4. ✅ 可选：测试连接是否正常

---

## 📝 脚本运行示例

```bash
$ ./一键配置MinIO.sh

🚀 MinIO一键配置脚本（新手友好版）
==================================

📋 步骤1：配置MinIO服务信息

请输入MinIO服务地址: http://minio-xxxxx.zeabur.app:9000
请输入MinIO用户名: minioadmin
请输入MinIO密码: [输入密码，不会显示]
请输入存储桶名称: [直接按回车使用默认值pigeonai]

✅ 配置信息已收集

📝 配置信息汇总：
==================================
MinIO Endpoint: http://minio-xxxxx.zeabur.app:9000
MinIO Access Key: minioadmin
MinIO Secret Key: Min***（已隐藏）
MinIO Bucket: pigeonai
==================================

📋 步骤2：生成环境变量配置

✅ 环境变量配置已保存到: minio-env-config.txt

📋 步骤3：在Zeabur中配置环境变量

请按照以下步骤操作：
1. 打开Zeabur控制台：https://zeabur.com
2. 进入您的主应用服务（不是MinIO服务）
3. 点击 'Variable' 或 '环境变量' 标签
4. 点击 'Add Variable' 或 '添加变量'
5. 逐个添加以下环境变量：

[显示配置信息]

✅ 配置完成！
```

---

## 🔧 最后一步：在Zeabur中添加环境变量

脚本会生成一个配置文件 `minio-env-config.txt`，您需要：

1. **查看配置文件：**
   ```bash
   cat minio-env-config.txt
   ```

2. **在Zeabur中添加环境变量：**
   - 打开Zeabur控制台
   - 进入主应用服务（不是MinIO服务）
   - 点击 "Variable" 标签
   - 点击 "Add Variable"
   - 逐个添加配置文件中的环境变量

3. **重启服务：**
   - 在Zeabur中点击 "Restart" 重启主服务

---

## ❓ 常见问题

### Q1: 我不知道从哪里获取信息？

**A:** 脚本会告诉您每一步在哪里获取信息，只需按照提示操作即可。

### Q2: 输入密码时看不到字符？

**A:** 这是正常的，为了安全，密码输入时不会显示字符，直接输入后按回车即可。

### Q3: 存储桶名称是什么？

**A:** 存储桶就是MinIO中存储文件的"文件夹"名称，如果没有特殊要求，直接按回车使用默认值 `pigeonai` 即可。

### Q4: 脚本运行出错怎么办？

**A:** 
1. 检查是否在正确的目录：`cd /Users/macbookair/Desktop/AI`
2. 检查脚本是否有执行权限：`chmod +x 一键配置MinIO.sh`
3. 查看错误信息，告诉我具体错误

---

## 🎯 总结

**只需3步：**
1. ✅ 运行脚本：`./一键配置MinIO.sh`
2. ✅ 输入从Zeabur复制的信息
3. ✅ 在Zeabur中添加环境变量

**就这么简单！** 🎉

---

**现在就可以运行脚本开始配置了！**














