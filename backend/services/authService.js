const storageService = require('./storageService');
const crypto = require('crypto');
const logger = require('../utils/logger');

class AuthService {
  /**
   * 创建用户
   */
  async createUser(userData) {
    try {
      const existingUser = await storageService.find('users', 
        u => u.username === userData.username || u.email === userData.email
      );

      if (existingUser) {
        throw new Error('用户名或邮箱已存在');
      }

      const user = {
        username: userData.username,
        email: userData.email,
        password: this.hashPassword(userData.password),
        role: userData.role || 'user', // admin, user
        status: userData.status || 'active', // active, inactive, banned
        createdAt: new Date().toISOString(),
        lastLogin: null,
        passwordChangedAt: new Date().toISOString(),
        passwordResetToken: null,
        passwordResetExpires: null
      };

      const saved = await storageService.add('users', user);
      delete saved.password;
      return saved;
    } catch (error) {
      logger.error('创建用户失败', error);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(username, password) {
    try {
      const user = await storageService.find('users', 
        u => (u.username === username || u.email === username) && u.status === 'active'
      );

      if (!user) {
        throw new Error('用户名或密码错误');
      }

      if (!this.verifyPassword(password, user.password)) {
        // 记录登录失败日志
        await this.logLoginAttempt(username, false, '密码错误');
        throw new Error('用户名或密码错误');
      }

      // 更新最后登录时间
      await storageService.update('users', user.id, {
        lastLogin: new Date().toISOString()
      });

      // 记录登录成功日志
      await this.logLoginAttempt(username, true, '登录成功');

      // 生成token
      const token = this.generateToken(user.id);

      // 保存token
      await this.saveToken(user.id, token);

      delete user.password;
      return {
        user,
        token
      };
    } catch (error) {
      logger.error('登录失败', error);
      throw error;
    }
  }

  /**
   * 验证token
   */
  async verifyToken(token) {
    try {
      const tokens = await storageService.read('tokens');
      const tokenData = tokens.find(t => t.token === token && t.expiresAt > new Date().toISOString());

      if (!tokenData) {
        return null;
      }

      const user = await storageService.find('users', u => u.id === tokenData.userId);
      if (!user || user.status !== 'active') {
        return null;
      }

      delete user.password;
      return user;
    } catch (error) {
      logger.error('验证token失败', error);
      return null;
    }
  }

  /**
   * 生成密码重置token
   */
  async generatePasswordResetToken(email) {
    try {
      const user = await storageService.find('users', u => u.email === email && u.status === 'active');

      if (!user) {
        // 为了安全，即使用户不存在也返回成功
        return { success: true, message: '如果邮箱存在，重置链接已发送' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1小时后过期

      await storageService.update('users', user.id, {
        passwordResetToken: this.hashPassword(resetToken),
        passwordResetExpires: resetExpires.toISOString()
      });

      // 这里应该发送邮件，目前只返回token
      return {
        success: true,
        token: resetToken, // 实际应用中不应该返回token，应该通过邮件发送
        expiresAt: resetExpires.toISOString(),
        message: '密码重置链接已生成（实际应用中应通过邮件发送）'
      };
    } catch (error) {
      logger.error('生成密码重置token失败', error);
      throw error;
    }
  }

  /**
   * 重置密码
   */
  async resetPassword(token, newPassword) {
    try {
      const users = await storageService.read('users');
      const user = users.find(u => 
        u.passwordResetToken && 
        u.passwordResetExpires &&
        new Date(u.passwordResetExpires) > new Date() &&
        this.verifyPassword(token, u.passwordResetToken)
      );

      if (!user) {
        throw new Error('重置token无效或已过期');
      }

      await storageService.update('users', user.id, {
        password: this.hashPassword(newPassword),
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date().toISOString()
      });

      return { success: true, message: '密码重置成功' };
    } catch (error) {
      logger.error('重置密码失败', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await storageService.find('users', u => u.id === userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      if (!this.verifyPassword(oldPassword, user.password)) {
        throw new Error('原密码错误');
      }

      await storageService.update('users', user.id, {
        password: this.hashPassword(newPassword),
        passwordChangedAt: new Date().toISOString()
      });

      return { success: true, message: '密码修改成功' };
    } catch (error) {
      logger.error('修改密码失败', error);
      throw error;
    }
  }

  /**
   * 管理员重置用户密码（不需要原密码）
   */
  async adminResetPassword(userId, newPassword) {
    try {
      const user = await storageService.find('users', u => u.id === userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('新密码长度至少为6位');
      }

      await storageService.update('users', user.id, {
        password: this.hashPassword(newPassword),
        passwordChangedAt: new Date().toISOString()
      });

      logger.info('管理员重置用户密码', { userId, username: user.username });
      return { success: true, message: '密码重置成功' };
    } catch (error) {
      logger.error('管理员重置密码失败', error);
      throw error;
    }
  }

  /**
   * 记录登录尝试
   */
  async logLoginAttempt(username, success, reason) {
    try {
      await storageService.add('loginLogs', {
        username,
        success,
        reason,
        ip: null, // 可以从请求中获取
        userAgent: null, // 可以从请求中获取
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('记录登录日志失败', error);
    }
  }

  /**
   * 保存token
   */
  async saveToken(userId, token) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600000); // 7天过期

      await storageService.add('tokens', {
        userId,
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      });

      // 清理过期token
      await this.cleanExpiredTokens();
    } catch (error) {
      logger.error('保存token失败', error);
    }
  }

  /**
   * 清理过期token
   */
  async cleanExpiredTokens() {
    try {
      const tokens = await storageService.read('tokens');
      const validTokens = tokens.filter(t => new Date(t.expiresAt) > new Date());
      await storageService.write('tokens', validTokens);
    } catch (error) {
      logger.error('清理过期token失败', error);
    }
  }

  /**
   * 哈希密码
   */
  hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'salt').digest('hex');
  }

  /**
   * 验证密码
   */
  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  /**
   * 生成token
   */
  generateToken(userId) {
    return crypto.randomBytes(32).toString('hex') + '_' + userId;
  }

  /**
   * 登出
   */
  async logout(token) {
    try {
      const tokens = await storageService.read('tokens');
      const filtered = tokens.filter(t => t.token !== token);
      await storageService.write('tokens', filtered);
      return { success: true };
    } catch (error) {
      logger.error('登出失败', error);
      throw error;
    }
  }
}

module.exports = new AuthService();


















