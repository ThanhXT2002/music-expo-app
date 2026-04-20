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
  const query = useQuery<Track[]>({
    queryKey: ['library', 'tracks'],
    queryFn: async (): Promise<Track[]> => {
      logger.info('API Thư viện tạm thời bị vô hiệu hoá');
      // Trả về mảng rỗng để không bị báo lỗi 404 cho tính năng đang phát triển
      return [];
    },
  });

  return {
    tracks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
