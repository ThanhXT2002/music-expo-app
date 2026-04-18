/**
 * @file playlistService.ts
 * @description Service giao tiếp với API cho playlist.
 * @module features/playlist/services
 */

import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';
import type { Playlist } from '@shared/types/track';
import type { PlaylistFormData } from '../types';

const logger = createLogger('playlist-service');

/**
 * Lấy danh sách playlist của user.
 *
 * @returns Danh sách playlist
 */
export async function getPlaylists(): Promise<Playlist[]> {
  logger.info('Tải danh sách playlist');
  const response = await apiClient.get<Playlist[]>(API_ENDPOINTS.PLAYLISTS);
  logger.info('Tải playlist thành công', { total: response.data.length });
  return response.data;
}

/**
 * Lấy chi tiết playlist (bao gồm danh sách tracks).
 *
 * @param id - ID playlist
 * @returns Chi tiết playlist
 */
export async function getPlaylistDetail(id: string): Promise<Playlist> {
  logger.info('Tải chi tiết playlist', { playlistId: id });
  const response = await apiClient.get<Playlist>(API_ENDPOINTS.PLAYLIST_DETAIL(id));
  return response.data;
}

/**
 * Tạo playlist mới.
 *
 * @param data - Dữ liệu playlist
 * @returns Playlist vừa tạo
 */
export async function createPlaylist(data: PlaylistFormData): Promise<Playlist> {
  logger.info('Tạo playlist mới', { title: data.title });
  const response = await apiClient.post<Playlist>(API_ENDPOINTS.PLAYLISTS, data);
  logger.info('Tạo playlist thành công', { playlistId: response.data.id });
  return response.data;
}

/**
 * Thêm bài hát vào playlist.
 *
 * @param playlistId - ID playlist
 * @param trackId - ID bài hát cần thêm
 */
export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
  logger.info('Thêm bài vào playlist', { playlistId, trackId });
  await apiClient.post(API_ENDPOINTS.PLAYLIST_TRACKS(playlistId), { trackId });
}

/**
 * Xoá bài hát khỏi playlist.
 *
 * @param playlistId - ID playlist
 * @param trackId - ID bài hát cần xoá
 */
export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
  logger.info('Xoá bài khỏi playlist', { playlistId, trackId });
  await apiClient.delete(`${API_ENDPOINTS.PLAYLIST_TRACKS(playlistId)}/${trackId}`);
}
