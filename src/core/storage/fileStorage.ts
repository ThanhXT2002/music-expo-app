/**
 * @file fileStorage.ts
 * @description Wrapper cho expo-file-system — quản lý file nhạc offline.
 * Xử lý tải xuống, kiểm tra tồn tại, xoá file và tính dung lượng.
 * @module core/storage
 */

import * as FileSystem from 'expo-file-system/legacy';
import { createLogger } from '@core/logger';

const logger = createLogger('file-storage');

/** Thư mục gốc lưu nhạc offline */
const MUSIC_DIR = `${FileSystem.documentDirectory}music/`;

/**
 * Đảm bảo thư mục nhạc tồn tại — tạo nếu chưa có.
 */
async function ensureMusicDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(MUSIC_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MUSIC_DIR, { intermediates: true });
    logger.debug('Tạo thư mục nhạc offline', { path: MUSIC_DIR });
  }
}

/**
 * Tải file nhạc từ URL về thiết bị.
 *
 * @param trackId - ID bài hát (dùng làm tên file)
 * @param url - URL nguồn tải
 * @param onProgress - Callback theo dõi tiến trình tải (0–1)
 * @returns Đường dẫn file đã tải
 */
export async function downloadTrack(
  trackId: string,
  url: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  await ensureMusicDir();
  const filePath = `${MUSIC_DIR}${trackId}.mp3`;

  logger.info('Bắt đầu tải bài hát', { trackId, url });

  try {
    const downloadResumable = FileSystem.createDownloadResumable(url, filePath, {}, (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      onProgress?.(progress);
    });

    const result = await downloadResumable.downloadAsync();

    if (!result) {
      throw new Error('Download trả về null');
    }

    logger.info('Tải bài hát thành công', { trackId, filePath: result.uri });
    return result.uri;
  } catch (error) {
    logger.error('Tải bài hát thất bại', { trackId, error });
    throw error;
  }
}

/**
 * Kiểm tra bài hát đã được tải offline chưa.
 *
 * @param trackId - ID bài hát
 * @returns true nếu file tồn tại trên thiết bị
 */
export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  const filePath = `${MUSIC_DIR}${trackId}.mp3`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
}

/**
 * Lấy đường dẫn file offline của bài hát.
 *
 * @param trackId - ID bài hát
 * @returns Đường dẫn file hoặc null nếu chưa tải
 */
export async function getTrackFilePath(trackId: string): Promise<string | null> {
  const filePath = `${MUSIC_DIR}${trackId}.mp3`;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists ? filePath : null;
}

/**
 * Xoá file nhạc offline.
 *
 * @param trackId - ID bài hát cần xoá
 */
export async function deleteTrackFile(trackId: string): Promise<void> {
  const filePath = `${MUSIC_DIR}${trackId}.mp3`;
  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
    logger.info('Xoá file nhạc offline', { trackId });
  } catch (error) {
    logger.error('Không thể xoá file nhạc', { trackId, error });
  }
}

/**
 * Tính tổng dung lượng nhạc offline đã tải.
 *
 * @returns Tổng dung lượng tính bằng bytes
 */
export async function getTotalDownloadSize(): Promise<number> {
  await ensureMusicDir();
  try {
    const files = await FileSystem.readDirectoryAsync(MUSIC_DIR);
    let totalSize = 0;

    for (const file of files) {
      const info = await FileSystem.getInfoAsync(`${MUSIC_DIR}${file}`);
      if (info.exists && !info.isDirectory) {
        totalSize += info.size ?? 0;
      }
    }

    logger.debug('Tổng dung lượng nhạc offline', { totalBytes: totalSize, fileCount: files.length });
    return totalSize;
  } catch (error) {
    logger.error('Không thể tính dung lượng offline', error);
    return 0;
  }
}
