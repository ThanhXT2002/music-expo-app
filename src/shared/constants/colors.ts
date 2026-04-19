/**
 * @file colors.ts
 * @description Bảng màu ứng dụng — Dark Mode mặc định.
 * Tập trung quản lý màu sắc để đảm bảo nhất quán toàn app.
 * @module shared/constants
 */

/**
 * Bảng màu chính của ứng dụng.
 * Thiết kế tối ưu cho Dark Mode, lấy cảm hứng từ Spotify.
 */
export const COLORS = {
  // --- Background ---
  /** Nền chính — đen rất sâu (deep dark) */
  background: '#080316',
  /** Nền phụ — cho bottom sheet, thiết kế màn hình nâng cao */
  backgroundSecondary: '#120d20',
  /** Nền surface (các khối nổi trên nền như Tab Bar Pill, Card) */
  surface: '#1a142c',

  // --- Text ---
  /** Chữ chính — trắng sáng */
  textPrimary: '#EAEAEA',
  /** Chữ phụ — xám nhạt */
  textSecondary: '#A0A0A0',
  /** Chữ mờ — hint, placeholder, icon inactive */
  textMuted: '#9e9e9e',

  // --- Brand / Accent ---
  /** Màu chủ đạo (Tím Neon) */
  primary: '#B026FF',
  /** Màu chủ đạo nhạt hơn khi press/hover */
  primaryLight: '#D270FF',
  /** Màu chủ đạo đậm */
  primaryDark: '#7A00CC',

  // --- Extended Palette (Từ hình ảnh thiết kế) ---
  /** Tím đậm (Deep Purple) */
  secondary: '#4B2991',
  /** Tím (Purple) */
  tertiary: '#872CA2',
  /** Đỏ tươi/Hồng sẫm (Magenta/Pink) */
  quaternary: '#C0369D',
  /** Hồng (Rose/Pink) */
  quinary: '#EA4F88',
  /** Hồng cam (Salmon Pink) */
  senary: '#FA7876',
  /** Cam đào (Peach/Orange) */
  septenary: '#F6A97A',

  // --- Status ---
  /** Thành công */
  success: '#1DB954',
  /** Cảnh báo */
  warning: '#FFB800',
  /** Lỗi */
  error: '#FF415B',
  /** Thông tin */
  info: '#2196F3',

  // --- Border ---
  /** Viền mặc định */
  border: '#2c2445',
  /** Viền khi focus */
  borderFocus: '#B026FF',

  // --- Overlay ---
  /** Nền mờ cho modal/overlay */
  overlay: 'rgba(8, 3, 22, 0.7)',

  // --- Skeleton ---
  /** Nền loading skeleton */
  skeleton: '#1a142c',
  /** Hiệu ứng shimmer loading */
  skeletonHighlight: '#2c2445'
} as const

/** Type-safe color key */
export type ColorKey = keyof typeof COLORS
