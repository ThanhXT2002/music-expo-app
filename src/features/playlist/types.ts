/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Playlist.
 * @module features/playlist
 */

/**
 * Dữ liệu form tạo/sửa playlist.
 */
export interface PlaylistFormData {
  /** Tên playlist */
  title: string
  /** Mô tả */
  description: string
  /** Công khai hay riêng tư */
  isPublic: boolean
}
