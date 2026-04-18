/**
 * @file colors.ts
 * @description Bảng màu ứng dụng — Dark Mode mặc định.
 * Tập trung quản lý màu sắc để đảm bảo nhất quán toàn app.
 * @module shared/constants
 */

/**
 * Bảng màu chính của ứng dụng.
 * Thiết kế tối ưu cho Dark Mode, lấy cảm hứng từ Spotify/Apple Music.
 */
export const COLORS = {
  // --- Background ---
  /** Nền chính — đen tuyệt đối */
  background: '#0A0A0A',
  /** Nền phụ — xám rất đậm cho card/section */
  backgroundSecondary: '#1A1A2E',
  /** Nền nâng cao — cho bottom sheet, modal */
  backgroundElevated: '#16213E',
  /** Nền surface — cho input, search bar */
  surface: '#1E1E2E',

  // --- Text ---
  /** Chữ chính — trắng sáng */
  textPrimary: '#EAEAEA',
  /** Chữ phụ — xám nhạt */
  textSecondary: '#A0A0A0',
  /** Chữ mờ — hint, placeholder */
  textMuted: '#6B6B6B',

  // --- Accent / Brand ---
  /** Màu chủ đạo — tím xanh gradient */
  primary: '#6C63FF',
  /** Màu chủ đạo nhạt */
  primaryLight: '#8B83FF',
  /** Màu chủ đạo đậm */
  primaryDark: '#4A42D4',
  /** Màu phụ — hồng neon */
  secondary: '#FF6B9D',
  /** Màu nhấn thứ 3 — xanh mint */
  accent: '#00D4AA',

  // --- Status ---
  /** Thành công */
  success: '#4CAF50',
  /** Cảnh báo */
  warning: '#FF9800',
  /** Lỗi */
  error: '#F44336',
  /** Thông tin */
  info: '#2196F3',

  // --- Border ---
  /** Viền mặc định */
  border: '#2A2A3E',
  /** Viền khi focus */
  borderFocus: '#6C63FF',

  // --- Overlay ---
  /** Nền mờ cho modal/overlay */
  overlay: 'rgba(0, 0, 0, 0.6)',

  // --- Skeleton ---
  /** Nền loading skeleton */
  skeleton: '#2A2A3E',
  /** Hiệu ứng shimmer loading */
  skeletonHighlight: '#3A3A4E',
} as const;

/** Type-safe color key */
export type ColorKey = keyof typeof COLORS;
