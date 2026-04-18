/**
 * @file user.ts
 * @description Kiểu dữ liệu cho người dùng và phiên đăng nhập.
 * @module shared/types
 */

/**
 * Thông tin người dùng.
 */
export interface User {
  /** ID duy nhất */
  id: string;
  /** Tên hiển thị */
  displayName: string;
  /** Email */
  email: string;
  /** URL ảnh đại diện */
  avatarUrl?: string;
  /** Gói đăng ký: free hoặc premium */
  subscription: 'free' | 'premium';
  /** Ngày tạo tài khoản */
  createdAt: string;
}

/**
 * Thông tin phiên đăng nhập.
 */
export interface AuthSession {
  /** Access token (JWT) */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Thời gian hết hạn access token (ISO string) */
  expiresAt: string;
  /** Thông tin user */
  user: User;
}
