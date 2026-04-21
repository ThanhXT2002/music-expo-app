/**
 * @file types.ts
 * @description Kiểu dữ liệu cho feature Downloads.
 * Bao gồm trạng thái tải client, trạng thái server, metadata bài hát.
 * @module features/downloads
 */

// ─── Client Download Status ──────────────────────────────────────────────────

/** Trạng thái tải file MP3 về thiết bị */
export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error'

// ─── Server Processing Status ────────────────────────────────────────────────

/** Trạng thái xử lý bài hát trên server (convert YouTube → MP3) */
export type ServerStatus = 'unknown' | 'pending' | 'processing' | 'completed' | 'failed'

// ─── Song Info (API Response) ────────────────────────────────────────────────

/** Thông tin bài hát nhận được từ API POST /songs/info */
export interface SongInfo {
  id: string
  title: string
  artist: string
  duration: number
  duration_formatted: string
  thumbnail_url: string
  original_url: string
  keywords: string[]
  created_at: string
}

/** Trạng thái bài hát từ API GET /songs/status/{id} */
export interface SongStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  ready: boolean
  title?: string
  artist?: string
}

// ─── Download Item (UI State) ────────────────────────────────────────────────

/** Thông tin tải xuống — kết hợp metadata + trạng thái client & server */
export interface DownloadItem {
  /** YouTube video ID */
  trackId: string
  /** Tên bài hát */
  title: string
  /** Tên nghệ sĩ */
  artist: string
  /** URL ảnh bìa */
  coverUrl: string
  /** Thời lượng (giây) */
  duration: number
  /** Trạng thái tải file về thiết bị */
  status: DownloadStatus
  /** Trạng thái xử lý trên server */
  serverStatus: ServerStatus
  /** Tiến trình tải file (0–1) */
  progress: number
  /** Tiến trình convert trên server (0–100) */
  serverProgress: number
  /** Đường dẫn file local đã tải (null nếu chưa xong) */
  filePath: string | null
  /** Thông báo lỗi (null nếu không lỗi) */
  errorMessage: string | null
}
