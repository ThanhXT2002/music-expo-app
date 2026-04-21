/**
 * @file secureStorage.ts
 * @description Wrapper cho expo-secure-store — lưu trữ dữ liệu nhạy cảm (token, credentials).
 * Dữ liệu được mã hoá bởi hệ điều hành (Keychain trên iOS, Keystore trên Android).
 * @module core/storage
 */

import * as SecureStore from 'expo-secure-store'
import { createLogger } from '@core/logger'

const logger = createLogger('secure-storage')

/**
 * Các key lưu trữ an toàn trong ứng dụng.
 */
export const SECURE_KEYS = {
  /** JWT access token */
  ACCESS_TOKEN: 'access_token',
  /** JWT refresh token */
  REFRESH_TOKEN: 'refresh_token',
  /** ID user đang đăng nhập */
  USER_ID: 'user_id'
} as const

/**
 * Lưu giá trị vào secure storage.
 *
 * @param key - Key lưu trữ
 * @param value - Giá trị cần lưu (chuỗi)
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value)
    logger.debug('Lưu secure item thành công', { key })
  } catch (error) {
    logger.error('Không thể lưu secure item', { key, error })
    throw error
  }
}

/**
 * Đọc giá trị từ secure storage.
 *
 * @param key - Key cần đọc
 * @returns Giá trị hoặc null nếu không tồn tại
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key)
    logger.debug('Đọc secure item', { key, found: !!value })
    return value
  } catch (error) {
    logger.error('Không thể đọc secure item', { key, error })
    return null
  }
}

/**
 * Xoá giá trị khỏi secure storage.
 *
 * @param key - Key cần xoá
 */
export async function deleteSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key)
    logger.debug('Xoá secure item thành công', { key })
  } catch (error) {
    logger.error('Không thể xoá secure item', { key, error })
  }
}

/**
 * Xoá toàn bộ dữ liệu bảo mật — dùng khi đăng xuất.
 */
export async function clearSecureStorage(): Promise<void> {
  logger.info('Xoá toàn bộ secure storage')
  const keys = Object.values(SECURE_KEYS)
  await Promise.all(keys.map((key) => deleteSecureItem(key)))
  logger.info('Xoá secure storage thành công')
}
