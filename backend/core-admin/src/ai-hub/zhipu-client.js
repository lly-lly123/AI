/**
 * 智谱AI客户端封装
 * 负责与智谱AI API的交互
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

class ZhipuClient {
  constructor() {
    this.apiKey = config.zhipu.apiKey;
    this.model = config.zhipu.model;
    this.apiBase = config.zhipu.apiBase;
    this.enabled = config.zhipu.enabled && !!this.apiKey;
    this.callCount = 0;
    this.lastResetTime = Date.now();
  }

  /**
   * 检查是否可以调用AI
   */
  canCallAI() {
    if (!this.enabled) {
      return { allowed: false, reason: 'AI功能未启用或API Key未配置' };
    }

    // 重置每小时计数
    const now = Date.now();
    if (now - this.lastResetTime > 3600000) {
      this.callCount = 0;
      this.lastResetTime = now;
    }

    if (this.callCount >= config.zhipu.maxCallsPerHour) {
      return { allowed: false, reason: '已达到每小时调用上限' };
    }

    return { allowed: true };
  }

  /**
   * 调用智谱AI
   * @param {string} prompt - 提示词
   * @param {object} context - 上下文信息
   * @param {object} options - 选项
   */
  async call(prompt, context = {}, options = {}) {
    const checkResult = this.canCallAI();
    if (!checkResult.allowed) {
      logger.warn(`AI调用被拒绝: ${checkResult.reason}`);
      return {
        success: false,
        error: checkResult.reason,
        fallback: true
      };
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `你是智鸽·中枢管家的AI顾问。你的职责是：
1. 分析数据真实性和可靠性
2. 提供管理建议和决策支持
3. 识别风险和异常
4. 给出置信度评估

重要原则：
- 只提供分析和建议，不直接操作系统
- 对不确定的情况明确标注
- 给出置信度评分（0-1）
- 优先使用本地规则，AI作为补充`
        },
        {
          role: 'user',
          content: this.buildPrompt(prompt, context, options)
        }
      ];

      // 智谱AI API格式
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      
      const response = await axios.post(
        apiUrl,
        {
          model: this.model,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      this.callCount++;

      const result = {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };

      // 尝试提取置信度
      const confidenceMatch = result.content.match(/置信度[：:]\s*([0-9.]+)/);
      if (confidenceMatch) {
        result.confidence = parseFloat(confidenceMatch[1]);
      } else {
        result.confidence = 0.7; // 默认置信度
      }

      logger.info(`AI调用成功，使用token: ${result.usage.total_tokens}`);
      return result;

    } catch (error) {
      logger.error(`AI调用失败: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * 构建提示词
   */
  buildPrompt(prompt, context, options) {
    let fullPrompt = prompt;

    if (context.data) {
      fullPrompt += `\n\n数据上下文：\n${JSON.stringify(context.data, null, 2)}`;
    }

    if (context.rules) {
      fullPrompt += `\n\n规则检查结果：\n${JSON.stringify(context.rules, null, 2)}`;
    }

    if (context.history) {
      fullPrompt += `\n\n历史记录：\n${JSON.stringify(context.history, null, 2)}`;
    }

    if (options.task) {
      fullPrompt += `\n\n任务类型：${options.task}`;
    }

    return fullPrompt;
  }

  /**
   * 分析数据真实性
   */
  async analyzeDataTruth(data, sources) {
    const prompt = `请分析以下数据的真实性：

数据来源数量：${sources.length}
数据内容：${JSON.stringify(data, null, 2)}

请评估：
1. 数据是否合理（时间戳、状态连续性等）
2. 是否存在异常或矛盾
3. 数据可信度评分（0-1）
4. 建议的处理方式

请以JSON格式返回：
{
  "truth_status": "verified" | "suspect" | "invalid",
  "confidence": 0.0-1.0,
  "issues": ["问题列表"],
  "recommendation": "处理建议"
}`;

    return await this.call(prompt, { data, sources }, { task: 'truth_analysis' });
  }

  /**
   * 生成管理建议
   */
  async generateManagementAdvice(metrics, issues) {
    const prompt = `基于以下系统指标和问题，生成管理建议：

系统指标：
${JSON.stringify(metrics, null, 2)}

发现的问题：
${JSON.stringify(issues, null, 2)}

请提供：
1. 优先级排序
2. 风险等级评估
3. 具体行动建议
4. 预期效果

请以JSON格式返回：
{
  "priority": "high" | "medium" | "low",
  "risk_level": "critical" | "warning" | "info",
  "actions": ["行动列表"],
  "expected_impact": "预期影响描述"
}`;

    return await this.call(prompt, { metrics, issues }, { task: 'management_advice' });
  }
}

module.exports = new ZhipuClient();

