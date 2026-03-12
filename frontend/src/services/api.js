import axios from 'axios';

// In production (Vercel), use the full backend URL; in dev, use Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on login/register attempts — let the component show the error
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
};

export const chatSessionAPI = {
  // Chat session management
  createSession: (title) => api.post('/chat-sessions', { title }),
  getSessions: () => api.get('/chat-sessions'),
  getSession: (sessionId) => api.get(`/chat-sessions/${sessionId}`),
  updateSessionTitle: (sessionId, title) => api.put(`/chat-sessions/${sessionId}/title`, { title }),
  deleteSession: (sessionId) => api.delete(`/chat-sessions/${sessionId}`),
  
  // Messages in sessions
  sendMessage: (sessionId, question) => api.post(`/chat-sessions/${sessionId}/messages`, { question }),
  
  // NEW: ChatGPT-like experience - start chat with first message
  startChatSession: (question) => api.post('/chat-sessions/start', { question }),
};

export const documentAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/documents/list'),
  delete: (filename) => api.delete(`/documents/${encodeURIComponent(filename)}`),
};

export const chatAPI = {
  sendMessage: (message) => api.post('/chat', { question: message }),
  getHistory: () => api.get('/chat/history'),
  clearChat: () => api.delete('/chat/clear'),
};

export default api;