# 🔑 获取GitHub Personal Access Token（必须）

## ⚠️ 重要说明

GitHub**不再支持使用账户密码**进行Git操作，必须使用**Personal Access Token**。

你的账户信息：
- 邮箱：3375875589@qq.com
- 用户名：Ily-lly123
- 仓库：PigeonAI

## 🚀 快速步骤

### 步骤1：创建Token（2分钟）

1. **打开浏览器**，访问：
   ```
   https://github.com/settings/tokens
   ```

2. **点击按钮**：
   - 点击 "Generate new token"
   - 选择 "Generate new token (classic)"

3. **填写信息**：
   - **Note（备注）**: 输入 `PigeonAI推送` 或 `Mac推送`
   - **Expiration（过期时间）**: 
     - 选择 `90 days`（90天后过期，需要重新创建）
     - 或选择 `No expiration`（永不过期，更方便但安全性较低）
   - **Select scopes（权限）**: 
     - ✅ 勾选 **`repo`**（Full control of private repositories）
     - 这会自动勾选所有repo相关的权限

4. **生成Token**：
   - 滚动到页面底部
   - 点击绿色的 **"Generate token"** 按钮

5. **复制Token**：
   - 会显示一个以 `ghp_` 开头的长字符串，类似：
     ```
     ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```
   - **立即复制**（只显示一次！）
   - **保存好这个Token**，之后推送代码时需要用到

### 步骤2：使用Token推送代码

#### 方法1：在终端执行（推荐）

打开**终端**（Terminal），执行：

```bash
cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"
git push -u origin main
```

当提示输入时：
- **Username（用户名）**: 输入 `Ily-lly123`
- **Password（密码）**: **粘贴刚才复制的Token**（不是你的账户密码3375875589@qq.com的密码！）

#### 方法2：使用我创建的脚本

```bash
cd "/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本"
./推送代码.sh
```

## ✅ 成功标志

推送成功后，你会看到类似输出：
```
Enumerating objects: 92, done.
Counting objects: 100% (92/92), done.
Delta compression using up to 8 threads
Compressing objects: 100% (85/85), done.
Writing objects: 100% (92/92), 1.5 MiB | 2.1 MiB/s, done.
To https://github.com/Ily-lly123/PigeonAI.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

然后访问：https://github.com/Ily-lly123/PigeonAI 就能看到你的代码了！

## 🔒 安全提醒

- ✅ Token相当于密码，**不要分享给他人**
- ✅ 如果Token泄露，立即到 https://github.com/settings/tokens 删除它
- ✅ 可以随时创建新Token，旧Token会自动失效
- ⚠️ Token过期后需要重新创建

## 💡 小技巧：让Mac记住Token

如果你想让Mac记住Token，避免每次都输入：

1. **推送时输入一次Token**
2. Mac会自动保存到钥匙串（Keychain）
3. 以后推送就不需要再输入了

## 🆘 如果遇到问题

### 问题1：提示"认证失败"

- 确认使用的是Token，不是账户密码
- 确认Token有`repo`权限
- 检查Token是否过期

### 问题2：提示"权限不足"

- 确认Token勾选了`repo`权限
- 确认仓库存在且你有权限访问

### 问题3：Token忘记了

- 重新创建一个新Token
- 删除旧Token（在 https://github.com/settings/tokens 页面）

---

**现在就去创建Token，然后推送代码吧！** 🚀

