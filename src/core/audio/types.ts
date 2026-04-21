/**
 * @file types.ts
 * @description Kiểu dữ liệu cho audio engine.
 * Định nghĩa cấu trúc track audio, trạng thái phát và cấu hình player.
 * @module core/audio
 */

/**
 * Trạng thái phát nhạc của audio engine.
 */
export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error'

/**
 * Thông tin một bài hát trong hàng đợi audio.
 */
export interface AudioTrack {
  /** ID duy nhất của bài hát */
  id: string
  /** Tên bài hát */
  title: string
  /** Tên nghệ sĩ */
  artist: string
  /** URL stream audio */
  streamUrl: string
  /** URL ảnh bìa — dùng cho lock screen controls */
  coverUrl?: string
  /** Thời lượng tính bằng giây */
  durationSeconds: number
}

/**
 * Cấu hình khởi tạo audio player.
 */
export interface AudioPlayerConfig {
  /** Cho phép phát nhạc trong background */
  enableBackgroundPlayback: boolean
  /** Cho phép hiển thị controls trên lock screen */
  enableLockScreenControls: boolean
  /** Âm lượng mặc định (0–1) */
  defaultVolume: number
}

/**
 * Thông tin tiến trình phát nhạc.
 */
export interface PlaybackProgress {
  /** Vị trí hiện tại (giây) */
  currentTime: number
  /** Tổng thời lượng (giây) */
  duration: number
  /** Phần trăm tiến trình (0–1) */
  progress: number
  /** Phần trăm đã buffer (0–1) */
  buffered: number
}
