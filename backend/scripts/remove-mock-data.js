/**
 * 删除虚拟测试数据脚本
 * 用于清理测试时注入的虚拟数据
 */

const path = require('path');
const fs = require('fs').promises;
const storageService = require('../services/storageService');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function removeMockData() {
  log('\n🧹 开始清理虚拟测试数据...', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    // 1. 清理 user_data.json 中的虚拟数据
    log('\n📋 步骤1: 清理用户数据...', 'cyan');
    const userDataList = await storageService.read('user_data') || [];
    const originalCount = userDataList.length;
    
    // 查找admin用户的数据
    const adminUserData = userDataList.find(u => u.userId === 'admin' || u.username === 'admin');
    
    if (adminUserData) {
      // 删除虚拟数据（保留结构）
      adminUserData.pigeons = [];
      adminUserData.training = [];
      adminUserData.races = [];
      adminUserData.healthRecords = [];
      adminUserData.pairings = [];
      
      // 更新数据
      const updatedUserDataList = userDataList.map(u => 
        (u.userId === 'admin' || u.username === 'admin') ? adminUserData : u
      );
      
      await storageService.write('user_data', updatedUserDataList);
      log(`✅ 已清理 admin 用户的虚拟数据`, 'green');
    } else {
      log('⚠️  未找到 admin 用户数据', 'yellow');
    }

    // 2. 清理 pigeons.json 中的虚拟数据
    log('\n📋 步骤2: 清理鸽子数据...', 'cyan');
    const pigeons = await storageService.read('pigeons') || [];
    const originalPigeonCount = pigeons.length;
    
    // 删除所有虚拟数据（保留真实数据）
    // 虚拟数据的特征：name包含"测试"、"虚拟"、"Mock"等关键词
    const realPigeons = pigeons.filter(p => {
      const name = (p.name || '').toLowerCase();
      const ring = (p.ring || '').toLowerCase();
      return !name.includes('测试') && 
             !name.includes('虚拟') && 
             !name.includes('mock') &&
             !ring.includes('test') &&
             !ring.includes('mock');
    });
    
    await storageService.write('pigeons', realPigeons);
    const removedPigeons = originalPigeonCount - realPigeons.length;
    log(`✅ 已删除 ${removedPigeons} 只虚拟鸽子`, 'green');
    log(`   保留 ${realPigeons.length} 只真实鸽子`, 'blue');

    // 3. 清理 training.json 中的虚拟数据
    log('\n📋 步骤3: 清理训练记录...', 'cyan');
    const training = await storageService.read('training') || [];
    const originalTrainingCount = training.length;
    
    // 删除虚拟训练记录（保留真实数据）
    const realTraining = training.filter(t => {
      const notes = (t.notes || '').toLowerCase();
      return !notes.includes('测试') && 
             !notes.includes('虚拟') && 
             !notes.includes('mock');
    });
    
    await storageService.write('training', realTraining);
    const removedTraining = originalTrainingCount - realTraining.length;
    log(`✅ 已删除 ${removedTraining} 条虚拟训练记录`, 'green');
    log(`   保留 ${realTraining.length} 条真实训练记录`, 'blue');

    // 4. 清理 races.json 中的虚拟数据
    log('\n📋 步骤4: 清理比赛记录...', 'cyan');
    const races = await storageService.read('races') || [];
    const originalRaceCount = races.length;
    
    // 删除虚拟比赛记录（保留真实数据）
    const realRaces = races.filter(r => {
      const name = (r.name || '').toLowerCase();
      const location = (r.location || '').toLowerCase();
      return !name.includes('测试') && 
             !name.includes('虚拟') && 
             !name.includes('mock') &&
             !location.includes('测试') &&
             !location.includes('虚拟');
    });
    
    await storageService.write('races', realRaces);
    const removedRaces = originalRaceCount - realRaces.length;
    log(`✅ 已删除 ${removedRaces} 条虚拟比赛记录`, 'green');
    log(`   保留 ${realRaces.length} 条真实比赛记录`, 'blue');

    // 打印摘要
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 清理摘要', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`删除虚拟鸽子: ${removedPigeons} 只`, 'green');
    log(`删除虚拟训练记录: ${removedTraining} 条`, 'green');
    log(`删除虚拟比赛记录: ${removedRaces} 条`, 'green');
    log('\n✅ 虚拟数据清理完成！', 'green');
    log('='.repeat(60), 'cyan');

  } catch (error) {
    log(`\n❌ 清理失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行清理
removeMockData().catch(error => {
  log(`\n❌ 执行失败: ${error.message}`, 'red');
  process.exit(1);
});

