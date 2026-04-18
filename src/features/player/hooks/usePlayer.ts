/**
 * @file usePlayer.ts
 * @description Hook trung tâm quản lý phát nhạc.
 * Kết nối UI với AudioManager và playerStore.
 * @module features/player/hooks
 */

import { useEffect, useState } from 'react';
import * as AudioManager from '@core/audio/AudioManager';
import { createLogger } from '@core/logger';
import { usePlayerStore } from '../store/playerStore';
import type { UsePlayerReturn } from '../types';

const logger = createLogger('use-player');

/**
 * Hook quản lý toàn bộ vòng đời phát nhạc.
 * Kết nối playerStore (Zustand) với AudioManager (expo-av).
 *
 * @param trackId - ID bài hát muốn phát khi hook khởi tạo (tuỳ chọn)
 * @returns Trạng thái và điều khiển trình phát
 *
 * @example
 * const { isPlaying, play, pause, progress } = usePlayer('track-123');
 */
export function usePlayer(trackId?: string): UsePlayerReturn {
  const store = usePlayerStore();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Đăng ký listener nhận cập nhật tiến trình từ AudioManager
  useEffect(() => {
    const unsubscribe = AudioManager.subscribe((_state, progressData) => {
      setProgress(progressData.progress);
      setCurrentTime(progressData.currentTime);
      setDuration(progressData.duration);
    });

    return () => unsubscribe();
  }, []);

  // Tự động load và phát bài nếu được truyền trackId
  useEffect(() => {
    if (!trackId) return;
    logger.info('Khởi tạo player với track', { trackId });
  }, [trackId]);

  const play = async () => {
    logger.debug('Gọi play()', { trackId: store.currentTrack?.id });
    try {
      await AudioManager.play();
      store.setIsPlaying(true);
    } catch (error) {
      logger.error('Lỗi khi phát nhạc', error);
    }
  };

  const pause = async () => {
    logger.debug('Gọi pause()', { trackId: store.currentTrack?.id });
    try {
      await AudioManager.pause();
      store.setIsPlaying(false);
    } catch (error) {
      logger.error('Lỗi khi dừng nhạc', error);
    }
  };

  const next = async () => {
    logger.info('Chuyển bài tiếp theo');
    // TODO: Tích hợp AudioQueue.getNextTrack()
  };

  const previous = async () => {
    logger.info('Quay lại bài trước');
    // TODO: Tích hợp AudioQueue.getPreviousTrack()
  };

  const seekTo = async (position: number) => {
    logger.debug('Tua tới vị trí', { position });
    await AudioManager.seekTo(position);
  };

  return {
    currentTrack: store.currentTrack,
    isPlaying: store.isPlaying,
    progress,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    seekTo,
  };
}
