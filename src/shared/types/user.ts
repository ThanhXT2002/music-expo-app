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
  id: string
  /** Email */
  email: string
  /** Tên hiển thị */
  name: string
  /** URL ảnh đại diện */
  profile_picture?: string
  /** Phương thức đăng ký */
  signup_provider?: string
  /** Trạng thái xác thực email */
  is_verified?: boolean
}

/**
 * Thông tin phiên đăng nhập.
 */
export interface AuthSession {
  /** Access token (JWT) */
  accessToken: string
  /** Refresh token */
  refreshToken: string
  /** Thời gian hết hạn access token (ISO string) */
  expiresAt: string
  /** Thông tin user */
  user: User
}
