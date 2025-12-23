/**
 * 智谱API直接调用代理模块（供Evo助手使用）
 * 功能：接收PC/移动端Evo助手的聊天请求，调用智谱API，返回AI回复
 * 要求：密钥安全、支持流式响应、容错机制
 * 使用：在所有页面（index.html、mobile.html、admin.html）中均可使用
 */
(function() {
  'use strict';
  
  // 在所有页面中都可以执行（供Evo助手调用）
  
  /**
   * 获取智谱API配置
   */
  function getZhipuConfig() {
    try {
      const config = localStorage.getItem('pigeon_api_config');
      if (config) {
        const parsed = JSON.parse(config);
        return {
          apiKey: parsed.zhipuApiKeyEvo || parsed.zhipuApiKeyAdmin || '',
          model: parsed.zhipuModel || 'glm-4',
          temperature: parsed.zhipuTemperature !== undefined ? parsed.zhipuTemperature : 0.7,
          maxTokens: parsed.zhipuMaxTokens || 2000
        };
      }
    } catch (e) {
      console.error('[Zhipu Proxy] 获取配置失败:', e);
    }
    return {
      apiKey: '',
      model: 'glm-4',
      temperature: 0.7,
      maxTokens: 2000
    };
  }
  
  /**
   * 调用智谱API
   * @param {string} message - 用户消息
   * @param {Array} history - 对话历史
   * @param {Function} onStream - 流式响应回调（可选）
   * @returns {Promise<Object>} API响应
   */
  async function callZhipuAPI(message, history = [], onStream = null) {
    const config = getZhipuConfig();
    
    if (!config.apiKey) {
      throw new Error('智谱API Key未配置，请在智能管理系统中配置');
    }
    
    // 构建消息列表
    const messages = [];
    
    // 添加历史对话
    if (Array.isArray(history) && history.length > 0) {
      history.forEach(item => {
        if (item.role && item.content) {
          messages.push({
            role: item.role,
            content: item.content
          });
        }
      });
    }
    
    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message
    });
    
    // 智谱API请求参数
    const requestBody = {
      model: config.model,
      messages: messages,
      temperature: Math.max(0, Math.min(1, config.temperature)),
      max_tokens: Math.max(100, Math.min(2000, config.maxTokens)),
      stream: onStream ? true : false // 是否流式响应
    };
    
    // 智谱API端点
    const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`智谱API调用失败 (${response.status}): ${errorText}`);
      }
      
      // 流式响应处理
      if (onStream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                return { success: true, content: '' };
              }
              
              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content || '';
                if (delta && onStream) {
                  onStream(delta);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
        
        return { success: true, content: '' };
      }
      
      // 非流式响应处理
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || '';
      
      return {
        success: true,
        content: content,
        usage: result.usage || {}
      };
      
    } catch (error) {
      console.error('[Zhipu Proxy] API调用失败:', error);
      throw error;
    }
  }
  
  /**
   * 带重试的API调用（容错机制）
   * @param {string} message - 用户消息
   * @param {Array} history - 对话历史
   * @param {Function} onStream - 流式响应回调
   * @param {number} retries - 重试次数
   * @returns {Promise<Object>} API响应
   */
  async function callZhipuAPIWithRetry(message, history = [], onStream = null, retries = 3) {
    let lastError = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await callZhipuAPI(message, history, onStream);
      } catch (error) {
        lastError = error;
        console.warn(`[Zhipu Proxy] 第${i + 1}次调用失败:`, error);
        
        // 如果不是最后一次重试，等待后重试
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 递增延迟
        }
      }
    }
    
    // 所有重试都失败，返回预设错误提示
    const errorMessage = getErrorMessage();
    throw new Error(errorMessage);
  }
  
  /**
   * 获取错误提示（可从后台配置）
   */
  function getErrorMessage() {
    try {
      const config = localStorage.getItem('pigeon_api_config');
      if (config) {
        const parsed = JSON.parse(config);
        if (parsed.aiErrorMessage) {
          return parsed.aiErrorMessage;
        }
      }
    } catch (e) {
      // 忽略错误
    }
    return 'AI助手暂时无法响应，请稍后再试。如问题持续，请联系管理员。';
  }
  
  /**
   * 处理来自PC/移动端的API请求（通过postMessage）
   */
  function handleAPIRequest(event) {
    // 验证消息来源（可选，增强安全性）
    // if (event.origin !== window.location.origin) {
    //   return; // 只接受同源消息
    // }
    
    // 检查消息类型
    if (event.data && event.data.type === 'ZHIPU_API_REQUEST') {
      const { message, history, requestId } = event.data;
      
      // 调用API
      callZhipuAPIWithRetry(message, history, null, 3)
        .then(result => {
          // 返回成功结果
          if (event.source) {
            event.source.postMessage({
              type: 'ZHIPU_API_RESPONSE',
              requestId: requestId,
              success: true,
              data: result.content || result
            }, event.origin);
          }
        })
        .catch(error => {
          // 返回错误结果
          if (event.source) {
            event.source.postMessage({
              type: 'ZHIPU_API_RESPONSE',
              requestId: requestId,
              success: false,
              error: error.message || 'API调用失败'
            }, event.origin);
          }
        });
    }
    
    // 处理流式请求
    if (event.data && event.data.type === 'ZHIPU_API_STREAM_REQUEST') {
      const { message, history, requestId } = event.data;
      
      let fullContent = '';
      
      // 调用流式API
      callZhipuAPIWithRetry(message, history, (delta) => {
        // 流式数据回调
        fullContent += delta;
        if (event.source) {
          event.source.postMessage({
            type: 'ZHIPU_API_STREAM_DELTA',
            requestId: requestId,
            delta: delta
          }, event.origin);
        }
      }, 3)
        .then(result => {
          // 流式完成
          if (event.source) {
            event.source.postMessage({
              type: 'ZHIPU_API_STREAM_COMPLETE',
              requestId: requestId,
              content: fullContent
            }, event.origin);
          }
        })
        .catch(error => {
          // 流式错误
          if (event.source) {
            event.source.postMessage({
              type: 'ZHIPU_API_STREAM_ERROR',
              requestId: requestId,
              error: error.message || 'API调用失败'
            }, event.origin);
          }
        });
    }
  }
  
  /**
   * 初始化API代理
   */
  function initAPIProxy() {
    // 监听来自PC/移动端的消息
    window.addEventListener('message', handleAPIRequest);
    
    // 导出API供直接调用（如果admin.html在同一窗口）
    window.ZhipuAPIProxy = {
      call: callZhipuAPIWithRetry,
      callStream: callZhipuAPI,
      getConfig: getZhipuConfig
    };
    
    console.log('[Zhipu Proxy] API代理已初始化');
  }
  
  // 等待DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAPIProxy);
  } else {
    initAPIProxy();
  }
  
})();

