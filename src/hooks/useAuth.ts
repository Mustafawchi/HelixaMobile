import { useState, useCallback } from 'react';
import { authApi } from '../api/endpoints/auth';
import { storage } from '../utils/storage';
import type { User, LoginRequest } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      storage.set('accessToken', data.accessToken);
      storage.set('refreshToken', data.refreshToken);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      storage.delete('accessToken');
      storage.delete('refreshToken');
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, isLoading, login, logout };
};
