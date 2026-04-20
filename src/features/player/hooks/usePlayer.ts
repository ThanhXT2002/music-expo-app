/**
 * @file usePlayer.ts
 * @description Hook trung tâm quản lý phát nhạc.
 * Kết nối UI với AudioManager và playerStore.
 *
 * Fix:
 * - Sync isPlaying từ AudioManager status (không set thủ công)
 * - play/pause gọi AudioManager trước, rồi sync store
 *
 * @module features/player/hooks
 */

import { useEffect, useState, useCallback } from 'react';
import * as AudioManager from '@core/audio/AudioManager';
import { createLogger } from '@core/logger';
import { usePlayerStore } from '../store/playerStore';
import type { UsePlayerReturn } from '../types';
import type { RepeatMode } from '../types';

const logger = createLogger('use-player');

/**
 * Hook quản lý toàn bộ vòng đời phát nhạc.
 * Kết nối playerStore (Zustand) với AudioManager (expo-av).
 *
 * @param trackId - ID bài hát muốn phát khi hook khởi tạo (tuỳ chọn)
 * @returns Trạng thái và điều khiển trình phát
 */
export function usePlayer(trackId?: string): UsePlayerReturn {
  const store = usePlayerStore();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Đăng ký listener nhận cập nhật tiến trình từ AudioManager
  useEffect(() => {
    const unsubscribe = AudioManager.subscribe((state, progressData) => {
      setProgress(progressData.progress);
      setCurrentTime(progressData.currentTime);
      setDuration(progressData.duration);

      // Sync isPlaying từ AudioManager state (source of truth)
      const isNowPlaying = state === 'playing';
      const storeIsPlaying = usePlayerStore.getState().isPlaying;
      if (isNowPlaying !== storeIsPlaying) {
        usePlayerStore.getState().setIsPlaying(isNowPlaying);
      }
    });

    return () => unsubscribe();
  }, []);

  // Tự động load và phát bài nếu được truyền trackId
  useEffect(() => {
    if (!trackId) return;
    logger.info('Khởi tạo player với track', { trackId });
  }, [trackId]);

  const play = useCallback(async () => {
    logger.debug('Gọi play()', { trackId: store.currentTrack?.id });
    try {
      await AudioManager.play();
      // isPlaying sẽ được sync từ AudioManager listener ở trên
    } catch (error) {
      logger.error('Lỗi khi phát nhạc', error);
    }
  }, [store]);

  const pause = useCallback(async () => {
    logger.debug('Gọi pause()', { trackId: store.currentTrack?.id });
    try {
      await AudioManager.pause();
      // isPlaying sẽ được sync từ AudioManager listener ở trên
    } catch (error) {
      logger.error('Lỗi khi dừng nhạc', error);
    }
  }, [store]);

  const next = useCallback(async () => {
    logger.info('Chuyển bài tiếp theo');
    // TODO: Tích hợp AudioQueue.getNextTrack()
  }, []);

  const previous = useCallback(async () => {
    logger.info('Quay lại bài trước');
    // TODO: Tích hợp AudioQueue.getPreviousTrack()
  }, []);

  const seekTo = useCallback(async (position: number) => {
    logger.debug('Tua tới vị trí', { position });
    await AudioManager.seekTo(position);
  }, []);

  // ─── Toggle Shuffle / Repeat ───────────────────────────────────────────

  const toggleShuffle = useCallback(() => {
    store.toggleShuffle();
  }, [store]);

  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const currentIdx = modes.indexOf(store.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    logger.debug('Đổi chế độ lặp', { from: store.repeatMode, to: nextMode });
    store.setRepeatMode(nextMode);
  }, [store]);

  return {
    currentTrack: store.currentTrack,
    isPlaying: store.isPlaying,
    shuffleEnabled: store.shuffleEnabled,
    repeatMode: store.repeatMode,
    progress,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    seekTo,
    toggleShuffle,
    toggleRepeat,
  };
}
