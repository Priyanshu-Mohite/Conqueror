import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API request failed';
    console.error('[API Error]', message, error);
    return Promise.reject(error);
  }
);

export default api;
