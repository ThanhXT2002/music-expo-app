/**
 * @file downloadService.ts
 * @description Service quản lý tải nhạc offline.
 * @module features/downloads/services
 */

import { createLogger } from '@core/logger';
import * as fileStorage from '@core/storage/fileStorage';
import { getStreamUrl } from '@features/player/services/playerService';

const logger = createLogger('download-service');

/**
 * Tải bài hát về thiết bị để nghe offline.
 * Lấy stream URL từ API rồi tải file về local storage.
 *
 * @param trackId - ID bài hát cần tải
 * @param onProgress - Callback theo dõi tiến trình (0–1)
 * @returns Đường dẫn file đã tải
 */
export async function downloadTrackForOffline(
  trackId: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  logger.info('Bắt đầu tải bài hát offline', { trackId });

  try {
    // Kiểm tra đã tải trước đó chưa
    const isDownloaded = await fileStorage.isTrackDownloaded(trackId);
    if (isDownloaded) {
      logger.info('Bài hát đã tải trước đó — bỏ qua', { trackId });
      const path = await fileStorage.getTrackFilePath(trackId);
      return path!;
    }

    // Lấy URL stream từ API
    const streamUrl = await getStreamUrl(trackId);

    // Tải file
    const filePath = await fileStorage.downloadTrack(trackId, streamUrl, onProgress);

    logger.info('Tải bài hát offline thành công', { trackId, filePath });
    return filePath;
  } catch (error) {
    logger.error('Tải bài hát offline thất bại', { trackId, error });
    throw error;
  }
}

/**
 * Xoá bài hát đã tải offline.
 *
 * @param trackId - ID bài hát cần xoá
 */
export async function removeOfflineTrack(trackId: string): Promise<void> {
  logger.info('Xoá bài hát offline', { trackId });
  await fileStorage.deleteTrackFile(trackId);
}
