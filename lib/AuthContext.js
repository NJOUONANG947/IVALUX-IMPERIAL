'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from './api';

const AuthContext = createContext({
  currentUser: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const isAuthenticated = !!currentUser;

  const loadSession = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ivalux_access_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setCurrentUser(data.user);
      setProfile(data.profile);
    } catch {
      localStorage.removeItem('ivalux_access_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('ivalux_access_token', data.access_token);
    setCurrentUser(data.user);
    const meData = await api.getMe();
    setProfile(meData.profile);
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
    setProfile(null);
  };

  const userWithRole = currentUser && profile
    ? { ...currentUser, role: profile.role, full_name: profile.full_name, country: profile.country }
    : currentUser;

  return (
    <AuthContext.Provider value={{
      currentUser: userWithRole,
      profile,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

export function isAdmin(user) {
  return user?.role === 'admin';
}
