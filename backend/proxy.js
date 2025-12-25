/**
 * 智谱API代理服务
 * 功能：解决移动端跨域问题，代理智谱API请求
 * 使用：在Zeabur部署时，确保环境变量ZHIPU_API_KEY已配置
 */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS配置 - 允许所有来源（适配Zeabur部署）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'zhipu-proxy' });
});

// 智谱API代理接口
app.post('/proxy/chat', async (req, res) => {
  try {
    // 从环境变量读取API Key
    const apiKey = process.env.ZHIPU_API_KEY || 
                   process.env.ZHIPU_API_KEY_EVO || 
                   process.env.ZHIPU_API_KEY_ADMIN;

    if (!apiKey) {
      console.error('❌ 智谱API Key未配置，请检查环境变量：ZHIPU_API_KEY, ZHIPU_API_KEY_EVO, 或 ZHIPU_API_KEY_ADMIN');
      return res.status(500).json({
        success: false,
        error: 'API Key未配置',
        message: '请在Zeabur环境变量中配置ZHIPU_API_KEY'
      });
    }

    // 获取请求参数
    const { messages, model = 'glm-4', temperature = 0.7, max_tokens = 2000, stream = false } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请求参数错误',
        message: 'messages参数必须是非空数组'
      });
    }

    // 构建智谱API请求
    const zhipuUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens,
      stream
    };

    console.log('📤 代理请求到智谱API:', {
      model,
      messagesCount: messages.length,
      stream
    });

    // 发送请求到智谱API
    const response = await fetch(zhipuUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    // 处理响应
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 智谱API请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return res.status(response.status).json({
        success: false,
        error: '智谱API请求失败',
        message: errorText || response.statusText,
        status: response.status
      });
    }

    // 流式响应处理
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body;
      let buffer = '';

      reader.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              res.write('data: [DONE]\n\n');
              res.end();
            } else {
              try {
                const parsed = JSON.parse(data);
                res.write(`data: ${JSON.stringify(parsed)}\n\n`);
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        });
      });

      reader.on('end', () => {
        res.end();
      });

      reader.on('error', (error) => {
        console.error('流式响应错误:', error);
        res.status(500).json({
          success: false,
          error: '流式响应处理失败',
          message: error.message
        });
      });
    } else {
      // 非流式响应
      const data = await response.json();
      console.log('✅ 智谱API响应成功');
      
      res.json({
        success: true,
        data: data
      });
    }
  } catch (error) {
    console.error('❌ 代理服务错误:', error);
    res.status(500).json({
      success: false,
      error: '代理服务内部错误',
      message: error.message
    });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: err.message
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 智谱API代理服务已启动`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🔗 代理接口: http://localhost:${PORT}/proxy/chat`);
  console.log(`🔑 API Key状态: ${process.env.ZHIPU_API_KEY || process.env.ZHIPU_API_KEY_EVO || process.env.ZHIPU_API_KEY_ADMIN ? '✅ 已配置' : '❌ 未配置'}`);
});

module.exports = app;







