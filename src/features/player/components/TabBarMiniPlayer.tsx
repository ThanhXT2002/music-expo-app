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
  withTiming,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react-native'
import TextTicker from 'react-native-text-ticker'
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
const THUMB_COLLAPSED = 56
/** Kích thước thumbnail khi mở rộng */
const THUMB_EXPANDED = 48
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

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable)

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
  const { isPlaying, currentTime, duration, play, pause, next, previous } = usePlayer()
  const router = useRouter()

  // 0 = collapsed, 1 = expanded
  const expandProgress = useSharedValue(0)
  // Animation value cho click overlay flash
  const clickOpacity = useSharedValue(0)

  // ── Derived values ──
  const coverUrl = currentTrack?.coverUrl || ''
  const progress = currentTrack ? currentTime / currentTrack.durationSeconds : 0
  const remainingTime = duration - currentTime

  // ── Handlers ──
  const handlePlayPause = useCallback(async () => {
    // Flash effect khi click (hiện rõ 1s rồi mờ dần về 0)
    clickOpacity.value = 1
    clickOpacity.value = withTiming(0, { duration: 1000 })

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
          // Mini player ở trái → kéo PHẢI (translationX > 0) về phía pill để expand
          // Mini player ở phải → kéo TRÁI (translationX < 0) về phía pill để expand
          const translation = isSearchRight ? -e.translationX : e.translationX
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

  // Thumbnail size: thu nhỏ bằng scale để không bị tràn layout (gây lệch tâm)
  const thumbStyle = useAnimatedStyle(() => {
    const scale = interpolate(expandProgress.value, [0, 1], [1, THUMB_EXPANDED / THUMB_COLLAPSED], Extrapolation.CLAMP)
    const margin = interpolate(
      expandProgress.value,
      [0, 1],
      [0, (THUMB_EXPANDED - THUMB_COLLAPSED) / 2],
      Extrapolation.CLAMP
    )
    return {
      width: THUMB_COLLAPSED,
      height: THUMB_COLLAPSED,
      transform: [{ scale }]
      // marginHorizontal: margin
    }
  })

  /**
   * Expanded items: animate cả width + opacity.
   * Khi collapsed (progress=0): width=0, opacity=0 → không chiếm space.
   * Khi expanded (progress=1): width tự nhiên, opacity=1.
   * overflow: 'hidden' đảm bảo nội dung bị clip khi width thu hẹp.
   */
  const expandedControlStyle = useAnimatedStyle(() => {
    const display = expandProgress.value < 0.01 ? 'none' : 'flex'
    return {
      display,
      opacity: expandProgress.value,
      width: interpolate(expandProgress.value, [0, 1], [0, 32], Extrapolation.CLAMP),
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center'
    }
  })

  const expandedInfoStyle = useAnimatedStyle(() => {
    const display = expandProgress.value < 0.01 ? 'none' : 'flex'
    return {
      display,
      flex: interpolate(expandProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      maxWidth: interpolate(expandProgress.value, [0, 1], [0, 500], Extrapolation.CLAMP),
      opacity: expandProgress.value,
      marginLeft: interpolate(expandProgress.value, [0, 1], [0, 4], Extrapolation.CLAMP),
      overflow: 'hidden',
      justifyContent: 'center'
    }
  })

  const expandedTimerStyle = useAnimatedStyle(() => {
    const display = expandProgress.value < 0.01 ? 'none' : 'flex'
    return {
      display,
      opacity: expandProgress.value,
      maxWidth: interpolate(expandProgress.value, [0, 1], [0, 100], Extrapolation.CLAMP),
      overflow: 'hidden',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }
  })

  // Play/Pause overlay — mặc định ẩn (0), hiện rõ (1) trong 1s khi click
  const circleOverlayStyle = useAnimatedStyle(() => ({
    opacity: clickOpacity.value
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
      <Reanimated.View
        style={[
          styles.container,
          containerStyle,
          // Vị trí absolute: trùng spacer khi collapsed, đè pill khi expand
          isSearchRight ? { right: OUTER_H_PAD } : { left: OUTER_H_PAD }
        ]}
      >
        {/* Glass background */}
        <View style={[StyleSheet.absoluteFillObject, styles.glass]} />

        {/* Circular progress (collapsed) */}
        <Reanimated.View
          style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }, circularProgressOpacity]}
          pointerEvents='none'
        >
          <CircularProgress size={CIRCLE_SIZE} progress={progress} strokeWidth={2.5} />
        </Reanimated.View>

        {/* Pill progress border (expanded) */}
        <Reanimated.View style={[StyleSheet.absoluteFill, pillProgressOpacity]} pointerEvents='none'>
          <PillProgressBorder width={FULL_WIDTH} height={PILL_HEIGHT} progress={progress} strokeWidth={3} />
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
          <AnimatedPressable onPress={handlePlayPause} style={[styles.thumbWrapper, thumbStyle]}>
            <SpinningDisc
              uri={coverUrl}
              isPlaying={isPlaying}
              size={THUMB_COLLAPSED}
              showHole={false}
              showGlow={false}
            />

            {/* Play/Pause overlay (collapsed) */}
            <Reanimated.View style={[styles.playOverlay, circleOverlayStyle]}>
              {isPlaying ? (
                <Pause size={20} color='#FFFFFF' fill='#FFFFFF' />
              ) : (
                <Play size={20} color='#FFFFFF' fill='#FFFFFF' />
              )}
            </Reanimated.View>
          </AnimatedPressable>

          {/* Next button — width=0 khi collapsed */}
          <Reanimated.View style={expandedControlStyle}>
            <Pressable onPress={next} style={styles.controlBtn} hitSlop={8}>
              <SkipForward size={18} color={COLORS.textMuted} fill={COLORS.textMuted} />
            </Pressable>
          </Reanimated.View>

          {/* Song info — flex=0, width=0 khi collapsed */}
          <Reanimated.View style={expandedInfoStyle}>
            <Pressable onPress={handleTapExpanded}>
              <TextTicker style={styles.songTitle} duration={8000} loop bounce repeatSpacer={50} marqueeDelay={1000}>
                {currentTrack.title}
              </TextTicker>
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
    // Absolute — đè lên pill bar khi expand, trùng spacer khi collapsed
    position: 'absolute',
    top: 12,
    height: PILL_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0px 0px 16px rgba(176, 38, 255, 0.7)',
    zIndex: 10
  },
  glass: {
    // Đậm (0.92) để phủ kín pill bar bên dưới khi expand
    backgroundColor: 'rgba(18, 12, 40, 0.92)',
    borderRadius: 100
  },
  contentRow: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbWrapper: {
    alignSelf: 'center',
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
    paddingRight: 12,
    paddingLeft: 12,
    minWidth: 40,
    textAlign: 'right'
  }
})
