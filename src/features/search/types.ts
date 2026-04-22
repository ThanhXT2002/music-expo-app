/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Search.
 * @module features/search
 */

import type { Track, Album, Artist } from '@shared/types/track'

/**
 * Kết quả API thô trả về từ backend (Youtube Music)
 */
export interface RawYTMusicResult {
  resultType: 'song' | 'video' | 'album' | 'artist' | 'playlist'
  [key: string]: any
}

/**
 * Kết quả tìm kiếm tổng hợp từ API.
 */
export interface SearchResult {
  /** Danh sách bài hát khớp */
  tracks: Track[]
  /** Danh sách album khớp */
  albums: Album[]
  /** Danh sách nghệ sĩ khớp */
  artists: Artist[]
}

/** Tab hiển thị kết quả tìm kiếm */
export type SearchTab = 'all' | 'tracks' | 'albums' | 'artists'
