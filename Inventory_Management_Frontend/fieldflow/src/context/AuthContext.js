import React, { createContext, useEffect, useState } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    // keep state in sync if other tabs change auth
    const handler = () => {
      setToken(localStorage.getItem('token'));
      try {
        setUser(JSON.parse(localStorage.getItem('user')) || null);
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login({ username, password });

      // Backend expected to return an object that contains the token (common keys: accessToken, token)
      const tokenStr = data.accessToken || data.token || data;
      if (!tokenStr) return { success: false, message: 'Authentication token not received' };

      const userObj = {
        username: data.username || username,
        roles: data.roles || [],
      };

      localStorage.setItem('token', tokenStr);
      localStorage.setItem('user', JSON.stringify(userObj));
      setToken(tokenStr);
      setUser(userObj);

      return { success: true, data };
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    try {
      window.location = '/login';
    } catch (e) {
      // noop
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
