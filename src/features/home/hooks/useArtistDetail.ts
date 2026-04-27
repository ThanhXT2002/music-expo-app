/**
 * @file useArtistDetail.ts
 * @description Hook tải dữ liệu chi tiết nghệ sĩ từ API.
 * Gọi GET /ytmusic/artist/{id} và map response thành cấu trúc nội bộ.
 * @module features/home/hooks
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@core/api/apiClient'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { createLogger } from '@core/logger'
import { mapYtSongToTrack } from '@shared/utils/trackMapper'
import { getBestThumbnail, getHDThumbnailUrl } from '@shared/utils/trackMapper'
import type { Track, Album } from '@shared/types/track'

const logger = createLogger('use-artist-detail')

// ─── Types ────────────────────────────────────────────────────────────────────

/** Thông tin nghệ sĩ đã được chuẩn hóa từ API */
export interface ArtistDetail {
  /** YouTube Music channel ID */
  id: string
  /** Tên nghệ sĩ */
  name: string
  /** URL ảnh đại diện HD */
  avatarUrl: string
  /** Số lượng người theo dõi (hiển thị) */
  subscriberText: string
  /** Số subscriber dạng số — 0 nếu không parse được */
  subscriberCount: number
  /** Mô tả / tiểu sử nghệ sĩ */
  description: string
  /** Danh sách bài hát nổi bật */
  topSongs: Track[]
  /** Danh sách album */
  albums: ArtistAlbumItem[]
  /** Danh sách single */
  singles: ArtistAlbumItem[]
}

/** Một album/single của nghệ sĩ (cấu trúc gọn cho card) */
export interface ArtistAlbumItem {
  /** browseId — dùng để navigate */
  id: string
  /** Tên album/single */
  title: string
  /** URL ảnh bìa */
  coverUrl: string
  /** Năm phát hành */
  year: string
  /** Loại: Album hoặc Single */
  type: string
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

/**
 * Map raw API response của ytmusicapi.get_artist() sang ArtistDetail.
 * Response gốc có cấu trúc:
 * { name, description, subscribers, thumbnails, songs: { results: [...] }, albums: { results: [...] }, singles: { results: [...] } }
 *
 * @param raw - Response thô từ backend
 * @param artistId - Channel ID (truyền vào vì API không trả lại ID)
 */
function mapRawToArtistDetail(raw: any, artistId: string): ArtistDetail {
  // Subscribers: "12.5M subscribers" → parse ra số
  const subscriberText = raw.subscribers || ''
  let subscriberCount = 0
  const subMatch = subscriberText.replace(/[^0-9.KMB]/gi, '')
  if (subMatch) {
    const num = parseFloat(subMatch)
    if (subscriberText.toUpperCase().includes('B')) subscriberCount = num * 1_000_000_000
    else if (subscriberText.toUpperCase().includes('M')) subscriberCount = num * 1_000_000
    else if (subscriberText.toUpperCase().includes('K')) subscriberCount = num * 1_000
    else subscriberCount = num
  }

  // Top songs
  const rawSongs = raw.songs?.results || []
  const topSongs: Track[] = rawSongs.map((song: any) => mapYtSongToTrack(song))

  // Albums
  const rawAlbums = raw.albums?.results || []
  const albums: ArtistAlbumItem[] = rawAlbums.map((item: any) => ({
    id: item.browseId || item.id || '',
    title: item.title || '',
    coverUrl: getHDThumbnailUrl(getBestThumbnail(item.thumbnails)),
    year: item.year || '',
    type: item.type || 'Album',
  }))

  // Singles
  const rawSingles = raw.singles?.results || []
  const singles: ArtistAlbumItem[] = rawSingles.map((item: any) => ({
    id: item.browseId || item.id || '',
    title: item.title || '',
    coverUrl: getHDThumbnailUrl(getBestThumbnail(item.thumbnails)),
    year: item.year || '',
    type: item.type || 'Single',
  }))

  return {
    id: artistId,
    name: raw.name || 'Unknown Artist',
    avatarUrl: getHDThumbnailUrl(getBestThumbnail(raw.thumbnails), 720),
    subscriberText,
    subscriberCount,
    description: raw.description || '',
    topSongs,
    albums,
    singles,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook tải chi tiết nghệ sĩ từ API.
 *
 * @param artistId - YouTube Music channel ID (browseId)
 * @returns Chi tiết nghệ sĩ, trạng thái loading/error và hàm refetch
 */
export function useArtistDetail(artistId: string) {
  const query = useQuery<ArtistDetail>({
    queryKey: ['artist-detail', artistId],
    queryFn: async () => {
      logger.info('Tải chi tiết nghệ sĩ', { artistId })
      const response = await apiClient.get<any>(API_ENDPOINTS.YTM_ARTIST(artistId))

      // Backend trả về raw dict từ ytmusicapi.get_artist()
      const rawData = response.data?.data ?? response.data
      const detail = mapRawToArtistDetail(rawData, artistId)

      logger.info('Tải nghệ sĩ thành công', {
        name: detail.name,
        topSongs: detail.topSongs.length,
        albums: detail.albums.length,
      })

      return detail
    },
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000, // Cache 10 phút — dữ liệu artist ít thay đổi
  })

  return {
    /** Chi tiết nghệ sĩ */
    artist: query.data ?? null,
    /** Đang tải dữ liệu */
    isLoading: query.isLoading,
    /** Lỗi khi tải */
    error: query.error,
    /** Tải lại dữ liệu */
    refetch: query.refetch,
  }
}
