/**
 * @file LibraryScreen.tsx
 * @description Màn hình thư viện nhạc — trung tâm quản lý nội dung cá nhân.
 * Filter tabs, liked songs hero, playlists, albums, toggle view.
 * @module features/library
 */

import { View, ScrollView, Pressable, StyleSheet, Dimensions, Text } from 'react-native'

import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus, Heart, Clock, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native'
import { useLibrary } from '../hooks/useLibrary'
import { usePlayerStore } from '@features/player/store/playerStore'
import * as AudioManager from '@core/audio/AudioManager'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS, LAYOUT } from '@shared/constants/spacing'
import { GlassCard } from '@shared/components/GlassCard'
import { TrackListItem } from '@shared/components/TrackListItem'
import { EmptyState } from '@shared/components/EmptyState'
import type { LibraryTab } from '../types'
import type { Track } from '@shared/types/track'

const { width } = Dimensions.get('window')

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Filter tabs — Tất cả / Playlist / Album / Nghệ sĩ / Đã tải */
function LibraryFilterTabs({
  activeTab,
  onTabChange
}: {
  activeTab: LibraryTab
  onTabChange: (tab: LibraryTab) => void
}) {
  const tabs: { key: LibraryTab; label: string }[] = [
    { key: 'tracks', label: 'Bài hát' },
    { key: 'playlists', label: 'Playlist' },
    { key: 'albums', label: 'Album' },
    { key: 'downloads', label: 'Yêu thích' }
  ]

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={[styles.filterTab, activeTab === tab.key && styles.filterTabActive]}
        >
          <Text style={[styles.filterTabText, activeTab === tab.key && styles.filterTabTextActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

/** Hero card — Liked Songs */
function LikedSongsHero({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <LinearGradient
        colors={['#6C5CE7', '#B026FF', '#872CA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.likedHero}
      >
        <View style={styles.likedHeroContent}>
          <Heart size={28} color='#FFFFFF' fill='#FFFFFF' />
          <View style={styles.likedHeroInfo}>
            <Text style={styles.likedHeroTitle}>Bài hát đã thích</Text>
            <Text style={styles.likedHeroCount}>{count} bài hát</Text>
          </View>
        </View>
        <ChevronRight size={22} color='rgba(255,255,255,0.7)' />
      </LinearGradient>
    </Pressable>
  )
}

/** Card danh sách nghe gần đây */
function RecentlyPlayedEntry({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.recentEntry, pressed && { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
          <View style={styles.recentEntryIcon}>
            <Clock size={22} color={COLORS.primary} />
          </View>
          <View style={styles.recentEntryInfo}>
            <Text style={styles.recentEntryTitle}>Nghe gần đây</Text>
            <Text style={styles.recentEntryDesc}>Lịch sử phát nhạc của bạn</Text>
          </View>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </View>
      )}
    </Pressable>
  )
}

/** Playlist card item (Isolated rounded card) */
function PlaylistItem({
  title,
  trackCount,
  coverUrl,
  onPress,
  isSelected = false
}: {
  title: string
  trackCount: number
  coverUrl?: string
  onPress: () => void
  isSelected?: boolean
}) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: SPACING.md }}>
      {({ pressed }) => (
        <View style={styles.playlistCardWrapper}>
          {isSelected && (
            <LinearGradient
              colors={['#EA4F88', '#B026FF', '#2196F3']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <View
            style={[
              styles.playlistCardInner,
              isSelected && styles.playlistCardInnerSelected,
              pressed && { opacity: 0.8 }
            ]}
          >
            <View style={styles.playlistCover}>
              {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.playlistCoverImage} contentFit='cover' />
              ) : (
                <LinearGradient colors={[COLORS.secondary, COLORS.tertiary]} style={styles.playlistCoverImage}>
                  <Text style={styles.playlistCoverText}>♫</Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistTitle} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.playlistCount}>{trackCount} bài hát</Text>
            </View>
            <View style={styles.moreButton}>
              <MoreHorizontal size={18} color='#A0A0A0' />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Màn hình thư viện nhạc của người dùng.
 * Hiển thị liked songs, playlists, albums, bài đã tải.
 */
export default function LibraryScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { tracks, isLoading, removeTrack } = useLibrary()
  const playerStore = usePlayerStore()
  const [activeTab, setActiveTab] = useState<LibraryTab>('tracks')

  const handlePlayTrack = useCallback(
    async (track: Track) => {
      // Truy Cập Trang Player mà không restart nếu bấm trúng bài đang phát/pause
      if (playerStore.currentTrack?.id === track.id) {
        if (!playerStore.isPlaying) {
          await AudioManager.play()
        }
        router.push(`/player/${track.id}`)
        return
      }

      // Đẩy toàn bộ màn hình Library vào Queue
      playerStore.setQueue(tracks)
      playerStore.setCurrentTrack(track)

      await AudioManager.loadAndPlay({
        id: track.id,
        title: track.title,
        artist: track.artist,
        streamUrl: track.streamUrl || '',
        coverUrl: track.coverUrl,
        durationSeconds: track.durationSeconds
      })

      playerStore.setIsPlaying(true)
      router.push(`/player/${track.id}`)
    },
    [tracks, playerStore, router]
  )

  return (
    <View style={styles.container}>
      {/* Cực tím Gradient background ở top giống ảnh */}
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.25)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ambientTopGlow}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header (Back, Title, Heart) */}
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
          <Text style={styles.headerTitleLeft}>Thư viện</Text>
          <Pressable style={styles.iconButton} onPress={() => router.push('/playlist/create' as any)}>
            <Plus size={20} color='#FFFFFF' />
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <LibraryFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Render nội dung theo Tab */}
        {activeTab === 'playlists' && (
          <View style={styles.listSection}>
            <View style={styles.sectionContent}>
              <PlaylistItem title="I'm Lovin' Myself" trackCount={12} onPress={() => {}} isSelected />
              <PlaylistItem title='Workout Mix' trackCount={8} onPress={() => {}} />
              <PlaylistItem title='Chill Night' trackCount={15} onPress={() => {}} />
              <PlaylistItem title='Nhạc yêu thích' trackCount={tracks.length} onPress={() => {}} />
            </View>
          </View>
        )}

        {activeTab === 'tracks' && tracks.length > 0 && (
          <View style={styles.listSection}>
            {tracks.map((track) => (
              <TrackListItem
                key={track.id}
                track={track}
                onPress={() => handlePlayTrack(track)}
                onMenuPress={() => {
                  removeTrack(track.id)
                }}
              />
            ))}
          </View>
        )}

        {activeTab === 'tracks' && !isLoading && tracks.length === 0 && (
          <EmptyState
            icon='heart-outline'
            title='Chưa có bài hát'
            description='Hãy tải các bài hát để thêm vào thư viện offline của bạn.'
          />
        )}

        {(activeTab === 'albums' || activeTab === 'downloads') && (
          <EmptyState icon='folder-outline' title='Chưa có dữ liệu' description='Tính năng này đang được phát triển.' />
        )}

        {/* Spacer cho TabBar và MiniPlayer */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleLeft: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: '#FFFFFF'
  },

  // Filter Tabs
  tabsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING['2xl']
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

  // Hero
  heroSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg
  },
  likedHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.purpleGlow
  },
  likedHeroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md
  },
  likedHeroInfo: {},
  likedHeroTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  likedHeroCount: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2
  },

  // Recently Played Entry
  entrySection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING['2xl']
  },
  recentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md
  },
  recentEntryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(176, 38, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentEntryInfo: {
    flex: 1
  },
  recentEntryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  recentEntryDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2
  },

  // List Section
  listSection: {
    marginBottom: SPACING['2xl']
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm
  },
  sectionContent: {
    marginHorizontal: SPACING.lg
  },

  // PlaylistItem (Isolated Card)
  playlistCardWrapper: {
    borderRadius: RADIUS.xl,
    padding: 1, // for gradient border thickness
    overflow: 'hidden'
  },
  playlistCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: 'rgba(18, 13, 32, 0.85)',
    borderRadius: RADIUS.xl - 1
  },
  playlistCardInnerSelected: {
    backgroundColor: 'rgba(18, 13, 32, 0.95)'
  },
  playlistCover: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  playlistCoverImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playlistCoverText: {
    fontSize: 24,
    color: '#FFFFFF'
  },
  playlistInfo: {
    flex: 1
  },
  playlistTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4
  },
  playlistCount: {
    fontSize: FONT_SIZE.sm,
    color: '#888888'
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
