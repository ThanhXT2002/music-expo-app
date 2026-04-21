/**
 * @file GlassView.tsx
 * @description Cross-platform glass effect wrapper.
 * - iOS 26+: Dùng @callstack/liquid-glass (native UIKit glass).
 * - Android/iOS cũ: Dùng expo-blur BlurView + rgba overlay (glassmorphism fallback).
 *
 * @module shared/components
 */

import React from 'react'
import { View, StyleSheet, Platform, type ViewStyle, type StyleProp } from 'react-native'
import { BlurView } from 'expo-blur'
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass'
import { COLORS } from '@shared/constants/colors'
import { RADIUS } from '@shared/constants/spacing'

interface GlassViewProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  /** Cường độ blur (chỉ áp dụng cho fallback) */
  intensity?: number
  /** BorderRadius */
  borderRadius?: number
  /** Hiển thị viền sáng hay không */
  showBorder?: boolean
}

/**
 * GlassView — hiệu ứng glass (kính mờ) đa nền tảng.
 *
 * - Trên iOS 26+: dùng native Liquid Glass.
 * - Trên Android: dùng expo-blur + rgba overlay.
 *
 * @example
 * <GlassView style={{ padding: 16 }}>
 *   <Text>Nội dung trong glass card</Text>
 * </GlassView>
 */
export function GlassView({
  children,
  style,
  intensity = 25,
  borderRadius = RADIUS.lg,
  showBorder = true
}: GlassViewProps) {
  // ── iOS 26+ native Liquid Glass ──
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView style={[styles.glassBase, { borderRadius }, showBorder && styles.glassBorder, style]}>
        {children}
      </LiquidGlassView>
    )
  }

  // ── Android / iOS cũ: glassmorphism fallback ──
  return (
    <View
      style={[styles.glassBase, styles.fallbackContainer, { borderRadius }, showBorder && styles.glassBorder, style]}
    >
      {/* Blur layer */}
      <BlurView intensity={intensity} tint='dark' style={[StyleSheet.absoluteFillObject, { borderRadius }]} />

      {/* Inner tint overlay */}
      <View style={[StyleSheet.absoluteFillObject, styles.fallbackOverlay, { borderRadius }]} />

      {/* Content */}
      <View style={styles.contentWrapper}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  glassBase: {
    overflow: 'hidden'
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  fallbackContainer: {
    backgroundColor: 'rgba(30, 20, 60, 0.55)'
  },
  fallbackOverlay: {
    backgroundColor: 'rgba(176, 38, 255, 0.04)'
  },
  contentWrapper: {
    zIndex: 1
  }
})
