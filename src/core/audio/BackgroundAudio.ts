/**
 * @file BackgroundAudio.ts
 * @description Xử lý phát nhạc nền và lock screen controls.
 * Đăng ký event listeners cho các nút điều khiển từ tai nghe, notification, lock screen.
 * @module core/audio
 */

import { createLogger } from '@core/logger'
import * as AudioManager from './AudioManager'
import * as AudioQueue from './AudioQueue'

const logger = createLogger('background-audio')

/**
 * Cấu hình background audio và đăng ký remote controls.
 * Cần gọi sau khi AudioManager đã khởi tạo xong.
 *
 * NOTE: Trên Expo (expo-av), background playback được bật thông qua
 * Audio.setAudioModeAsync({ staysActiveInBackground: true }) —
 * đã được xử lý trong AudioManager.setupAudioManager().
 * File này chủ yếu đóng vai trò tập trung logic xử lý khi bài hát kết thúc.
 */
export function setupBackgroundAudio(): void {
  logger.info('Cấu hình background audio')

  // Đăng ký listener để tự động chuyển bài khi bài hiện tại kết thúc
  AudioManager.subscribe((state) => {
    if (state === 'stopped') {
      handleTrackEnd()
    }
  })

  logger.info('Background audio đã sẵn sàng')
}

/**
 * Xử lý khi bài hát hiện tại phát xong.
 * Tự động lấy bài tiếp theo từ queue và phát.
 */
async function handleTrackEnd(): Promise<void> {
  logger.debug('Bài hát kết thúc — kiểm tra queue')

  const nextTrack = AudioQueue.getNextTrack()

  if (nextTrack) {
    logger.info('Tự động chuyển sang bài tiếp theo', {
      trackId: nextTrack.id,
      title: nextTrack.title
    })
    try {
      await AudioManager.loadAndPlay(nextTrack)
    } catch (error) {
      logger.error('Không thể phát bài tiếp theo', { trackId: nextTrack.id, error })
    }
  } else {
    logger.info('Queue đã hết — dừng phát')
  }
}
