import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tm_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState([]);

  // Toast Notification System
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync token and user with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('tm_token', token);
    } else {
      localStorage.removeItem('tm_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tm_user');
    }
  }, [user]);

  // Authentication Actions
  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    const jwtToken = res.token;
    const userData = { id: res.id, name: res.name, email: res.email };

    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('tm_token', jwtToken);
    localStorage.setItem('tm_user', JSON.stringify(userData));

    showToast(`Welcome back, ${res.name}!`, 'success');
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register(name, email, password);
    const jwtToken = res.token;
    const userData = { id: res.id, name: res.name, email: res.email };

    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('tm_token', jwtToken);
    localStorage.setItem('tm_user', JSON.stringify(userData));

    showToast('Account created successfully! Welcome to TripMate.', 'success');
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    showToast('You have been logged out.', 'info');
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('tm_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <i
              className={`fa-solid ${
                t.type === 'success'
                  ? 'fa-circle-check'
                  : t.type === 'error'
                  ? 'fa-circle-xmark'
                  : t.type === 'warning'
                  ? 'fa-triangle-exclamation'
                  : 'fa-circle-info'
              }`}
            ></i>
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.7,
                fontSize: '1rem',
              }}
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
