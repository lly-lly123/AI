// Vercel Serverless Function入口
// 这个文件用于Vercel部署

const app = require('../backend/server');

// Vercel Serverless Function 格式
module.exports = (req, res) => {
  return app(req, res);
};

