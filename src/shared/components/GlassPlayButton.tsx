/**
 * @file GlassPlayButton.tsx
 * @description Nút play tròn kiểu glass — nền trắng mờ + viền trắng mờ.
 * Tách ra từ MediaActionButtons để dùng độc lập ở nhiều nơi.
 *
 * Khác với PlayButton (gradient + glow), GlassPlayButton dùng glass morphism
 * phù hợp khi đặt trên ảnh bìa hoặc trong hàng ngang nhẹ nhàng hơn.
 *
 * @module shared/components
 */

import { Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { Play, Pause } from 'lucide-react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

type GlassPlayButtonVariant =
  /** Nút rỗng (chỉ viền) — dùng trong hàng ngang inline */
  | 'outline'
  /** Nút đặc (icon fill) — dùng khi đặt overlay trên ảnh */
  | 'solid'

interface GlassPlayButtonProps {
  /** Đang phát hay dừng — hiện icon Pause khi true */
  isPlaying?: boolean
  /** Kiểu hiển thị (mặc định: 'outline') */
  variant?: GlassPlayButtonVariant
  /** Kích thước nút tính bằng px (mặc định: 44) */
  size?: number
  /** Kích thước icon bên trong (mặc định: tự tính = size * 0.4) */
  iconSize?: number
  /** Callback khi nhấn */
  onPress?: () => void
  /** hitSlop mở rộng vùng chạm (mặc định: 8) */
  hitSlop?: number
  /** Style container bổ sung */
  style?: ViewStyle
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GlassPlayButton — nút play/pause tròn kiểu glass morphism.
 *
 * @example
 * // Inline trong hàng ngang (outline, icon rỗng)
 * <GlassPlayButton onPress={handlePlay} />
 *
 * @example
 * // Overlay trên ảnh bìa (solid, icon đặc, nhỏ hơn)
 * <GlassPlayButton variant='solid' size={34} style={styles.overlayBtn} />
 *
 * @example
 * // Hiện trạng thái đang phát
 * <GlassPlayButton isPlaying={isPlaying} onPress={togglePlay} size={48} />
 */
export function GlassPlayButton({
  isPlaying = false,
  variant = 'outline',
  size = 44,
  iconSize,
  onPress,
  hitSlop = 8,
  style,
}: GlassPlayButtonProps) {
  // Tự tính iconSize nếu không truyền vào — tỉ lệ 40% kích thước nút
  const iSize = iconSize ?? Math.round(size * 0.4)

  // Outline: icon rỗng (không fill) — nhẹ nhàng hơn
  // Solid: icon đặc (fill) — dễ nhìn hơn khi đặt trên ảnh
  const iconFill = variant === 'solid' ? '#fff' : undefined

  // Offset nhỏ để icon play trông cân quang học (play icon lệch trái tự nhiên)
  const iconOffset = variant === 'solid' ? 1 : 2

  const IconComponent = isPlaying ? Pause : Play

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      style={[
        styles.base,
        variant === 'solid' ? styles.solid : styles.outline,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <IconComponent
        size={iSize}
        color='#fff'
        fill={iconFill}
        style={{ marginLeft: iconOffset }}
      />
    </Pressable>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** Outline — nền mờ nhẹ + viền trắng mờ */
  outline: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  /** Solid — nền mờ đậm hơn + viền rõ hơn, dùng khi overlay trên ảnh */
  solid: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
})
