-- Supabase数据库初始化脚本
-- 在Supabase Dashboard的SQL Editor中运行此脚本

-- 创建所有需要的表

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT,
  password TEXT,
  type TEXT DEFAULT '普通用户',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 鸽子表
CREATE TABLE IF NOT EXISTS pigeons (
  id TEXT PRIMARY KEY,
  ring TEXT,
  name TEXT,
  gender TEXT,
  color TEXT,
  birth_date TEXT,
  father_ring TEXT,
  mother_ring TEXT,
  owner TEXT,
  notes TEXT,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 训练表
CREATE TABLE IF NOT EXISTS training (
  id TEXT PRIMARY KEY,
  pigeon_id TEXT,
  date TEXT,
  distance TEXT,
  time TEXT,
  speed TEXT,
  weather TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 比赛表
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  pigeon_id TEXT,
  race_name TEXT,
  race_date TEXT,
  distance TEXT,
  position TEXT,
  speed TEXT,
  prize TEXT,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 管理员日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  action TEXT,
  user_id TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ip TEXT,
  user_agent TEXT,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Token表
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 新闻源表
CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  name TEXT,
  url TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户数据表
CREATE TABLE IF NOT EXISTS user_data (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  data_type TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 备份表
CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  backup_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 设置表
CREATE TABLE IF NOT EXISTS evo_settings (
  id TEXT PRIMARY KEY,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 启用Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pigeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE training ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE evo_settings ENABLE ROW LEVEL SECURITY;

-- 创建允许匿名访问的策略（用于API访问）
CREATE POLICY "Allow anonymous read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON users FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON pigeons FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON pigeons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON pigeons FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON pigeons FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON training FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON training FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON training FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON training FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON races FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON races FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON races FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON races FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON admin_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON admin_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON login_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON login_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON tokens FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON tokens FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON tokens FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON news_sources FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON news_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON news_sources FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON news_sources FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON usage_stats FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON usage_stats FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON user_data FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON user_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON user_data FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON user_data FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read" ON backups FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON backups FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read" ON evo_settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON evo_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON evo_settings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON evo_settings FOR DELETE USING (true);


