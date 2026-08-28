import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const verifyToken = useCallback(async (token) => {
    try {
      const res = await fetch(`/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const login = useCallback((token) => {
    localStorage.setItem('auth_token', token);
    verifyToken(token);
    navigate('/dashboard');
  }, [navigate, verifyToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_backend_role');
    setUser(null);
    navigate('/');
  }, [navigate]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

