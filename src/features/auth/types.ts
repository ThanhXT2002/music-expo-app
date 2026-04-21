/**
 * @file types.ts
 * @description Kiểu dữ liệu riêng cho feature Auth.
 * @module features/auth
 */

/**
 * Dữ liệu form đăng nhập.
 */
export interface LoginFormData {
  /** Email */
  email: string
  /** Mật khẩu */
  password: string
}

/**
 * Dữ liệu form đăng ký.
 */
export interface RegisterFormData {
  /** Tên hiển thị */
  displayName: string
  /** Email */
  email: string
  /** Mật khẩu */
  password: string
  /** Xác nhận mật khẩu */
  confirmPassword: string
}
