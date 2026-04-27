/**
 * @file ArtistDetailScreen.tsx
 * @description Trang hồ sơ nghệ sĩ — hero banner, popular songs, albums, bio.
 * Dữ liệu được tải động từ API /ytmusic/artist/{id}.
 * @module features/home
 */

import { View, ScrollView, Pressable, StyleSheet, Dimensions, Text, ActivityIndicator } from 'react-native'
import { useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useSafePush } from '@core/hooks/useSafePush'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, UserPlus, RefreshCw } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { HorizontalCardList } from '@shared/components/HorizontalCardList'
import { PlayButton } from '@shared/components/PlayButton'
import { SectionHeader } from '@shared/components/SectionHeader'
import { TrackListItem } from '@shared/components/TrackListItem'
import { useArtistDetail } from '../hooks/useArtistDetail'
import { usePlayerStore } from '@features/player/store/playerStore'
import * as AudioManager from '@core/audio/AudioManager'
import type { Track } from '@shared/types/track'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ArtistDetailScreenProps {
  artistId: string
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Skeleton loading khi đang tải dữ liệu nghệ sĩ */
function ArtistSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Hero skeleton */}
      <View style={styles.skeletonHero} />
      {/* Name skeleton */}
      <View style={styles.skeletonName} />
      <View style={styles.skeletonSub} />
      {/* Track skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.skeletonTrack}>
          <View style={styles.skeletonTrackCover} />
          <View style={styles.skeletonTrackInfo}>
            <View style={styles.skeletonTrackTitle} />
            <View style={styles.skeletonTrackArtist} />
          </View>
        </View>
      ))}
    </View>
  )
}

/** Trạng thái lỗi với nút thử lại */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>😢</Text>
      <Text style={styles.errorTitle}>Không thể tải thông tin</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryBtn}>
        <RefreshCw size={16} color='#FFFFFF' />
        <Text style={styles.retryBtnText}>Thử lại</Text>
      </Pressable>
    </View>
  )
}



// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ArtistDetailScreen({ artistId }: ArtistDetailScreenProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  // Tải dữ liệu nghệ sĩ từ API
  const { artist, isLoading, error, refetch } = useArtistDetail(artistId)
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id)

  const safePush = useSafePush()

  /** Danh sách top songs hiển thị (tối đa 10 bài) */
  const displayTopSongs = artist?.topSongs.slice(0, 10) ?? []

  /**
   * Phát một bài hát trong context "Bài hát nổi bật".
   * - Nếu bài đang phát: chỉ mở Player + resume nếu đang tạm dừng
   * - Nếu bài mới: thay thế queue = top songs, load & play
   * Dùng safePush để tránh double-click mở 2 player page
   */
  const handleTrackPress = useCallback(async (track: Track) => {
    try {
      const store = usePlayerStore.getState()

      // Nếu click vào đúng bài đang phát → chỉ mở Player, không phát lại từ đầu
      if (store.currentTrack?.id === track.id) {
        safePush(`/player/${track.id}`)
        // Resume nếu đang tạm dừng
        if (AudioManager.getPlaybackState() === 'paused') {
          AudioManager.play()
        }
        return
      }

      // Bài mới → thay thế queue = toàn bộ "Bài hát nổi bật"
      store.setQueue(displayTopSongs)
      store.setCurrentTrack(track)

      // Navigate ngay → audio load ngầm phía sau
      safePush(`/player/${track.id}`)

      if (track.streamUrl) {
        AudioManager.loadAndPlay(track as Track & { streamUrl: string }).catch((err) =>
          console.error('Lỗi load audio từ artist:', err)
        )
      }
    } catch (err) {
      console.error('Lỗi phát nhạc từ artist:', err)
    }
  }, [safePush, displayTopSongs])

  /** Phát toàn bộ bài hát nổi bật — bắt đầu từ bài đầu tiên */
  const handlePlayAll = useCallback(async () => {
    if (displayTopSongs.length === 0) return
    await handleTrackPress(displayTopSongs[0])
  }, [displayTopSongs, handleTrackPress])

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Back button vẫn hiển thị khi loading */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
          hitSlop={12}
        >
          <ArrowLeft size={24} color='#FFFFFF' />
        </Pressable>
        <ArtistSkeleton />
      </View>
    )
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (error || !artist) {
    return (
      <View style={styles.container}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
          hitSlop={12}
        >
          <ArrowLeft size={24} color='#FFFFFF' />
        </Pressable>
        <ErrorState
          message={error?.message || 'Đã xảy ra lỗi không xác định'}
          onRetry={refetch}
        />
      </View>
    )
  }

  // ─── Chuẩn bị hiển thị subscriber ──────────────────────────────────────────
  const subscriberDisplay = artist.subscriberCount > 0
    ? artist.subscriberCount >= 1_000_000
      ? `${(artist.subscriberCount / 1_000_000).toFixed(1)}M người theo dõi`
      : artist.subscriberCount >= 1_000
        ? `${(artist.subscriberCount / 1_000).toFixed(0)}K người theo dõi`
        : `${artist.subscriberCount} người theo dõi`
    : artist.subscriberText || ''

  // Gộp albums + singles thành 1 danh sách để hiển thị
  const allAlbums = [...artist.albums, ...artist.singles]

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <View style={styles.heroBanner}>
          <Image source={{ uri: artist.avatarUrl }} style={styles.heroBg} contentFit='cover' />
          <LinearGradient colors={['transparent', 'rgba(8,3,22,0.6)', COLORS.background]} style={styles.heroOverlay} />

          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { top: insets.top + SPACING.sm }]}
            hitSlop={12}
          >
            <ArrowLeft size={24} color='#FFFFFF' />
          </Pressable>

          {/* Artist info overlay */}
          <View style={styles.heroInfo}>
            <Text style={styles.artistName}>{artist.name}</Text>
            {subscriberDisplay ? (
              <Text style={styles.artistFollowers}>{subscriberDisplay}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Popular Songs ────────────────────────────────────────────── */}
        {displayTopSongs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title='Bài hát nổi bật' />
            {displayTopSongs.map((track, idx) => (
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
        )}

        {/* ── Albums & Singles ─────────────────────────────────────────── */}
        {allAlbums.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title='Album & Single' />
            <HorizontalCardList
              items={allAlbums.map((album) => ({
                id: album.id,
                imageUrl: album.coverUrl,
                title: album.title,
                subtitle: album.year,
              }))}
              size='md'
              showPlayButton={false}
              onPress={(item) => router.push(`/album/${item.id}` as any)}
            />
          </View>
        )}

        {/* ── Bio ──────────────────────────────────────────────────────── */}
        {artist.description ? (
          <View style={styles.section}>
            <SectionHeader title='Giới thiệu' />
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{artist.description}</Text>
            </View>
          </View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  // Hero
  heroBanner: {
    height: 320,
    position: 'relative'
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject
  },
  heroOverlay: {
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
  heroInfo: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    left: SPACING.lg,
    right: SPACING.lg
  },
  artistName: {
    fontSize: FONT_SIZE['4xl'],
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  artistFollowers: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm
  },
  followBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary
  },

  // Sections
  section: {
    marginTop: SPACING['2xl']
  },



  // Bio
  bioCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22
  },

  // ─── Skeleton ──────────────────────────────────────────────────────────────
  skeletonContainer: {
    flex: 1,
    paddingTop: 0,
  },
  skeletonHero: {
    height: 320,
    backgroundColor: COLORS.surface,
  },
  skeletonName: {
    width: 200,
    height: 28,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.lg,
    marginTop: SPACING.xl,
  },
  skeletonSub: {
    width: 140,
    height: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.lg,
    marginTop: SPACING.sm,
  },
  skeletonTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  skeletonTrackCover: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  skeletonTrackInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  skeletonTrackTitle: {
    width: '70%',
    height: 14,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },
  skeletonTrackArtist: {
    width: '45%',
    height: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
  },

  // ─── Error State ───────────────────────────────────────────────────────────
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
    gap: SPACING.md,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  retryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
