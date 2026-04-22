/**
 * @file PlayerScreen.tsx
 * @description Màn hình phát nhạc toàn màn hình — NowPlaying.
 *
 * Design theo web player:
 * - Background: Ambient blur ảnh album + gradient overlay
 * - Album Art: Đĩa than tròn xoay khi playing (spin animation)
 * - Song Info: Centered (title + artist)
 * - Action Row: Playlist + Download/Heart
 * - Progress Bar: Gradient fill, draggable thumb
 * - Controls: Shuffle / Prev / Play / Next / Repeat (active states)
 * - Bottom: Lời nhạc + Hàng đợi
 *
 * @module features/player
 */

import { View, Pressable, StyleSheet, Dimensions, Animated, Easing, Text } from 'react-native'

import { useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing as ReanimatedEasing
} from 'react-native-reanimated'
import {
  ChevronDown,
  Heart,
  ListMusic,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  MessageSquareText,
  Menu,
  Download
} from 'lucide-react-native'
import { createLogger } from '@core/logger'
import { usePlayer } from '../hooks/usePlayer'
import { usePlayerStore } from '../store/playerStore'
import { ProgressBar } from './ProgressBar'
import { CurrentPlaylistSheet } from './CurrentPlaylistSheet'
import { useDownloadStore } from '@features/downloads/store/downloadStore'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'

const logger = createLogger('player-screen')
const { width: SCREEN_WIDTH } = Dimensions.get('window')
const COVER_SIZE = SCREEN_WIDTH * 0.7

interface PlayerScreenProps {
  trackId: string
}

// ─── Spinning Disc Component ─────────────────────────────────────────────────

function SpinningDisc({ uri, isPlaying, size }: { uri: string; isPlaying: boolean; size: number }) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (isPlaying) {
      // Xoay liên tục vô hạn, mỗi vòng 8 giây (360 độ)
      rotation.value = withRepeat(
        withTiming(rotation.value + 360, {
          duration: 8000,
          easing: ReanimatedEasing.linear
        }),
        -1, // Lặp vô cực
        false // Không chạy ngược lại
      )
    } else {
      // Dừng ngay lập tức (giữ nguyên vị trí)
      cancelAnimation(rotation)
    }
  }, [isPlaying, rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }))

  return (
    <View style={[styles.discContainer, { width: size, height: size }]}>
      {/* Disc shadow glow */}
      <View style={[styles.discGlow, { width: size + 20, height: size + 20 }]} />

      <Reanimated.View style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}>
        <Image
          source={{ uri }}
          style={[styles.discImage, { width: size, height: size, borderRadius: size / 2 }]}
          contentFit='cover'
          transition={400}
        />
        {/* Lỗ đĩa than ở giữa */}
        <View style={styles.discHole} />
      </Reanimated.View>
    </View>
  )
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function PlayerScreen({ trackId }: PlayerScreenProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    shuffleEnabled,
    repeatMode,
    play,
    pause,
    next,
    previous,
    seekTo,
    toggleShuffle,
    toggleRepeat
  } = usePlayer(trackId)

  useEffect(() => {
    logger.debug('PlayerScreen mount', { trackId })
    return () => logger.debug('PlayerScreen unmount')
  }, [trackId])

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pause()
    } else {
      await play()
    }
  }

  // Fallback cover
  const coverUrl = currentTrack?.coverUrl || 'https://picsum.photos/seed/player/400/400'

  // ─── Repeat icon & color logic ───
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat
  const repeatColor = repeatMode !== 'none' ? COLORS.primary : COLORS.textMuted
  const shuffleColor = shuffleEnabled ? COLORS.primary : COLORS.textMuted

  const isDownloaded = useDownloadStore((state) => state.offlineSongs.some((s) => s.id === trackId))

  return (
    <View style={styles.container}>
      {/* ── Ambient background ── */}
      <Image source={{ uri: coverUrl }} style={styles.ambientBg} contentFit='cover' blurRadius={80} />
      <LinearGradient
        colors={['rgba(8,3,22,0.4)', 'rgba(8,3,22,0.75)', COLORS.background]}
        style={styles.ambientOverlay}
      />

      {/* ── Header: ĐANG NGHE ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={12}>
          <ChevronDown size={28} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>ĐANG NGHE</Text>
          <Text style={styles.headerSublabel}>_ ___ _</Text>
        </View>
        <Pressable
          style={styles.headerBtn}
          hitSlop={12}
          onPress={() => usePlayerStore.getState().openCurrentPlaylist()}
        >
          <Menu size={24} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {/* ── Spinning Disc (Album Art) ── */}
      <View style={styles.coverSection}>
        <SpinningDisc uri={coverUrl} isPlaying={isPlaying} size={COVER_SIZE} />
      </View>

      {/* ── Song Info — Centered ── */}
      <View style={styles.infoSection}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {currentTrack?.title ?? 'Chưa chọn bài hát'}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {currentTrack?.artist ?? '—'}
        </Text>
      </View>

      {/* ── Action Row: Playlist + Download / Heart ── */}
      <View style={styles.actionRow}>
        <Pressable style={styles.actionBtn} hitSlop={8}>
          <ListMusic size={22} color={COLORS.textSecondary} />
        </Pressable>
        <View style={styles.actionRight}>
          {!isDownloaded && (
            <Pressable style={styles.actionBtn} hitSlop={8}>
              <Download size={22} color={COLORS.textSecondary} />
            </Pressable>
          )}
          <Pressable style={styles.actionBtn} hitSlop={8}>
            <Heart size={22} color={COLORS.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* ── Progress Bar ── */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} currentTime={currentTime} duration={duration} onSeek={seekTo} />
      </View>

      {/* ── Controls Row ── */}
      <View style={styles.controlsRow}>
        {/* Shuffle */}
        <Pressable onPress={toggleShuffle} style={styles.controlBtn} hitSlop={12}>
          <Shuffle size={22} color={shuffleColor} />
        </Pressable>

        {/* Previous */}
        <Pressable onPress={previous} style={styles.controlBtn} hitSlop={12}>
          <SkipBack size={30} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
        </Pressable>

        {/* Play/Pause — Large button */}
        <Pressable onPress={handlePlayPause} style={styles.playBtn}>
          {isPlaying ? (
            <View style={styles.pauseIconGroup}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          ) : (
            <View style={styles.playIcon} />
          )}
        </Pressable>

        {/* Next */}
        <Pressable onPress={next} style={styles.controlBtn} hitSlop={12}>
          <SkipForward size={30} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
        </Pressable>

        {/* Repeat */}
        <Pressable onPress={toggleRepeat} style={styles.controlBtn} hitSlop={12}>
          <RepeatIcon size={22} color={repeatColor} />
        </Pressable>
      </View>

      {/* ── Bottom actions ── */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + SPACING.lg }]}>
        {/* <Pressable style={styles.bottomBtn} hitSlop={8}>
          <MessageSquareText size={20} color={COLORS.textMuted} />
          <Text style={styles.bottomBtnText}>Lời nhạc</Text>
        </Pressable>
        <Pressable style={styles.bottomBtn} hitSlop={8}>
          <ListMusic size={20} color={COLORS.textMuted} />
          <Text style={styles.bottomBtnText}>Hàng đợi</Text>
        </Pressable> */}
      </View>

      {/* ── Current Playlist Sheet ── */}
      <CurrentPlaylistSheet />
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  ambientBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55
  },
  ambientOverlay: {
    ...StyleSheet.absoluteFillObject
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1
  },
  headerLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 2
  },
  headerSublabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },

  // ── Spinning Disc ──
  coverSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg
  },
  discContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  discGlow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'transparent',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 15
  },
  disc: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)'
  },
  discImage: {},
  discHole: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: -12,
    marginLeft: -12
  },

  // ── Song Info ──
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    marginTop: SPACING.lg
  },
  songTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3
  },
  songArtist: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center'
  },

  // ── Action Row ──
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'] + SPACING.sm,
    marginTop: SPACING.lg
  },
  actionRight: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  actionBtn: {
    padding: SPACING.sm
  },

  // ── Progress ──
  progressSection: {
    paddingHorizontal: SPACING['2xl'],
    marginTop: SPACING.xs
  },

  // ── Controls ──
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg
  },
  controlBtn: {
    padding: SPACING.sm
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  pauseIconGroup: {
    flexDirection: 'row',
    gap: 6
  },
  pauseBar: {
    width: 6,
    height: 24,
    backgroundColor: COLORS.background,
    borderRadius: 2
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderLeftColor: COLORS.background,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4
  },

  // ── Bottom ──
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING['5xl'],
    marginTop: SPACING['3xl']
  },
  bottomBtn: {
    alignItems: 'center',
    gap: SPACING.xs
  },
  bottomBtnText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted
  }
})
