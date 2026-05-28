import axios from 'axios';
import { useAuth } from './store';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const { token } = useAuth.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const sipLinesAPI = {
  getAll: () => api.get('/sip-lines'),
  getOne: (id: string) => api.get(`/sip-lines/${id}`),
  create: (data: any) => api.post('/sip-lines', data),
  update: (id: string, data: any) => api.put(`/sip-lines/${id}`, data),
  delete: (id: string) => api.delete(`/sip-lines/${id}`),
};

export const ticketsAPI = {
  getAll: (params?: any) => api.get('/tickets', { params }),
  create: (data: any) => api.post('/tickets', data),
  update: (id: string, data: any) => api.put(`/tickets/${id}`, data),
};

export const statisticsAPI = {
  getStats: () => api.get('/statistics'),
};

export default api;
