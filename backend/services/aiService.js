const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * AI服务 - 支持多个AI提供商
 * 优先使用国内可访问的服务，无需VPN
 */
class AIService {
  constructor() {
    // AI服务提供商配置
    this.providers = {
      // 智谱AI（国内可访问，免费额度）
      zhipu: {
        apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        apiKey: config.ai?.zhipuApiKey || null,
        enabled: !!config.ai?.zhipuApiKey,
        name: '智谱AI (GLM)',
        provider: 'ZhipuAI'
      },
      // 通义千问（阿里云，国内可访问）
      qwen: {
        apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        apiKey: config.ai?.qwenApiKey || null,
        enabled: !!config.ai?.qwenApiKey,
        name: '通义千问',
        provider: 'Alibaba Cloud'
      },
      // 免费AI代理服务（国内可访问，无需API Key）
      // 注意：这是一个示例配置，实际使用时需要替换为可用的免费AI服务
      freeAI: {
        apiUrl: null, // 暂时禁用，等待配置可用的免费AI服务
        apiKey: null,
        enabled: false, // 默认禁用，需要配置可用的免费AI服务URL
        name: '免费AI代理',
        provider: 'Free AI Proxy'
      },
      // Hugging Face（需要VPN，作为备选）
      huggingface: {
        apiUrl: 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
        apiKey: config.ai?.huggingFaceApiKey || null,
        enabled: true, // 默认启用作为备选
        name: 'Zephyr-7B-Beta',
        provider: 'Hugging Face'
      }
    };
    
    // 记录模型选择
    this.modelChoice = config.ai?.model || 'auto';

    // 当前使用的提供商
    this.currentProvider = this.selectProvider();
    
    // AI 模型信息
    this.modelInfo = {
      name: this.currentProvider.name,
      provider: this.currentProvider.provider,
      source: this.currentProvider.apiUrl,
      description: '智能对话模型，支持中文对话',
      free: true,
      requiresApiKey: this.currentProvider.apiKey ? true : false,
      features: [
        '完全免费使用',
        '支持中文对话',
        '高性能响应'
      ]
    };

    // 异步加载存储中的AI密钥配置
    this.initFromStorage();
  }

  async initFromStorage() {
    try {
      const storageService = require('./storageService');
      const saved = await storageService.read('ai_settings');
      if (saved && Object.keys(saved).length > 0) {
        this.applyKeySettings(saved);
        logger.info('AI 配置已从存储加载');
      }
    } catch (error) {
      logger.warn('加载存储中的AI配置失败:', error.message);
    }
  }

  /**
   * 应用外部传入的AI密钥/模型配置
   */
  applyKeySettings(settings = {}) {
    const setIf = (provider, keyName) => {
      if (settings[keyName]) {
        provider.apiKey = settings[keyName];
        provider.enabled = true;
      }
    };

    setIf(this.providers.zhipu, 'zhipuApiKeyEvo');
    // 中枢管家Key，当前沿用智谱通道
    if (settings.zhipuApiKeyAdmin) {
      this.providers.zhipu.apiKey = settings.zhipuApiKeyAdmin;
      this.providers.zhipu.enabled = true;
    }
    setIf(this.providers.qwen, 'qwenApiKey');
    setIf(this.providers.huggingface, 'huggingFaceApiKey');

    if (settings.model) {
      this.modelChoice = settings.model;
    }

    // 重新选择最优提供商
    this.currentProvider = this.selectProvider();
    this.modelInfo = {
      name: this.currentProvider.name,
      provider: this.currentProvider.provider,
      source: this.currentProvider.apiUrl,
      description: '智能对话模型，支持中文对话',
      free: true,
      requiresApiKey: !!this.currentProvider.apiKey,
      features: ['完全免费使用', '支持中文对话', '高性能响应']
    };
  }

  /**
   * 选择可用的AI提供商（优先国内服务）
   */
  selectProvider() {
    // 优先级1：智谱AI（国内可访问）
    if (this.providers.zhipu.enabled && this.providers.zhipu.apiKey) {
      return this.providers.zhipu;
    }
    
    // 优先级2：通义千问（国内可访问）
    if (this.providers.qwen.enabled && this.providers.qwen.apiKey) {
      return this.providers.qwen;
    }
    
    // 优先级3：免费AI代理（国内可访问，无需API Key）
    if (this.providers.freeAI.enabled) {
      return this.providers.freeAI;
    }
    
    // 优先级4：Hugging Face（需要VPN，作为备选）
    return this.providers.huggingface;
  }

  /**
   * 加载功能使用说明文档
   */
  async loadFunctionGuides() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const guidePath = path.join(__dirname, '../../功能使用说明.md');
      
      try {
        const content = await fs.readFile(guidePath, 'utf8');
        // 缓存功能说明（避免每次都读取文件）
        this.functionGuides = content;
        return content;
      } catch (error) {
        logger.warn('功能使用说明文档不存在，使用默认说明');
        return null;
      }
    } catch (error) {
      logger.warn('加载功能使用说明失败:', error.message);
      return null;
    }
  }

  /**
   * 构建系统提示词（保持 Evo 身份，包含功能使用说明）
   */
  async buildSystemPrompt(context = {}) {
    // 加载功能使用说明（如果还没有加载）
    if (!this.functionGuides) {
      await this.loadFunctionGuides();
    }
    
    let functionGuidesSection = '';
    if (this.functionGuides) {
      // 提取功能说明的关键部分（避免提示词过长）
      const guides = this.functionGuides;
      // 只包含主要功能部分，去掉详细说明
      const mainSections = guides.match(/##\s+[\w\s]+/g) || [];
      functionGuidesSection = `\n\n## 系统功能使用说明\n\n${guides.substring(0, Math.min(guides.length, 8000))}\n\n（功能说明已加载，请结合这些说明回答用户问题）`;
    }
    
    return `你是 Evo，一个专业的信鸽管理智能助手。你的身份和特点：

1. **身份**：Evo 智能助手，专门为信鸽爱好者提供专业服务
2. **专业领域**：
   - 信鸽信息管理和查询
   - 训练数据分析
   - 血统关系分析
   - 比赛成绩统计
   - 信鸽健康管理建议

3. **对话风格**：
   - 友好、专业、耐心
   - 使用简洁明了的语言
   - 提供实用的建议和帮助
   - 适当使用表情符号让对话更生动
   - 结合系统功能使用说明回答用户问题

4. **当前系统信息**：
   - 总鸽子数：${context.totalPigeons || 0}
   - 在世鸽子：${context.alivePigeons || 0}
   - 种鸽数量：${context.breeders || 0}

5. **重要**：当用户询问如何使用某个功能时，请参考系统功能使用说明，提供详细、准确的指导。${functionGuidesSection}

请始终以 Evo 的身份回答用户的问题，保持专业和友好的态度。`;
  }

  /**
   * 格式化对话历史（适配 Hugging Face API）
   */
  async formatMessages(question, history = [], context = {}) {
    // 构建完整的对话文本
    let conversation = '';
    
    // 添加系统提示（异步）
    const systemPrompt = await this.buildSystemPrompt(context);
    conversation += `System: ${systemPrompt}\n\n`;
    
    // 添加历史对话（最多保留最近10轮）
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.type === 'user' || msg.type === 'assistant' || msg.type === 'evo') {
        const role = msg.type === 'user' ? 'User' : 'Assistant';
        conversation += `${role}: ${msg.text}\n\n`;
      }
    });
    
    // 添加当前问题
    conversation += `User: ${question}\n\nAssistant:`;
    
    return conversation;
  }

  /**
   * 调用 AI API（支持多个提供商）
   */
  async chat(question, history = [], context = {}) {
    // 确保功能说明已加载
    if (!this.functionGuides) {
      await this.loadFunctionGuides();
    }
    
    // 尝试多个提供商，直到成功
    const providersToTry = [
      this.currentProvider,
      ...Object.values(this.providers).filter(p => p !== this.currentProvider && p.enabled)
    ];

    for (const provider of providersToTry) {
      try {
        let responseText = '';
        
        // 智谱AI
        if (provider === this.providers.zhipu && provider.enabled && provider.apiKey) {
          responseText = await this.chatWithZhipu(question, history, context, provider);
        }
        // 通义千问
        else if (provider === this.providers.qwen && provider.enabled && provider.apiKey) {
          responseText = await this.chatWithQwen(question, history, context, provider);
        }
        // 免费AI代理
        else if (provider === this.providers.freeAI && provider.enabled) {
          responseText = await this.chatWithFreeAI(question, history, context, provider);
        }
        // Hugging Face（备选）
        else if (provider === this.providers.huggingface) {
          responseText = await this.chatWithHuggingFace(question, history, context, provider);
        }
        
        if (responseText && responseText.length > 5) {
          logger.info('AI 响应成功', { 
            provider: provider.name,
            responseLength: responseText.length 
          });
          
          // 更新当前提供商信息
          this.currentProvider = provider;
          this.modelInfo = {
            name: provider.name,
            provider: provider.provider,
            source: provider.apiUrl,
            description: '智能对话模型，支持中文对话',
            free: true,
            requiresApiKey: !!provider.apiKey,
            features: ['完全免费使用', '支持中文对话', '高性能响应']
          };
          
          return {
            text: responseText,
            model: provider.name,
            provider: provider.provider
          };
        }
      } catch (error) {
        logger.warn(`AI 提供商 ${provider.name} 调用失败，尝试下一个`, error.message);
        continue;
      }
    }
    
    // 所有提供商都失败，使用改进的本地AI逻辑
    logger.warn('所有 AI 提供商都失败，使用改进的本地AI逻辑');
    return {
      text: this.getEnhancedFallbackResponse(question, context),
      error: '所有AI服务暂时不可用，使用本地逻辑',
      model: '本地AI逻辑',
      provider: 'Local AI'
    };
  }

  /**
   * 改进的本地AI响应（更智能的规则匹配）
   */
  getEnhancedFallbackResponse(question, context = {}) {
    const q = question.toLowerCase();
    
    // 问候语
    if (q.includes('你好') || q.includes('hello') || q.includes('hi') || q.includes('您好')) {
      return `你好！我是 Evo，您的智能助手。\n\n我可以帮您：\n• 📊 查看统计数据（总鸽子数：${context.totalPigeons || 0}）\n• 🕊️ 管理鸽子信息\n• 🏆 查看比赛记录\n• 📈 数据分析\n\n请告诉我您需要什么帮助？`;
    }
    
    // 统计数据
    if (q.includes('统计') || q.includes('数据') || q.includes('总数') || q.includes('多少')) {
      return `📊 统计数据：\n\n• 总鸽子数：${context.totalPigeons || 0}\n• 在世鸽子：${context.alivePigeons || 0}\n• 种鸽数量：${context.breeders || 0}\n\n需要查看更详细的数据吗？`;
    }
    
    // 鸽子相关
    if (q.includes('鸽子') || q.includes('信鸽')) {
      return `🕊️ 关于信鸽管理：\n\n我可以帮您：\n• 查看鸽子列表\n• 添加新鸽子\n• 编辑鸽子信息\n• 查看血统关系\n\n请告诉我您具体需要什么帮助？`;
    }
    
    // 血统相关
    if (q.includes('血统') || q.includes('父母') || q.includes('子代') || q.includes('血系')) {
      return `🧬 血统关系管理：\n\n我可以帮您：\n• 查看血统图谱\n• 分析血统关系\n• 追踪家族谱系\n\n需要我帮您查看哪个鸽子的血统？`;
    }
    
    // 比赛相关
    if (q.includes('比赛') || q.includes('赛事') || q.includes('成绩')) {
      return `🏆 比赛与成绩：\n\n我可以帮您：\n• 查看比赛记录\n• 统计比赛成绩\n• 分析比赛表现\n\n需要查看哪方面的信息？`;
    }
    
    // 健康相关
    if (q.includes('健康') || q.includes('疾病') || q.includes('疫苗')) {
      return `💊 健康管理：\n\n我可以帮您：\n• 查看健康档案\n• 记录健康检查\n• 管理疫苗记录\n\n需要我帮您做什么？`;
    }
    
    // 训练相关
    if (q.includes('训练') || q.includes('飞行')) {
      return `🏃 训练管理：\n\n我可以帮您：\n• 记录训练数据\n• 分析训练效果\n• 制定训练计划\n\n需要查看训练记录吗？`;
    }
    
    // 帮助
    if (q.includes('帮助') || q.includes('help') || q.includes('功能')) {
      return `🕊️ 我是Evo智能助手！\n\n我可以帮您：\n• 📊 查看统计数据\n• 🕊️ 管理鸽子信息\n• 🏆 查看比赛记录\n• 📈 数据分析\n• 🧬 血统关系管理\n• 💊 健康管理\n• 🏃 训练管理\n\n有什么我可以帮助您的吗？`;
    }
    
    // 默认响应
    return `我理解您的问题："${question}"\n\n目前AI服务暂时不可用，但我可以用本地逻辑帮您解答。\n\n我可以帮您：\n• 📊 查看统计数据\n• 🕊️ 管理鸽子信息\n• 🏆 查看比赛记录\n• 📈 数据分析\n\n请告诉我您具体需要什么帮助？`;
  }

  /**
   * 使用智谱AI进行对话
   */
  async chatWithZhipu(question, history = [], context = {}, provider) {
    const messages = await this.formatMessagesForChatAPI(question, history, context);
    
    const response = await axios.post(
      provider.apiUrl,
      {
        model: 'glm-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 512
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        timeout: 30000
      }
    );
    
    return response.data?.choices?.[0]?.message?.content?.trim() || '';
  }

  /**
   * 使用通义千问进行对话
   */
  async chatWithQwen(question, history = [], context = {}, provider) {
    const messages = await this.formatMessagesForChatAPI(question, history, context);
    
    const response = await axios.post(
      provider.apiUrl,
      {
        model: 'qwen-turbo',
        input: {
          messages: messages
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 512
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        timeout: 30000
      }
    );
    
    return response.data?.output?.text?.trim() || '';
  }

  /**
   * 使用免费AI代理进行对话（国内可访问）
   */
  async chatWithFreeAI(question, history = [], context = {}, provider) {
    const messages = await this.formatMessagesForChatAPI(question, history, context);
    
    try {
      const response = await axios.post(
        provider.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 512
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      return response.data?.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
      // 如果免费代理失败，尝试使用备用方案
      logger.warn('免费AI代理失败，尝试备用方案', error.message);
      throw error;
    }
  }

  /**
   * 使用 Hugging Face 进行对话（原有逻辑）
   */
  async chatWithHuggingFace(question, history = [], context = {}, provider) {
    const conversationText = await this.formatMessages(question, history, context);
    
    const requestData = {
      inputs: conversationText,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false
      }
    };

    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const response = await axios.post(
      provider.apiUrl,
      requestData,
      {
        headers,
        timeout: 30000
      }
    );

    let responseText = '';
    
    if (Array.isArray(response.data)) {
      const result = response.data[0];
      if (result.generated_text) {
        responseText = result.generated_text.trim();
      } else if (typeof result === 'string') {
        responseText = result.trim();
      }
    } else if (response.data.generated_text) {
      responseText = response.data.generated_text.trim();
    } else if (typeof response.data === 'string') {
      responseText = response.data.trim();
    }

    // 清理响应文本
    if (responseText) {
      responseText = responseText.replace(/^assistant:\s*/i, '').trim();
      if (responseText.includes(question)) {
        responseText = responseText.split(question)[0].trim();
      }
    }
    
    return responseText;
  }

  /**
   * 格式化消息为Chat API格式（用于智谱AI、通义千问等）
   */
  formatMessagesForChatAPI(question, history = [], context = {}) {
    const messages = [];
    
    // 添加系统提示
    messages.push({
      role: 'system',
      content: this.buildSystemPrompt(context)
    });
    
    // 添加历史对话（最多保留最近10轮）
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.type === 'user') {
        messages.push({ role: 'user', content: msg.text });
      } else if (msg.type === 'assistant' || msg.type === 'evo') {
        messages.push({ role: 'assistant', content: msg.text });
      }
    });
    
    // 添加当前问题
    messages.push({ role: 'user', content: question });
    
    return messages;
  }

  /**
   * 获取备用响应（当 AI 不可用时）
   */
  getFallbackResponse(question) {
    const q = question.toLowerCase();
    
    if (q.includes('你好') || q.includes('hello') || q.includes('hi')) {
      return '你好！我是 Evo，您的智能助手。虽然 AI 服务暂时不可用，但我可以用本地逻辑帮您解答问题。请告诉我您需要什么帮助？';
    }
    
    if (q.includes('统计') || q.includes('数据')) {
      return '我可以帮您查看统计数据。请稍等，让我为您整理信息...';
    }
    
    return `我理解您的问题："${question}"\n\n目前 AI 服务暂时不可用，但我可以用本地逻辑帮您解答。请告诉我您具体需要什么帮助？`;
  }

  /**
   * 获取模型信息
   */
  getModelInfo() {
    return this.modelInfo;
  }

  /**
   * 测试 AI 连接
   */
  async testConnection() {
    try {
      const testResponse = await this.chat('你好', [], {});
      return {
        success: true,
        message: 'AI 服务连接正常',
        model: this.modelInfo.name,
        provider: this.modelInfo.provider
      };
    } catch (error) {
      return {
        success: false,
        message: `连接失败: ${error.message}`,
        model: this.modelInfo.name,
        provider: this.modelInfo.provider
      };
    }
  }
}

module.exports = new AIService();

