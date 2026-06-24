import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 30000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired / invalid — clear and let route guards handle redirect
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/reset-password') && !currentPath.startsWith('/forgot-password') && !currentPath.startsWith('/verify-email')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // don't force-redirect, just notify
        console.warn('Session expired, please log in again.');
      }
    }
    return Promise.reject(err);
  }
);

export default api;
