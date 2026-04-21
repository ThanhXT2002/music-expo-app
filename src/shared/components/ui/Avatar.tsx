/**
 * @file Avatar.tsx
 * @description Component hiển thị ảnh đại diện (avatar) với fallback tên viết tắt.
 * @module shared/components/ui
 */

import { View, Text } from 'react-native'

import { Image } from 'expo-image'

/**
 * Props của Avatar.
 */
interface AvatarProps {
  /** URL ảnh đại diện */
  imageUrl?: string
  /** Tên hiển thị — dùng lấy chữ cái đầu khi không có ảnh */
  name: string
  /** Kích thước: sm (32), md (40), lg (56), xl (80) */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Class Tailwind bổ sung */
  className?: string
}

/** Map size sang kích thước pixel */
const SIZE_MAP = {
  sm: { container: 'h-8 w-8', text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-14 w-14', text: 'text-lg' },
  xl: { container: 'h-20 w-20', text: 'text-2xl' }
}

/**
 * Avatar — hiển thị ảnh đại diện hoặc chữ cái đầu tên khi không có ảnh.
 *
 * @example
 * <Avatar imageUrl="https://..." name="Sơn Tùng MTP" size="lg" />
 * <Avatar name="ST" size="sm" /> // Hiển thị "ST" trên nền gradient
 */
export function Avatar({ imageUrl, name, size = 'md', className = '' }: AvatarProps) {
  const sizeStyles = SIZE_MAP[size]

  // Lấy 1–2 ký tự đầu tiên của tên để làm fallback
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        className={`rounded-full ${sizeStyles.container} ${className}`}
        contentFit='cover'
        transition={200}
      />
    )
  }

  return (
    <View className={`items-center justify-center rounded-full bg-[#6C63FF] ${sizeStyles.container} ${className}`}>
      <Text className={`font-bold text-white ${sizeStyles.text}`}>{initials}</Text>
    </View>
  )
}
