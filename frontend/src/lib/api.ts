import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yarana_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const url = error.config?.url || '';
    // Skip auto-logout for unlock endpoint (401 = wrong password, not expired token)
    const isUnlockRoute = url.includes('/unlock');
    if (error.response?.status === 401 && !isUnlockRoute) {
      localStorage.removeItem('yarana_token');
      localStorage.removeItem('yarana_user');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    const msg = error.response?.data?.message || error.response?.data?.error || 'Network error';
    return Promise.reject({ message: msg, status: error.response?.status });
  }
);

export default api;
