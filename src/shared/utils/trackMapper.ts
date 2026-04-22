/**
 * @file trackMapper.ts
 * @description Các hàm chuyển đổi dữ liệu từ API thô (Youtube Music) sang chuẩn nội bộ của App (Track, Album, Artist).
 * @module shared/utils
 */

import type { Track, Album, Artist } from '@shared/types/track'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { apiClient } from '@core/api/apiClient'

/** Cấu trúc Thumbnail trả về từ Youtube Music */
export interface YTThumbnail {
  url: string
  width: number
  height: number
}

/** Cấu trúc Artist trả về từ Youtube Music */
export interface YTArtistInfo {
  name: string
  id?: string
}

/** 
 * Lấy URL ảnh nét nhất từ mảng thumbnails.
 * Ưu tiên ảnh có chiều rộng lớn nhất.
 */
export function getBestThumbnail(thumbnails?: YTThumbnail[]): string {
  if (!thumbnails || thumbnails.length === 0) return ''
  // Lấy ảnh có kích thước lớn nhất
  const best = thumbnails.reduce((b, c) => (c.width > b.width ? c : b))
  return best.url
}

/**
 * Nâng cấp URL thumbnail YT Music lên kích thước HD.
 * YouTube thumbnails cho phép đổi param `w` và `h` trong URL để lấy ảnh lớn hơn.
 * 
 * Ví dụ:
 * - Input:  `https://lh3.googleusercontent.com/...=w120-h120-l90-rj`
 * - Output: `https://lh3.googleusercontent.com/...=w544-h544-l90-rj`
 * 
 * @param url - URL thumbnail gốc
 * @param size - Kích thước mong muốn (mặc định 544px — HD cho mobile)
 */
export function getHDThumbnailUrl(url: string, size = 544): string {
  if (!url) return ''
  // YouTube/Google thumbnail URLs dùng format: =w{width}-h{height}-...
  return url
    .replace(/=w\d+/, `=w${size}`)
    .replace(/-h\d+/, `-h${size}`)
}

/**
 * Chuyển đổi một Item (Song) từ YT Music sang chuẩn Track của App.
 *
 * @param item - Object dữ liệu Song từ API (resultType: 'song')
 * @returns Object Track chuẩn
 */
export function mapYtSongToTrack(item: any): Track {
  // YTMusic trả về artists là mảng object
  const artistName = item.artists?.map((a: YTArtistInfo) => a.name).join(', ') || 'Unknown Artist'
  const artistId = item.artists?.[0]?.id || ''
  
  // Tạo URL stream bằng cách móc thẳng vào Endpoint Stream của FastAPI
  // Lấy baseURL từ apiClient để đảm bảo đồng nhất (tránh lỗi localhost trên thiết bị thật)
  const baseUrl = apiClient.defaults.baseURL?.replace(/\/$/, '') || ''
  const streamUrl = `${baseUrl}${API_ENDPOINTS.YTM_STREAM(item.videoId)}`

  return {
    id: item.videoId,
    title: item.title || 'Unknown Title',
    artist: artistName,
    artistId: artistId,
    album: item.album?.name,
    albumId: item.album?.id,
    coverUrl: getHDThumbnailUrl(getBestThumbnail(item.thumbnails)),
    durationSeconds: item.duration_seconds || 0,
    streamUrl: streamUrl,
    isDownloaded: false,
    isLiked: false,
  }
}

/**
 * Chuyển đổi một Item (Album) từ YT Music sang chuẩn Album của App.
 *
 * @param item - Object dữ liệu Album từ API (resultType: 'album')
 * @returns Object Album chuẩn
 */
export function mapYtAlbumToAlbum(item: any): Album {
  const artistName = item.artists?.map((a: YTArtistInfo) => a.name).join(', ') || 'Unknown Artist'
  const artistId = item.artists?.[0]?.id || ''

  return {
    id: item.browseId || item.id,
    title: item.title || 'Unknown Album',
    artist: artistName,
    artistId: artistId,
    coverUrl: getHDThumbnailUrl(getBestThumbnail(item.thumbnails)),
    releaseYear: parseInt(item.year, 10) || new Date().getFullYear(),
    trackCount: item.trackCount || 0,
  }
}

/**
 * Chuyển đổi một Item (Artist) từ YT Music sang chuẩn Artist của App.
 *
 * @param item - Object dữ liệu Artist từ API (resultType: 'artist')
 * @returns Object Artist chuẩn
 */
export function mapYtArtistToArtist(item: any): Artist {
  return {
    id: item.browseId || item.id,
    name: item.artist || item.name || 'Unknown Artist',
    avatarUrl: getHDThumbnailUrl(getBestThumbnail(item.thumbnails)),
    followers: parseInt(item.subscribers?.replace(/[^0-9]/g, ''), 10) || 0,
  }
}
