/**
 * @file useLibrary.ts
 * @description Hook tải dữ liệu thư viện nhạc của người dùng.
 * @module features/library/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@core/api/apiClient';
import { createLogger } from '@core/logger';
import type { Track } from '@shared/types/track';

const logger = createLogger('use-library');

/**
 * Hook tải danh sách bài hát trong thư viện.
 *
 * @returns Dữ liệu thư viện và trạng thái loading
 */
export function useLibrary() {
  const query = useQuery({
    queryKey: ['library', 'tracks'],
    queryFn: async () => {
      logger.info('Tải thư viện nhạc');
      const response = await apiClient.get<Track[]>('/library/tracks');
      logger.info('Tải thư viện thành công', { total: response.data.length });
      return response.data;
    },
  });

  return {
    tracks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
