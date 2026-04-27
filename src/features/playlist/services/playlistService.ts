/**
 * @file playlistService.ts
 * @description Service giao tiếp với API cho playlist.
 * @module features/playlist/services
 */

import { apiClient } from '@core/api/apiClient'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { createLogger } from '@core/logger'
import * as localDb from '@core/data/database'
import type { Playlist } from '@shared/types/track'
import type { PlaylistFormData } from '../types'

const logger = createLogger('playlist-service')

/** Tạo UUID v4 đơn giản cho Client-side ID generation */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Lấy danh sách playlist của user.
 * Ưu tiên đọc từ SQLite để có ngay lập tức (Offline), sau đó đồng bộ với API.
 */
export async function getPlaylists(): Promise<Playlist[]> {
  logger.info('Tải danh sách playlist')
  try {
    // 1. Luôn thử đọc từ Local SQLite trước
    const localPlaylists = await localDb.getPlaylistsLocal()
    
    // 2. Fetch ngầm từ API để đồng bộ dữ liệu mới nhất
    apiClient.get<Playlist[]>(API_ENDPOINTS.PLAYLISTS)
      .then(async (response) => {
        logger.info('Đồng bộ playlist từ API thành công', { total: response.data.length })
        // Cập nhật lại SQLite
        for (const p of response.data) {
          await localDb.savePlaylistLocal(p.id, p.title)
        }
      })
      .catch((error) => {
        logger.warn('Không thể đồng bộ playlist từ API (Offline mode?)', { error: error.message })
      })

    // Trả về dữ liệu local ngay lập tức
    return localPlaylists as unknown as Playlist[]
  } catch (error) {
    logger.error('Lỗi khi tải playlist', error)
    return []
  }
}

/**
 * Lấy chi tiết playlist (chỉ dùng API tạm thời)
 */
export async function getPlaylistDetail(id: string): Promise<Playlist> {
  logger.info('Tải chi tiết playlist', { playlistId: id })
  const response = await apiClient.get<Playlist>(API_ENDPOINTS.PLAYLIST_DETAIL(id))
  return response.data
}

/**
 * Tạo playlist mới. (Offline-first)
 */
export async function createPlaylist(data: PlaylistFormData): Promise<Playlist> {
  const newId = generateUUID()
  logger.info('Tạo playlist mới (Local)', { title: data.title, id: newId })
  
  // 1. Lưu ngay vào SQLite
  await localDb.savePlaylistLocal(newId, data.title)

  // 2. Đồng bộ API
  try {
    const response = await apiClient.post<Playlist>(API_ENDPOINTS.PLAYLISTS, { id: newId, ...data })
    logger.info('Đồng bộ tạo playlist lên Server thành công')
    return response.data
  } catch (error) {
    logger.warn('Chưa thể đồng bộ playlist lên Server (lưu tạm offline)', { error: (error as Error).message })
    return {
      id: newId,
      title: data.title,
      ownerId: 'local',
      ownerName: 'Bạn',
      trackCount: 0,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

/**
 * Thêm bài hát vào playlist. (Offline-first)
 */
export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  logger.info('Thêm bài vào playlist (Local)', { playlistId, trackId })
  
  // 1. Lưu SQLite
  await localDb.addTrackToPlaylistLocal(playlistId, trackId)

  // 2. Gọi API
  try {
    await apiClient.post(API_ENDPOINTS.PLAYLIST_TRACKS(playlistId), { trackId })
  } catch (error) {
    logger.warn('Chưa thể đồng bộ thêm bài hát lên Server', { error: (error as Error).message })
  }
}

/**
 * Xoá bài hát khỏi playlist. (Offline-first)
 */
export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  logger.info('Xoá bài khỏi playlist (Local)', { playlistId, trackId })
  
  // 1. Xoá SQLite
  await localDb.removeTrackFromPlaylistLocal(playlistId, trackId)

  // 2. Gọi API
  try {
    await apiClient.delete(`${API_ENDPOINTS.PLAYLIST_TRACKS(playlistId)}/${trackId}`)
  } catch (error) {
    logger.warn('Chưa thể đồng bộ xoá bài hát lên Server', { error: (error as Error).message })
  }
}
