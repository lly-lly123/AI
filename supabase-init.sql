-- ============================================================================
-- Supabase 数据库初始化SQL
-- ============================================================================
-- 用途：在Supabase项目中执行此SQL以创建所需的数据表
-- 执行位置：Supabase控制台 -> SQL Editor -> New Query
-- ============================================================================

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建鸽子数据表
CREATE TABLE IF NOT EXISTS pigeons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  ring_number TEXT,
  breed TEXT,
  color TEXT,
  gender TEXT,
  birth_date DATE,
  parent_male TEXT,
  parent_female TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建训练记录表
CREATE TABLE IF NOT EXISTS training (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pigeon_id TEXT NOT NULL,
  date DATE NOT NULL,
  distance REAL,
  duration INTEGER,
  weather TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建比赛表
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE,
  distance REAL,
  location TEXT,
  category TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建管理员日志表
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  username TEXT,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建令牌表
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'access',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建资讯源表
CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  region TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建使用统计表
CREATE TABLE IF NOT EXISTS usage_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  details JSONB,
  source TEXT,
  page TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建用户数据表
CREATE TABLE IF NOT EXISTS user_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data_type TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建备份表
CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  users JSONB,
  user_data JSONB,
  total_users INTEGER,
  total_data_records INTEGER
);

-- 创建evo_settings表（AI设置）
CREATE TABLE IF NOT EXISTS evo_settings (
  id TEXT PRIMARY KEY,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建feedbacks表（用户反馈）
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 创建索引以提高查询性能
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pigeons_user_id ON pigeons(user_id);
CREATE INDEX IF NOT EXISTS idx_training_user_id ON training(user_id);
CREATE INDEX IF NOT EXISTS idx_training_pigeon_id ON training(pigeon_id);
CREATE INDEX IF NOT EXISTS idx_training_date ON training(date);
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON admin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_races_status ON races(status);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_created_at ON usage_stats(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);

-- ============================================================================
-- 完成提示
-- ============================================================================
-- 执行完成后，所有表已创建并已添加索引
-- 现在可以在Zeabur环境变量中配置SUPABASE_URL和SUPABASE_ANON_KEY
-- ============================================================================















































