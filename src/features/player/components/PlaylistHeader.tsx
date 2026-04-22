/**
 * @file PlaylistHeader.tsx
 * @description Header cho màn hình danh sách phát hiện tại.
 * Chứa ảnh nền blur, thông tin bài hát và controls thu gọn.
 * @module features/player/components
 */

import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { SkipBack, SkipForward, Play, Pause, Shuffle } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import type { Track } from '@shared/types/track'
import { ProgressBarMini } from './ProgressBarMini'
import React from 'react'

interface PlaylistHeaderProps {
  currentTrack: Track | null
  totalTracks: number
  currentIndex: number
  isPlaying: boolean
  shuffleEnabled: boolean
  progressPercentage: number
  remainingTimeText: string
  onPrevious: () => void
  onPlayPause: () => void
  onNext: () => void
  onShuffle: () => void
  headerActions?: React.ReactNode
}

/**
 * PlaylistHeader - Khu vực trên cùng của Bottom Sheet hiển thị danh sách phát
 */
export function PlaylistHeader({
  currentTrack,
  totalTracks,
  currentIndex,
  isPlaying,
  shuffleEnabled,
  progressPercentage,
  remainingTimeText,
  onPrevious,
  onPlayPause,
  onNext,
  onShuffle,
  headerActions
}: PlaylistHeaderProps) {
  // Ảnh nền fallback nếu không có
  const coverUrl = currentTrack?.coverUrl || 'https://picsum.photos/seed/player/400/400'

  return (
    <View style={styles.container}>
      {/* Background Layer */}
      <LinearGradient
        colors={[COLORS.secondary, COLORS.tertiary, COLORS.quaternary]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Image source={{ uri: coverUrl }} style={styles.bgBlur} blurRadius={60} />
      <View style={styles.bgOverlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Top bar: Tiêu đề + Thống kê + Actions (Tải xuống, Shuffle) */}
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={styles.headerTitle}>Danh sách phát hiện tại</Text>
            <Text style={styles.statsText}>
              {totalTracks > 0 ? `${totalTracks} bài hát • ${currentIndex + 1}/${totalTracks}` : 'Không có bài hát'}
            </Text>
          </View>
          <View style={styles.topActions}>
            {headerActions}
            <Pressable onPress={onShuffle} hitSlop={12} style={styles.actionBtn}>
              <Shuffle size={20} color={shuffleEnabled ? COLORS.primary : COLORS.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Middle: Info bài hát */}
        <View style={styles.middleRow}>
          <Text style={styles.songTitle} numberOfLines={2}>
            {currentTrack?.title || 'Chưa chọn bài hát'}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {currentTrack?.artist || '—'}
          </Text>
        </View>

        {/* Bottom: Playback Controls & Remaining Time */}
        <View style={styles.bottomRow}>
          <View style={styles.playbackControls}>
            <Pressable onPress={onPrevious} hitSlop={12}>
              <SkipBack size={28} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            </Pressable>

            <Pressable onPress={onPlayPause} hitSlop={12}>
              {isPlaying ? (
                <Pause size={36} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
              ) : (
                <Play size={36} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
              )}
            </Pressable>

            <Pressable onPress={onNext} hitSlop={12}>
              <SkipForward size={28} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.timeText}>{remainingTimeText}</Text>
        </View>
      </View>

      {/* Progress bar bám sát viền dưới cùng */}
      <View style={styles.progressWrapper}>
        <ProgressBarMini progress={progressPercentage} height={3} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    width: '100%',
    overflow: 'hidden'
  },
  bgBlur: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 40, 0.4)' // Tối nhẹ
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  topLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4
  },
  statsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  actionBtn: {
    padding: 4,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  middleRow: {
    marginTop: SPACING.lg,
  },
  songTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase' // Chữ hoa giống design
  },
  songArtist: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: SPACING.lg
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl
  },
  timeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
    marginBottom: 2
  },
  progressWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  }
})
