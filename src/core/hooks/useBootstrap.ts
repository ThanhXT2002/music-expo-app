/**
 * @file useBootstrap.ts
 * @description Hook khởi tạo ứng dụng.
 *
 * Luồng:
 * 1. preventAutoHideAsync() — giữ splash
 * 2. Khởi tạo audio engine (ngầm)
 * 3. Restore session → setIsReady(true)
 * 4. _layout.tsx phát hiện isReady → ẩn splash + auth guard
 *
 * QUAN TRỌNG: Không subscribe vào authStore để tránh re-render cascade.
 * @module core
 */

import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { setupAudioManager } from '@core/audio/AudioManager'
import { setupBackgroundAudio } from '@core/audio/BackgroundAudio'
import { initDb } from '@core/data/database'
import { createLogger } from '@core/logger'
import * as authService from '@features/auth/services/authService'
import { useAuthStore } from '@features/auth/store/authStore'

const logger = createLogger('bootstrap')

/** Giữ splash screen — phải gọi TRƯỚC khi component render lần đầu */
SplashScreen.preventAutoHideAsync()

/**
 * Hook khởi tạo app — KHÔNG chặn UI, KHÔNG gây re-render cascade.
 *
 * Dùng authService trực tiếp + authStore.getState() thay vì useAuth()
 * để tránh subscribe vào authStore.
 */
export function useBootstrap(): void {
  useEffect(() => {
    async function initBackground() {
      logger.info('Bắt đầu khởi tạo ứng dụng')

      // Audio engine
      try {
        await setupAudioManager()
        setupBackgroundAudio()
        logger.info('Audio engine sẵn sàng')
      } catch (error) {
        logger.error('Khởi tạo audio engine thất bại', error)
      }

      // SQLite database
      try {
        await initDb()
        logger.info('SQLite database sẵn sàng')
      } catch (error) {
        logger.error('Khởi tạo database thất bại', error)
      }

      // Restore session
      try {
        await useAuthStore.getState().restoreSession()
      } catch (error) {
        logger.error('Khôi phục session thất bại', error)
      }

      // Ẩn splash sau khi session check xong
      // _layout.tsx sẽ dùng isReady để quyết định redirect
      await SplashScreen.hideAsync()

      logger.info('Khởi tạo hoàn tất')
    }

    initBackground()
  }, [])
}
