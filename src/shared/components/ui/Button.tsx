/**
 * @file Button.tsx
 * @description Component nút bấm cơ bản — hỗ trợ nhiều variant và size.
 * Atomic component dùng xuyên suốt toàn ứng dụng.
 * @module shared/components/ui
 */

import { Pressable, ActivityIndicator, Text } from 'react-native'

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
  /** Class Tailwind bổ sung */
  className?: string
}

/**
 * Nút bấm cơ bản với nhiều variant.
 * Sử dụng NativeWind (Tailwind) để styling.
 *
 * @example
 * <Button title="Phát nhạc" onPress={handlePlay} variant="filled" />
 * <Button title="Huỷ" onPress={handleCancel} variant="outline" />
 */
export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}: ButtonProps) {
  // Xác định style dựa trên variant
  const variantStyles = {
    filled: 'bg-[#6C63FF] active:bg-[#4A42D4]',
    outline: 'border border-[#6C63FF] bg-transparent active:bg-[#6C63FF]/10',
    ghost: 'bg-transparent active:bg-white/5'
  }

  // Xác định style dựa trên size
  const sizeStyles = {
    sm: 'px-3 py-1.5',
    md: 'px-5 py-2.5',
    lg: 'px-7 py-3.5'
  }

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`items-center justify-center rounded-xl ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? '#EAEAEA' : '#6C63FF'} />
      ) : (
        <Text
          className={`font-semibold ${textSizeStyles[size]} ${variant === 'filled' ? 'text-[#EAEAEA]' : 'text-[#6C63FF]'}`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  )
}
