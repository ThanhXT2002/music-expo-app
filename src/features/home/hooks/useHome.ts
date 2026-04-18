/**
 * @file useHome.ts
 * @description Hook tải dữ liệu trang chủ từ API.
 * @module features/home/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';
import type { HomeFeed } from '../types';

const logger = createLogger('use-home');

/**
 * Hook tải dữ liệu feed trang chủ.
 * Sử dụng TanStack Query để cache và quản lý trạng thái loading/error.
 *
 * @returns Dữ liệu trang chủ, trạng thái loading/error và hàm refetch
 *
 * @example
 * const { feed, isLoading, error, refetch } = useHome();
 */
export function useHome() {
  const query = useQuery({
    queryKey: ['home', 'feed'],
    queryFn: async () => {
      logger.info('Tải dữ liệu trang chủ');
      const response = await apiClient.get<HomeFeed>(API_ENDPOINTS.YTM_TOP_SONGS);
      logger.info('Tải trang chủ thành công', {
        featuredCount: response.data.featured.length,
        recentCount: response.data.recentlyPlayed.length,
      });
      return response.data;
    },
  });

  return {
    /** Dữ liệu feed trang chủ */
    feed: query.data ?? null,
    /** Đang tải dữ liệu */
    isLoading: query.isLoading,
    /** Lỗi khi tải */
    error: query.error,
    /** Tải lại dữ liệu */
    refetch: query.refetch,
  };
}
