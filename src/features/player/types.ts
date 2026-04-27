/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Player.
 * @module features/player
 */

/**
 * Chế độ lặp phát nhạc.
 */
export type RepeatMode = 'none' | 'one' | 'all'

/**
 * Giá trị trả về của hook usePlayer.
 */
export interface UsePlayerReturn {
  /** Bài hát đang phát, null nếu chưa chọn */
  currentTrack: import('@shared/types/track').Track | null
  /** true nếu đang phát, false nếu đang dừng */
  isPlaying: boolean
  /** true nếu đang tải/buffer bài hát (chưa sẵn sàng phát) */
  isBuffering: boolean
  /** Chế độ shuffle đang bật? */
  shuffleEnabled: boolean
  /** Chế độ lặp hiện tại */
  repeatMode: RepeatMode
  /** Tiến trình phát — giá trị 0–1 */
  progress: number
  /** Vị trí phát hiện tại (giây) */
  currentTime: number
  /** Tổng thời lượng (giây) */
  duration: number
  /** Phát bài hiện tại */
  play: () => Promise<void>
  /** Dừng bài hiện tại */
  pause: () => Promise<void>
  /** Chuyển sang bài tiếp theo */
  next: () => Promise<void>
  /** Quay lại bài trước */
  previous: () => Promise<void>
  /** Tua tới vị trí chỉ định (giây) */
  seekTo: (position: number) => Promise<void>
  /** Bật/tắt chế độ shuffle */
  toggleShuffle: () => void
  /** Chuyển chế độ lặp: none → all → one → none */
  toggleRepeat: () => void
}
