# 📋 Supabase 数据库初始化说明

## 🎯 问题说明

如果日志中出现以下警告：
```
[WARN] Supabase表不存在，将使用本地存储模式
错误代码: PGRST205
提示: 请在Supabase SQL Editor中执行 supabase-init.sql 创建数据表
```

这表示 Supabase 环境变量已配置，但数据库中缺少必要的数据表。

## ✅ 解决步骤

### 第1步：打开 Supabase 控制台

1. 访问：https://supabase.com
2. 登录你的账号
3. 选择你的项目（URL 应该匹配你在 Zeabur 中配置的 `SUPABASE_URL`）

### 第2步：打开 SQL Editor

1. 在左侧菜单中找到 **"SQL Editor"**（SQL 编辑器）
2. 点击 **"New Query"**（新建查询）按钮

### 第3步：执行初始化脚本

1. 在项目根目录找到 `supabase-init.sql` 文件
2. 打开文件，复制**全部内容**
3. 粘贴到 Supabase SQL Editor 中
4. 点击 **"Run"**（运行）按钮执行

### 第4步：验证表是否创建成功

1. 在左侧菜单找到 **"Table Editor"**（表编辑器）
2. 应该能看到以下表：
   - `users` - 用户表
   - `pigeons` - 鸽子数据表
   - `training` - 训练记录表
   - `races` - 比赛表
   - `admin_logs` - 管理员日志表
   - `login_logs` - 登录日志表
   - `tokens` - 令牌表
   - `news_sources` - 资讯源表
   - `usage_stats` - 使用统计表
   - `user_data` - 用户数据表
   - `backups` - 备份表
   - `evo_settings` - AI设置表
   - `feedbacks` - 用户反馈表

### 第5步：重启 Zeabur 服务

1. 在 Zeabur 控制台，进入你的项目
2. 点击服务右侧的 **"..."** 菜单
3. 选择 **"Restart"**（重启）
4. 或点击 **"Redeploy"**（重新部署）

### 第6步：验证修复成功

重启后，在 Zeabur 运行时日志中应该看到：

```
✅ 云存储服务初始化成功（使用Supabase）
📦 数据将自动同步到云端
🔄 自动同步已启动（每30秒同步队列，每5分钟全量同步）
```

**不再看到**：
```
⚠️ Supabase表不存在，将使用本地存储模式
```

## 📝 注意事项

1. **数据安全**：执行 SQL 脚本不会删除现有数据，只会创建不存在的表
2. **索引创建**：脚本会自动创建索引以提高查询性能
3. **执行时间**：通常需要几秒钟完成
4. **错误处理**：如果表已存在，脚本会跳过（使用 `IF NOT EXISTS`）

## 🆘 如果遇到问题

### 问题1：SQL 执行失败

**可能原因**：
- SQL 语法错误
- 权限不足

**解决方法**：
- 检查是否完整复制了所有 SQL 代码
- 确保使用的是项目所有者账号

### 问题2：表创建成功但仍有警告

**可能原因**：
- 环境变量配置错误
- 服务未重启

**解决方法**：
- 检查 Zeabur 环境变量中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- 确保重启了 Zeabur 服务

### 问题3：找不到 supabase-init.sql 文件

**解决方法**：
- 文件位置：项目根目录 `/supabase-init.sql`
- 如果找不到，可以从 GitHub 仓库下载

## ✅ 完成后的效果

修复成功后：
- ✅ 数据会自动同步到 Supabase 云端
- ✅ 支持多设备数据同步
- ✅ 数据持久化更可靠
- ✅ 不再出现 Supabase 连接警告

---

**最后更新**：2025-12-27

