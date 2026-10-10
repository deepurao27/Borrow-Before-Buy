import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap session via localStorage cache + /auth/me
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      // 1. Immediately hydrate from localStorage if present
      try {
        const cachedUserStr = localStorage.getItem('bbb_user');
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          if (cachedUser && isMounted) {
            setUser(cachedUser);
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }

      // 2. Verify with backend /auth/me
      try {
        const res = await apiClient('/auth/me');
        if (isMounted && res?.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('bbb_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        if (isMounted) {
          // If 401 or session expired, clear if no valid token
          const token = localStorage.getItem('bbb_access_token');
          if (!token) {
            setUser(null);
            localStorage.removeItem('bbb_user');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    // Listen for session expiry from API client
    const handleSessionExpired = () => {
      setUser(null);
      localStorage.removeItem('bbb_user');
      localStorage.removeItem('bbb_access_token');
    };

    window.addEventListener('bbb:session-expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('bbb:session-expired', handleSessionExpired);
    };
  }, []);

  const login = (userData, token = null) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem('bbb_user', JSON.stringify(userData));
      }
      if (token) {
        localStorage.setItem('bbb_access_token', token);
      }
    } catch (e) {}
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore logout failure
    } finally {
      localStorage.removeItem('bbb_user');
      localStorage.removeItem('bbb_access_token');
      localStorage.removeItem('bbb_refresh_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
