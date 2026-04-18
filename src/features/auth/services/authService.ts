/**
 * @file authService.ts
 * @description Service giao tiếp với API xác thực.
 * Token được lưu vào secureStorage — Axios interceptor tự đọc mỗi request.
 * Không cần setAuthToken thủ công nữa.
 * @module features/auth/services
 */

import { apiClient } from '@core/api/apiClient';
import { API_ENDPOINTS } from '@core/api/endpoints';
import { createLogger } from '@core/logger';
import * as secureStorage from '@core/storage/secureStorage';
import type { AuthSession } from '@shared/types/user';
import type { LoginFormData, RegisterFormData } from '../types';

const logger = createLogger('auth-service');

/**
 * Lưu tokens vào secureStorage sau khi đăng nhập / đăng ký.
 * Axios interceptor sẽ tự đọc ACCESS_TOKEN khi gửi request tiếp theo.
 *
 * @param session - Phiên đăng nhập từ API
 */
async function persistSession(session: AuthSession): Promise<void> {
  await secureStorage.setSecureItem(secureStorage.SECURE_KEYS.ACCESS_TOKEN, session.accessToken);
  await secureStorage.setSecureItem(secureStorage.SECURE_KEYS.REFRESH_TOKEN, session.refreshToken);
  await secureStorage.setSecureItem(secureStorage.SECURE_KEYS.USER_ID, session.user.id);
}

/**
 * Đăng nhập bằng email và mật khẩu.
 *
 * @param data - Email và mật khẩu
 * @returns Phiên đăng nhập (token + user info)
 * @throws {AppError} Khi thông tin đăng nhập sai hoặc server lỗi
 */
export async function login(data: LoginFormData): Promise<AuthSession> {
  logger.info('Đăng nhập', { email: data.email });
  try {
    const response = await apiClient.post<AuthSession>(API_ENDPOINTS.AUTH_GOOGLE, data);
    const session = response.data;
    await persistSession(session);
    logger.info('Đăng nhập thành công', { userId: session.user.id });
    return session;
  } catch (error) {
    logger.error('Đăng nhập thất bại', { email: data.email, error });
    throw error;
  }
}

/**
 * Đăng ký tài khoản mới.
 * Tự động đăng nhập sau khi đăng ký thành công.
 *
 * @param data - Thông tin đăng ký
 * @returns Phiên đăng nhập
 */
export async function register(data: RegisterFormData): Promise<AuthSession> {
  logger.info('Đăng ký tài khoản', { email: data.email });
  try {
    const response = await apiClient.post<AuthSession>(API_ENDPOINTS.AUTH_GOOGLE, {
      displayName: data.displayName,
      email: data.email,
      password: data.password,
    });
    const session = response.data;
    await persistSession(session);
    logger.info('Đăng ký thành công', { userId: session.user.id });
    return session;
  } catch (error) {
    logger.error('Đăng ký thất bại', { email: data.email, error });
    throw error;
  }
}

/**
 * Đăng xuất — gọi API rồi xoá toàn bộ session local.
 * Lỗi server không làm gián đoạn — vẫn xoá session local.
 */
export async function logout(): Promise<void> {
  logger.info('Đăng xuất');
  try {
    await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
  } catch {
    // Vẫn đăng xuất local dù server lỗi
    logger.warn('Gọi API logout thất bại — vẫn xoá session local');
  }
  await secureStorage.clearSecureStorage();
  logger.info('Đăng xuất hoàn tất');
}

/**
 * Khôi phục session từ secureStorage khi mở lại app.
 * Nếu token còn hợp lệ → trả về user info.
 * Nếu không → xoá storage và trả về null.
 *
 * @returns AuthSession nếu còn hợp lệ, null nếu cần đăng nhập lại
 */
export async function restoreSession(): Promise<AuthSession | null> {
  logger.info('Khôi phục session');
  const token = await secureStorage.getSecureItem(secureStorage.SECURE_KEYS.ACCESS_TOKEN);

  if (!token) {
    logger.debug('Không có token — cần đăng nhập');
    return null;
  }

  try {
    // Axios interceptor tự attach token từ secureStorage
    const response = await apiClient.get<AuthSession['user']>(API_ENDPOINTS.USER_PROFILE);
    const refreshToken = await secureStorage.getSecureItem(secureStorage.SECURE_KEYS.REFRESH_TOKEN);

    logger.info('Khôi phục session thành công', { userId: response.data.id });
    return {
      accessToken: token,
      refreshToken: refreshToken ?? '',
      expiresAt: '',
      user: response.data,
    };
  } catch (error) {
    logger.warn('Token không hợp lệ — xoá session', error);
    await secureStorage.clearSecureStorage();
    return null;
  }
}
