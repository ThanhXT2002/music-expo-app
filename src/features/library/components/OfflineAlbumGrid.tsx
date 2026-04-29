/**
 * @file OfflineAlbumGrid.tsx
 * @description Lưới album offline — nhóm bài hát theo nghệ sĩ, hiển thị dạng grid.
 * Mobile: 3 cột. Tablet (>= 768px): tự động tính số cột vừa màn hình.
 * Khi có bài hát của album đang phát → thay Play button bằng SpinningDisc nhỏ.
 * @module features/library/components
 */

import { View, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { MediaActionButtons } from '@shared/components/MediaActionButtons'
import { SpinningDisc } from '@shared/components/SpinningDisc'
import { CircularProgress } from '@shared/components/CircularProgress'
import { usePlayerStore } from '@features/player/store/playerStore'
import { usePlayer } from '@features/player/hooks/usePlayer'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import type { OfflineAlbum } from '../hooks/useOfflineAlbums'

// ─── Config ───────────────────────────────────────────────────────────────────

const MOBILE_COLS = 3
const TABLET_BREAKPOINT = 768
const ITEM_GAP = SPACING.sm
const CONTAINER_PADDING = SPACING.lg
const MINI_DISC_SIZE = 44

function useGridConfig() {
  const { width } = useWindowDimensions()
  const isTablet = width >= TABLET_BREAKPOINT
  const cols = isTablet ? Math.floor((width - CONTAINER_PADDING * 2) / 130) : MOBILE_COLS
  const totalGap = ITEM_GAP * (cols - 1)
  const itemWidth = (width - CONTAINER_PADDING * 2 - totalGap) / cols
  return { cols, itemWidth }
}

// ─── Album Item ───────────────────────────────────────────────────────────────

interface AlbumItemProps {
  album: OfflineAlbum
  itemWidth: number
  onPress: (album: OfflineAlbum) => void
}

function AlbumItem({ album, itemWidth, onPress }: AlbumItemProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const { isPlaying, currentTime } = usePlayer()

  const isActiveAlbum = currentTrack
    ? album.tracks.some((t) => t.id === currentTrack.id)
    : false

  const progress = isActiveAlbum && currentTrack
    ? currentTime / (currentTrack.durationSeconds || 1)
    : 0

  return (
    <Pressable
      onPress={() => onPress(album)}
      style={({ pressed }) => [
        styles.item,
        { width: itemWidth, opacity: pressed ? 0.8 : 1 }
      ]}
    >
      {/* Ảnh bìa — luôn hiển thị */}
      <View style={[styles.imageWrapper, { width: itemWidth, height: itemWidth, borderRadius: RADIUS.lg }]}>
        <Image
          source={{ uri: album.coverUrl }}
          style={styles.image}
          contentFit='cover'
          transition={200}
        />
        <LinearGradient
          colors={['transparent', 'rgba(8, 3, 22, 0.85)']}
          style={styles.gradientOverlay}
        />

        {/* Góc dưới trái: SpinningDisc khi đang phát, Play button khi không */}
        {isActiveAlbum ? (
          <View style={styles.miniDiscWrapper}>
            <SpinningDisc
              uri={currentTrack!.coverUrl}
              isPlaying={isPlaying}
              size={MINI_DISC_SIZE}
              showHole={false}
              showGlow={false}
            />
            {/* Circular progress bao quanh disc nhỏ */}
            <View style={StyleSheet.absoluteFill}>
              <CircularProgress
                size={MINI_DISC_SIZE}
                progress={progress}
                strokeWidth={2.5}
              />
            </View>
          </View>
        ) : (
          <MediaActionButtons
            variant='inline'
            showLike={false}
            showDownload={false}
            playSize={MINI_DISC_SIZE}
            iconSize={13}
            onPlay={() => onPress(album)}
            style={{ position: 'absolute', bottom: 6, left: 6 }}
          />
        )}
      </View>

      {/* Tên nghệ sĩ */}
      <Text
        style={[styles.title, { width: itemWidth }, isActiveAlbum && { color: COLORS.primary }]}
        numberOfLines={1}
        ellipsizeMode='tail'
      >
        {album.artist}
      </Text>
      <Text style={[styles.subtitle, { width: itemWidth }]} numberOfLines={1}>
        {album.trackCount} bài hát
      </Text>
    </Pressable>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OfflineAlbumGridProps {
  albums: OfflineAlbum[]
  onPress: (album: OfflineAlbum) => void
}

export function OfflineAlbumGrid({ albums, onPress }: OfflineAlbumGridProps) {
  const { itemWidth } = useGridConfig()

  return (
    <View style={styles.grid}>
      {albums.map((album) => (
        <AlbumItem
          key={album.id}
          album={album}
          itemWidth={itemWidth}
          onPress={onPress}
        />
      ))}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CONTAINER_PADDING,
    gap: ITEM_GAP,
  },
  item: {
    gap: SPACING.xs,
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  miniDiscWrapper: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: MINI_DISC_SIZE,
    height: MINI_DISC_SIZE,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
})
