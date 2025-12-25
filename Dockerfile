# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY backend/package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制后端代码
COPY backend/ ./

# 复制前端文件（包括 mobile.html, index.html 等）
COPY mobile.html ./
COPY index.html ./
COPY admin.html ./
COPY app.html ./

# 复制前端资源目录
COPY js/ ./js/
COPY css/ ./css/
COPY picker/ ./picker/
COPY img/ ./img/
COPY fonts/ ./fonts/

# 创建日志目录
RUN mkdir -p logs

# 暴露端口（Zeabur 会自动设置 PORT 环境变量）
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
