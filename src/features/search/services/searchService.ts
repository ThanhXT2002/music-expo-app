/**
 * @file searchService.ts
 * @description Service giao tiếp với API tìm kiếm.
 * @module features/search/services
 */

import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';
import type { SearchResult } from '../types';

const logger = createLogger('search-service');

/**
 * Tìm kiếm tổng hợp — trả về tracks, albums, artists khớp với từ khoá.
 *
 * @param query - Từ khoá tìm kiếm
 * @returns Kết quả tìm kiếm tổng hợp
 */
export async function searchAll(query: string): Promise<SearchResult> {
  logger.info('Tìm kiếm', { query });
  try {
    const response = await apiClient.get<SearchResult>(`${API_ENDPOINTS.YTM_SEARCH}?q=${encodeURIComponent(query)}`);
    logger.info('Tìm kiếm thành công', {
      query,
      tracks: response.data.tracks.length,
      albums: response.data.albums.length,
      artists: response.data.artists.length,
    });
    return response.data;
  } catch (error) {
    logger.error('Tìm kiếm thất bại', { query, error });
    throw error;
  }
}
