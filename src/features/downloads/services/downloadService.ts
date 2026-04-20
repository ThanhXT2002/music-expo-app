/**
 * @file downloadService.ts
 * @description Service kết nối Backend API cho tính năng tải nhạc.
 *
 * Chức năng:
 * - Gửi YouTube URL → nhận metadata bài hát
 * - Poll trạng thái convert trên server
 * - Tìm kiếm bài hát đã hoàn thành (server-side fuzzy search)
 * - Validate YouTube URL format
 * - Tải file MP3 vật lý về thiết bị + lưu SQLite
 *
 * @module features/downloads/services
 */

import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';
import * as fileStorage from '@core/storage/fileStorage';
import { saveOfflineSong, deleteOfflineSong } from '@core/data/database';
import type { SongInfo, SongStatusResponse } from '../types';

const logger = createLogger('download-service');

// ─── YouTube URL Validation ──────────────────────────────────────────────────

/** Regex nhận dạng các format URL YouTube phổ biến */
const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)[\w-]+/i;

/**
 * Kiểm tra chuỗi có phải URL YouTube hợp lệ không.
 *
 * @param url - Chuỗi cần kiểm tra
 * @returns true nếu là URL YouTube
 */
export function isYoutubeUrl(url: string): boolean {
  return YOUTUBE_URL_REGEX.test(url.trim());
}

// ─── API: Lấy thông tin bài hát ──────────────────────────────────────────────

/**
 * Gửi YouTube URL lên server để lấy metadata bài hát.
 * Server sẽ đồng thời trigger background download/convert.
 *
 * @param youtubeUrl - URL YouTube cần xử lý
 * @returns Metadata bài hát (id, title, artist, thumbnail, duration...)
 */
export async function fetchSongInfo(youtubeUrl: string): Promise<SongInfo> {
  logger.info('Lấy thông tin bài hát từ YouTube', { youtubeUrl });
  try {
    const response = await apiClient.post(API_ENDPOINTS.SONG_INFO, {
      youtube_url: youtubeUrl,
    });
    const data = response.data?.data;
    if (!data) throw new Error('Server không trả về thông tin bài hát');
    logger.info('Nhận metadata thành công', { id: data.id, title: data.title });
    return data as SongInfo;
  } catch (error) {
    logger.error('Lấy thông tin bài hát thất bại', { youtubeUrl, error });
    throw error;
  }
}

// ─── API: Poll trạng thái convert ────────────────────────────────────────────

/**
 * Kiểm tra trạng thái convert/xử lý trên server.
 *
 * @param songId - YouTube video ID
 * @returns Trạng thái: pending / processing / completed / failed + progress
 */
export async function pollSongStatus(songId: string): Promise<SongStatusResponse> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONG_STATUS(songId));
    return response.data?.data as SongStatusResponse;
  } catch (error) {
    logger.error('Poll trạng thái thất bại', { songId, error });
    throw error;
  }
}

// ─── API: Tìm kiếm bài hát đã hoàn thành ───────────────────────────────────

/**
 * Tìm kiếm bài hát đã convert xong trên server (fuzzy match).
 *
 * @param keyword - Từ khoá tìm kiếm
 * @param limit - Số lượng kết quả tối đa
 * @returns Danh sách bài hát matchs
 */
export async function searchCompletedSongs(
  keyword: string,
  limit: number = 20,
): Promise<SongInfo[]> {
  logger.info('Tìm kiếm bài hát trên server', { keyword });
  try {
    const response = await apiClient.get(API_ENDPOINTS.SONGS_COMPLETED, {
      params: { key: keyword, limit },
    });
    return (response.data?.data ?? []) as SongInfo[];
  } catch (error) {
    logger.error('Tìm kiếm thất bại', { keyword, error });
    return [];
  }
}

// ─── File Download: Tải MP3 về thiết bị ──────────────────────────────────────

/**
 * Tải file MP3 từ server về thiết bị và lưu record vào SQLite.
 *
 * @param songInfo - Metadata bài hát
 * @param onProgress - Callback tiến trình tải (0–1)
 * @returns Đường dẫn file local đã tải
 */
export async function downloadAndSave(
  songInfo: SongInfo,
  onProgress?: (progress: number) => void,
): Promise<string> {
  logger.info('Bắt đầu tải file MP3', { id: songInfo.id, title: songInfo.title });

  // Kiểm tra đã tải trước đó
  const alreadyDownloaded = await fileStorage.isTrackDownloaded(songInfo.id);
  if (alreadyDownloaded) {
    logger.info('File đã có trên đĩa — đồng bộ lại SQLite', { id: songInfo.id });
    const path = await fileStorage.getTrackFilePath(songInfo.id);
    // Luôn đảm bảo record SQLite tồn tại (phòng trường hợp lần trước save thất bại)
    await saveOfflineSong({
      id: songInfo.id,
      title: songInfo.title,
      artist: songInfo.artist,
      thumbnailUrl: songInfo.thumbnail_url,
      localAudioUri: path!,
      duration: songInfo.duration,
    });
    return path!;
  }

  // URL stream từ backend
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
  const streamUrl = `${BASE_URL}${API_ENDPOINTS.SONG_PROXY_DOWNLOAD(songInfo.id)}`;

  // Tải file vật lý
  const filePath = await fileStorage.downloadTrack(songInfo.id, streamUrl, onProgress);

  // Lưu vào SQLite
  await saveOfflineSong({
    id: songInfo.id,
    title: songInfo.title,
    artist: songInfo.artist,
    thumbnailUrl: songInfo.thumbnail_url,
    localAudioUri: filePath,
    duration: songInfo.duration,
  });

  logger.info('Tải và lưu thành công', { id: songInfo.id, filePath });
  return filePath;
}

// ─── File Delete: Xoá bài hát offline ────────────────────────────────────────

/**
 * Xoá bài hát offline: xoá file vật lý + xoá record SQLite.
 *
 * @param songId - YouTube video ID
 */
export async function removeDownloadedSong(songId: string): Promise<void> {
  logger.info('Xoá bài hát offline', { songId });
  await fileStorage.deleteTrackFile(songId);
  await deleteOfflineSong(songId);
}
