# 📤 GitHub 代码推送完整指南

## 🎯 快速开始

### 方法一：使用一键推送脚本（推荐）

最简单的方式，双击运行脚本即可：

```bash
# 在项目目录下运行
./git-push-main.sh
```

这个脚本会：
- ✅ 自动检测 Git 仓库
- ✅ 图形界面输入提交信息
- ✅ 自动配置远程仓库
- ✅ 支持 Token 认证
- ✅ 推送到 main 分支

### 方法二：使用快速推送脚本

```bash
./快速推送代码.sh
```

这个脚本会：
- ✅ 自动检测并提交未保存的更改
- ✅ 尝试多种推送方式（SSH、HTTPS）
- ✅ 自动处理 SSL 验证问题

### 方法三：手动推送（标准流程）

```bash
# 1. 进入项目目录
cd /Users/macbookair/Desktop/AI

# 2. 检查状态
git status

# 3. 添加所有更改
git add .

# 4. 提交更改
git commit -m "你的提交信息"

# 5. 推送到 GitHub
git push -u origin main
```

---

## 🔧 常见问题解决方案

### 问题1：网络连接失败

**错误信息**：
```
Failed to connect to github.com port 443
```

**解决方案**：

#### 方案A：配置代理（如果使用 VPN/代理）

```bash
# 运行代理配置脚本
./配置Git代理.sh

# 或手动配置（Clash 默认端口 7890）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 然后推送
git push -u origin main
```

#### 方案B：使用 Telescope 代理（端口 1191）

```bash
git config http.proxy http://127.0.0.1:1191
git config https.proxy http://127.0.0.1:1191
git push -u origin main
```

#### 方案C：稍后重试

**重要**：代码已安全保存在本地，不会丢失！可以等网络恢复后再推送。

---

### 问题2：SSL 证书验证失败

**错误信息**：
```
SSL certificate problem
```

**解决方案**：

```bash
# 临时禁用 SSL 验证（仅用于推送）
git -c http.sslVerify=false push -u origin main
```

**注意**：这只是临时解决方案。长期建议配置正确的 SSL 证书或使用 SSH。

---

### 问题3：认证失败

**错误信息**：
```
Authentication failed
Permission denied
```

**解决方案**：

#### 方案A：使用 Personal Access Token (PAT)

1. 在 GitHub 创建 Token：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择 `repo` 权限
   - 复制生成的 Token

2. 使用 Token 推送：

```bash
# 方法1：在 URL 中包含 Token
git remote set-url origin https://YOUR_TOKEN@github.com/lly-lly123/AI.git
git push -u origin main

# 方法2：使用 git credential helper
git push -u origin main
# 当提示输入密码时，输入 Token（不是密码）
```

#### 方案B：配置 SSH 密钥（推荐，最安全）

```bash
# 1. 检查是否已有 SSH 密钥
ls -al ~/.ssh

# 2. 如果没有，生成新的 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 3. 复制公钥到剪贴板
pbcopy < ~/.ssh/id_ed25519.pub

# 4. 在 GitHub 添加 SSH 密钥：
#    - 访问：https://github.com/settings/keys
#    - 点击 "New SSH key"
#    - 粘贴公钥并保存

# 5. 测试连接
ssh -T git@github.com

# 6. 更改远程地址为 SSH
git remote set-url origin git@github.com:lly-lly123/AI.git

# 7. 推送
git push -u origin main
```

---

## 📋 可用的推送脚本

项目中有多个脚本可以帮助您推送代码：

| 脚本名称 | 功能 | 使用场景 |
|---------|------|---------|
| `git-push-main.sh` | 一键推送（图形界面） | 最简单，推荐新手使用 |
| `快速推送代码.sh` | 自动尝试多种方式 | 网络不稳定时使用 |
| `推送代码到GitHub.sh` | 使用代理推送 | VPN 已连接时使用 |
| `直接推送HTTPS.sh` | 直接 HTTPS 推送 | 网络正常时使用 |
| `配置Git代理.sh` | 配置 Git 代理 | 需要代理时使用 |
| `解决Git推送SSL错误.sh` | 修复 SSL 问题 | SSL 证书错误时使用 |

---

## 🚀 完整推送流程示例

### 场景1：首次推送新项目

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加远程仓库
git remote add origin https://github.com/lly-lly123/AI.git

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "初始提交"

# 5. 推送到 main 分支
git push -u origin main
```

### 场景2：日常更新推送

```bash
# 1. 检查状态
git status

# 2. 添加更改
git add .

# 3. 提交
git commit -m "更新功能：描述你的更改"

# 4. 推送
git push
```

### 场景3：使用代理推送

```bash
# 1. 配置代理
./配置Git代理.sh
# 或手动配置：
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 2. 推送
git push -u origin main

# 3. 推送完成后，可选：清除代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## ⚠️ 重要提示

### ✅ 代码安全

- **代码已保存在本地**：即使推送失败，代码也不会丢失
- **可以稍后推送**：不急于现在推送，可以等网络恢复
- **不影响部署**：可以先配置 Zeabur，等代码推送后再部署

### 🔒 安全建议

1. **不要将 Token 提交到代码库**
   - 使用 `.gitignore` 排除包含敏感信息的文件
   - Token 应该通过环境变量或 Git credential helper 管理

2. **使用 SSH 密钥（推荐）**
   - 比密码或 Token 更安全
   - 一次配置，长期使用

3. **定期更新 Token**
   - 如果 Token 泄露，及时撤销并创建新的

---

## 🔍 诊断工具

### 检查 Git 配置

```bash
# 查看远程仓库地址
git remote -v

# 查看代理设置
git config --global --get http.proxy
git config --global --get https.proxy

# 查看所有 Git 配置
git config --list
```

### 测试网络连接

```bash
# 测试 GitHub 连接
ping github.com

# 测试 HTTPS 连接
curl -I https://github.com

# 运行网络诊断脚本
./网络连接诊断.sh
```

### 检查 SSH 连接

```bash
# 测试 SSH 连接
ssh -T git@github.com

# 应该看到：
# Hi username! You've successfully authenticated...
```

---

## 📞 需要帮助？

如果所有方法都失败：

1. **检查网络连接**：确保可以访问互联网
2. **确认代理/VPN**：如果使用代理，确保代理软件正在运行
3. **尝试其他网络**：使用手机热点或其他网络环境
4. **查看详细错误**：运行诊断脚本获取更多信息
5. **代码已安全保存**：可以稍后推送，不会丢失

---

## 📝 当前仓库信息

- **仓库地址**：`https://github.com/lly-lly123/AI.git`
- **SSH 地址**：`git@github.com:lly-lly123/AI.git`
- **默认分支**：`main`

---

**最后更新**：2025-12-26  
**状态**：所有脚本已就绪，可以开始推送
