/**
 * @file Badge.tsx
 * @description Component huy hiệu nhỏ — dùng để hiển thị trạng thái, số lượng.
 * @module shared/components/ui
 */

import { View, Text } from 'react-native'

/**
 * Props của Badge.
 */
interface BadgeProps {
  /** Nội dung hiển thị */
  label: string
  /** Màu nền: primary, success, warning, error */
  color?: 'primary' | 'success' | 'warning' | 'error'
  /** Class Tailwind bổ sung */
  className?: string
}

/** Map màu badge */
const COLOR_MAP = {
  primary: 'bg-[#6C63FF]/20 text-[#8B83FF]',
  success: 'bg-[#4CAF50]/20 text-[#4CAF50]',
  warning: 'bg-[#FF9800]/20 text-[#FF9800]',
  error: 'bg-[#F44336]/20 text-[#F44336]'
}

/**
 * Badge — huy hiệu nhỏ hiển thị trạng thái hoặc nhãn.
 *
 * @example
 * <Badge label="Premium" color="primary" />
 * <Badge label="Offline" color="success" />
 */
export function Badge({ label, color = 'primary', className = '' }: BadgeProps) {
  const colorStyle = COLOR_MAP[color]

  return (
    <View className={`rounded-full px-2.5 py-1 ${colorStyle.split(' ')[0]} ${className}`}>
      <Text className={`text-xs font-semibold ${colorStyle.split(' ').slice(1).join(' ')}`}>{label}</Text>
    </View>
  )
}
