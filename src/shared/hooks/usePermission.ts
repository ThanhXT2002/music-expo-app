/**
 * @file usePermission.ts
 * @description Hook xin quyền từ người dùng (notification, microphone, v.v.).
 * Cung cấp API thống nhất cho việc kiểm tra và request permissions.
 * @module shared/hooks
 */

import { useCallback, useEffect, useState } from 'react'
import { createLogger } from '@core/logger'

const logger = createLogger('use-permission')

/** Trạng thái quyền */
type PermissionStatus = 'undetermined' | 'granted' | 'denied'

/**
 * Giá trị trả về của hook usePermission.
 */
interface UsePermissionReturn {
  /** Trạng thái quyền hiện tại */
  status: PermissionStatus
  /** true nếu đang loading */
  isLoading: boolean
  /** Hàm xin quyền từ người dùng */
  request: () => Promise<boolean>
}

/**
 * Hook quản lý permission cho một tính năng cụ thể.
 * Tự động kiểm tra trạng thái quyền khi mount.
 *
 * @param checkFn - Hàm kiểm tra trạng thái quyền hiện tại
 * @param requestFn - Hàm xin quyền từ người dùng
 * @returns Trạng thái và hàm request permission
 *
 * @example
 * const { status, request } = usePermission(
 *   Notifications.getPermissionsAsync,
 *   Notifications.requestPermissionsAsync,
 * );
 */
export function usePermission(
  checkFn: () => Promise<{ status: string }>,
  requestFn: () => Promise<{ status: string }>
): UsePermissionReturn {
  const [status, setStatus] = useState<PermissionStatus>('undetermined')
  const [isLoading, setIsLoading] = useState(true)

  // Kiểm tra quyền khi hook mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await checkFn()
        setStatus(result.status as PermissionStatus)
        logger.debug('Kiểm tra permission', { status: result.status })
      } catch (error) {
        logger.error('Lỗi kiểm tra permission', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const request = useCallback(async (): Promise<boolean> => {
    logger.info('Xin quyền từ người dùng')
    try {
      const result = await requestFn()
      const granted = result.status === 'granted'
      setStatus(result.status as PermissionStatus)
      logger.info('Kết quả xin quyền', { granted, status: result.status })
      return granted
    } catch (error) {
      logger.error('Lỗi xin quyền', error)
      return false
    }
  }, [requestFn])

  return { status, isLoading, request }
}
