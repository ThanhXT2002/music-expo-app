/**
 * @file libraryService.ts
 * @description Service giao tiếp với API cho thư viện nhạc.
 * @module features/library/services
 */

import { apiClient } from '@core/api/apiClient'
import { createLogger } from '@core/logger'

const logger = createLogger('library-service')

/**
 * Thêm bài hát vào danh sách yêu thích.
 *
 * @param trackId - ID bài hát
 */
export async function likeTrack(trackId: string): Promise<void> {
  logger.info('Thích bài hát', { trackId })
  await apiClient.post(`/library/tracks/${trackId}/like`)
}

/**
 * Xoá bài hát khỏi danh sách yêu thích.
 *
 * @param trackId - ID bài hát
 */
export async function unlikeTrack(trackId: string): Promise<void> {
  logger.info('Bỏ thích bài hát', { trackId })
  await apiClient.delete(`/library/tracks/${trackId}/like`)
}
