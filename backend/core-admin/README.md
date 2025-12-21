# 智鸽·中枢管家（ZhiPigeon Core Admin）

## 系统概述

智鸽·中枢管家是一个AI驱动的智能机器人管理员系统，负责：
- 后台超级管理员
- 主站数据真实性守护者
- AI站长级中枢

## 核心特性

1. **四层架构**
   - 本地管理核心（Core）
   - 规则与真实性校验引擎（Rule Engine）
   - AI调度中枢（AI Hub）
   - 外部AI（智谱）

2. **API真实性监管**
   - 自动识别主站API
   - 健康监测
   - 数据真实性校验
   - 多源交叉验证

3. **学习与进化**
   - 行为学习
   - 结果学习
   - 记忆系统

4. **防假数据机制**
   - 前端禁止直连第三方API
   - 数据真实性标记
   - 降级展示机制

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入智谱API Key
```

3. 启动系统：
```bash
npm start
```

## 目录结构

```
core-admin/
├── src/
│   ├── core/              # 本地管理核心
│   ├── rule-engine/        # 规则引擎
│   ├── ai-hub/            # AI调度中枢
│   ├── api-sentinel/      # API监管系统
│   ├── truth-validator/   # 数据真实性校验
│   ├── learning/          # 学习系统
│   └── utils/             # 工具函数
├── config/                # 配置文件
├── data/                  # 数据存储
├── logs/                  # 日志文件
└── tests/                 # 测试文件
```

## API文档

详见 `docs/API.md`

## 安全说明

- API Key存储在环境变量中，严禁硬编码
- 所有AI行为记录日志
- 敏感操作需要人工确认








