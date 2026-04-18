/**
 * @file spacing.ts
 * @description Hệ thống khoảng cách chuẩn (spacing scale) cho toàn ứng dụng.
 * Dựa trên bộ đơn vị 4px — đảm bảo layout đều đặn và nhất quán.
 * @module shared/constants
 */

/**
 * Spacing scale — bội số 4px.
 * Giá trị tính bằng pixel, dùng trực tiếp trong style.
 *
 * @example
 * style={{ padding: SPACING.md, marginBottom: SPACING.lg }}
 */
export const SPACING = {
  /** 0px — không khoảng cách */
  none: 0,
  /** 2px — khoảng rất nhỏ */
  xxs: 2,
  /** 4px — khoảng cực nhỏ */
  xs: 4,
  /** 8px — khoảng nhỏ */
  sm: 8,
  /** 12px — khoảng vừa nhỏ */
  md: 12,
  /** 16px — khoảng vừa — mặc định cho padding */
  lg: 16,
  /** 20px — khoảng vừa lớn */
  xl: 20,
  /** 24px — khoảng lớn */
  '2xl': 24,
  /** 32px — khoảng rất lớn */
  '3xl': 32,
  /** 40px — khoảng cực lớn */
  '4xl': 40,
  /** 48px — khoảng khổng lồ */
  '5xl': 48,
  /** 64px — khoảng đặc biệt */
  '6xl': 64,
} as const;

/**
 * Border radius chuẩn.
 */
export const RADIUS = {
  /** 0px — không bo */
  none: 0,
  /** 4px — bo nhẹ */
  sm: 4,
  /** 8px — bo vừa */
  md: 8,
  /** 12px — bo lớn */
  lg: 12,
  /** 16px — bo rất lớn */
  xl: 16,
  /** 24px — bo cực lớn */
  '2xl': 24,
  /** Bo tròn hoàn toàn */
  full: 9999,
} as const;

/**
 * Font sizes chuẩn.
 */
export const FONT_SIZE = {
  /** 10px — caption nhỏ */
  xs: 10,
  /** 12px — caption */
  sm: 12,
  /** 14px — body nhỏ */
  md: 14,
  /** 16px — body mặc định */
  lg: 16,
  /** 18px — subtitle */
  xl: 18,
  /** 20px — heading nhỏ */
  '2xl': 20,
  /** 24px — heading */
  '3xl': 24,
  /** 32px — heading lớn */
  '4xl': 32,
  /** 40px — display */
  '5xl': 40,
} as const;
