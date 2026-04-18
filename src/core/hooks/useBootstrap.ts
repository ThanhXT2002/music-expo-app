/**
 * @file useBootstrap.ts
 * @description Hook khởi tạo ứng dụng — audio engine, session, splash screen.
 * Giữ splash hiển thị cho đến khi mọi thứ sẵn sàng.
 * @module core
 */

import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { setupAudioManager } from '@core/audio/AudioManager';
import { setupBackgroundAudio } from '@core/audio/BackgroundAudio';
import { createLogger } from '@core/logger';
import { useAuth } from '@features/auth/hooks/useAuth';

const logger = createLogger('bootstrap');

/** Giữ splash screen — phải gọi TRƯỚC khi component render lần đầu */
SplashScreen.preventAutoHideAsync();

/**
 * Hook khởi tạo app — chạy 1 lần duy nhất khi mở app.
 *
 * Luồng thực thi:
 * 1. Splash hiển thị (preventAutoHideAsync)
 * 2. Khởi tạo audio engine
 * 3. Khôi phục session đăng nhập
 * 4. Ẩn splash (hideAsync)
 *
 * @returns `appIsReady` — true khi app đã sẵn sàng hiển thị
 */
export function useBootstrap(): boolean {
  const { restoreSession } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);

  // Khởi tạo ứng dụng
  useEffect(() => {
    async function bootstrap() {
      logger.info('Bắt đầu khởi tạo ứng dụng');

      // Audio engine
      try {
        await setupAudioManager();
        setupBackgroundAudio();
        logger.info('Audio engine sẵn sàng');
      } catch (error) {
        logger.error('Khởi tạo audio engine thất bại', error);
      }

      // Khôi phục session
      await restoreSession();

      setAppIsReady(true);
      logger.info('Khởi tạo hoàn tất');
    }

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ẩn splash khi đã sẵn sàng
  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  return appIsReady;
}
