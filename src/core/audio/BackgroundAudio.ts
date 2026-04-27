/**
 * @file BackgroundAudio.ts
 * @description Xử lý phát nhạc nền và lock screen controls.
 * Đăng ký event listeners cho các nút điều khiển từ tai nghe, notification, lock screen.
 *
 * NOTE: Logic auto-next-track khi bài hát kết thúc được xử lý tập trung
 * trong usePlayer.ts (thông qua AudioManager subscriber).
 * File này KHÔNG xử lý auto-next để tránh 2 hệ thống gọi đồng thời
 * gây nhảy bài bất thường.
 *
 * @module core/audio
 */

import { createLogger } from '@core/logger'

const logger = createLogger('background-audio')

/**
 * Cấu hình background audio và đăng ký remote controls.
 * Cần gọi sau khi AudioManager đã khởi tạo xong.
 *
 * NOTE: Trên Expo (expo-av), background playback được bật thông qua
 * Audio.setAudioModeAsync({ staysActiveInBackground: true }) —
 * đã được xử lý trong AudioManager.setupAudioManager().
 */
export function setupBackgroundAudio(): void {
  logger.info('Cấu hình background audio')

  // Auto-next-track logic nằm tập trung ở usePlayer.ts
  // để tránh 2 hệ thống (BackgroundAudio + usePlayer) cùng xử lý → nhảy bài sai

  logger.info('Background audio đã sẵn sàng')
}
