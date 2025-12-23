#!/usr/bin/env node

/**
 * Supabase SQL执行脚本
 * 使用PostgreSQL连接执行SQL
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 检查参数
if (process.argv.length < 3) {
  console.log('');
  console.log('============================================================================');
  console.log('🚀 Supabase SQL执行脚本');
  console.log('============================================================================');
  console.log('');
  console.log('用法: node execute-sql.js <数据库连接字符串>');
  console.log('');
  console.log('获取方式：');
  console.log('1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/database');
  console.log('2. 找到 "Connection string" 部分');
  console.log('3. 选择 "URI" 标签');
  console.log('4. 复制连接字符串（格式: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres）');
  console.log('');
  process.exit(1);
}

const DB_URL = process.argv[2];
const SQL_FILE = path.join(__dirname, 'supabase-init.sql');

// 从URL提取数据库连接信息
// Supabase URL格式: https://xxxxx.supabase.co
// 数据库连接: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

function parseSupabaseUrl(url, key) {
  // 如果URL包含数据库连接字符串格式，直接使用
  if (url.startsWith('postgresql://')) {
    return url;
  }
  
  // 否则需要用户提供数据库密码
  // 从Supabase URL提取项目引用
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('无效的Supabase URL格式');
  }
  
  const projectRef = match[1];
  console.log('⚠️  需要数据库密码来连接');
  console.log('   请访问: Settings → Database → Connection string → URI');
  console.log('   或提供数据库密码');
  throw new Error('需要数据库连接字符串或密码');
}

async function executeSQL() {
  try {
    console.log('');
    console.log('============================================================================');
    console.log('🚀 执行Supabase SQL');
    console.log('============================================================================');
    console.log('');
    
    // 读取SQL文件
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL文件不存在: ${SQL_FILE}`);
    }
    
    const sql = fs.readFileSync(SQL_FILE, 'utf8');
    console.log(`📋 读取SQL文件: ${SQL_FILE}`);
    console.log(`   文件大小: ${sql.length} 字符`);
    console.log('');
    
    // 检查是否提供了数据库连接字符串
    let connectionString = DB_URL;
    
    if (!connectionString || !connectionString.startsWith('postgresql://')) {
      console.log('⚠️  需要数据库连接字符串');
      console.log('');
      console.log('请执行以下步骤：');
      console.log('1. 访问: https://supabase.com/dashboard/project/pigeonai/settings/database');
      console.log('2. 找到 "Connection string" 部分');
      console.log('3. 选择 "URI" 标签');
      console.log('4. 复制连接字符串（格式: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres）');
      console.log('');
      console.log('然后执行:');
      console.log(`   node execute-sql.js "<连接字符串>"`);
      console.log('');
      process.exit(1);
    }
    
    console.log('🔄 正在连接数据库...');
    
    // 创建PostgreSQL客户端
    const client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    console.log('✅ 数据库连接成功');
    console.log('');
    
    // 执行SQL（分割成多个语句）
    console.log('🔄 正在执行SQL...');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   共 ${statements.length} 条SQL语句`);
    console.log('');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim().length === 0) continue;
      
      try {
        await client.query(statement + ';');
        console.log(`✅ [${i + 1}/${statements.length}] 执行成功`);
      } catch (error) {
        // 忽略已存在的错误（如表已存在）
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] 已存在，跳过`);
        } else {
          console.log(`❌ [${i + 1}/${statements.length}] 执行失败: ${error.message}`);
          // 继续执行其他语句
        }
      }
    }
    
    await client.end();
    
    console.log('');
    console.log('============================================================================');
    console.log('✅ SQL执行完成！');
    console.log('============================================================================');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ 错误:', error.message);
    console.error('');
    process.exit(1);
  }
}

executeSQL();

