/**
 * @file GlassCard.tsx
 * @description Card với hiệu ứng kính mờ (glassmorphism).
 * Sử dụng GlassView để đảm bảo hiệu ứng glass nhất quán trên mọi nền tảng.
 * @module shared/components
 */

import React from 'react';
import { type ViewStyle, type StyleProp, StyleSheet } from 'react-native';
import { GlassView } from './GlassView';
import { SPACING, RADIUS } from '@shared/constants/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Cường độ blur */
  intensity?: number;
}

/**
 * GlassCard — card glassmorphism cao cấp.
 *
 * @example
 * <GlassCard style={{ padding: 16 }}>
 *   <Text>Nội dung card</Text>
 * </GlassCard>
 */
export function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
  return (
    <GlassView
      intensity={intensity}
      borderRadius={RADIUS.lg}
      showBorder
      style={[styles.card, style]}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
  },
});
