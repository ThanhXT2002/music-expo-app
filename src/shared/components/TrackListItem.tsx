/**
 * @file TrackListItem.tsx
 * @description Track item dạng list — dùng cho playlist detail, album detail, downloads.
 * Khác TrackCard (horizontal scroll card) — đây là dạng full-width list row.
 * @module shared/components
 */

import { View, Pressable, StyleSheet, Text } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing as ReanimatedEasing
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { MoreVertical } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { formatDuration } from '@shared/utils/formatDuration'
import type { Track } from '@shared/types/track'
import React, { useEffect } from 'react'

interface TrackListItemProps {
  /** Thông tin bài hát */
  track: Track
  /** Số thứ tự (hiển thị thay ảnh nếu muốn) */
  index?: number
  /** Hiển thị ảnh bìa (mặc định true) */
  showCover?: boolean
  /** Callback khi nhấn vào track */
  onPress: (track: Track) => void
  /** Callback khi nhấn menu "..." */
  onMenuPress?: (track: Track) => void
  /** Track này đang active (đang phát) */
  isActive?: boolean
  /** Icon hiển thị bên phải, mặc định là 3 chấm */
  rightIcon?: React.ReactNode
  /** Hiển thị thời lượng (mặc định true) */
  showDuration?: boolean
}

/** Component ảnh bìa xoay tròn chỉ render khi bài hát đang phát để tối ưu hiệu năng */
function ActiveTrackCover({ uri }: { uri: string }) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(rotation.value + 360, {
        duration: 6000,
        easing: ReanimatedEasing.linear
      }),
      -1,
      false
    )

    return () => {
      cancelAnimation(rotation)
    }
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => {
    const currentRotation = Number.isFinite(rotation.value) ? rotation.value : 0
    return {
      transform: [{ rotate: `${currentRotation}deg` }]
    }
  })

  return (
    <Animated.View style={[styles.coverWrapper, styles.coverWrapperActive, animatedStyle]}>
      <Image source={{ uri }} style={styles.coverImage} contentFit='cover' transition={200} />
    </Animated.View>
  )
}

/** Component vỏ bọc quyết định render ảnh tĩnh hay ảnh động */
function TrackCover({ uri, isActive }: { uri: string; isActive: boolean }) {
  if (isActive) {
    return <ActiveTrackCover uri={uri} />
  }

  // Trạng thái tĩnh (không play) -> Dùng View bình thường để tránh lỗi layout biến mất trên Android
  return (
    <View style={styles.coverWrapper}>
      <Image source={{ uri }} style={styles.coverImage} contentFit='cover' transition={200} />
    </View>
  )
}

/**
 * TrackListItem — hàng bài hát trong danh sách.
 */
export function TrackListItem({
  track,
  index,
  showCover = true,
  onPress,
  onMenuPress,
  isActive = false,
  rightIcon,
  showDuration = true
}: TrackListItemProps) {
  return (
    <Pressable onPress={() => onPress(track)}>
      {({ pressed }) => (
        <View style={[styles.container, pressed && styles.pressed, isActive && styles.active]}>
          {/* Số thứ tự hoặc ảnh bìa */}
          {showCover ? (
            <TrackCover uri={track.coverUrl} isActive={isActive} />
          ) : (
            <View style={styles.indexContainer}>
              <Text style={[styles.indexText, isActive && { color: COLORS.primary }]}>{index ?? '—'}</Text>
            </View>
          )}

          {/* Thông tin bài hát */}
          <View style={styles.info}>
            <Text style={[styles.title, isActive && { color: COLORS.primary }]} numberOfLines={1}>
              {track.title}
            </Text>
            {/* Artist + Duration cùng hàng, căn 2 đầu */}
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle} numberOfLines={1}>
                {track.artist}
              </Text>
              {showDuration && track.durationSeconds > 0 && (
                <Text style={styles.duration}>{formatDuration(track.durationSeconds)}</Text>
              )}
            </View>
          </View>

          {/* Menu button — luôn hiển thị */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation()
              onMenuPress?.(track)
            }}
            hitSlop={12}
            style={styles.menuButton}
          >
            {rightIcon || <MoreVertical size={18} color={COLORS.textMuted} />}
          </Pressable>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(20, 15, 45, 0.7)',
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
    gap: SPACING.md
  },
  pressed: {
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    transform: [{ scale: 0.98 }]
  },
  active: {
    backgroundColor: 'rgba(176, 38, 255, 0.2)',
    borderColor: 'rgba(176, 38, 255, 0.5)'
  },
  coverWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full, // Bắt buộc bo tròn toàn bộ để quay không bị méo
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent' // Luôn giữ border để tránh lỗi biến mất View trên Android khi toggle isActive
  },
  coverWrapperActive: {
    borderColor: '#1DB954' // Chuyển màu viền khi active
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.full
  },
  indexContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.full
  },
  indexText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    flex: 1,
    marginRight: SPACING.sm
  },
  duration: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  menuButton: {
    padding: SPACING.xs
  }
})
