/**
 * API服务模块
 * 统一管理所有API调用
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 鸽子相关API
export const pigeonAPI = {
  getAll: () => api.get('/pigeons'),
  getById: (id) => api.get(`/pigeons/${id}`),
  getByRing: (ring) => api.get(`/pigeons/ring/${ring}`),
  create: (data) => api.post('/pigeons', data),
  update: (id, data) => api.put(`/pigeons/${id}`, data),
  delete: (id) => api.delete(`/pigeons/${id}`),
};

// 训练相关API
export const trainingAPI = {
  getAll: (pigeonId) => api.get(`/training/pigeon/${pigeonId}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
  getStats: (pigeonId) => api.get(`/training/pigeon/${pigeonId}/stats`),
};

// 认证相关API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

// 资讯相关API
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  refresh: () => api.post('/news/refresh'),
};

// 赛事相关API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  refresh: () => api.post('/events/refresh'),
};

// 资格分析API
export const qualificationAPI = {
  analyze: (pigeonId, raceDistance) => 
    api.post('/qualification/analyze', { pigeonId, raceDistance }),
};

// AI助手API
export const aiAPI = {
  chat: (question, history = [], context = {}) => 
    api.post('/evo/chat', { question, history, context }),
  getModelInfo: () => api.get('/evo/model-info'),
  test: () => api.get('/evo/test'),
};

// 用户数据API
export const userDataAPI = {
  savePigeons: (pigeons) => api.post('/user/data/pigeons', { pigeons }),
  getPigeons: () => api.get('/user/data/pigeons'),
  saveFull: (data) => api.post('/user/data/full', data),
  getFull: () => api.get('/user/data/full'),
};

// 健康检查API
export const healthAPI = {
  check: () => api.get('/health'),
  getStats: () => api.get('/stats'),
};

export default api;






 * API服务模块
 * 统一管理所有API调用
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 鸽子相关API
export const pigeonAPI = {
  getAll: () => api.get('/pigeons'),
  getById: (id) => api.get(`/pigeons/${id}`),
  getByRing: (ring) => api.get(`/pigeons/ring/${ring}`),
  create: (data) => api.post('/pigeons', data),
  update: (id, data) => api.put(`/pigeons/${id}`, data),
  delete: (id) => api.delete(`/pigeons/${id}`),
};

// 训练相关API
export const trainingAPI = {
  getAll: (pigeonId) => api.get(`/training/pigeon/${pigeonId}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
  getStats: (pigeonId) => api.get(`/training/pigeon/${pigeonId}/stats`),
};

// 认证相关API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

// 资讯相关API
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  refresh: () => api.post('/news/refresh'),
};

// 赛事相关API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  refresh: () => api.post('/events/refresh'),
};

// 资格分析API
export const qualificationAPI = {
  analyze: (pigeonId, raceDistance) => 
    api.post('/qualification/analyze', { pigeonId, raceDistance }),
};

// AI助手API
export const aiAPI = {
  chat: (question, history = [], context = {}) => 
    api.post('/evo/chat', { question, history, context }),
  getModelInfo: () => api.get('/evo/model-info'),
  test: () => api.get('/evo/test'),
};

// 用户数据API
export const userDataAPI = {
  savePigeons: (pigeons) => api.post('/user/data/pigeons', { pigeons }),
  getPigeons: () => api.get('/user/data/pigeons'),
  saveFull: (data) => api.post('/user/data/full', data),
  getFull: () => api.get('/user/data/full'),
};

// 健康检查API
export const healthAPI = {
  check: () => api.get('/health'),
  getStats: () => api.get('/stats'),
};

export default api;






 * API服务模块
 * 统一管理所有API调用
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 鸽子相关API
export const pigeonAPI = {
  getAll: () => api.get('/pigeons'),
  getById: (id) => api.get(`/pigeons/${id}`),
  getByRing: (ring) => api.get(`/pigeons/ring/${ring}`),
  create: (data) => api.post('/pigeons', data),
  update: (id, data) => api.put(`/pigeons/${id}`, data),
  delete: (id) => api.delete(`/pigeons/${id}`),
};

// 训练相关API
export const trainingAPI = {
  getAll: (pigeonId) => api.get(`/training/pigeon/${pigeonId}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
  getStats: (pigeonId) => api.get(`/training/pigeon/${pigeonId}/stats`),
};

// 认证相关API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword }),
};

// 资讯相关API
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  refresh: () => api.post('/news/refresh'),
};

// 赛事相关API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  refresh: () => api.post('/events/refresh'),
};

// 资格分析API
export const qualificationAPI = {
  analyze: (pigeonId, raceDistance) => 
    api.post('/qualification/analyze', { pigeonId, raceDistance }),
};

// AI助手API
export const aiAPI = {
  chat: (question, history = [], context = {}) => 
    api.post('/evo/chat', { question, history, context }),
  getModelInfo: () => api.get('/evo/model-info'),
  test: () => api.get('/evo/test'),
};

// 用户数据API
export const userDataAPI = {
  savePigeons: (pigeons) => api.post('/user/data/pigeons', { pigeons }),
  getPigeons: () => api.get('/user/data/pigeons'),
  saveFull: (data) => api.post('/user/data/full', data),
  getFull: () => api.get('/user/data/full'),
};

// 健康检查API
export const healthAPI = {
  check: () => api.get('/health'),
  getStats: () => api.get('/stats'),
};

export default api;






