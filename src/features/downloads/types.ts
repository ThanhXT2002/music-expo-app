/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Downloads.
 * @module features/downloads
 */

/** Trạng thái tải xuống */
export type DownloadStatus = 'idle' | 'downloading' | 'completed' | 'error';

/** Thông tin tải xuống */
export interface DownloadItem {
  /** ID bài hát */
  trackId: string;
  /** Trạng thái hiện tại */
  status: DownloadStatus;
  /** Tiến trình tải (0–1) */
  progress: number;
  /** Đường dẫn file đã tải (null nếu chưa xong) */
  filePath: string | null;
  /** Thông báo lỗi (null nếu không lỗi) */
  errorMessage: string | null;
}
