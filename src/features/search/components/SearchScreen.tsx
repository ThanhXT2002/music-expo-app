/**
 * @file SearchScreen.tsx
 * @description Màn hình tìm kiếm nâng cao — thanh tìm kiếm, genre chips, kết quả.
 * Thiết kế theo phong cách Mood Beat: dark neon, glass effect.
 * @module features/search
 */

import { View, ScrollView, Pressable, FlatList, ActivityIndicator, StyleSheet, Text, TextInput, Keyboard } from 'react-native'
import { useState, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Search, Mic, X, TrendingUp } from 'lucide-react-native'
import { useSearchFull, useSearchSuggestions } from '../hooks/useSearch'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, LAYOUT } from '@shared/constants/spacing'
import { SectionHeader } from '@shared/components/SectionHeader'
import { TrackListItem } from '@shared/components/TrackListItem'
import { HorizontalCardList } from '@shared/components/HorizontalCardList'
import { usePlayerStore } from '@features/player/store/playerStore'
import * as AudioManager from '@core/audio/AudioManager'
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
  onClear,
  onFocus,
  onBlur,
  onSubmitEditing
}: {
  value: string
  onChangeText: (text: string) => void
  onClear: () => void
  onFocus?: () => void
  onBlur?: () => void
  onSubmitEditing?: () => void
}) {
  return (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchBar}>
        <Search size={18} color={COLORS.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          placeholder='Bài hát, nghệ sĩ, album...'
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType='search'
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <X size={18} color={COLORS.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  )
}

/** Dropdown gợi ý tìm kiếm */
function AutoSuggestDropdown({
  suggestions,
  onSelect,
  isFetching
}: {
  suggestions: string[]
  onSelect: (item: string) => void
  isFetching: boolean
}) {
  if (suggestions.length === 0 && !isFetching) return null

  return (
    <View style={styles.dropdownContainer}>
      {isFetching && suggestions.length === 0 ? (
        <View style={styles.dropdownLoading}>
          <ActivityIndicator size='small' color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={suggestions.slice(0, 8)} // Hiển thị tối đa 8 gợi ý
          keyExtractor={(item, index) => `${item}-${index}`}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='on-drag'
          renderItem={({ item }) => (
            <Pressable style={styles.suggestionItem} onPress={() => onSelect(item)}>
              <Search size={16} color={COLORS.textMuted} />
              <Text style={styles.suggestionText} numberOfLines={1}>{item}</Text>
            </Pressable>
          )}
        />
      )}
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


/** Artist card nhỏ trong kết quả */
function ArtistResultCard({ artist, onPress }: { artist: Artist; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.artistCard, pressed && { opacity: 0.8 }]}>
      <Image source={{ uri: artist.avatarUrl }} style={styles.artistAvatar} contentFit='cover' transition={200} />
      <Text style={styles.artistName} numberOfLines={1} ellipsizeMode='tail'>
        {artist.name}
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

  const [query, setQuery] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [activeTab, setActiveTab] = useState<SearchTab>('all')

  const { results, isSearching, hasResults } = useSearchFull(query)
  const { suggestions, isFetchingSuggestions } = useSearchSuggestions(query)

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  const handleSuggestionSelect = useCallback((text: string) => {
    setQuery(text)
    setIsInputFocused(false)
    Keyboard.dismiss()
  }, [])

  const handleGenreSelect = useCallback((genre: string) => {
    setQuery(genre)
    setIsInputFocused(false)
    Keyboard.dismiss()
  }, [])

  const handleTrackPress = useCallback(async (track: Track) => {
    try {
      const store = usePlayerStore.getState()
      // Thêm bài vào Queue nếu chưa có
      if (!store.queue.some(t => t.id === track.id)) {
        store.addToQueue(track)
      }

      // Set track hiện tại
      store.setCurrentTrack(track)

      if (!track.streamUrl) {
        console.error('Track thiếu streamUrl:', track)
        return
      }

      // Gọi AudioManager stream nhạc từ Backend Proxy Pipeline
      await AudioManager.loadAndPlay(track as Track & { streamUrl: string })

      // Chuyển hướng sang màn hình Now Playing
      router.push(`/player/${track.id}`)
    } catch (error) {
      console.error('Lỗi phát nhạc:', error)
    }
  }, [router])

  const showDropdown = isInputFocused && query.length >= 2

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search Bar */}
      <SearchInput
        value={query}
        onChangeText={setQuery}
        onClear={handleClear}
        onFocus={() => setIsInputFocused(true)}
        onSubmitEditing={() => {
          setIsInputFocused(false)
          Keyboard.dismiss()
        }}
        // Không dùng onBlur để tránh click list suggestion bị miss event
      />

      {/* Auto-Suggest Dropdown */}
      {showDropdown && (
        <AutoSuggestDropdown
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          isFetching={isFetchingSuggestions}
        />
      )}

      {/* Content */}
      {!query ? (
        // Chưa search → Genre grid
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => {
            Keyboard.dismiss();
            setIsInputFocused(false);
          }}
        >
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
              <HorizontalCardList
                items={results.albums.map((album) => ({
                  id: album.id,
                  imageUrl: album.coverUrl,
                  title: album.title,
                  subtitle: album.artist,
                }))}
                size='sm'
                showPlayButton={false}
                onPress={(item) => router.push(`/album/${item.id}` as any)}
              />
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
    marginBottom: SPACING.lg,
    zIndex: 101, // Phải cao hơn dropdown để dropdown đè dưới
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
    backgroundColor: 'rgba(108, 92, 231, 0.12)', // Dùng mã RGB của COLORS.primary (#6C5CE7)
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)'
  },

  // Dropdown
  dropdownContainer: {
    position: 'absolute',
    top: 110, // Ước lượng vị trí dưới SearchBar (tùy safe area)
    left: SPACING.lg,
    right: SPACING.lg, // Căn lề phải bằng với SearchBar
    backgroundColor: COLORS.surface, // Màu nền đặc không dùng Blur
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 250,
    zIndex: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownLoading: {
    padding: SPACING.lg,
    alignItems: 'center'
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: SPACING.sm
  },
  suggestionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    flex: 1
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



  // Artist Card
  artistCard: {
    width: 110,
    maxWidth: 110,
    alignItems: 'center',
    overflow: 'hidden'
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
    textAlign: 'center',
    width: 110,
  },
  artistFollowers: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    width: 110,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: 100
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
    marginTop: 100
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
