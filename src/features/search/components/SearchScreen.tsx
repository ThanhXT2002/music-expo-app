/**
 * @file SearchScreen.tsx
 * @description Màn hình tìm kiếm nâng cao — thanh tìm kiếm, genre chips, kết quả.
 * Thiết kế theo phong cách Mood Beat: dark neon, glass effect.
 * @module features/search
 */

import { View, ScrollView, Pressable, FlatList, ActivityIndicator, StyleSheet, Text, TextInput } from 'react-native'

import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Search, Mic, X, TrendingUp } from 'lucide-react-native'
import { useSearch } from '../hooks/useSearch'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, LAYOUT } from '@shared/constants/spacing'
import { SectionHeader } from '@shared/components/SectionHeader'
import { TrackListItem } from '@shared/components/TrackListItem'
import type { Track, Album, Artist } from '@shared/types/track'
import type { SearchTab } from '../types'

// ─── Genre Chips Data ─────────────────────────────────────────────────────────

const GENRES: { id: string; label: string; colors: [string, string] }[] = [
  { id: 'vpop', label: 'Nhạc Việt', colors: ['#6C5CE7', '#A29BFE'] },
  { id: 'kpop', label: 'K-Pop', colors: ['#E84393', '#FD79A8'] },
  { id: 'usuk', label: 'US-UK', colors: ['#0984E3', '#74B9FF'] },
  { id: 'edm', label: 'EDM', colors: ['#00CEC9', '#55EFC4'] },
  { id: 'ballad', label: 'Ballad', colors: ['#B026FF', '#D270FF'] },
  { id: 'rap', label: 'Rap/Hip-Hop', colors: ['#FF6B6B', '#EE5A24'] },
  { id: 'indie', label: 'Indie', colors: ['#F6A97A', '#EA4F88'] },
  { id: 'lofi', label: 'Lo-Fi', colors: ['#4B2991', '#872CA2'] },
  { id: 'classical', label: 'Cổ điển', colors: ['#C0369D', '#6C5CE7'] },
  { id: 'chill', label: 'Chill', colors: ['#00D2FF', '#3A7BD5'] },
  { id: 'workout', label: 'Workout', colors: ['#F39C12', '#E74C3C'] },
  { id: 'acoustic', label: 'Acoustic', colors: ['#1DB954', '#2ECC71'] }
]

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Thanh tìm kiếm với glass effect */
function SearchInput({
  value,
  onChangeText,
  onClear
}: {
  value: string
  onChangeText: (text: string) => void
  onClear: () => void
}) {
  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder='Bài hát, nghệ sĩ, album...'
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType='search'
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} hitSlop={8}>
            <X size={18} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>
      <Pressable style={styles.micButton} hitSlop={8}>
        <Mic size={20} color={COLORS.primary} />
      </Pressable>
    </View>
  )
}

/** Grid thể loại âm nhạc */
function GenreGrid({ onSelect }: { onSelect: (genre: string) => void }) {
  return (
    <View style={styles.genreSection}>
      <SectionHeader title='Khám phá thể loại' />
      <View style={styles.genreGrid}>
        {GENRES.map((genre) => (
          <Pressable
            key={genre.id}
            onPress={() => onSelect(genre.label)}
            style={({ pressed }) => [styles.genreChip, pressed && { opacity: 0.8 }]}
          >
            <LinearGradient
              colors={genre.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.genreGradient}
            >
              <Text style={styles.genreLabel}>{genre.label}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

/** Tabs lọc kết quả */
function FilterTabs({ activeTab, onTabChange }: { activeTab: SearchTab; onTabChange: (tab: SearchTab) => void }) {
  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'tracks', label: 'Bài hát' },
    { key: 'albums', label: 'Album' },
    { key: 'artists', label: 'Nghệ sĩ' }
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

/** Album card nhỏ trong kết quả */
function AlbumResultCard({ album, onPress }: { album: Album; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.albumCard, pressed && { opacity: 0.8 }]}>
      <Image source={{ uri: album.coverUrl }} style={styles.albumImage} contentFit='cover' transition={200} />
      <Text style={styles.albumTitle} numberOfLines={1}>
        {album.title}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {album.artist}
      </Text>
    </Pressable>
  )
}

/** Artist card nhỏ trong kết quả */
function ArtistResultCard({ artist, onPress }: { artist: Artist; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.artistCard, pressed && { opacity: 0.8 }]}>
      <Image source={{ uri: artist.avatarUrl }} style={styles.artistAvatar} contentFit='cover' transition={200} />
      <Text style={styles.artistName} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.artistFollowers} numberOfLines={1}>
        Nghệ sĩ
      </Text>
    </Pressable>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

/**
 * Màn hình tìm kiếm bài hát, album, nghệ sĩ.
 */
export default function SearchScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { query, setQuery, results, isSearching, hasResults } = useSearch()
  const [activeTab, setActiveTab] = useState<SearchTab>('all')

  const handleClear = useCallback(() => setQuery(''), [setQuery])
  const handleGenreSelect = useCallback((genre: string) => setQuery(genre), [setQuery])
  const handleTrackPress = useCallback((track: Track) => router.push(`/player/${track.id}`), [router])

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search Bar */}
      <SearchInput value={query} onChangeText={setQuery} onClear={handleClear} />

      {/* Content */}
      {!query ? (
        // Chưa search → Genre grid
        <ScrollView showsVerticalScrollIndicator={false}>
          <GenreGrid onSelect={handleGenreSelect} />
          <View style={{ height: LAYOUT.tabBarOffset }} />
        </ScrollView>
      ) : isSearching ? (
        // Đang tìm
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : hasResults && results ? (
        // Có kết quả
        <ScrollView showsVerticalScrollIndicator={false}>
          <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Bài hát */}
          {(activeTab === 'all' || activeTab === 'tracks') && results.tracks.length > 0 && (
            <View style={styles.resultSection}>
              {activeTab === 'all' && <SectionHeader title='Bài hát' />}
              {results.tracks.slice(0, activeTab === 'all' ? 5 : undefined).map((track) => (
                <TrackListItem key={track.id} track={track} onPress={handleTrackPress} onMenuPress={() => {}} />
              ))}
            </View>
          )}

          {/* Album */}
          {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
            <View style={styles.resultSection}>
              {activeTab === 'all' && <SectionHeader title='Album' />}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalResults}
              >
                {results.albums.map((album) => (
                  <AlbumResultCard
                    key={album.id}
                    album={album}
                    onPress={() => router.push(`/album/${album.id}` as any)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Nghệ sĩ */}
          {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
            <View style={styles.resultSection}>
              {activeTab === 'all' && <SectionHeader title='Nghệ sĩ' />}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalResults}
              >
                {results.artists.map((artist) => (
                  <ArtistResultCard
                    key={artist.id}
                    artist={artist}
                    onPress={() => router.push(`/artist/${artist.id}` as any)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: LAYOUT.tabBarOffset }} />
        </ScrollView>
      ) : query.length >= 2 ? (
        // Không có kết quả
        <View style={styles.emptyContainer}>
          <Search size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
          <Text style={styles.emptyDesc}>Thử tìm từ khoá khác nhé</Text>
        </View>
      ) : null}
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5
  },

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    height: 46,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    height: '100%'
  },
  micButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176, 38, 255, 0.2)'
  },

  // Genre Grid
  genreSection: {
    marginTop: SPACING.lg
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm
  },
  genreChip: {
    width: '31%',
    height: 80,
    borderRadius: RADIUS.lg,
    overflow: 'hidden'
  },
  genreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm
  },
  genreLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center'
  },

  // Filter Tabs
  tabsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingVertical: SPACING.sm
  },
  filterTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterTabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  filterTabTextActive: {
    color: '#FFFFFF'
  },

  // Results
  resultSection: {
    marginTop: SPACING.lg
  },
  horizontalResults: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md
  },

  // Album Card
  albumCard: {
    width: 130
  },
  albumImage: {
    width: 130,
    height: 130,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm
  },
  albumTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  albumArtist: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },

  // Artist Card
  artistCard: {
    width: 110,
    alignItems: 'center'
  },
  artistAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SPACING.sm
  },
  artistName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center'
  },
  artistFollowers: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    paddingBottom: 100
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  emptyDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted
  }
})
