// e:/task/frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Crucial for refresh token cookies
});

// Add access token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not try to refresh if the 401 came from login or refresh itself
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/register')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = res.data;
        
        // Save new token and retry original request
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — just clear the token.
        // The React app will show the login form automatically when user state is null.
        // Do NOT use window.location.href here — it causes an infinite reload loop.
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
