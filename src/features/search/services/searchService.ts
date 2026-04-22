/**
 * @file searchService.ts
 * @description Service giao tiếp với API tìm kiếm.
 * @module features/search/services
 */

import { apiClient } from '@core/api/apiClient'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { createLogger } from '@core/logger'
import { mapYtSongToTrack, mapYtAlbumToAlbum, mapYtArtistToArtist } from '@shared/utils/trackMapper'
import type { SearchResult, RawYTMusicResult } from '../types'

const logger = createLogger('search-service')

/**
 * Tìm kiếm tổng hợp — trả về tracks, albums, artists khớp với từ khoá.
 *
 * @param query - Từ khoá tìm kiếm
 * @returns Kết quả tìm kiếm tổng hợp
 */
export async function searchAll(query: string): Promise<SearchResult> {
  logger.info('Tìm kiếm', { query })
  try {
    const response = await apiClient.get<RawYTMusicResult[]>(`${API_ENDPOINTS.YTM_SEARCH}?query=${encodeURIComponent(query)}`)
    const rawData = response.data || []
    
    // Khởi tạo container kết quả
    const result: SearchResult = {
      tracks: [],
      albums: [],
      artists: [],
    }

    // Lọc và map dữ liệu
    for (const item of rawData) {
      if (item.resultType === 'song') {
        result.tracks.push(mapYtSongToTrack(item))
      } else if (item.resultType === 'album') {
        result.albums.push(mapYtAlbumToAlbum(item))
      } else if (item.resultType === 'artist') {
        result.artists.push(mapYtArtistToArtist(item))
      }
    }

    logger.info('Tìm kiếm thành công', {
      query,
      tracks: result.tracks.length,
      albums: result.albums.length,
      artists: result.artists.length
    })
    
    return result
  } catch (error) {
    logger.error('Tìm kiếm thất bại', { query, error })
    throw error
  }
}

/**
 * Gợi ý tìm kiếm (Auto-Suggest).
 * 
 * @param query - Từ khóa gợi ý
 * @returns Mảng các chuỗi gợi ý
 */
export async function fetchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await apiClient.get<string[]>(`${API_ENDPOINTS.YTM_SEARCH_SUGGESTIONS}?query=${encodeURIComponent(query)}`)
    return response.data || []
  } catch (error) {
    logger.error('Lấy gợi ý thất bại', { query, error })
    return []
  }
}
