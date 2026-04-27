/**
 * @file AlbumDetailScreen.tsx
 * @description Màn hình chi tiết album — hero ảnh bìa, track list, album info.
 * Dữ liệu được tải động từ API /ytmusic/album/{id}.
 * @module features/home
 */

import { View, ScrollView, Pressable, StyleSheet, Dimensions, Text, ActivityIndicator } from 'react-native'

import { useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSafePush } from '@core/hooks/useSafePush'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Play, Shuffle, Heart, MoreHorizontal, RefreshCw } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing'
import { PlayButton } from '@shared/components/PlayButton'
import { TrackListItem } from '@shared/components/TrackListItem'
import { useAlbumDetail } from '../hooks/useAlbumDetail'
import { usePlayerStore } from '@features/player/store/playerStore'
import * as AudioManager from '@core/audio/AudioManager'
import type { Track } from '@shared/types/track'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const COVER_SIZE = SCREEN_WIDTH * 0.55

interface AlbumDetailScreenProps {
  albumId: string
}

export default function AlbumDetailScreen({ albumId }: AlbumDetailScreenProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const safePush = useSafePush()

  // Tải dữ liệu album từ API
  const { album, isLoading, error, refetch } = useAlbumDetail(albumId)
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id)

  /**
   * Phát một bài hát trong context album.
   * - Nếu bài đang phát: chỉ mở Player + resume nếu đang tạm dừng
   * - Nếu bài mới: thay thế queue = toàn bộ tracks của album, load & play
   * Dùng safePush để tránh double-click mở 2 player page
   */
  const handleTrackPress = useCallback(
    (track: Track) => {
      const store = usePlayerStore.getState()

      // Nếu click vào đúng bài đang phát → chỉ mở Player, không phát lại từ đầu
      if (store.currentTrack?.id === track.id) {
        safePush(`/player/${track.id}`)
        if (AudioManager.getPlaybackState() === 'paused') {
          AudioManager.play()
        }
        return
      }

      // Bài mới → thay thế queue = toàn bộ tracks album
      const albumTracks = album?.tracks ?? []
      store.setQueue(albumTracks)
      store.setCurrentTrack(track)

      // Navigate ngay → audio load ngầm phía sau
      safePush(`/player/${track.id}`)

      if (track.streamUrl) {
        AudioManager.loadAndPlay(track as Track & { streamUrl: string }).catch((err) =>
          console.error('Lỗi load audio từ album:', err)
        )
      }
    },
    [safePush, album?.tracks]
  )

  /** Phát toàn bộ album — bắt đầu từ bài đầu tiên */
  const handlePlayAll = useCallback(() => {
    if (!album || album.tracks.length === 0) return
    handleTrackPress(album.tracks[0])
  }, [album, handleTrackPress])

  /** Phát ngẫu nhiên toàn bộ album */
  const handleShuffle = useCallback(() => {
    if (!album || album.tracks.length === 0) return
    const store = usePlayerStore.getState()
    store.setQueue(album.tracks)
    // Bật shuffle trước khi phát
    if (!store.shuffleEnabled) store.toggleShuffle()
    // Chọn bài ngẫu nhiên để bắt đầu
    const randomIndex = Math.floor(Math.random() * album.tracks.length)
    handleTrackPress(album.tracks[randomIndex])
  }, [album, handleTrackPress])

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải album...</Text>
      </View>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (error || !album) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Không thể tải album</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <RefreshCw size={18} color={COLORS.textPrimary} />
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Quay lại</Text>
        </Pressable>
      </View>
    )
  }

  // Tổng thời lượng album (tính từ tracks nếu API không trả về)
  const totalDuration = album.duration || formatAlbumDuration(album.tracks)

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Image source={{ uri: album.coverUrl }} style={styles.heroBg} contentFit='cover' blurRadius={50} />
          <LinearGradient
            colors={['rgba(8,3,22,0.2)', 'rgba(8,3,22,0.75)', COLORS.background]}
            style={styles.heroGradient}
          />

          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
            hitSlop={12}
          >
            <ArrowLeft size={24} color='#FFFFFF' />
          </Pressable>

          <View style={[styles.coverWrap, { marginTop: insets.top + 56 }]}>
            <Image source={{ uri: album.coverUrl }} style={styles.coverImage} contentFit='cover' transition={300} />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Pressable onPress={() => album.artistId && safePush(`/artist/${album.artistId}` as any)}>
            <Text style={styles.albumArtist}>{album.artist}</Text>
          </Pressable>
          <Text style={styles.albumMeta}>
            {album.type} · {album.year} · {album.trackCount} bài{totalDuration ? ` · ${totalDuration}` : ''}
          </Text>
          {album.description ? (
            <Text style={styles.albumDescription} numberOfLines={3}>
              {album.description}
            </Text>
          ) : null}
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.controlsLeft}>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <Heart size={22} color={COLORS.textSecondary} />
            </Pressable>
            <Pressable style={styles.iconBtn} hitSlop={8}>
              <MoreHorizontal size={22} color={COLORS.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.controlsRight}>
            <Pressable style={styles.shuffleBtn} onPress={handleShuffle}>
              <Shuffle size={18} color={COLORS.textPrimary} />
            </Pressable>
            <PlayButton size='lg' onPress={handlePlayAll} />
          </View>
        </View>

        {/* Track list */}
        <View style={styles.trackList}>
          {album.tracks.map((track, idx) => (
            <TrackListItem
              key={track.id}
              track={track}
              index={idx + 1}
              showCover
              isActive={currentTrackId === track.id}
              onPress={handleTrackPress}
              onMenuPress={() => {}}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Tính tổng thời lượng album từ danh sách tracks.
 * Trả về dạng "32 phút" hoặc "1 giờ 15 phút".
 */
function formatAlbumDuration(tracks: Track[]): string {
  const totalSeconds = tracks.reduce((sum, t) => sum + (t.durationSeconds || 0), 0)
  if (totalSeconds === 0) return ''
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.ceil((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours} giờ ${minutes} phút`
  return `${minutes} phút`
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  retryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  backLink: {
    marginTop: SPACING.lg
  },
  backLinkText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary
  },
  heroSection: {
    height: COVER_SIZE + 140,
    position: 'relative'
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject
  },
  backBtn: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  coverWrap: {
    alignItems: 'center',
    ...SHADOWS.ambient
  },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: RADIUS.lg
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl']
  },
  albumTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center'
  },
  albumArtist: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.xs
  },
  albumMeta: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs
  },
  albumDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    lineHeight: 20
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl']
  },
  controlsLeft: {
    flexDirection: 'row',
    gap: SPACING.md
  },
  controlsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  shuffleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  trackList: {
    marginTop: SPACING['2xl']
  }
})
