/**
 * @file HorizontalCardList.tsx
 * @description Component danh sách cuộn ngang dùng chung — hiển thị card vuông
 * với ảnh bìa, nút Play overlay, tiêu đề và mô tả phụ.
 *
 * Dùng cho: Nghe nhiều nhất, Dành cho bạn, Album (Search), v.v.
 * @module shared/components
 */

import React from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing'
import { MediaActionButtons } from './MediaActionButtons'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HorizontalCardItem {
  id: string
  imageUrl: string
  title: string
  subtitle?: string
}

type CardSize = 'sm' | 'md' | 'lg'

interface HorizontalCardListProps {
  /** Dữ liệu danh sách cards */
  items: HorizontalCardItem[]
  /** Kích thước card: sm(110), md(140), lg(160). Mặc định md */
  size?: CardSize
  /** Hiển thị nút action (mặc định true) */
  showPlayButton?: boolean
  /** Kiểu hiển thị nút:
   * - 'overlay': nút Play nổi trên ảnh (mặc định)
   * - 'inline': hàng ngang Play + Heart + Download dưới text
   */
  actionVariant?: 'overlay' | 'inline'
  /** Hiển thị gradient overlay phía dưới ảnh (mặc định false) */
  showGradientOverlay?: boolean
  /** Ảnh vuông hay chữ nhật (mặc định vuông 1:1) */
  imageAspectRatio?: number
  /** Callback khi nhấn vào card */
  onPress?: (item: HorizontalCardItem) => void
  /** Style bổ sung cho container */
  containerStyle?: ViewStyle
}

// ─── Size Config ──────────────────────────────────────────────────────────────

const SIZE_MAP: Record<CardSize, { width: number; playSize: number; playIcon: number }> = {
  sm: { width: 110, playSize: 28, playIcon: 12 },
  md: { width: 140, playSize: 32, playIcon: 14 },
  lg: { width: 160, playSize: 34, playIcon: 16 },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HorizontalCardList({
  items,
  size = 'md',
  showPlayButton = true,
  actionVariant = 'overlay',
  showGradientOverlay = false,
  imageAspectRatio = 1,
  onPress,
  containerStyle,
}: HorizontalCardListProps) {
  if (!items || items.length === 0) return null

  const config = SIZE_MAP[size]
  const imageHeight = config.width * imageAspectRatio

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, containerStyle]}
      decelerationRate='fast'
      snapToInterval={config.width + SPACING.md}
    >
      {items.map((item, idx) => (
        <Pressable
          key={`${item.id}-${idx}`}
          onPress={() => onPress?.(item)}
          style={({ pressed }) => [
            { width: config.width, gap: SPACING.sm },
            pressed && { opacity: 0.8 }
          ]}
        >
          {/* Ảnh bìa */}
          <View
            style={[
              styles.imageWrapper,
              { width: config.width, height: imageHeight, borderRadius: RADIUS.lg }
            ]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit='cover'
              transition={200}
            />

            {/* Gradient overlay phía dưới (tùy chọn) */}
            {showGradientOverlay && (
              <LinearGradient
                colors={['transparent', 'rgba(8, 3, 22, 0.85)']}
                style={styles.gradientOverlay}
              />
            )}

            {/* Nút action — overlay hoặc inline, đều đè lên ảnh */}
            {showPlayButton && actionVariant === 'overlay' && (
              <MediaActionButtons
                variant='overlay'
                playSize={config.playSize}
                iconSize={config.playIcon}
                onPlay={() => onPress?.(item)}
              />
            )}
            {showPlayButton && actionVariant === 'inline' && (
              <MediaActionButtons
                variant='inline'
                playSize={config.playSize}
                iconSize={config.playIcon}
                onPlay={() => onPress?.(item)}
                style={{ position: 'absolute', bottom: 8, left: 8 }}
              />
            )}
          </View>

          {/* Tiêu đề */}
          <Text style={[styles.title, { width: config.width }]} numberOfLines={1} ellipsizeMode='tail'>
            {item.title}
          </Text>

          {/* Mô tả phụ */}
          {item.subtitle !== undefined && (
            <Text style={[styles.subtitle, { width: config.width }]} numberOfLines={1} ellipsizeMode='tail'>
              {item.subtitle}
            </Text>
          )}
        </Pressable>
      ))}
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#1a142c',
    ...SHADOWS.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },

  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
})
