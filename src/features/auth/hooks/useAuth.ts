/**
 * @file useAuth.ts
 * @description Hook quản lý xác thực — login, register, logout, restore session.
 * @module features/auth/hooks
 */

import { useCallback } from 'react';
import { createLogger } from '@core/logger';
import { useAuthStore } from '../store/authStore';
import * as authService from '../services/authService';
import type { LoginFormData, RegisterFormData } from '../types';

const logger = createLogger('use-auth');

/**
 * Hook quản lý toàn bộ luồng xác thực.
 *
 * @returns User info, trạng thái và các hàm auth
 */
export function useAuth() {
  const { user, isReady, isLoading, setUser, setIsReady, setIsLoading } = useAuthStore();

  const login = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const session = await authService.login(data);
      setUser(session.user);
      logger.info('Đăng nhập qua hook thành công');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading]);

  const register = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const session = await authService.register(data);
      setUser(session.user);
      logger.info('Đăng ký qua hook thành công');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setIsLoading]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    logger.info('Đăng xuất qua hook thành công');
  }, [setUser]);

  const restoreSession = useCallback(async () => {
    logger.info('Khôi phục session khi mở app');
    try {
      const session = await authService.restoreSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      logger.error('Khôi phục session thất bại', error);
    } finally {
      setIsReady(true);
    }
  }, [setUser, setIsReady]);

  return {
    user,
    isAuthenticated: !!user,
    isReady,
    isLoading,
    login,
    register,
    logout,
    restoreSession,
  };
}
