# Zeabur 配置指南

## 当前问题修复

根据您的 Zeabur 设置页面截图，需要修复以下配置：

### 1. Command 字段修复

**当前错误：** `cd后端&&npm启动`（中文输入法导致）

**正确配置：**
```
cd backend && npm start
```

**操作步骤：**
1. 在 Zeabur 设置页面的 "Command" 字段中
2. 删除现有内容 `cd后端&&npm启动`
3. 输入：`cd backend && npm start`
4. 点击 "Save" 按钮

### 2. Dockerfile 字段修复

**正确的 Dockerfile 内容：**

请在 Zeabur 的 "Dockerfile" 文本框中，删除所有内容，然后粘贴以下内容：

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制package.json文件（先复制这个以利用Docker缓存）
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/

# 安装根目录依赖（如果有）
RUN npm install --production || true

# 安装backend依赖（重要！）
WORKDIR /app/backend
RUN npm install --production

# 复制所有文件
WORKDIR /app
COPY . .

# 设置工作目录为backend
WORKDIR /app/backend

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
```

**操作步骤：**
1. 在 Zeabur 设置页面的 "Dockerfile" 文本框中
2. 全选并删除所有现有内容
3. 复制上面的完整 Dockerfile 内容
4. 粘贴到文本框中
5. 点击 "Save" 按钮

### 3. Root Directory 字段

**正确配置：**
```
.
```
（保持默认值，表示项目根目录）

## 配置完成后

1. 保存所有更改
2. 返回 "Overview" 页面
3. 点击 "Redeploy" 或等待自动重新部署
4. 查看 "Logs" 页面确认部署成功

## 验证部署

部署成功后，您应该看到：
- 服务状态：Running（运行中）
- 日志中显示：`Server running on port 3000`
- 没有 `Cannot find module 'helmet'` 错误

## 如果仍有问题

如果配置后仍有问题，请：
1. 检查 "Logs" 页面的错误信息
2. 确认所有字段都已保存
3. 尝试手动触发重新部署
















































