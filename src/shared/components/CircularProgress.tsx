/**
 * @file CircularProgress.tsx
 * @description Vòng tròn SVG hiển thị progress — border quanh thumbnail.
 *
 * Dùng cho Mini Player collapsed state: progress chạy quanh thumbnail bài hát.
 *
 * @module shared/components
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Reanimated, {
  useAnimatedProps,
  useDerivedValue
} from 'react-native-reanimated'

const AnimatedCircle = Reanimated.createAnimatedComponent(Circle)

// ─── Props ───────────────────────────────────────────────────────────────────

interface CircularProgressProps {
  /** Đường kính vòng tròn (px) */
  size: number
  /** Tiến trình: 0 → 1 */
  progress: number
  /** Độ dày đường viền progress (mặc định 3) */
  strokeWidth?: number
  /** Màu progress (mặc định primary purple) */
  progressColor?: string
  /** Màu nền track (mặc định semi-transparent) */
  trackColor?: string
  /** Nội dung bên trong (thumbnail) */
  children?: React.ReactNode
}

/**
 * Vòng tròn progress dạng SVG.
 * Progress chạy theo chiều kim đồng hồ, bắt đầu từ 12h (top center).
 */
export function CircularProgress({
  size,
  progress,
  strokeWidth = 3,
  progressColor = '#B026FF',
  trackColor = 'rgba(255, 255, 255, 0.1)',
  children
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Tính strokeDashoffset dựa trên progress
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const strokeDashoffset = circumference * (1 - clampedProgress)

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Track nền */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill='transparent'
        />

        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Nội dung bên trong (thumbnail) */}
      {children && (
        <View style={[styles.content, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
          {children}
        </View>
      )}
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  svg: {
    position: 'absolute'
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    overflow: 'hidden'
  }
})
