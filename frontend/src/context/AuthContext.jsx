import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap session via /auth/me
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const res = await apiClient('/auth/me');
        if (isMounted && res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
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
    };

    window.addEventListener('bbb:session-expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('bbb:session-expired', handleSessionExpired);
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore logout failure
    } finally {
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
