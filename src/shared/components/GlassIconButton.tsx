/**
 * @file GlassIconButton.tsx
 * @description Nút tròn kiểu glass morphism — nhận bất kỳ icon nào làm children.
 * Cùng ngôn ngữ thiết kế với GlassPlayButton: nền trắng mờ + viền trắng mờ.
 *
 * Dùng ở: header icon buttons (Bell, Search, ...), toolbar actions, v.v.
 *
 * @module shared/components
 */

import { Pressable, type ViewStyle } from 'react-native'
import type { ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GlassIconButtonProps {
  /** Icon hoặc bất kỳ ReactNode nào đặt bên trong nút */
  children: ReactNode
  /** Callback khi nhấn */
  onPress?: () => void
  /** Kích thước nút (mặc định: 40) */
  size?: number
  /** hitSlop mở rộng vùng chạm (mặc định: 8) */
  hitSlop?: number
  /** Style bổ sung */
  style?: ViewStyle
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GlassIconButton — nút tròn glass morphism nhận icon tùy ý.
 *
 * @example
 * <GlassIconButton onPress={handleBell}>
 *   <Bell size={20} color={COLORS.textSecondary} />
 * </GlassIconButton>
 *
 * @example
 * // Kích thước lớn hơn
 * <GlassIconButton size={48} onPress={handleSearch}>
 *   <Search size={22} color='#fff' />
 * </GlassIconButton>
 */
export function GlassIconButton({ children, onPress, size = 40, hitSlop = 8, style }: GlassIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  )
}
