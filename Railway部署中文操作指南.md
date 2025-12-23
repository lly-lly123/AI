# Railway 部署中文操作指南 📖

## 🎯 当前问题

Railway 页面显示："No repositories found"（找不到仓库）

---

## 📝 详细操作步骤（按顺序执行）

### 第一步：在 Railway 页面操作

1. **找到 "Configure GitHub App" 链接**
   - 在 Railway 的 "Deploy Repository" 页面
   - 在搜索框下方，有一个蓝色的链接文字："Configure GitHub App"
   - **点击这个链接**

2. **等待跳转**
   - 点击后会跳转到 GitHub 授权页面

---

### 第二步：在 GitHub 授权页面操作

1. **确认仓库访问权限设置**
   - 你会看到两个选项：
     - ○ All repositories（所有仓库）
     - ● Only select repositories（仅选择特定仓库）← **选择这个**
   - 确保 "Only select repositories" 是选中的（有实心圆点）

2. **确认仓库已选择**
   - 在 "Selected X repository" 下方
   - 应该能看到：`lly-lly123/pigeon-ai`
   - 如果看不到，点击 "Select repositories" 按钮添加

3. **保存授权**
   - 滚动到页面底部
   - 找到绿色的 **"Save"** 按钮
   - **点击 "Save" 按钮**
   - 这是最关键的一步！必须点击保存！

4. **等待跳转**
   - 点击保存后，页面可能会自动跳转回 Railway
   - 或者显示成功消息

---

### 第三步：返回 Railway 页面

1. **切换回 Railway 标签页**
   - 如果还在 GitHub 页面，点击浏览器标签页切换回 Railway
   - 或者访问：https://railway.app

2. **强制刷新页面**
   - 按键盘快捷键：`Command + Shift + R`（Mac）
   - 或者：`Command + R`（普通刷新）
   - 这会清除缓存并重新加载页面

3. **重新尝试部署**
   - 点击 **"New Project"** 或 **"Deploy Repository"**
   - 现在应该能看到仓库列表了

---

### 第四步：选择仓库并创建项目

1. **搜索或选择仓库**
   - 在搜索框中输入：`pigeon-ai`
   - 或者直接在下拉列表中找到：`lly-lly123/pigeon-ai`
   - **点击这个仓库**

2. **等待项目创建**
   - Railway 会自动开始创建项目
   - 可能需要几秒钟

---

### 第五步：配置项目设置

项目创建后，需要配置两个重要设置：

#### 5.1 设置根目录（Root Directory）

1. **进入项目设置**
   - 在项目页面，点击顶部的 **"Settings"** 标签页

2. **找到根目录设置**
   - 在设置页面中找到 **"Root Directory"** 选项
   - 可能显示为输入框或下拉菜单

3. **设置为 backend**
   - 在输入框中输入：`backend`
   - 或者从下拉菜单中选择 `backend`
   - 点击 **"Save"** 保存

#### 5.2 配置环境变量（Environment Variables）

1. **进入环境变量设置**
   - 在项目页面，点击顶部的 **"Variables"** 标签页

2. **添加环境变量**
   - 点击 **"+ New Variable"** 或 **"Add Variable"** 按钮

3. **添加第一个变量：NODE_ENV**
   - 变量名（Key）：`NODE_ENV`
   - 变量值（Value）：`production`
   - 点击 **"Add"** 或 **"Save"**

4. **添加第二个变量：AI API Key（至少一个）**
   
   **选项 A：使用 ZHIPU_API_KEY_EVO**
   - 变量名：`ZHIPU_API_KEY_EVO`
   - 变量值：你的智谱AI密钥（从 https://open.bigmodel.cn/ 获取）
   - 点击 **"Add"**

   **选项 B：使用 ZHIPU_API_KEY_ADMIN**
   - 变量名：`ZHIPU_API_KEY_ADMIN`
   - 变量值：你的智谱AI密钥
   - 点击 **"Add"**

5. **（可选）添加其他变量**
   - `PORT=3000`（Railway 会自动提供，但可以显式设置）
   - `API_KEY=your-api-key-here`
   - `LOG_LEVEL=info`

---

### 第六步：等待部署完成

1. **查看部署状态**
   - 在项目页面，点击 **"Deployments"** 标签页
   - 可以看到部署进度和日志

2. **等待部署完成**
   - 通常需要 1-3 分钟
   - 状态会从 "Building" 变为 "Active" 或 "Success"

3. **查看日志（如果有问题）**
   - 点击部署记录
   - 查看日志输出，确认是否有错误

---

### 第七步：获取访问地址

1. **生成域名**
   - 在项目页面，点击 **"Settings"** 标签页
   - 找到 **"Domains"** 或 **"Generate Domain"** 选项
   - Railway 会自动生成一个域名，例如：
     ```
     https://your-project-name.up.railway.app
     ```

2. **复制访问地址**
   - 点击域名旁边的复制按钮
   - 保存这个地址，这是你的网站访问地址

---

### 第八步：验证部署

访问以下地址验证部署是否成功：

1. **健康检查**
   ```
   https://your-project-name.up.railway.app/api/health
   ```
   应该返回 JSON 数据，包含 `"success": true`

2. **API 根路径**
   ```
   https://your-project-name.up.railway.app/api
   ```

3. **前端页面**
   ```
   https://your-project-name.up.railway.app/
   ```

---

## ⚠️ 常见问题解决

### 问题 1：还是看不到仓库

**解决方法：**
1. 完全关闭 Railway 浏览器标签页
2. 重新打开：https://railway.app
3. 重新登录（如果需要）
4. 再次点击 "Deploy Repository"
5. 点击 "Configure GitHub App" 重新授权

### 问题 2：点击 Save 后没有反应

**解决方法：**
1. 检查是否真的点击了 "Save" 按钮（不是 "Cancel"）
2. 等待 5-10 秒，授权需要时间生效
3. 检查浏览器控制台是否有错误（按 F12 打开开发者工具）

### 问题 3：部署失败

**解决方法：**
1. 检查 Root Directory 是否设置为 `backend`
2. 检查环境变量是否正确配置
3. 查看部署日志，找到错误信息
4. 确认 `package.json` 中有 `"start": "node server.js"` 脚本

### 问题 4：找不到环境变量设置

**解决方法：**
1. 确保项目已创建
2. 在项目页面顶部找到标签页：Settings、Variables、Deployments
3. 点击 "Variables" 标签页
4. 如果还是找不到，尝试刷新页面

---

## 📋 操作检查清单

完成每一步后，打勾确认：

- [ ] 第一步：点击了 Railway 的 "Configure GitHub App"
- [ ] 第二步：在 GitHub 选择了 "Only select repositories"
- [ ] 第二步：确认 `lly-lly123/pigeon-ai` 在仓库列表中
- [ ] 第二步：点击了 "Save" 按钮保存授权
- [ ] 第三步：返回 Railway 并刷新了页面
- [ ] 第四步：成功看到并选择了 `lly-lly123/pigeon-ai` 仓库
- [ ] 第五步：设置了 Root Directory 为 `backend`
- [ ] 第五步：添加了 `NODE_ENV=production` 环境变量
- [ ] 第五步：添加了 AI API Key 环境变量
- [ ] 第六步：部署状态显示为 "Success" 或 "Active"
- [ ] 第七步：获取了访问地址
- [ ] 第八步：成功访问了健康检查端点

---

## 🎯 快速操作总结

**最简单的操作流程：**

1. **点击** Railway 页面的 "Configure GitHub App"
2. **确认** GitHub 页面选择了 `lly-lly123/pigeon-ai`
3. **点击** "Save" 按钮（最重要！）
4. **返回** Railway 页面
5. **刷新** 页面（Command + Shift + R）
6. **点击** "Deploy Repository"
7. **选择** `lly-lly123/pigeon-ai` 仓库
8. **设置** Root Directory 为 `backend`
9. **添加** 环境变量（至少 NODE_ENV 和 AI API Key）
10. **等待** 部署完成

---

## 💡 重要提示

1. **必须点击 "Save"**：只选择仓库不保存，授权不会生效
2. **必须刷新页面**：保存授权后，Railway 页面需要刷新才能看到仓库
3. **Root Directory 必须设置为 `backend`**：否则 Railway 找不到 `package.json`
4. **至少需要一个 AI API Key**：否则 AI 功能无法使用

---

## 🆘 需要帮助？

如果按照以上步骤操作后仍然有问题，请告诉我：

1. 你在哪一步卡住了？
2. 看到了什么错误信息？
3. Railway 页面显示什么内容？

我会继续帮你解决问题！🚀

