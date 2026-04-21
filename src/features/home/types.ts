/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Home.
 * @module features/home
 */

import type { Track, Album, Artist } from '@shared/types/track'

/**
 * Dữ liệu trang chủ — trả về từ API /home/feed.
 */
export interface HomeFeed {
  /** Banner nổi bật hiển thị ở đầu trang */
  featured: FeaturedItem[]
  /** Danh sách bài hát nghe gần đây */
  recentlyPlayed: Track[]
  /** Danh sách playlist gợi ý */
  recommendedPlaylists: RecommendedPlaylist[]
  /** Nghệ sĩ gợi ý */
  suggestedArtists: Artist[]
  /** Album mới phát hành */
  newReleases: Album[]
}

/**
 * Thông tin một item nổi bật trên banner.
 */
export interface FeaturedItem {
  /** ID duy nhất */
  id: string
  /** Tiêu đề banner */
  title: string
  /** Mô tả ngắn */
  subtitle: string
  /** URL ảnh nền banner */
  imageUrl: string
  /** Loại nội dung: track | album | playlist */
  type: 'track' | 'album' | 'playlist'
  /** ID nội dung để navigate khi nhấn */
  targetId: string
}

/**
 * Playlist gợi ý trên trang chủ.
 */
export interface RecommendedPlaylist {
  /** ID playlist */
  id: string
  /** Tên playlist */
  title: string
  /** Mô tả */
  description: string
  /** URL ảnh bìa */
  coverUrl: string
  /** Số lượng bài hát */
  trackCount: number
}
