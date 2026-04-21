/**
 * @file PlayButton.tsx
 * @description Nút play tròn với gradient + glow effect.
 * Dùng ở home cards, album detail, playlist detail.
 * @module shared/components
 */

import { Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Play, Pause } from 'lucide-react-native'
import { SHADOWS } from '@shared/constants/spacing'

interface PlayButtonProps {
  /** Đang phát hay dừng */
  isPlaying?: boolean
  /** Callback khi nhấn */
  onPress: () => void
  /** Kích thước: sm(36), md(48), lg(64) */
  size?: 'sm' | 'md' | 'lg'
  /** Style bổ sung */
  style?: ViewStyle
}

const SIZES = {
  sm: { button: 36, icon: 16 },
  md: { button: 48, icon: 20 },
  lg: { button: 64, icon: 28 }
}

/**
 * PlayButton — nút play/pause tròn với gradient neon và glow shadow.
 */
export function PlayButton({ isPlaying = false, onPress, size = 'md', style }: PlayButtonProps) {
  const dims = SIZES[size]
  const IconComponent = isPlaying ? Pause : Play

  return (
    <Pressable onPress={onPress} style={[styles.wrapper, SHADOWS.purpleGlow, style]} hitSlop={8}>
      <LinearGradient
        colors={['#B026FF', '#6C5CE7', '#872CA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            width: dims.button,
            height: dims.button,
            borderRadius: dims.button / 2
          }
        ]}
      >
        <IconComponent size={dims.icon} color='#FFFFFF' fill='#FFFFFF' strokeWidth={0} />
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 999
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
