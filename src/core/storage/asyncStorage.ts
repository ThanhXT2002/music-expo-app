/**
 * @file asyncStorage.ts
 * @description Wrapper cho AsyncStorage — lưu trữ preferences, cache và dữ liệu không nhạy cảm.
 * Dữ liệu lưu dạng key-value, tự động serialize/deserialize JSON.
 * @module core/storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '@core/logger';

const logger = createLogger('async-storage');

/**
 * Lưu object vào AsyncStorage (tự động JSON.stringify).
 *
 * @param key - Key lưu trữ
 * @param value - Object cần lưu
 */
export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    logger.debug('Lưu item thành công', { key });
  } catch (error) {
    logger.error('Không thể lưu item', { key, error });
    throw error;
  }
}

/**
 * Đọc object từ AsyncStorage (tự động JSON.parse).
 *
 * @param key - Key cần đọc
 * @returns Object đã parse hoặc null nếu không tồn tại
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      logger.debug('Không tìm thấy item', { key });
      return null;
    }
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    logger.error('Không thể đọc item', { key, error });
    return null;
  }
}

/**
 * Xoá một item khỏi AsyncStorage.
 *
 * @param key - Key cần xoá
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    logger.debug('Xoá item thành công', { key });
  } catch (error) {
    logger.error('Không thể xoá item', { key, error });
  }
}

/**
 * Xoá toàn bộ dữ liệu AsyncStorage — dùng khi cần reset app.
 */
export async function clearAll(): Promise<void> {
  logger.info('Xoá toàn bộ AsyncStorage');
  try {
    await AsyncStorage.clear();
    logger.info('Xoá AsyncStorage thành công');
  } catch (error) {
    logger.error('Không thể xoá AsyncStorage', error);
  }
}
