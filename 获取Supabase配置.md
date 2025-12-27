# 获取Supabase配置信息

## 📋 步骤

1. **访问Supabase API设置页面**
   - 在浏览器中打开：https://supabase.com/dashboard/project/pigeonai/settings/api
   - 或点击左侧边栏的 **Settings** → **API**

2. **复制以下信息：**
   - **Project URL**：在 "Project URL" 部分，复制完整的URL（例如：`https://xxxxx.supabase.co`）
   - **service_role key**：在 "Project API keys" 部分，找到 **service_role** key（注意：不是anon key，是service_role key）

3. **执行SQL脚本：**
   ```bash
   cd /Users/macbookair/Desktop/AI
   ./execute-supabase-sql.sh <SUPABASE_URL> <SERVICE_ROLE_KEY>
   ```

## ⚠️ 重要提示

- **service_role key** 具有完整权限，请妥善保管，不要泄露
- 执行SQL后，可以删除或重置这个key以确保安全




















































