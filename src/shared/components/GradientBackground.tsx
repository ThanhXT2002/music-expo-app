/**
 * @file GradientBackground.tsx
 * @description Nền gradient tối xuyên suốt ứng dụng — dùng cho các page full-screen.
 * Gradient: Deep purple → Indigo → Dark blue (Mood Beat theme).
 * @module shared/components
 */

import React from 'react'
import { StyleSheet, type ViewStyle, type ColorValue } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const DEFAULT_COLORS: [string, string, string] = ['#0F0C29', '#1a1240', '#120d20']

interface GradientBackgroundProps {
  /** Component con */
  children: React.ReactNode
  /** Style bổ sung */
  style?: ViewStyle
  /** Mảng màu gradient tuỳ chỉnh */
  colors?: readonly [string, string, ...string[]]
}

/**
 * GradientBackground — nền gradient dark neon cho toàn trang.
 *
 * @example
 * <GradientBackground>
 *   <Text>Nội dung trang</Text>
 * </GradientBackground>
 */
export function GradientBackground({ children, style, colors = DEFAULT_COLORS }: GradientBackgroundProps) {
  return (
    <LinearGradient colors={colors} style={[styles.gradient, style]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }}>
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  }
})
