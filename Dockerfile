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

