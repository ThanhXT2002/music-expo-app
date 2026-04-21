/**
 * @file apiClient.ts
 * @description Axios HTTP client tập trung.
 *
 * Các tính năng:
 * - Tự động attach Access Token từ secureStorage
 * - Auto refresh token khi nhận 401 bằng Firebase re-auth
 * - Unwrap ApiResponse<T> → trả thẳng data (hoặc throw nếu status: false)
 * - Normalize mọi lỗi về AppError chuẩn
 *
 * @module core/api
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios'
import { createLogger } from '@core/logger'
import { getSecureItem, setSecureItem, clearSecureStorage, SECURE_KEYS } from '@core/storage/secureStorage'
import { auth } from '@shared/config/firebase'
import type { ApiResponse, AppError } from '@shared/types/api'
import { API_ENDPOINTS } from './endpoints'

const logger = createLogger('api-client')

// ─── Base URL ────────────────────────────────────────────────────────────────

/** Base URL từ biến môi trường Expo Public */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api'

// ─── Normalize lỗi ───────────────────────────────────────────────────────────

/**
 * Chuẩn hoá AxiosError thành AppError.
 * Đọc message từ ApiResponse.message nếu backend trả về đúng format.
 *
 * @param error - AxiosError gốc
 * @returns AppError đã chuẩn hoá
 */
function normalizeError(error: AxiosError): AppError {
  if (error.response) {
    // Backend đã trả về ApiResponse format
    const body = error.response.data as ApiResponse
    return {
      message: body?.message || error.message || 'Đã xảy ra lỗi',
      statusCode: error.response.status,
      code: typeof body?.code === 'string' ? body.code : String(body?.code ?? '')
    }
  }
  if (error.code === 'ECONNABORTED') {
    return { message: 'Kết nối quá thời gian chờ', statusCode: 408 }
  }
  return { message: 'Không thể kết nối đến máy chủ', statusCode: 0 }
}

// ─── Tạo Axios instance ───────────────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// ─── Request interceptor — attach Access Token ────────────────────────────────

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getSecureItem(SECURE_KEYS.ACCESS_TOKEN)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
    logger.debug('Đính kèm token vào request', { url: config.url })
  }
  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
//  1. Unwrap ApiResponse<T> — extract .data khi status: true
//  2. Throw AppError khi status: false (business error từ backend)
//  3. Auto refresh token khi nhận HTTP 401

/** Đang refresh để tránh gọi song song */
let isRefreshing = false

/** Queue các request đang chờ token mới */
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = []

/**
 * Giải phóng toàn bộ queue sau khi refresh xong.
 *
 * @param error - Lỗi nếu refresh thất bại, null nếu thành công
 * @param token - Token mới nếu thành công
 */
function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach((pending) => {
    if (error) pending.reject(error)
    else pending.resolve(token!)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  /**
   * Thành công HTTP (2xx):
   * - Nếu backend trả ApiResponse.status = false → throw AppError (business logic error)
   * - Nếu ApiResponse.status = true → trả nguyên response (caller dùng .data)
   */
  (response: AxiosResponse<ApiResponse>) => {
    const body = response.data

    // Backend trả về ApiResponse format
    if (body && typeof body.status === 'boolean' && body.status === false) {
      const businessError: AppError = {
        message: body.message ?? 'Yêu cầu thất bại',
        statusCode: body.code ?? response.status
      }
      logger.warn('Business error từ backend', { url: response.config.url, error: businessError })
      return Promise.reject(businessError) as never
    }

    logger.debug('Request thành công', {
      url: response.config.url,
      code: body?.code
    })

    return response
  },

  /**
   * Lỗi HTTP (4xx, 5xx):
   * - 401 → auto refresh token rồi retry
   * - Còn lại → normalize thành AppError
   */
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Bỏ qua auth endpoints và request đã retry
    const isAuthEndpoint =
      original.url?.includes(API_ENDPOINTS.AUTH_GOOGLE) ||
      original.url?.includes(API_ENDPOINTS.AUTH_SYNC) ||
      original.url?.includes(API_ENDPOINTS.AUTH_REFRESH) ||
      original.url?.includes(API_ENDPOINTS.AUTH_LOGOUT)

    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      logger.error('Request thất bại', { url: original?.url, status: error.response?.status })
      return Promise.reject(normalizeError(error))
    }

    // Đang refresh → queue request lại
    if (isRefreshing) {
      logger.debug('Queue request chờ token mới', { url: original.url })
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            if (original.headers) original.headers.Authorization = `Bearer ${newToken}`
            resolve(axiosInstance(original))
          },
          reject
        })
      })
    }

    original._retry = true
    isRefreshing = true
    logger.info('Token hết hạn — bắt đầu refresh qua Firebase')

    try {
      // Đợi Firebase restore session xong (đề phòng gọi api lúc app vừaa boot)
      await auth.authStateReady()

      // Dùng Firebase currentUser để lấy fresh ID token
      const firebaseUser = auth.currentUser
      if (!firebaseUser) throw new Error('Không có Firebase session — cần đăng nhập lại')

      // Force refresh Firebase token
      const freshFirebaseToken = await firebaseUser.getIdToken(true)
      logger.debug('Lấy Firebase token mới thành công')

      // Re-sync với backend để lấy JWT mới
      const { data } = await axios.post<ApiResponse<{ token: { access_token: string }; user: any }>>(
        `${BASE_URL}/auth/sync`,
        { token: freshFirebaseToken }
      )

      const newAccessToken = data.data!.token.access_token
      await setSecureItem(SECURE_KEYS.ACCESS_TOKEN, newAccessToken)

      logger.info('Refresh token thành công qua Firebase re-sync')
      processQueue(null, newAccessToken)

      if (original.headers) original.headers.Authorization = `Bearer ${newAccessToken}`
      return axiosInstance(original)
    } catch (refreshError) {
      logger.error('Refresh token thất bại — xoá session', refreshError)
      processQueue(refreshError)
      await clearSecureStorage()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Axios client đã cấu hình — dùng trong toàn bộ feature layer.
 *
 * Response sẽ có dạng `AxiosResponse<ApiResponse<T>>` — lấy data:
 *
 * @example
 * // Single item
 * const res = await apiClient.get<ApiResponse<Track>>('/tracks/1');
 * const track = res.data.data; // Track
 *
 * // Danh sách phân trang
 * const res = await apiClient.get<PaginatedApiResponse<Track>>('/tracks?page=1');
 * const { data: tracks, meta } = res.data.data!;
 */
export { axiosInstance as apiClient }

/** Re-export AppError để dùng trong feature layer */
export type { AppError }
