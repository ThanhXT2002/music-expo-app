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
/**
 * Promise dùng chung để dedup request — đảm bảo chỉ 1 HTTP call dù TanStack Query
 * quyết định gọi queryFn bao nhiêu lần trong cùng 1 session.
 * Reset khi user pull-to-refresh (invalidateQueries).
 */
let _topSongsRequest: Promise<HomeFeed> | null = null;

export function useHome() {
  const query = useQuery({
    queryKey: ['home', 'feed'],
    queryFn: async () => {
      logger.info('Tải dữ liệu trang chủ');
      if (!_topSongsRequest) {
        _topSongsRequest = apiClient
          .get<HomeFeed>(API_ENDPOINTS.YTM_TOP_SONGS)
          .then(r => r.data)
          .catch(err => {
            _topSongsRequest = null; // reset để cho phép retry khi lỗi
            throw err;
          });
      }
      return await _topSongsRequest;
    },
    // Không refetch khi focus lại app
    refetchOnWindowFocus: false,
    // Không refetch khi kết nối lại mạng
    refetchOnReconnect: false,
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
