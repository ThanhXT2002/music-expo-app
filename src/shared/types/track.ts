/**
 * @file track.ts
 * @description Kiểu dữ liệu cho bài hát, album và nghệ sĩ.
 * Dùng chung cho toàn bộ ứng dụng — import từ @shared/types/track.
 * @module shared/types
 */

/**
 * Thông tin đầy đủ của một bài hát.
 */
export interface Track {
  /** ID duy nhất của bài hát */
  id: string;
  /** Tên bài hát */
  title: string;
  /** Tên nghệ sĩ */
  artist: string;
  /** ID nghệ sĩ — dùng để navigate sang trang nghệ sĩ */
  artistId: string;
  /** Tên album chứa bài hát */
  album?: string;
  /** ID album */
  albumId?: string;
  /** URL ảnh bìa bài hát */
  coverUrl: string;
  /** Thời lượng tính bằng giây */
  durationSeconds: number;
  /** URL stream — null nếu cần fetch từ API */
  streamUrl?: string;
  /** Bài hát đã được tải offline chưa */
  isDownloaded?: boolean;
  /** Bài hát đã được thích chưa */
  isLiked?: boolean;
  /** Thể loại nhạc */
  genre?: string;
}

/**
 * Thông tin album.
 */
export interface Album {
  /** ID duy nhất */
  id: string;
  /** Tên album */
  title: string;
  /** Tên nghệ sĩ */
  artist: string;
  /** ID nghệ sĩ */
  artistId: string;
  /** URL ảnh bìa */
  coverUrl: string;
  /** Năm phát hành */
  releaseYear: number;
  /** Số lượng bài hát */
  trackCount: number;
  /** Danh sách bài hát */
  tracks?: Track[];
}

/**
 * Thông tin nghệ sĩ.
 */
export interface Artist {
  /** ID duy nhất */
  id: string;
  /** Tên nghệ sĩ */
  name: string;
  /** URL ảnh đại diện */
  avatarUrl: string;
  /** Số lượng người theo dõi */
  followers: number;
  /** Mô tả ngắn */
  bio?: string;
  /** Danh sách thể loại */
  genres?: string[];
}

/**
 * Thông tin playlist.
 */
export interface Playlist {
  /** ID duy nhất */
  id: string;
  /** Tên playlist */
  title: string;
  /** Mô tả playlist */
  description?: string;
  /** URL ảnh bìa */
  coverUrl?: string;
  /** ID người tạo */
  ownerId: string;
  /** Tên người tạo */
  ownerName: string;
  /** Số lượng bài hát */
  trackCount: number;
  /** Playlist công khai hay riêng tư */
  isPublic: boolean;
  /** Danh sách bài hát */
  tracks?: Track[];
  /** Ngày tạo */
  createdAt: string;
  /** Ngày cập nhật */
  updatedAt: string;
}
