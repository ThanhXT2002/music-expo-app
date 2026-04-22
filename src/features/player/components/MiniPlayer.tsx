/**
 * @file MiniPlayer.tsx
 * @description Trình phát nhạc thu nhỏ — glass effect, progress bar mỏng.
 * Hiển thị cố định phía trên tab bar.
 * @module features/player
 */

import { View, Pressable, StyleSheet, Text } from 'react-native'

import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Play, Pause, SkipForward, ListMusic } from 'lucide-react-native'
import { usePlayerStore } from '../store/playerStore'
import { usePlayer } from '../hooks/usePlayer'
import { CurrentPlaylistSheet } from './CurrentPlaylistSheet'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'

/**
 * MiniPlayer — thanh phát nhạc nhỏ nổi phía trên tab bar.
 * Glass effect background, progress bar mỏng phía trên.
 */
export function MiniPlayer() {
  const { currentTrack, openCurrentPlaylist } = usePlayerStore()
  const { isPlaying, progress, play, pause, next } = usePlayer()
  const router = useRouter()

  if (!currentTrack) return null

  const handlePlayPause = async () => {
    if (isPlaying) await pause()
    else await play()
  }

  return (
    <>
      <Pressable onPress={() => router.push(`/player/${currentTrack.id}`)} style={styles.container}>
        {/* Glass background */}
        <BlurView intensity={30} tint='dark' style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, styles.glassOverlay]} />

        {/* Progress bar mỏng phía trên */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(progress ?? 0) * 100}%` }]} />
        </View>

        <View style={styles.content}>
          {/* Cover */}
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} contentFit='cover' transition={200} />

          {/* Song info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          {/* Controls */}
          <Pressable onPress={handlePlayPause} style={styles.controlBtn} hitSlop={12}>
            {isPlaying ? (
              <Pause size={22} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            ) : (
              <Play size={22} color={COLORS.textPrimary} fill={COLORS.textPrimary} />
            )}
          </Pressable>
          
          <Pressable onPress={next} style={styles.controlBtn} hitSlop={12}>
            <SkipForward size={20} color={COLORS.textMuted} fill={COLORS.textMuted} />
          </Pressable>

          <Pressable onPress={openCurrentPlaylist} style={styles.controlBtn} hitSlop={12}>
            <ListMusic size={20} color={COLORS.textMuted} />
          </Pressable>
        </View>
      </Pressable>

      {/* Đặt CurrentPlaylistSheet ở ngoài Pressable để Modal có thể đè lên toàn bộ app */}
      <CurrentPlaylistSheet />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 82,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(20, 15, 45, 0.55)',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  glassOverlay: {
    backgroundColor: 'rgba(176, 38, 255, 0.04)'
  },
  progressTrack: {
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingRight: SPACING.md,
    gap: SPACING.sm
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm
  },
  info: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  artist: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 1
  },
  controlBtn: {
    padding: SPACING.sm
  }
})
