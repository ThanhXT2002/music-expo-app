/**
 * @file useAlbumDetail.ts
 * @description Hook tải dữ liệu chi tiết album từ API.
 * Gọi GET /ytmusic/album/{id} và map response thành cấu trúc nội bộ.
 * @module features/home/hooks
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@core/api/apiClient'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { createLogger } from '@core/logger'
import { mapYtSongToTrack } from '@shared/utils/trackMapper'
import { getBestThumbnail, getHDThumbnailUrl } from '@shared/utils/trackMapper'
import type { Track } from '@shared/types/track'

const logger = createLogger('use-album-detail')

// ─── Types ────────────────────────────────────────────────────────────────────

/** Thông tin album đã được chuẩn hóa từ API */
export interface AlbumDetail {
  /** YouTube Music album browse ID */
  id: string
  /** Tên album */
  title: string
  /** Loại phát hành (Album / Single / EP) */
  type: string
  /** Tên nghệ sĩ chính */
  artist: string
  /** Channel ID nghệ sĩ — dùng để navigate sang trang nghệ sĩ */
  artistId: string
  /** URL ảnh bìa album HD */
  coverUrl: string
  /** Năm phát hành */
  year: string
  /** Tổng số bài hát */
  trackCount: number
  /** Tổng thời lượng (hiển thị) */
  duration: string
  /** Mô tả album (nếu có) */
  description: string
  /** Danh sách bài hát trong album */
  tracks: Track[]
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Map raw API response của ytmusicapi.get_album() sang AlbumDetail.
 *
 * Response gốc có cấu trúc:
 * { title, type, thumbnails, year, artists: [{name, id}], trackCount, duration, description, tracks: [...] }
 *
 * Tracks trong album có cấu trúc giống song nhưng có thể thiếu thumbnails,
 * nên ta gán coverUrl từ album nếu track thiếu ảnh.
 *
 * @param raw - Response thô từ backend
 * @param albumId - Browse ID album (truyền vào vì API có thể không trả lại)
 */
function mapRawToAlbumDetail(raw: any, albumId: string): AlbumDetail {
  // Artist info
  const artists = raw.artists || []
  const artistName = artists.map((a: any) => a.name).join(', ') || 'Unknown Artist'
  const artistId = artists[0]?.id || ''

  // Cover URL — ưu tiên lấy từ album thumbnails
  const albumCoverUrl = getHDThumbnailUrl(getBestThumbnail(raw.thumbnails))

  // Tracks — map từng bài, gán coverUrl từ album nếu track thiếu
  const rawTracks = raw.tracks || []
  const tracks: Track[] = rawTracks
    .filter((t: any) => t.videoId) // Lọc track hợp lệ (có videoId)
    .map((t: any) => {
      const mapped = mapYtSongToTrack(t)
      // Track trong album thường thiếu thumbnail → fallback sang ảnh bìa album
      if (!mapped.coverUrl || mapped.coverUrl === '') {
        mapped.coverUrl = albumCoverUrl
      }
      // Gán thông tin album cho track
      mapped.album = raw.title || ''
      mapped.albumId = albumId
      return mapped
    })

  return {
    id: albumId,
    title: raw.title || 'Unknown Album',
    type: raw.type || 'Album',
    artist: artistName,
    artistId,
    coverUrl: albumCoverUrl,
    year: raw.year || '',
    trackCount: raw.trackCount || tracks.length,
    duration: raw.duration || '',
    description: raw.description || '',
    tracks,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook tải chi tiết album từ API.
 *
 * @param albumId - YouTube Music album browse ID
 * @returns Chi tiết album, trạng thái loading/error và hàm refetch
 */
export function useAlbumDetail(albumId: string) {
  const query = useQuery<AlbumDetail>({
    queryKey: ['album-detail', albumId],
    queryFn: async () => {
      logger.info('Tải chi tiết album', { albumId })
      const response = await apiClient.get<any>(API_ENDPOINTS.YTM_ALBUM(albumId))

      // Backend trả về raw dict từ ytmusicapi.get_album()
      const rawData = response.data?.data ?? response.data
      const detail = mapRawToAlbumDetail(rawData, albumId)

      logger.info('Tải album thành công', {
        title: detail.title,
        artist: detail.artist,
        trackCount: detail.tracks.length,
      })

      return detail
    },
    enabled: !!albumId,
    staleTime: 10 * 60 * 1000, // Cache 10 phút — dữ liệu album ít thay đổi
  })

  return {
    /** Chi tiết album */
    album: query.data ?? null,
    /** Đang tải dữ liệu */
    isLoading: query.isLoading,
    /** Lỗi khi tải */
    error: query.error,
    /** Tải lại dữ liệu */
    refetch: query.refetch,
  }
}
