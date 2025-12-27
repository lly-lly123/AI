/**
 * 输入验证中间件
 */

const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * 验证请求结果
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('输入验证失败', {
      path: req.path,
      errors: errors.array(),
    });
    return res.status(400).json({
      success: false,
      error: '输入验证失败',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * 验证鸽子数据
 */
const validatePigeon = [
  body('ring')
    .trim()
    .notEmpty()
    .withMessage('脚环号为必填项')
    .isLength({ min: 1, max: 50 })
    .withMessage('脚环号长度应在1-50个字符之间'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('名称最多100个字符'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('出生日期格式不正确'),
  body('type')
    .optional()
    .isIn(['种鸽', '赛鸽', '其他'])
    .withMessage('类型必须是种鸽、赛鸽或其他'),
  validateRequest,
];

/**
 * 验证训练记录数据
 */
const validateTraining = [
  body('pigeonId')
    .notEmpty()
    .withMessage('鸽子ID为必填项'),
  body('date')
    .isISO8601()
    .withMessage('训练日期格式不正确'),
  body('distance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('距离必须是非负数'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('时长必须是非负整数'),
  validateRequest,
];

/**
 * 验证用户注册数据
 */
const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('用户名为必填项')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度应在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('邮箱为必填项')
    .isEmail()
    .withMessage('邮箱格式不正确'),
  body('password')
    .notEmpty()
    .withMessage('密码为必填项')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符'),
  validateRequest,
];

/**
 * 验证用户登录数据
 */
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('用户名为必填项'),
  body('password')
    .notEmpty()
    .withMessage('密码为必填项'),
  validateRequest,
];

/**
 * 验证修改密码数据
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('原密码为必填项'),
  body('newPassword')
    .notEmpty()
    .withMessage('新密码为必填项')
    .isLength({ min: 6 })
    .withMessage('新密码至少需要6个字符'),
  validateRequest,
];

/**
 * 验证资格分析数据
 */
const validateQualification = [
  body('pigeonId')
    .notEmpty()
    .withMessage('鸽子ID为必填项'),
  body('raceDistance')
    .notEmpty()
    .withMessage('比赛距离为必填项')
    .isFloat({ min: 0 })
    .withMessage('比赛距离必须是非负数'),
  validateRequest,
];

module.exports = {
  validateRequest,
  validatePigeon,
  validateTraining,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateQualification,
};




























































