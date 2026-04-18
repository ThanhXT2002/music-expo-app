/**
 * @file AudioManager.ts
 * @description Singleton quản lý toàn bộ audio playback của ứng dụng.
 * Bọc expo-av, cung cấp API thống nhất cho play/pause/seek/volume.
 *
 * ⚠ QUAN TRỌNG: Chỉ có một instance duy nhất toàn app — không khởi tạo lại.
 * @module core/audio
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { createLogger } from '@core/logger';
import type { AudioTrack, PlaybackProgress, PlaybackState } from './types';

const logger = createLogger('audio-manager');

/** Sound object hiện tại đang phát */
let currentSound: Audio.Sound | null = null;

/** Track đang phát */
let currentTrack: AudioTrack | null = null;

/** Trạng thái phát nhạc */
let playbackState: PlaybackState = 'idle';

/** Callback khi trạng thái phát thay đổi */
type PlaybackCallback = (state: PlaybackState, progress: PlaybackProgress) => void;
const listeners: Set<PlaybackCallback> = new Set();

/**
 * Khởi tạo audio mode cho ứng dụng.
 * Gọi một lần duy nhất trong root layout.
 *
 * @throws {Error} Nếu thiết bị không hỗ trợ audio playback
 */
export async function setupAudioManager(): Promise<void> {
  logger.info('Khởi tạo AudioManager');
  try {
    await Audio.setAudioModeAsync({
      // Cho phép phát nhạc khi màn hình khoá
      staysActiveInBackground: true,
      // Cho phép phát khi đang ở chế độ im lặng (iOS)
      playsInSilentModeIOS: true,
    });
    logger.info('AudioManager khởi tạo thành công');
  } catch (error) {
    logger.error('AudioManager khởi tạo thất bại', error);
    throw error;
  }
}

/**
 * Load và phát một bài hát mới.
 * Tự động dừng bài đang phát trước khi chuyển bài.
 *
 * @param track - Thông tin bài hát cần phát
 */
export async function loadAndPlay(track: AudioTrack): Promise<void> {
  logger.info('Load bài hát mới', { trackId: track.id, title: track.title });

  try {
    // Giải phóng sound cũ nếu đang phát bài khác
    if (currentSound) {
      logger.debug('Giải phóng sound cũ trước khi load bài mới');
      await currentSound.unloadAsync();
      currentSound = null;
    }

    playbackState = 'loading';
    notifyListeners();

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.streamUrl },
      { shouldPlay: true },
      onPlaybackStatusUpdate,
    );

    currentSound = sound;
    currentTrack = track;
    playbackState = 'playing';
    notifyListeners();

    logger.info('Phát bài hát thành công', { trackId: track.id });
  } catch (error) {
    playbackState = 'error';
    notifyListeners();
    logger.error('Không thể load hoặc phát bài hát', { trackId: track.id, error });
    throw error;
  }
}

/**
 * Phát tiếp bài hát đang dừng.
 */
export async function play(): Promise<void> {
  if (!currentSound) {
    logger.warn('Gọi play() nhưng không có sound nào được load');
    return;
  }
  logger.debug('Phát tiếp nhạc');
  await currentSound.playAsync();
  playbackState = 'playing';
  notifyListeners();
}

/**
 * Tạm dừng bài hát đang phát.
 */
export async function pause(): Promise<void> {
  if (!currentSound) {
    logger.warn('Gọi pause() nhưng không có sound nào được load');
    return;
  }
  logger.debug('Tạm dừng nhạc');
  await currentSound.pauseAsync();
  playbackState = 'paused';
  notifyListeners();
}

/**
 * Tua tới vị trí chỉ định.
 *
 * @param positionSeconds - Vị trí cần tua tới (giây)
 */
export async function seekTo(positionSeconds: number): Promise<void> {
  if (!currentSound) return;
  logger.debug('Tua tới vị trí', { positionSeconds });
  await currentSound.setPositionAsync(positionSeconds * 1000);
}

/**
 * Đăng ký callback lắng nghe thay đổi trạng thái phát.
 *
 * @param callback - Hàm callback nhận state và progress
 * @returns Hàm unsubscribe để huỷ đăng ký
 */
export function subscribe(callback: PlaybackCallback): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Lấy track đang phát hiện tại.
 *
 * @returns Track hiện tại hoặc null
 */
export function getCurrentTrack(): AudioTrack | null {
  return currentTrack;
}

/**
 * Lấy trạng thái phát hiện tại.
 *
 * @returns Trạng thái playback
 */
export function getPlaybackState(): PlaybackState {
  return playbackState;
}

// --- Internal helpers ---

/**
 * Callback xử lý cập nhật trạng thái từ expo-av.
 * Tự động phát hiện khi bài hát kết thúc.
 */
function onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
  if (!status.isLoaded) return;

  if (status.didJustFinish) {
    logger.info('Bài hát đã phát xong', { trackId: currentTrack?.id });
    playbackState = 'stopped';
    notifyListeners();
    return;
  }

  const progress: PlaybackProgress = {
    currentTime: (status.positionMillis ?? 0) / 1000,
    duration: (status.durationMillis ?? 0) / 1000,
    progress: status.durationMillis ? status.positionMillis / status.durationMillis : 0,
    buffered: status.playableDurationMillis
      ? status.playableDurationMillis / (status.durationMillis ?? 1)
      : 0,
  };

  listeners.forEach((cb) => cb(playbackState, progress));
}

/**
 * Thông báo tất cả listeners về thay đổi trạng thái.
 */
function notifyListeners(): void {
  const defaultProgress: PlaybackProgress = {
    currentTime: 0,
    duration: 0,
    progress: 0,
    buffered: 0,
  };
  listeners.forEach((cb) => cb(playbackState, defaultProgress));
}
