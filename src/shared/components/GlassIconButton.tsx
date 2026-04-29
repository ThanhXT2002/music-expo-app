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
import { BlurView } from 'expo-blur'
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
  /** Sử dụng BlurView thay vì background color (mặc định: false) */
  useBlur?: boolean
  /** Blur intensity khi useBlur=true (mặc định: 20) */
  blurIntensity?: number
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
 * // Kích thước lớn hơn với BlurView
 * <GlassIconButton size={44} useBlur onPress={handleBack}>
 *   <ArrowLeft size={22} color='#fff' />
 * </GlassIconButton>
 */
export function GlassIconButton({
  children,
  onPress,
  size = 40,
  hitSlop = 8,
  style,
  useBlur = false,
  blurIntensity = 20
}: GlassIconButtonProps) {
  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  }

  if (useBlur) {
    return (
      <Pressable onPress={onPress} hitSlop={hitSlop} style={[buttonStyle, style]}>
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </BlurView>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={[
        buttonStyle,
        { backgroundColor: 'rgba(255,255,255,0.1)' },
        style,
      ]}
    >
      {children}
    </Pressable>
  )
}
