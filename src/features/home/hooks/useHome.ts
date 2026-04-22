/**
 * @file useHome.ts
 * @description Hook tải dữ liệu trang chủ từ API.
 * Lấy top songs và map thành HomeFeed structure.
 * @module features/home/hooks
 */

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@core/api/apiClient'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { createLogger } from '@core/logger'
import { mapYtSongToTrack } from '@shared/utils/trackMapper'
import type { HomeFeed, FeaturedItem, RecommendedPlaylist } from '../types'
import type { Track } from '@shared/types/track'

const logger = createLogger('use-home')

/**
 * Chuyển đổi danh sách tracks từ API thành cấu trúc HomeFeed.
 * Vì backend chỉ trả về flat array từ /ytmusic/top-songs,
 * ta cần map sang các section khác nhau cho UI.
 */
function mapTracksToFeed(tracks: Track[]): HomeFeed {
  // Featured: lấy 3 bài đầu làm banner
  const featured: FeaturedItem[] = tracks.slice(0, 3).map((t, i) => ({
    id: `featured-${t.id}`,
    title: t.title,
    subtitle: t.artist,
    imageUrl: t.coverUrl || `https://picsum.photos/seed/banner${i}/800/400`,
    type: 'track' as const,
    targetId: t.id
  }))

  // Top songs: lấy 10 bài đầu
  const recentlyPlayed = tracks.slice(0, 10)

  // Playlist giả: nhóm theo nghệ sĩ
  const artistMap = new Map<string, Track[]>()
  tracks.forEach((t) => {
    if (!artistMap.has(t.artist)) artistMap.set(t.artist, [])
    artistMap.get(t.artist)!.push(t)
  })
  const recommendedPlaylists: RecommendedPlaylist[] = Array.from(artistMap.entries())
    .slice(0, 5)
    .map(([artist, artistTracks], i) => ({
      id: `playlist-auto-${i}`,
      title: `${artist} Mix`,
      description: `Tuyển tập ${artist}`,
      coverUrl: artistTracks[0]?.coverUrl || `https://picsum.photos/seed/playlist${i}/300/300`,
      trackCount: artistTracks.length,
      tracks: artistTracks
    }))

  return {
    featured,
    recentlyPlayed,
    recommendedPlaylists,
    suggestedArtists: [],
    newReleases: []
  }
}

/**
 * Hook tải dữ liệu feed trang chủ.
 * Gọi /ytmusic/top-songs và map thành HomeFeed.
 *
 * @returns Dữ liệu trang chủ, trạng thái loading/error và hàm refetch
 */
export function useHome() {
  const query = useQuery<HomeFeed>({
    queryKey: ['home', 'feed'],
    queryFn: async () => {
      logger.info('Tải dữ liệu trang chủ')
      const response = await apiClient.get<any>(API_ENDPOINTS.YTM_TOP_SONGS)

      // API /ytmusic/top-songs trả về ApiResponse, data là mảng tracks
      const rawData = response.data?.data ?? response.data

      // Kiểm tra nếu rawData là array (flat tracks) thì map sang HomeFeed
      if (Array.isArray(rawData)) {
        // Dùng mapYtSongToTrack() để có đầy đủ streamUrl, albumId, etc.
        const tracks: Track[] = rawData.map((item: any) => mapYtSongToTrack(item))
        return mapTracksToFeed(tracks)
      }

      // Nếu rawData đã là HomeFeed format
      return rawData as HomeFeed
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  return {
    /** Dữ liệu feed trang chủ */
    feed: query.data ?? null,
    /** Đang tải dữ liệu */
    isLoading: query.isLoading,
    /** Lỗi khi tải */
    error: query.error,
    /** Tải lại dữ liệu */
    refetch: query.refetch
  }
}

