/**
 * @file queryClient.ts
 * @description Cấu hình TanStack Query (React Query) cho toàn dự án.
 * Quản lý cache, retry, stale time và global error handling.
 * @module core/api
 */

import { QueryClient } from '@tanstack/react-query'
import { createLogger } from '@core/logger'

const logger = createLogger('query-client')

/**
 * QueryClient singleton — dùng chung cho toàn app.
 * Cấu hình mặc định tối ưu cho ứng dụng nghe nhạc:
 * - staleTime Infinity: một khi đã fetch thành công, không bao giờ tự refetch ngầm
 * - gcTime 30 phút: giữ cache đủ lâu cho offline browsing
 * - retry 1 lần: đủ để xử lý mất mạng tạm thời
 * - refetchOnMount: 'always' là default nhưng staleTime Infinity sẽ ngăn refetch
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Infinity = data không bao giờ bị coi là "stale" tự động.
       * Kết hợp với refetchOnMount mặc định: nếu data đã có trong cache
       * và chưa stale → sẽ KHÔNG refetch dù component mount lại bao nhiêu lần.
       * User muốn data mới → dùng pull-to-refresh (refetch thủ công).
       */
      staleTime: Infinity,
      /** Giữ cache 30 phút sau khi component unmount */
      gcTime: 30 * 60 * 1000,
      /** Retry 1 lần khi request thất bại */
      retry: 1,
      /** Không refetch khi app được focus lại */
      refetchOnWindowFocus: false,
      /** Không refetch khi kết nối lại mạng */
      refetchOnReconnect: false
    },
    mutations: {
      /** Callback xử lý lỗi toàn cục cho mutations */
      onError: (error) => {
        logger.error('Mutation thất bại', { error })
      }
    }
  }
})
