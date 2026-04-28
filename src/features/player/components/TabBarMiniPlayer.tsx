/**
 * @file TabBarMiniPlayer.tsx
 * @description Mini Player tích hợp vào tab bar — 2 trạng thái.
 *
 * Collapsed: Circle thumbnail xoay + circular progress border + play/pause overlay
 * Expanded: Pill bar với prev/next/title/countdown + pill progress border
 *
 * Chuyển đổi bằng Pan gesture (kéo ngang).
 *
 * @module features/player/components
 */

import React, { useCallback, useMemo } from 'react'
import { View, Pressable, StyleSheet, Text, Dimensions } from 'react-native'

import { useRouter } from 'expo-router'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react-native'
import { usePlayerStore } from '../store/playerStore'
import { usePlayer } from '../hooks/usePlayer'
import { SpinningDisc } from '@shared/components/SpinningDisc'
import { CircularProgress } from '@shared/components/CircularProgress'
import { PillProgressBorder } from '@shared/components/PillProgressBorder'
import { COLORS } from '@shared/constants/colors'

// ─── Config ──────────────────────────────────────────────────────────────────

/** Kích thước circle khi thu gọn */
const CIRCLE_SIZE = 64
/** Kích thước thumbnail bên trong circle */
const THUMB_COLLAPSED = 48
/** Kích thước thumbnail khi mở rộng */
const THUMB_EXPANDED = 36
/** Pill height */
const PILL_HEIGHT = 64
/** Khoảng kéo để trigger expand (px) */
const DRAG_THRESHOLD = 80
/** Outer horizontal padding */
const OUTER_H_PAD = 16
/** Khoảng cách giữa items khi expanded */
const EXPANDED_GAP = 8

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const FULL_WIDTH = SCREEN_WIDTH - OUTER_H_PAD * 2

// ─── Helper: format time ─────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface TabBarMiniPlayerProps {
  /** Search circle ở bên phải → mini player ở trái, và ngược lại */
  isSearchRight: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Mini Player widget tích hợp vào bottom tab bar.
 *
 * - Collapsed: hình tròn 64×64 với thumbnail xoay + circular progress
 * - Expanded: bao phủ toàn bộ width với controls đầy đủ
 *
 * Khi collapsed, tất cả expanded items có width=0 để thumbnail
 * nằm chính giữa circle nhờ justifyContent: 'center'.
 */
export function TabBarMiniPlayer({ isSearchRight }: TabBarMiniPlayerProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const { isPlaying, progress, currentTime, duration, play, pause, next, previous } = usePlayer()
  const router = useRouter()

  // 0 = collapsed, 1 = expanded
  const expandProgress = useSharedValue(0)

  // ── Derived values ──
  const coverUrl = currentTrack?.coverUrl || ''
  const remainingTime = duration - currentTime

  // ── Handlers ──
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) await pause()
    else await play()
  }, [isPlaying, play, pause])

  const handleTapExpanded = useCallback(() => {
    if (currentTrack) {
      router.push(`/player/${currentTrack.id}`)
    }
  }, [currentTrack, router])

  // ── Pan Gesture — kéo ngang để expand/collapse ──
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .onUpdate((e) => {
          'worklet'
          const translation = isSearchRight ? e.translationX : -e.translationX
          const normalized = Math.max(0, Math.min(translation / DRAG_THRESHOLD, 1))
          expandProgress.value = normalized
        })
        .onEnd(() => {
          'worklet'
          expandProgress.value = withSpring(expandProgress.value > 0.4 ? 1 : 0, {
            damping: 20,
            stiffness: 150
          })
        }),
    [isSearchRight, expandProgress]
  )

  // ── Animated styles ──

  // Container: circle → full width
  const containerStyle = useAnimatedStyle(() => {
    const width = interpolate(expandProgress.value, [0, 1], [CIRCLE_SIZE, FULL_WIDTH], Extrapolation.CLAMP)
    const borderRadius = interpolate(expandProgress.value, [0, 1], [CIRCLE_SIZE / 2, 100], Extrapolation.CLAMP)
    return { width, borderRadius }
  })

  // Thumbnail size: thu nhỏ khi expand
  const thumbStyle = useAnimatedStyle(() => {
    const size = interpolate(expandProgress.value, [0, 1], [THUMB_COLLAPSED, THUMB_EXPANDED], Extrapolation.CLAMP)
    return { width: size, height: size, borderRadius: size / 2 }
  })

  /**
   * Expanded items: animate cả width + opacity.
   * Khi collapsed (progress=0): width=0, opacity=0 → không chiếm space.
   * Khi expanded (progress=1): width tự nhiên, opacity=1.
   * overflow: 'hidden' đảm bảo nội dung bị clip khi width thu hẹp.
   */
  const expandedControlStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    maxWidth: interpolate(expandProgress.value, [0, 0.5], [0, 40], Extrapolation.CLAMP),
    overflow: 'hidden' as const,
    marginHorizontal: interpolate(expandProgress.value, [0, 0.5], [0, 4], Extrapolation.CLAMP)
  }))

  const expandedInfoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    flex: expandProgress.value > 0.3 ? 1 : 0,
    maxWidth: interpolate(expandProgress.value, [0, 0.5], [0, 500], Extrapolation.CLAMP),
    overflow: 'hidden' as const,
    marginLeft: interpolate(expandProgress.value, [0, 0.5], [0, 4], Extrapolation.CLAMP)
  }))

  const expandedTimerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
    maxWidth: interpolate(expandProgress.value, [0, 0.5], [0, 50], Extrapolation.CLAMP),
    overflow: 'hidden' as const,
    marginRight: interpolate(expandProgress.value, [0, 0.5], [0, 4], Extrapolation.CLAMP)
  }))

  // Play/Pause overlay — ẩn khi expand
  const circleOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 0.3], [1, 0], Extrapolation.CLAMP)
  }))

  // Circular progress — ẩn khi expand
  const circularProgressOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP)
  }))

  // Pill progress — hiện khi expand
  const pillProgressOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(expandProgress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP)
  }))

  // Không render nếu chưa có bài hát — sau tất cả hooks
  if (!currentTrack) return null

  return (
    <GestureDetector gesture={panGesture}>
      <Reanimated.View style={[styles.container, containerStyle]}>
        {/* Glass background */}
        <View style={[StyleSheet.absoluteFillObject, styles.glass]} />

        {/* Circular progress (collapsed) */}
        <Reanimated.View style={[StyleSheet.absoluteFill, circularProgressOpacity]} pointerEvents='none'>
          <CircularProgress size={CIRCLE_SIZE} progress={progress} strokeWidth={3}>
            <View />
          </CircularProgress>
        </Reanimated.View>

        {/* Pill progress border (expanded) */}
        <Reanimated.View style={[StyleSheet.absoluteFill, pillProgressOpacity]} pointerEvents='none'>
          <PillProgressBorder width={FULL_WIDTH} height={PILL_HEIGHT} progress={progress} strokeWidth={2.5} />
        </Reanimated.View>

        {/* ── Content Row ── */}
        <View style={styles.contentRow}>
          {/* Prev button — width=0 khi collapsed */}
          <Reanimated.View style={expandedControlStyle}>
            <Pressable onPress={previous} style={styles.controlBtn} hitSlop={8}>
              <SkipBack size={18} color={COLORS.textMuted} fill={COLORS.textMuted} />
            </Pressable>
          </Reanimated.View>

          {/* Thumbnail — luôn hiện, luôn ở giữa khi collapsed */}
          <Pressable onPress={handlePlayPause} style={styles.thumbWrapper}>
            <Reanimated.View style={thumbStyle}>
              <SpinningDisc
                uri={coverUrl}
                isPlaying={isPlaying}
                size={THUMB_COLLAPSED}
                showHole={false}
                showGlow={false}
              />
            </Reanimated.View>

            {/* Play/Pause overlay (collapsed) */}
            <Reanimated.View style={[styles.playOverlay, circleOverlayStyle]}>
              {isPlaying ? (
                <Pause size={20} color='#FFFFFF' fill='#FFFFFF' />
              ) : (
                <Play size={20} color='#FFFFFF' fill='#FFFFFF' />
              )}
            </Reanimated.View>
          </Pressable>

          {/* Next button — width=0 khi collapsed */}
          <Reanimated.View style={expandedControlStyle}>
            <Pressable onPress={next} style={styles.controlBtn} hitSlop={8}>
              <SkipForward size={18} color={COLORS.textMuted} fill={COLORS.textMuted} />
            </Pressable>
          </Reanimated.View>

          {/* Song info — flex=0, width=0 khi collapsed */}
          <Reanimated.View style={expandedInfoStyle}>
            <Pressable onPress={handleTapExpanded}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </Pressable>
          </Reanimated.View>

          {/* Countdown timer — width=0 khi collapsed */}
          <Reanimated.View style={expandedTimerStyle}>
            <Text style={styles.countdown}>{formatTime(remainingTime)}</Text>
          </Reanimated.View>
        </View>
      </Reanimated.View>
    </GestureDetector>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    height: PILL_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  glass: {
    backgroundColor: 'rgba(20, 15, 45, 0.7)',
    borderRadius: 100
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: center → thumbnail nằm giữa khi collapsed
    // vì các expanded items có width=0 → không chiếm space
    justifyContent: 'center'
  },
  thumbWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 999
  },
  controlBtn: {
    padding: 6
  },
  songTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    // Ngăn text bị wrap khi width đang animate
    width: 200
  },
  songArtist: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
    width: 200
  },
  countdown: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    paddingRight: 4,
    // Đảm bảo text không bị co lại
    minWidth: 40,
    textAlign: 'right'
  }
})
