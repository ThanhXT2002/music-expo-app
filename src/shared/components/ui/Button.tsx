/**
 * @file Button.tsx
 * @description Component nút bấm cơ bản — hỗ trợ nhiều variant và size.
 * Atomic component dùng xuyên suốt toàn ứng dụng.
 * @module shared/components/ui
 */

import { Pressable, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { COLORS } from '@shared/constants/colors'
import { RADIUS, SPACING, FONT_SIZE } from '@shared/constants/spacing'

/**
 * Props của Button.
 */
interface ButtonProps {
  /** Nội dung hiển thị trên nút */
  title: string
  /** Hàm xử lý khi nhấn nút */
  onPress: () => void
  /** Kiểu hiển thị: filled (mặc định), outline, ghost */
  variant?: 'filled' | 'outline' | 'ghost'
  /** Kích thước: sm, md (mặc định), lg */
  size?: 'sm' | 'md' | 'lg'
  /** Vô hiệu hoá nút */
  disabled?: boolean
  /** Hiển thị loading spinner thay vì text */
  loading?: boolean
  /** Style bổ sung */
  style?: any
}

/**
 * Nút bấm cơ bản với nhiều variant.
 * Sử dụng StyleSheet để styling mượt mà và tránh lỗi cache của NativeWind.
 */
export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  style
}: ButtonProps) {
  const getContainerStyle = (pressed: boolean) => {
    return StyleSheet.flatten([
      styles.base,
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd,
      variant === 'filled' ? styles.filled : variant === 'outline' ? styles.outline : styles.ghost,
      pressed && variant === 'filled' ? styles.filledPressed : null,
      pressed && variant === 'outline' ? styles.outlinePressed : null,
      pressed && variant === 'ghost' ? styles.ghostPressed : null,
      (disabled || loading) ? styles.disabled : null,
      style
    ])
  }

  const getTextStyle = () => {
    return StyleSheet.flatten([
      styles.textBase,
      size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd,
      variant === 'filled' ? styles.textFilled : styles.textOutline
    ])
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => getContainerStyle(pressed)}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? '#EAEAEA' : COLORS.primary} />
      ) : (
        <Text style={getTextStyle()}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
  },
  sizeSm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  sizeMd: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
  },
  sizeLg: {
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  filled: {
    backgroundColor: COLORS.primary, // '#6C63FF'
  },
  filledPressed: {
    backgroundColor: '#4A42D4',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlinePressed: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: FONT_SIZE.xs,
  },
  textMd: {
    fontSize: FONT_SIZE.md,
  },
  textLg: {
    fontSize: FONT_SIZE.lg,
  },
  textFilled: {
    color: '#EAEAEA',
  },
  textOutline: {
    color: COLORS.primary,
  }
})
