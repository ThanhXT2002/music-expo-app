/**
 * @file LibraryScreen.tsx
 * @description Màn hình thư viện nhạc — trung tâm quản lý nội dung cá nhân.
 * Filter tabs, liked songs hero, playlists, albums, toggle view.
 * @module features/library
 */

import { View, ScrollView, Pressable, StyleSheet, Text } from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus } from 'lucide-react-native'
import { GlassIconButton } from '@shared/components/GlassIconButton'
import { useSafePush } from '@core/hooks/useSafePush'
import { useLibrary } from '../hooks/useLibrary'
import { usePlayerStore } from '@features/player/store/playerStore'
import { usePlaylistStore } from '@features/playlist/store/playlistStore'
import { useFavoriteIdsLocal } from '../hooks/useFavorites'
import * as AudioManager from '@core/audio/AudioManager'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing'
import { TrackListItem } from '@shared/components/TrackListItem'
import { EmptyState } from '@shared/components/EmptyState'
import type { LibraryTab } from '../types'
import type { Track } from '@shared/types/track'


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
    { key: 'albums', label: 'Album' },
    { key: 'favorites', label: 'Yêu thích' }
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


// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Màn hình thư viện nhạc của người dùng.
 * Hiển thị liked songs, playlists, albums, bài đã tải.
 */
export default function LibraryScreen() {
  const insets = useSafeAreaInsets()
  const safePush = useSafePush()
  const { tracks, isLoading, removeTrack } = useLibrary()
  const playerStore = usePlayerStore()
  const [activeTab, setActiveTab] = useState<LibraryTab>('tracks')
  const { data: favoriteIds = [] } = useFavoriteIdsLocal() // Chỉ lấy từ local, không gọi API

  // Lọc bài hát offline đã yêu thích
  const offlineFavoriteTracks = tracks.filter(t => favoriteIds.includes(t.id))

  const handlePlayTrack = useCallback(
    async (track: Track) => {
      // Truy Cập Trang Player mà không restart nếu bấm trúng bài đang phát/pause
      if (playerStore.currentTrack?.id === track.id) {
        safePush(`/player/${track.id}`)
        if (AudioManager.getPlaybackState() === 'paused') {
          await AudioManager.play()
        }
        return
      }

      // Đẩy toàn bộ màn hình Library vào Queue
      playerStore.setQueue(tracks)
      playerStore.setCurrentTrack(track)

      // Navigate ngay → audio load ngầm phía sau
      safePush(`/player/${track.id}`)

      AudioManager.loadAndPlay({
        id: track.id,
        title: track.title,
        artist: track.artist,
        streamUrl: track.streamUrl || '',
        coverUrl: track.coverUrl,
        durationSeconds: track.durationSeconds
      }).catch((err) => {
        console.error('Lỗi phát nhạc từ Library:', err)
      })
    },
    [tracks, playerStore, safePush]
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
        <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
          <Text style={styles.headerTitleLeft}>Thư viện</Text>
          <View style={styles.headerRightAbsolute}>
            <GlassIconButton onPress={() => {
              const { openCreateModal } = usePlaylistStore.getState()
              openCreateModal()
            }}>
              <Plus size={20} color='#FFFFFF' />
            </GlassIconButton>
          </View>
        </View>

        {/* Filter Tabs */}
        <LibraryFilterTabs activeTab={activeTab} onTabChange={setActiveTab} />


        {activeTab === 'tracks' && tracks.length > 0 && (
          <View style={styles.listSection}>
            {tracks.map((track) => (
              <TrackListItem
                key={track.id}
                track={{ ...track, isDownloaded: true }} // Trong Library mặc định bài hát được xem là đã tải
                isActive={playerStore.currentTrack?.id === track.id}
                onPress={() => handlePlayTrack(track)}
                onDelete={() => {
                  removeTrack(track.id)
                }}
              />
            ))}
          </View>
        )}

        {activeTab === 'favorites' && offlineFavoriteTracks.length > 0 && (
          <View style={styles.listSection}>
            {offlineFavoriteTracks.map((track) => (
              <TrackListItem
                key={track.id}
                track={{ ...track, isDownloaded: true }}
                isActive={playerStore.currentTrack?.id === track.id}
                onPress={() => handlePlayTrack(track)}
                onDelete={() => {
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

        {activeTab === 'favorites' && !isLoading && offlineFavoriteTracks.length === 0 && (
          <EmptyState
            icon='heart-outline'
            title='Chưa có bài hát yêu thích offline'
            description='Hãy tải bài hát về máy và thêm vào yêu thích để xem ở đây.'
          />
        )}

        {activeTab === 'albums' && (
          <EmptyState icon='heart-outline' title='Chưa có dữ liệu' description='Tính năng này đang được phát triển.' />
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
    // Không dùng alignItems: 'center' kết hợp flexDirection: 'row' ở cấp ngoài cùng
    // vì iconButton 44px sẽ tự động kéo giãn chiều cao row, đẩy text xuống giữa.
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    justifyContent: 'center' // Đảm bảo text được cố định
  },
  headerRightAbsolute: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.md - 4 // Trừ hao nhẹ để icon nằm chính giữa text
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
