/**
 * @file playerService.ts
 * @description Service giao tiếp với API backend cho tính năng phát nhạc.
 * Xử lý lấy URL stream, báo cáo lượt nghe, và lấy lyrics.
 * @module features/player/services
 */

import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';

const logger = createLogger('player-service');

/**
 * Lấy URL stream của bài hát từ server.
 * Server trả về URL có TTL 1 giờ — không cache quá lâu.
 *
 * @param trackId - ID bài hát cần lấy stream URL
 * @returns URL stream dạng HTTPS
 * @throws {Error} Khi server trả về lỗi hoặc mất kết nối
 */
export async function getStreamUrl(trackId: string): Promise<string> {
  logger.info('Lấy stream URL', { trackId });
  try {
    const response = await apiClient.get<{ url: string }>(API_ENDPOINTS.SONG_PROXY_DOWNLOAD(trackId));
    logger.info('Lấy stream URL thành công', { trackId });
    return response.data.url;
  } catch (error) {
    logger.error('Không thể lấy stream URL', { trackId, error });
    throw error;
  }
}

/**
 * Báo cáo lượt nghe lên server để tính thống kê.
 * Fire-and-forget — lỗi không ảnh hưởng trải nghiệm nghe nhạc.
 *
 * @param trackId - ID bài hát đã nghe
 * @param listenedSeconds - Số giây đã nghe thực tế
 */
export async function reportPlay(trackId: string, listenedSeconds: number): Promise<void> {
  logger.debug('Báo cáo lượt nghe', { trackId, listenedSeconds });
  try {
    await apiClient.post(API_ENDPOINTS.SONGS_COMPLETED, { trackId, listenedSeconds });
  } catch (error) {
    // Không throw — không để lỗi thống kê ảnh hưởng tính năng nghe nhạc
    logger.warn('Báo cáo lượt nghe thất bại — bỏ qua', { trackId, error });
  }
}

/**
 * Lấy lyrics của bài hát.
 *
 * @param trackId - ID bài hát
 * @returns Nội dung lyrics hoặc null nếu không có
 */
export async function getLyrics(trackId: string): Promise<string | null> {
  logger.debug('Lấy lyrics', { trackId });
  try {
    const response = await apiClient.get<{ lyrics: string | null }>(
      API_ENDPOINTS.YTM_SONG_LYRICS(trackId),
    );
    return response.data.lyrics;
  } catch (error) {
    logger.warn('Không thể lấy lyrics — bỏ qua', { trackId, error });
    return null;
  }
}
