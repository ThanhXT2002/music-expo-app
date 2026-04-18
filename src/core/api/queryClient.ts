/**
 * @file queryClient.ts
 * @description Cấu hình TanStack Query (React Query) cho toàn dự án.
 * Quản lý cache, retry, stale time và global error handling.
 * @module core/api
 */

import { QueryClient } from '@tanstack/react-query';
import { createLogger } from '@core/logger';

const logger = createLogger('query-client');

/**
 * QueryClient singleton — dùng chung cho toàn app.
 * Cấu hình mặc định tối ưu cho ứng dụng nghe nhạc:
 * - staleTime 5 phút: dữ liệu playlist/track ít thay đổi
 * - retry 2 lần: đủ để xử lý mất mạng tạm thời
 * - gcTime 30 phút: giữ cache đủ lâu cho offline browsing
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Dữ liệu được coi là "tươi" trong 5 phút — không refetch lại */
      staleTime: 5 * 60 * 1000,
      /** Giữ cache 30 phút sau khi component unmount */
      gcTime: 30 * 60 * 1000,
      /** Retry tối đa 2 lần khi request thất bại */
      retry: 2,
      /** Không refetch khi quay lại app từ background */
      refetchOnReconnect: false,
    },
    mutations: {
      /** Callback xử lý lỗi toàn cục cho mutations */
      onError: (error) => {
        logger.error('Mutation thất bại', { error });
      },
    },
  },
});
