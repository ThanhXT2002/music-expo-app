/**
 * @file MediaActionButtons.tsx
 * @description Bộ nút action dùng chung cho media cards — Play, Like, Download.
 * Dùng ở: MusicBannerCarousel (inline row), HorizontalCardList (overlay trên ảnh), v.v.
 * @module shared/components
 */

import React from 'react'
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { Play, Heart, Download } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { SHADOWS } from '@shared/constants/spacing'

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionVariant = 'inline' | 'overlay'

interface MediaActionButtonsProps {
  /** Kiểu hiển thị:
   * - 'inline': hàng ngang (Play viền + Heart + Download) — dùng trong banner
   * - 'overlay': nút Play nổi trên ảnh (có glow) — dùng trong card
   */
  variant?: ActionVariant
  /** Kích thước nút Play (mặc định: inline=44, overlay=34) */
  playSize?: number
  /** Kích thước icon bên trong (mặc định: inline=18, overlay=14) */
  iconSize?: number
  /** Hiện nút Like (mặc định true, chỉ khi variant='inline') */
  showLike?: boolean
  /** Hiện nút Download (mặc định true, chỉ khi variant='inline') */
  showDownload?: boolean
  /** Callback khi nhấn Play */
  onPlay?: () => void
  /** Callback khi nhấn Like */
  onLike?: () => void
  /** Callback khi nhấn Download */
  onDownload?: () => void
  /** Style container bổ sung */
  style?: ViewStyle
}

// ─── Defaults per variant ─────────────────────────────────────────────────────

const VARIANT_DEFAULTS: Record<ActionVariant, { playSize: number; iconSize: number }> = {
  inline: { playSize: 44, iconSize: 18 },
  overlay: { playSize: 34, iconSize: 14 },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaActionButtons({
  variant = 'inline',
  playSize,
  iconSize,
  showLike = true,
  showDownload = true,
  onPlay,
  onLike,
  onDownload,
  style,
}: MediaActionButtonsProps) {
  const defaults = VARIANT_DEFAULTS[variant]
  const pSize = playSize ?? defaults.playSize
  const iSize = iconSize ?? defaults.iconSize

  if (variant === 'overlay') {
    // Nút Play nổi — thường đặt absolute trên ảnh
    return (
      <Pressable
        onPress={onPlay}
        hitSlop={8}
        style={[
          styles.overlayButton,
          { width: pSize, height: pSize, borderRadius: pSize / 2 },
          style,
        ]}
      >
        <Play size={iSize} color='#fff' fill='#fff' style={{ marginLeft: 1 }} />
      </Pressable>
    )
  }

  // Variant 'inline' — hàng ngang: Play (viền) + Heart + Download
  return (
    <View style={[styles.inlineRow, style]}>
      <Pressable
        onPress={onPlay}
        style={[
          styles.inlinePlayButton,
          { width: pSize, height: pSize, borderRadius: pSize / 2 },
        ]}
      >
        <Play size={iSize} color='#fff' style={{ marginLeft: 2 }} />
      </Pressable>

      {showLike && (
        <Pressable onPress={onLike} hitSlop={8} style={styles.iconButton}>
          <Heart size={iSize + 2} color='rgba(255,255,255,0.8)' />
        </Pressable>
      )}

      {showDownload && (
        <Pressable onPress={onDownload} hitSlop={8} style={styles.iconButton}>
          <Download size={iSize + 2} color='rgba(255,255,255,0.8)' />
        </Pressable>
      )}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Overlay variant — nút nổi trên ảnh (cùng style glass với inline)
  overlayButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inline variant — hàng ngang
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inlinePlayButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
})
