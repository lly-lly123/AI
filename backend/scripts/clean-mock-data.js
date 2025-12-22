/**
 * 清理虚拟测试数据
 * 删除所有标记为 "__MOCK_DATA__" 的数据
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// 需要清理的文件
const DATA_FILES = [
  'pigeons.json',
  'user_data.json',
  'training.json',
  'races.json'
];

function cleanMockData() {
  console.log('🧹 开始清理虚拟测试数据...\n');

  let totalRemoved = 0;

  DATA_FILES.forEach(fileName => {
    const filePath = path.join(DATA_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${fileName}`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      let removed = 0;
      let cleanedData;

      if (Array.isArray(data)) {
        // 数组格式
        cleanedData = data.filter(item => {
          if (item.notes && item.notes.includes('__MOCK_DATA__')) {
            removed++;
            return false;
          }
          if (item.data && Array.isArray(item.data.pigeons)) {
            // user_data.json格式
            item.data.pigeons = item.data.pigeons.filter(p => {
              if (p.notes && p.notes.includes('__MOCK_DATA__')) {
                removed++;
                return false;
              }
              return true;
            });
            item.data.training = item.data.training ? item.data.training.filter(t => {
              if (t.notes && t.notes.includes('__MOCK_DATA__')) {
                removed++;
                return false;
              }
              return true;
            }) : [];
            item.data.races = item.data.races ? item.data.races.filter(r => {
              if (r.notes && r.notes.includes('__MOCK_DATA__')) {
                removed++;
                return false;
              }
              return true;
            }) : [];
          }
          return true;
        });
      } else if (data.pigeons && Array.isArray(data.pigeons)) {
        // 对象格式，包含pigeons数组
        cleanedData = { ...data };
        cleanedData.pigeons = data.pigeons.filter(p => {
          if (p.notes && p.notes.includes('__MOCK_DATA__')) {
            removed++;
            return false;
          }
          return true;
        });
      } else {
        cleanedData = data;
      }

      // 保存清理后的数据
      fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf8');
      
      if (removed > 0) {
        console.log(`✅ ${fileName}: 删除了 ${removed} 条虚拟数据`);
        totalRemoved += removed;
      } else {
        console.log(`✓ ${fileName}: 没有找到虚拟数据`);
      }
    } catch (error) {
      console.error(`❌ 处理 ${fileName} 时出错:`, error.message);
    }
  });

  console.log(`\n✨ 清理完成！共删除 ${totalRemoved} 条虚拟数据`);
}

// 执行清理
cleanMockData();

