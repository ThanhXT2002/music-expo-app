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

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, logout: storeLogout, restoreSession: storeRestoreSession } = useAuthStore();

  const login = useCallback(async (data: LoginFormData) => {
    useAuthStore.setState({ isLoading: true });
    try {
      const session = await authService.login(data);
      await setAuth(session.accessToken, session.user);
      logger.info('Đăng nhập qua hook thành công');
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  }, [setAuth]);

  const register = useCallback(async (data: RegisterFormData) => {
    useAuthStore.setState({ isLoading: true });
    try {
      const session = await authService.register(data);
      await setAuth(session.accessToken, session.user);
      logger.info('Đăng ký qua hook thành công');
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    useAuthStore.setState({ isLoading: true });
    try {
      await authService.logout();
      await storeLogout();
      logger.info('Đăng xuất qua hook thành công');
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  }, [storeLogout]);

  const restoreSession = useCallback(async () => {
    logger.info('Khôi phục session khi mở app');
    await storeRestoreSession();
  }, [storeRestoreSession]);

  const loginWithGoogle = useCallback(async () => {
    useAuthStore.setState({ isLoading: true });
    try {
      const session = await authService.loginWithGoogle();
      await setAuth(session.accessToken, session.user);
      logger.info('Đăng nhập Google qua hook thành công');
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  }, [setAuth]);

  const loginWithFacebook = useCallback(async () => {
    useAuthStore.setState({ isLoading: true });
    try {
      const session = await authService.loginWithFacebook();
      await setAuth(session.accessToken, session.user);
      logger.info('Đăng nhập Facebook qua hook thành công');
    } finally {
      useAuthStore.setState({ isLoading: false });
    }
  }, [setAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    restoreSession,
    loginWithGoogle,
    loginWithFacebook,
  };
}
