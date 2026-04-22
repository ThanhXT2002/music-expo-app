/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Library.
 * @module features/library
 */

import type { Track, Album } from '@shared/types/track'

/** Tab hiển thị trong library */
export type LibraryTab = 'tracks' | 'albums' | 'favorites'

/** Bộ lọc sắp xếp */
export type SortBy = 'recent' | 'title' | 'artist'

/** Dữ liệu tổng hợp thư viện */
export interface LibraryData {
  /** Danh sách bài hát đã thích */
  likedTracks: Track[]
  /** Danh sách album đã lưu */
  savedAlbums: Album[]
  /** Tổng số bài đã tải offline */
  downloadedCount: number
}
