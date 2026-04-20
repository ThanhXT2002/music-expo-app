/**
 * @file spacing.ts
 * @description Design tokens — spacing, border radius, typography.
 * Tập trung quản lý kích thước để đảm bảo nhất quán toàn app.
 * @module shared/constants
 */

/** Spacing scale (px) */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/** Border radius tokens */
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

/** Font size tokens */
export const FONT_SIZE = {
  /** Caption / Helper text */
  xs: 11,
  /** Small labels */
  sm: 13,
  /** Body text */
  md: 14,
  /** Subtitles */
  lg: 16,
  /** Section titles */
  xl: 18,
  /** Page titles */
  '2xl': 22,
  /** Hero titles */
  '3xl': 28,
  /** Display */
  '4xl': 34,
} as const;

/** Consistent shadow for glass/glow effects */
export const SHADOWS = {
  /** Purple neon glow — dùng cho buttons, cards nổi bật */
  purpleGlow: {
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  /** Soft card shadow */
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  /** Ambient blur glow — player background */
  ambient: {
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
} as const;

/** Tab bar & layout constants */
export const LAYOUT = {
  /** Chiều cao bottom tab bar pill */
  tabBarHeight: 64,
  /** Padding bottom cho content khi có tab bar */
  tabBarOffset: 100,
  /** Padding bottom cho content khi có MiniPlayer + tab bar */
  miniPlayerOffset: 160,
} as const;
