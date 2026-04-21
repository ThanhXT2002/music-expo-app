/**
 * @file authStore.ts
 * @description Store quản lý trạng thái xác thực toàn app.
 * @module features/auth/store
 */

import { create } from 'zustand'
import { apiClient as api } from '@core/api/apiClient'
import { createLogger } from '@core/logger'
import { getSecureItem, setSecureItem, deleteSecureItem, SECURE_KEYS } from '@core/storage/secureStorage'
import type { User } from '@shared/types/user'

const logger = createLogger('auth-store')

interface AuthState {
  isAuthenticated: boolean
  isReady: boolean
  isLoading: boolean
  user: User | null

  setAuth: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isReady: false,
  isLoading: false,
  user: null,

  setAuth: async (token: string, user: User) => {
    logger.debug('setAuth called')
    try {
      await setSecureItem(SECURE_KEYS.ACCESS_TOKEN, token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      set({ isAuthenticated: true, user, isReady: true })
    } catch (e) {
      logger.error('Loi luu token', e)
    }
  },

  logout: async () => {
    logger.debug('logout called')
    await deleteSecureItem(SECURE_KEYS.ACCESS_TOKEN)
    delete api.defaults.headers.common['Authorization']
    set({ isAuthenticated: false, user: null, isReady: true })
  },

  restoreSession: async () => {
    logger.debug('restoreSession called')
    try {
      set({ isLoading: true })
      const token = await getSecureItem(SECURE_KEYS.ACCESS_TOKEN)
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        try {
          const response = await api.get<any>('/users/me')
          set({ isAuthenticated: true, user: response.data.data, isReady: true, isLoading: false })
        } catch (error) {
          await deleteSecureItem(SECURE_KEYS.ACCESS_TOKEN)
          set({ isAuthenticated: false, user: null, isReady: true, isLoading: false })
        }
      } else {
        set({ isAuthenticated: false, user: null, isReady: true, isLoading: false })
      }
    } catch (e) {
      logger.error('Loi khoi phuc session', e)
      set({ isAuthenticated: false, user: null, isReady: true, isLoading: false })
    }
  }
}))
