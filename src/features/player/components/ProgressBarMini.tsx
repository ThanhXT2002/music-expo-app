/**
 * @file ProgressBarMini.tsx
 * @description Thanh progress bar mỏng 2-3px, tái sử dụng cho player header.
 * @module features/player/components
 */

import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@shared/constants/colors'
import React from 'react'

interface ProgressBarMiniProps {
  /** Phần trăm tiến trình (0-100) */
  progress: number
  /** Chiều cao thanh bar (mặc định 2.5) */
  height?: number
}

/**
 * Thanh tiến trình thu gọn (Mini Progress Bar)
 */
export function ProgressBarMini({ progress, height = 2.5 }: ProgressBarMiniProps) {
  // Đảm bảo progress trong khoảng 0-100
  const safeProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.progressWrapper, { width: `${safeProgress}%` }]}>
        <LinearGradient
          colors={[COLORS.primary, '#6C5CE7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  progressWrapper: {
    height: '100%'
  },
  gradient: {
    flex: 1
  }
})
