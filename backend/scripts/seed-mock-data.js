/**
 * 注入前台演示用虚拟数据（含删除标记）
 * 覆盖范围：鸽子管理 / 血统关系 / 统计分析 / 比赛与成绩 / 繁育与配对 /
 *          健康管理 / 训练模块 / 能力综合分析（依赖训练与比赛数据）
 *
 * 使用：
 *   node backend/scripts/seed-mock-data.js
 *
 * 删除：
 *   node backend/scripts/clean-mock-data.js
 *   或  node backend/scripts/remove-mock-data.js
 */

const storage = require('../services/storageService');

const MOCK_FLAG = '__MOCK_DATA__';

const now = () => new Date().toISOString();
const rid = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

function withMockNotes(obj, notes) {
  return { ...obj, notes: `${notes} - ${MOCK_FLAG}` };
}

function stripMock(arr = []) {
  return arr.filter(item => !(item.notes || '').includes(MOCK_FLAG));
}

async function seed() {
  console.log('🚀 开始注入虚拟数据用于前台演示...\n');

  // 找到 admin 用户ID，找不到则用 'admin'
  const users = await storage.read('users');
  const admin = (users || []).find(u => u.username === 'admin');
  const adminId = admin?.id || 'admin';

  // 1) 生成鸽子样本（含父母环号方便血统关系展示）
  const pigeons = [
    withMockNotes({
      id: rid(),
      ring: 'CN-2024-001',
      name: '雷霆一号',
      gender: '雄',
      color: '灰白',
      birth_date: '2024-03-12',
      type: '赛鸽',
      father_ring: 'CN-2021-888',
      mother_ring: 'CN-2021-889',
      owner: '演示账号',
      alive: true,
      isCore: true,
      userId: adminId,
    }, '虚拟测试数据'),
    withMockNotes({
      id: rid(),
      ring: 'CN-2024-002',
      name: '晨曦公主',
      gender: '雌',
      color: '麒麟花',
      birth_date: '2024-04-05',
      type: '赛鸽',
      father_ring: 'CN-2021-888',
      mother_ring: 'CN-2021-889',
      owner: '演示账号',
      alive: true,
      isCore: true,
      userId: adminId,
    }, '虚拟测试数据'),
    withMockNotes({
      id: rid(),
      ring: 'CN-2023-110',
      name: '北风',
      gender: '雄',
      color: '灰',
      birth_date: '2023-06-01',
      type: '种鸽',
      father_ring: 'CN-2019-500',
      mother_ring: 'CN-2020-300',
      owner: '演示账号',
      alive: true,
      isCore: false,
      userId: adminId,
    }, '虚拟测试数据'),
    withMockNotes({
      id: rid(),
      ring: 'CN-2023-209',
      name: '玫瑰',
      gender: '雌',
      color: '红',
      birth_date: '2023-05-18',
      type: '种鸽',
      father_ring: 'CN-2019-500',
      mother_ring: 'CN-2020-300',
      owner: '演示账号',
      alive: true,
      isCore: false,
      userId: adminId,
    }, '虚拟测试数据'),
  ];

  // 2) 健康记录
  const healthRecords = [
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[0].id,
      date: '2024-11-10',
      type: '体检',
      condition: '健康',
    }, '虚拟健康记录'),
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[1].id,
      date: '2024-12-01',
      type: '疫苗接种',
      condition: '良好',
    }, '虚拟健康记录'),
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[2].id,
      date: '2024-10-05',
      type: '治疗',
      condition: '康复中',
    }, '虚拟健康记录'),
  ];

  // 3) 训练记录
  const training = [
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[0].id,
      date: '2024-12-15',
      distance: '120公里',
      time: '2:20',
      speed: '51.7公里/小时',
      weather: '多云',
    }, '虚拟训练记录'),
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[1].id,
      date: '2024-12-18',
      distance: '80公里',
      time: '1:25',
      speed: '56.5公里/小时',
      weather: '晴',
    }, '虚拟训练记录'),
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[2].id,
      date: '2024-11-28',
      distance: '150公里',
      time: '3:10',
      speed: '47.4公里/小时',
      weather: '阴',
    }, '虚拟训练记录'),
  ];

  // 4) 比赛记录
  const races = [
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[0].id,
      race_name: '冬季120公里资格赛',
      race_date: '2024-12-20',
      distance: '120公里',
      position: 18,
      speed: '50.1公里/小时',
      prize: '季军',
      status: '已完成',
    }, '虚拟比赛记录'),
    withMockNotes({
      id: rid(),
      pigeon_id: pigeons[1].id,
      race_name: '冬季80公里热身赛',
      race_date: '2024-12-12',
      distance: '80公里',
      position: 5,
      speed: '58.2公里/小时',
      prize: '亚军',
      status: '已完成',
    }, '虚拟比赛记录'),
  ];

  // 5) 配对记录（繁育与配对）
  const pairings = [
    withMockNotes({
      id: rid(),
      male_id: pigeons[0].id,
      female_id: pigeons[1].id,
      pairing_date: '2024-11-05',
      status: '已孵化',
    }, '虚拟配对记录'),
    withMockNotes({
      id: rid(),
      male_id: pigeons[2].id,
      female_id: pigeons[3].id,
      pairing_date: '2024-10-22',
      status: '配对中',
    }, '虚拟配对记录'),
  ];

  // 6) 更新 user_data（admin）
  const userData = await storage.read('user_data');
  const filtered = stripMock(userData);
  const adminData = filtered.find(u => u.userId === adminId) || {
    userId: adminId,
    username: 'admin',
    data: {
      pigeons: [],
      training: [],
      races: [],
      healthRecords: [],
      pairings: [],
    },
  };

  const others = filtered.filter(u => u.userId !== adminId);
  const mergedAdmin = {
    ...adminData,
    data: {
      pigeons: stripMock(adminData.data?.pigeons).concat(pigeons),
      training: stripMock(adminData.data?.training).concat(training),
      races: stripMock(adminData.data?.races).concat(races),
      healthRecords: stripMock(adminData.data?.healthRecords).concat(healthRecords),
      pairings: stripMock(adminData.data?.pairings).concat(pairings),
    },
    updatedAt: now(),
  };

  await storage.write('user_data', [...others, mergedAdmin]);
  console.log('✅ user_data.json 已写入演示数据');

  // 7) 顶层共享数据（列表模块）
  const topPigeons = stripMock(await storage.read('pigeons')).concat(pigeons);
  const topTraining = stripMock(await storage.read('training')).concat(training);
  const topRaces = stripMock(await storage.read('races')).concat(races);

  await storage.write('pigeons', topPigeons);
  await storage.write('training', topTraining);
  await storage.write('races', topRaces);
  console.log('✅ pigeons / training / races 已写入演示数据');

  console.log('\n✨ 注入完成，可刷新前端查看各模块数据。');
  console.log('🧹 需要清理时执行: node backend/scripts/clean-mock-data.js 或 remove-mock-data.js');
}

seed().catch(err => {
  console.error('❌ 注入失败:', err);
  process.exit(1);
});






























