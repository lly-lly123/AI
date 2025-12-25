# 🌐 生成公网访问URL指南

## 📍 统一预览入口

已创建 `preview.html` 作为统一预览入口，具备以下特性：

### ✨ 核心功能

1. **自动设备识别**
   - 自动检测PC/移动设备
   - 移动设备自动切换到移动端视图
   - 实时显示设备类型和屏幕尺寸

2. **统一访问入口**
   - 一个URL访问所有页面
   - 标签页切换：PC端、移动端、iPhone预览、智能管理
   - 无需分开打开多个页面

3. **AI助手测试支持**
   - 所有页面都支持AI助手功能
   - 可以在网络环境下测试Evo助手
   - 支持智谱API调用测试

## 🚀 部署方式

### 方式一：Vercel部署（推荐）

1. **准备部署**
   ```bash
   # 确保所有文件都在项目目录中
   cd /Users/macbookair/Desktop/AI
   ```

2. **推送到GitHub**
   ```bash
   git add .
   git commit -m "添加统一预览入口"
   git push origin main
   ```

3. **在Vercel中部署**
   - 访问 https://vercel.com
   - 导入GitHub仓库
   - 部署设置：
     - Framework Preset: `Other`
     - Root Directory: `./`
     - Build Command: 留空
     - Output Directory: `.`

4. **获取公网URL**
   - 部署完成后，Vercel会提供类似这样的URL：
   ```
   https://your-project-name.vercel.app
   ```

5. **访问统一预览入口**
   ```
   https://your-project-name.vercel.app/preview.html
   ```

### 方式二：Netlify部署

1. **拖拽部署**
   - 访问 https://app.netlify.com
   - 直接将项目文件夹拖拽到部署区域

2. **获取URL**
   ```
   https://your-project-name.netlify.app/preview.html
   ```

### 方式三：GitHub Pages

1. **启用GitHub Pages**
   - 在仓库设置中启用Pages
   - 选择main分支

2. **访问URL**
   ```
   https://your-username.github.io/your-repo-name/preview.html
   ```

## 📱 使用说明

### 访问统一入口

部署后，访问：
```
https://your-domain.com/preview.html
```

### 功能说明

1. **自动设备识别**
   - PC访问：默认显示PC端主站
   - 手机访问：自动切换到移动端视图

2. **标签页切换**
   - 💻 PC端主站：完整的桌面版界面
   - 📱 移动端：移动端优化界面
   - 📱 iPhone预览：iPhone 15 Pro Max预览效果
   - ⚙️ 智能管理：后台管理系统

3. **AI助手测试**
   - 所有页面都支持Evo助手
   - 点击右下角助手按钮即可测试
   - 支持网络环境下的API调用

4. **全屏模式**
   - 点击右上角"全屏"按钮
   - 获得更好的预览体验

## 🔗 示例URL格式

部署后的完整URL示例：

```
https://pigeonai.vercel.app/preview.html
```

或者如果设置了默认页面：

```
https://pigeonai.vercel.app/
```

## ⚙️ 配置说明

### 设置preview.html为默认首页

如果需要将 `preview.html` 设置为默认首页，可以：

1. **重命名文件**
   ```bash
   mv preview.html index-preview.html
   ```

2. **在Vercel中配置**
   - 在项目设置中添加重写规则
   - 或使用 `vercel.json` 配置

3. **使用vercel.json**
   ```json
   {
     "rewrites": [
       { "source": "/", "destination": "/preview.html" }
     ]
   }
   ```

## 🧪 测试AI助手

1. **访问统一入口**
   ```
   https://your-domain.com/preview.html
   ```

2. **切换到任意标签页**
   - PC端或移动端都可以

3. **点击Evo助手**
   - 右下角会出现助手图标
   - 点击打开聊天窗口

4. **测试对话**
   - 输入问题测试AI回复
   - 验证网络环境下的API调用

## 📊 访问统计

部署后可以通过以下方式查看访问统计：

- **Vercel Analytics**：在Vercel控制台查看
- **Google Analytics**：添加GA代码到preview.html
- **自定义统计**：在preview.html中添加统计代码

## 🔒 安全提示

1. **API Key保护**
   - 确保API Key存储在环境变量中
   - 不要将API Key提交到代码仓库

2. **访问控制**
   - 智能管理系统需要登录
   - 默认账号：admin / admin123

## 💡 提示

- 统一入口URL：`preview.html`
- 支持所有设备自动适配
- 一个URL访问所有功能
- 完美支持AI助手网络测试
























































