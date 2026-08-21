import axios from 'axios';

// Empty = same origin (API + UI served from one place, e.g. the Vercel
// deployment, or http://localhost:5000 via CRA's dev proxy). Set
// REACT_APP_API_URL only if the UI is ever hosted on a different origin
// than the API.
const BASE_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ── Request interceptor: attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle auth errors globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gat_token');
      localStorage.removeItem('gat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ════════════════════ AUTH APIs ════════════════════
export const authAPI = {
  sendOtp: (email) =>
    api.post('/api/auth/send-otp', { email }),

  verifyOtp: (email, otp) =>
    api.post('/api/auth/verify-otp', { email, otp }),

  signup: (data) =>
    api.post('/api/auth/signup', data),

  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),

  forgotPassword: (email) =>
    api.post('/api/auth/forgot-password', { email }),

  resetPassword: (token, newPassword, confirmPassword) =>
    api.post('/api/auth/reset-password', { token, newPassword, confirmPassword }),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  logout: () =>
    api.post('/api/auth/logout'),

  expireSession: () =>
    api.post('/api/auth/expire'),
};

// ════════════════════ DASHBOARD APIs ════════════════════
export const dashboardAPI = {
  get: () => api.get('/api/dashboard'),
};

// ════════════════════ TASKS APIs ════════════════════
export const tasksAPI = {
  getAll: () => api.get('/api/tasks'),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

// ════════════════════ EVENTS APIs ════════════════════
export const eventsAPI = {
  getAll: () => api.get('/api/events'),
  create: (data) => api.post('/api/events', data),
  delete: (id) => api.delete(`/api/events/${id}`),
};

// ════════════════════ PROFILE APIs ════════════════════
export const profileAPI = {
  get: () => api.get('/api/profile'),
  update: (data) => api.put('/api/profile', data),
  updateAcademic: (data) => api.put('/api/profile/academic', data),
};

// ════════════════════ STUDY PLANNER APIs ════════════════════
export const studyAPI = {
  getAll: () => api.get('/api/study'),
  create: (data) => api.post('/api/study', data),
  delete: (id) => api.delete(`/api/study/${id}`),
};

// ════════════════════ APTITUDE APIs ════════════════════
export const aptitudeAPI = {
  get: () => api.get('/api/aptitude'),
  update: (data) => api.post('/api/aptitude', data),
};

// ════════════════════ ATTENDANCE APIs ════════════════════
export const attendanceAPI = {
  get: () => api.get('/api/attendance'),

  // UPSERT (add or update)
  add: (data) => api.post('/api/attendance', data),

  // DELETE (FIXED)
  delete: (id) => api.delete(`/api/attendance/${id}`),
};

// ════════════════════ SGPA APIs ════════════════════
export const sgpaAPI = {
  get: () => api.get('/api/sgpa'),
  calculate: (data) => api.post('/api/sgpa/calculate', data),
};

export default api;