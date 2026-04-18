/**
 * @file authStore.ts
 * @description Store quản lý trạng thái xác thực toàn app.
 * @module features/auth/store
 */

import { create } from 'zustand';
import { createLogger } from '@core/logger';
import type { User } from '@shared/types/user';

const logger = createLogger('auth-store');

interface AuthStore {
  /** User đang đăng nhập, null nếu chưa đăng nhập */
  user: User | null;
  /** Đã kiểm tra xong session chưa (dùng cho splash screen) */
  isReady: boolean;
  /** Đang xử lý đăng nhập/đăng ký */
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setIsReady: (ready: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isReady: false,
  isLoading: false,

  setUser: (user) => {
    logger.debug('Cập nhật user', { userId: user?.id ?? 'null' });
    set({ user });
  },

  setIsReady: (ready) => {
    logger.debug('Auth ready', { ready });
    set({ isReady: ready });
  },

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
