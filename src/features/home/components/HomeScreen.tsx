/**
 * @file HomeScreen.tsx
 * @description Màn hình trang chủ — Khám phá nhạc.
 * Hiển thị featured banner, top songs, nghe nhiều nhất, playlist gợi ý.
 *
 * Thiết kế theo phong cách Mood Beat: dark neon, purple glow, glassmorphism.
 * @module features/home
 */

import {
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  StyleSheet,
  Text
} from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, Search } from 'lucide-react-native'
import { GlassIconButton } from '@shared/components/GlassIconButton'

import { createLogger } from '@core/logger'
import { useSafePush } from '@core/hooks/useSafePush'
import { useHome } from '../hooks/useHome'
import { useAuthStore } from '@features/auth/store/authStore'
import { usePlayerStore } from '@features/player/store/playerStore'
import * as AudioManager from '@core/audio/AudioManager'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, LAYOUT } from '@shared/constants/spacing'
import { SectionHeader } from '@shared/components/SectionHeader'
import { TrackListItem } from '@shared/components/TrackListItem'
import { HorizontalCardList } from '@shared/components/HorizontalCardList'
import { MusicBannerCarousel } from './MusicBannerCarousel'
import type { Track } from '@shared/types/track'
import type { RecommendedPlaylist } from '../types'

const logger = createLogger('home-screen')
const { width: SCREEN_WIDTH } = Dimensions.get('window')
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Hook phát nhạc dùng chung cho toàn màn hình Home */
function usePlayTrack() {
  const safePush = useSafePush()

  return useCallback(
    async (track: Track, contextTracks?: Track[]) => {
      const store = usePlayerStore.getState()

      // Nếu click vào đúng bài đang phát -> Chỉ mở Player, KHÔNG phát lại từ đầu
      if (store.currentTrack?.id === track.id) {
        safePush(`/player/${track.id}`)
        // Nếu bài hát đang tạm dừng thì cho phát tiếp
        if (AudioManager.getPlaybackState() === 'paused') {
          AudioManager.play()
        }
        return
      }

      // Cập nhật toàn bộ queue nếu có truyền context (danh sách bài hát ngữ cảnh)
      if (contextTracks && contextTracks.length > 0) {
        store.setQueue(contextTracks)
      } else {
        if (!store.queue.some((t) => t.id === track.id)) {
          store.addToQueue(track)
        }
      }

      store.setCurrentTrack(track)

      // Navigate ngay → audio load ngầm phía sau
      safePush(`/player/${track.id}`)

      if (track.streamUrl) {
        AudioManager.loadAndPlay(track as Track & { streamUrl: string }).catch((err) => {
          logger.error('Lỗi phát nhạc từ Home', { err })
        })
      }
    },
    [safePush]
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Header với lời chào + username + avatar */
function HomeHeader() {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const safePush = useSafePush()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng ☀️' : hour < 18 ? 'Chào buổi chiều 🌤️' : 'Chào buổi tối 🌙'

  return (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
      <View style={styles.headerLeft}>
        <Image
          source={
            user?.profile_picture
              ? { uri: user.profile_picture }
              : process.env.EXPO_PUBLIC_USER_DEFAULT_IMG && process.env.EXPO_PUBLIC_USER_DEFAULT_IMG.startsWith('http')
                ? { uri: process.env.EXPO_PUBLIC_USER_DEFAULT_IMG }
                : require('../../../../assets/images/user-default.png') // Tạm dùng logo làm fallback nếu chưa có file user-default.png
          }
          style={styles.avatar}
          contentFit='cover'
        />
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name ?? 'Nghe nhạc vui vẻ!'}
          </Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <GlassIconButton hitSlop={10}>
          <Bell size={20} color={COLORS.textSecondary} />
          {/* <View style={styles.bellDot} /> */}
        </GlassIconButton>
        <GlassIconButton onPress={() => safePush('/(tabs)/search')} hitSlop={10}>
          <Search size={20} color={COLORS.textSecondary} />
        </GlassIconButton>
      </View>
    </View>
  )
}

/** Skeleton loading placeholder */
function HomeSkeleton() {
  const pulse = (width: number, height: number, radius: number = RADIUS.md) => (
    <View style={[styles.skeleton, { width, height, borderRadius: radius }]} />
  )

  return (
    <View style={{ paddingHorizontal: SPACING.lg, gap: SPACING.lg, marginTop: SPACING.lg }}>
      {/* Banner skeleton */}
      {pulse(BANNER_WIDTH, 200, RADIUS.xl)}

      {/* Section title */}
      {pulse(140, 18, RADIUS.sm)}

      {/* Track list skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: SPACING.md, alignItems: 'center' }}>
          {pulse(52, 52, RADIUS.full)}
          <View style={{ gap: 6 }}>
            {pulse(160, 14, RADIUS.sm)}
            {pulse(100, 11, RADIUS.sm)}
          </View>
        </View>
      ))}
    </View>
  )
}

/** Top Songs — List dùng TrackListItem */
function TopSongsSection({
  tracks,
  onPress
}: {
  tracks: Track[]
  onPress: (track: Track, contextTracks?: Track[]) => void
}) {
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id)

  if (!tracks || tracks.length === 0) return null

  const displayTracks = tracks.slice(0, 8)

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title='Thịnh hành hôm nay' />
      <View>
        {displayTracks.map((track, idx) => (
          <TrackListItem
            key={`top-${track.id}-${idx}`}
            track={track}
            index={idx + 1}
            showCover
            showDuration
            isActive={currentTrackId === track.id}
            onPress={() => onPress(track, displayTracks)}
            onMenuPress={undefined}
          />
        ))}
      </View>
    </View>
  )
}

/** Nghe nhiều nhất — Horizontal scroll cards */
function MostPlayedSection({
  tracks,
  onPress
}: {
  tracks: Track[]
  onPress: (track: Track, contextTracks?: Track[]) => void
}) {
  if (!tracks || tracks.length === 0) return null

  const displayTracks = tracks.slice(3, 13)

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title='Nghe nhiều nhất' />
      <HorizontalCardList
        items={displayTracks.map((t) => ({
          id: t.id,
          imageUrl: t.coverUrl,
          title: t.title,
          subtitle: t.artist
        }))}
        size='md'
        actionVariant='inline'
        showGradientOverlay
        imageAspectRatio={1.125}
        onPress={(item) => {
          const track = displayTracks.find((t) => t.id === item.id)
          if (track) onPress(track, displayTracks)
        }}
      />
    </View>
  )
}

/** Playlist gợi ý — Horizontal scroll cards */
function RecommendedSection({
  playlists,
  onPress
}: {
  playlists: RecommendedPlaylist[]
  onPress: (pl: RecommendedPlaylist) => void
}) {
  if (!playlists || playlists.length === 0) return null

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title='Dành cho bạn' actionText='Xem tất cả' onSeeAll={() => {}} />
      <HorizontalCardList
        items={playlists.map((pl) => ({
          id: pl.id,
          imageUrl: pl.coverUrl,
          title: pl.title,
          subtitle: `${pl.trackCount} bài hát`
        }))}
        size='md'
        onPress={(item) => {
          const pl = playlists.find((p) => p.id === item.id)
          if (pl) onPress(pl)
        }}
      />
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Màn hình trang chủ — Khám phá nhạc.
 */
export default function HomeScreen() {
  const { feed, isLoading, refetch } = useHome()
  const [refreshing, setRefreshing] = useState(false)
  const handlePlayTrack = usePlayTrack()

  const onRefresh = useCallback(async () => {
    logger.info('Người dùng kéo refresh trang chủ')
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <View style={styles.container}>
      {/* Ambient purple glow top */}
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.18)', 'transparent']}
        start={{ x: 0.6, y: 0 }}
        end={{ x: 0.4, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents='none'
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <HomeHeader />

        {isLoading ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* Banner nổi bật */}
            <MusicBannerCarousel
              data={(feed?.featured ?? []).map((f) => ({
                id: f.id,
                title: f.title,
                subtitle: f.subtitle,
                imageUrl: f.imageUrl
              }))}
              onPress={(item) => {
                const track = feed?.recentlyPlayed.find((t) => item.id.includes(t.id))
                if (track) handlePlayTrack(track)
              }}
            />

            {/* Top Songs */}
            <TopSongsSection tracks={feed?.recentlyPlayed ?? []} onPress={handlePlayTrack} />

            {/* Nghe nhiều nhất */}
            <MostPlayedSection tracks={feed?.recentlyPlayed ?? []} onPress={handlePlayTrack} />

            {/* Playlist gợi ý */}
            <RecommendedSection
              playlists={feed?.recommendedPlaylists ?? []}
              onPress={(pl) => {
                if (pl.tracks.length === 0) return
                const store = usePlayerStore.getState()
                // Thêm toàn bộ tracks vào queue
                pl.tracks.forEach((t) => {
                  if (!store.queue.some((q) => q.id === t.id)) {
                    store.addToQueue(t)
                  }
                })
                // Phát bài đầu tiên
                handlePlayTrack(pl.tracks[0])
              }}
            />
          </>
        )}

        <View style={{ height: LAYOUT.miniPlayerOffset }} />
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

  // Skeleton
  skeleton: {
    backgroundColor: COLORS.surface,
    opacity: 0.7
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    marginRight: SPACING.md
  },
  greeting: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  userName: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
    letterSpacing: -0.3
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.background
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary
  },

  // Section container
  sectionContainer: {
    marginTop: SPACING['2xl']
  }
})
