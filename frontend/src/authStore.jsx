// e:/task/frontend/src/authStore.js
import { useState, useEffect } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      const res = await api.get('/user/profile');
      setUser(res.data.user);
    } catch {
      // If profile fails, interceptor might have already tried refresh
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for OAuth token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('accessToken', token);
      // Clean URL
      window.history.replaceState({}, document.title, "/");
    }
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


