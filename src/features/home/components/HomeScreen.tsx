/**
 * @file HomeScreen.tsx
 * @description Màn hình trang chủ — Khám phá nhạc.
 * Hiển thị featured banner, top songs, nghe gần đây, playlist gợi ý, nghệ sĩ.
 *
 * Thiết kế theo phong cách Mood Beat: dark neon, purple glow, glassmorphism.
 * @module features/home
 */

import { View, ScrollView, RefreshControl, Pressable, Dimensions, StyleSheet, Text } from 'react-native'

import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, Mic } from 'lucide-react-native'
import { createLogger } from '@core/logger'
import { useHome } from '../hooks/useHome'
import { useAuthStore } from '@features/auth/store/authStore'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS, LAYOUT } from '@shared/constants/spacing'
import { SectionHeader } from '@shared/components/SectionHeader'
import { PlayButton } from '@shared/components/PlayButton'
import { formatDuration } from '@shared/utils/formatDuration'
import type { Track } from '@shared/types/track'
import type { FeaturedItem, RecommendedPlaylist } from '../types'

const logger = createLogger('home-screen')
const { width: SCREEN_WIDTH } = Dimensions.get('window')
const BANNER_WIDTH = SCREEN_WIDTH - 32
const CARD_WIDTH = 150

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Header với lời chào + username + avatar */
function HomeHeader() {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.userName}>{user?.name ?? 'Nghe nhạc vui vẻ!'}</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.bellBtn}>
          <Bell size={20} color='#FFFFFF' />
          <View style={styles.bellDot} />
        </View>
        <Image
          source={{ uri: user?.profile_picture || 'https://i.pravatar.cc/150?img=47' }}
          style={styles.avatar}
          contentFit='cover'
        />
      </View>
    </View>
  )
}

/** Categories Pills */
function HomeCategories() {
  const tabs = ['Tất cả', 'Thịnh hành', 'Yêu thích', 'Ngẫu nhiên']
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
      {tabs.map((tab, idx) => (
        <Pressable key={tab} style={[styles.filterTab, idx === 0 && styles.filterTabActive]}>
          <Text style={[styles.filterTabText, idx === 0 && styles.filterTabTextActive]}>{tab}</Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

/** Banner nổi bật — carousel cuộn ngang */
function FeaturedBannerSection({ items }: { items: FeaturedItem[] }) {
  const router = useRouter()

  if (!items || items.length === 0) return null

  const handlePress = (item: FeaturedItem) => {
    if (item.type === 'track') router.push(`/player/${item.targetId}`)
    else if (item.type === 'playlist') router.push(`/playlist/${item.targetId}`)
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      snapToInterval={BANNER_WIDTH + SPACING.md}
      decelerationRate='fast'
      contentContainerStyle={styles.bannerScroll}
      style={styles.bannerContainer}
    >
      {items.map((item, index) => (
        <Pressable key={item.id} onPress={() => handlePress(item)} style={styles.bannerCard}>
          <LinearGradient
            colors={index % 2 === 0 ? ['#E3A8FF', '#A374FF'] : ['#4AC29A', '#BDFFF3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContent}>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
              <View style={styles.bannerPlayBtn}>
                <PlayButton size='md' onPress={() => handlePress(item)} />
              </View>
            </View>
            <View style={styles.bannerImageWrapper}>
              <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} contentFit='cover' />
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  )
}

/** Top Songs — Grid 2 cột cards ngang */
function TopSongsSection({ tracks }: { tracks: Track[] }) {
  const router = useRouter()

  if (!tracks || tracks.length === 0) return null

  // Chỉ lấy 6 bài đầu cho grid
  const displayTracks = tracks.slice(0, 6)

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title='Thịnh hành hôm nay' />
      <View style={styles.topSongsGrid}>
        {displayTracks.map((track) => (
          <Pressable key={`top-${track.id}`} onPress={() => router.push(`/player/${track.id}`)}>
            {({ pressed }) => (
              <View style={[styles.topSongCard, pressed && styles.cardPressed]}>
                <Image
                  source={{ uri: track.coverUrl }}
                  style={styles.topSongImage}
                  contentFit='cover'
                  transition={200}
                />
                <View style={styles.topSongInfo}>
                  <Text style={styles.topSongTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.topSongArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

/** Nghe gần đây — Horizontal scroll cards (Most Popular style) */
function RecentlyPlayedSection({ tracks }: { tracks: Track[] }) {
  const router = useRouter()

  if (!tracks || tracks.length === 0) return null

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title='Nghe nhiều nhất' />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {tracks.map((track) => (
          <Pressable
            key={track.id}
            onPress={() => router.push(`/player/${track.id}`)}
            style={({ pressed }) => [styles.popularCard, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.popularImageWrapper}>
              <Image source={{ uri: track.coverUrl }} style={styles.popularImage} contentFit='cover' transition={200} />
              <LinearGradient colors={['transparent', 'rgba(0, 0, 0, 0.7)']} style={styles.popularImageOverlay} />
              <View style={styles.popularTextOverlay}>
                <Text style={styles.popularTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.popularArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

/** Playlist gợi ý — Vertical List (Top Daily Playlists style) */
function RecommendedPlaylistSection({ playlists }: { playlists: RecommendedPlaylist[] }) {
  const router = useRouter()

  if (!playlists || playlists.length === 0) return null

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title='Dành cho bạn' actionText='See all' onSeeAll={() => {}} />
      <View style={styles.verticalList}>
        {playlists.map((pl) => (
          <Pressable key={pl.id} onPress={() => router.push(`/playlist/${pl.id}`)}>
            {({ pressed }) => (
              <View style={[styles.verticalListItem, pressed && styles.verticalListItemPressed]}>
                <Image
                  source={{ uri: pl.coverUrl }}
                  style={styles.verticalListImage}
                  contentFit='cover'
                  transition={200}
                />
                <View style={styles.verticalListInfo}>
                  <Text style={styles.verticalListTitle} numberOfLines={1}>
                    {pl.title}
                  </Text>
                  <Text style={styles.verticalListDesc} numberOfLines={1}>
                    Bởi MoodBeat • {pl.trackCount} bài hát
                  </Text>
                </View>
                <View style={styles.verticalListPlayBtn}>
                  <PlayButton size='sm' onPress={() => router.push(`/playlist/${pl.id}`)} />
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Màn hình trang chủ của ứng dụng — Khám phá nhạc.
 * Hiển thị banner nổi bật, bài nghe gần đây, top songs và playlist gợi ý.
 */
export default function HomeScreen() {
  const { feed, refetch } = useHome()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    logger.info('Người dùng kéo refresh trang chủ')
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.2)', 'transparent']}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ambientTopGlow}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <HomeHeader />

        {/* Categories Tabs */}
        <HomeCategories />

        {/* Banner nổi bật */}
        <FeaturedBannerSection items={feed?.featured ?? []} />

        {/* Top Songs Grid */}
        <TopSongsSection tracks={feed?.recentlyPlayed ?? []} />

        {/* Nghe gần đây */}
        <RecentlyPlayedSection tracks={feed?.recentlyPlayed ?? []} />

        {/* Playlist gợi ý */}
        <RecommendedPlaylistSection playlists={feed?.recommendedPlaylists ?? []} />

        {/* Bottom spacing cho tab bar và mini player */}
        <View style={{ height: 180 }} />
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
  ambientTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md
  },
  headerLeft: {
    flex: 1
  },
  greeting: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    fontWeight: '600'
  },
  userName: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.5
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },

  // Filter Tabs
  tabsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md
  },
  filterTab: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF'
  },
  filterTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#A0A0A0'
  },
  filterTabTextActive: {
    color: '#000000'
  },

  // Section container
  sectionContainer: {
    marginTop: SPACING['2xl']
  },

  // Banner (Discover Weekly style)
  bannerContainer: {
    marginTop: SPACING.lg
  },
  bannerScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 180,
    borderRadius: RADIUS.xl,
    overflow: 'hidden'
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row'
  },
  bannerTextContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center'
  },
  bannerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '800',
    color: '#111111',
    lineHeight: 28
  },
  bannerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: '#333333',
    fontWeight: '500',
    marginVertical: SPACING.sm
  },
  bannerPlayBtn: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start'
  },
  bannerImageWrapper: {
    width: 140,
    height: '100%',
    padding: SPACING.md,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  bannerImage: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.lg,
    transform: [{ rotate: '5deg' }],
    ...SHADOWS.card
  },

  // Top Songs Grid
  topSongsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm
  },
  topSongCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    height: 56
  },
  cardPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  topSongImage: {
    width: 56,
    height: 56
  },
  topSongInfo: {
    flex: 1,
    paddingHorizontal: SPACING.sm
  },
  topSongTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  topSongArtist: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },

  // Horizontal Scroll
  horizontalScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md
  },

  // Most Popular
  popularCard: {
    width: 160
  },
  popularImageWrapper: {
    width: 160,
    height: 180,
    borderRadius: RADIUS.xl,
    overflow: 'hidden'
  },
  popularImage: {
    width: '100%',
    height: '100%'
  },
  popularImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80
  },
  popularTextOverlay: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md
  },
  popularTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  popularArtist: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2
  },

  // Vertical List (Top Daily Playlists)
  verticalList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md
  },
  verticalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Sáng lên như Menu
    backgroundColor: 'rgba(20, 15, 45, 0.8)', // Trùng tông màu Menu Pill
    // Shadow giả lập Glow tím nhẹ
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  verticalListItemPressed: {
    backgroundColor: 'rgba(176, 38, 255, 0.15)', // Nhấn vào thì loé bóng tím
    transform: [{ scale: 0.98 }]
  },
  verticalListImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full // Also round the image perfectly
  },
  verticalListInfo: {
    flex: 1,
    marginLeft: SPACING.md
  },
  verticalListTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  verticalListDesc: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    marginTop: 4
  },
  verticalListPlayBtn: {
    marginLeft: SPACING.md
  }
})
