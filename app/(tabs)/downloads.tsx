/**
 * @file downloads.tsx
 * @description Tab Tải xuống — Tìm kiếm YouTube, tải MP3, quản lý nhạc offline.
 *
 * Màn hình chính gồm:
 * - Thanh tìm kiếm đa năng (YouTube URL / từ khoá)
 * - Active downloads với progress bar
 * - Danh sách nhạc đã tải offline
 * - Storage stats
 *
 * Design: Aurora Glass (gradient glow, pill-shaped items, glass borders)
 * @module app/(tabs)
 */

import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Search, X, ClipboardPaste, Download, Trash2,
  CheckCircle, AlertCircle, HardDrive, Music,
} from 'lucide-react-native';
import { COLORS } from '@shared/constants/colors';
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing';
import { EmptyState } from '@shared/components/EmptyState';
import { useDownloads } from '@features/downloads/hooks/useDownloads';
import { usePlayerStore } from '@features/player/store/playerStore';
import * as AudioManager from '@core/audio/AudioManager';
import { createLogger } from '@core/logger';
import type { DownloadItem } from '@features/downloads/types';
import type { LocalSong } from '@core/data/database';

const logger = createLogger('downloads-screen');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Thanh tìm kiếm với icon dán link + search */
function SearchBar({
  query,
  onChangeText,
  onSubmit,
  onClear,
  onPaste,
  isUrlMode,
  isSearching,
}: {
  query: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onPaste: () => void;
  isUrlMode: boolean;
  isSearching: boolean;
}) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        {/* Nút Paste — đọc clipboard và điền vào input */}
        <Pressable onPress={onPaste} style={styles.pasteBtn} hitSlop={8}>
          <ClipboardPaste size={18} color={isUrlMode ? '#B026FF' : '#A0A0A0'} />
        </Pressable>

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder="Dán link YouTube hoặc tìm bài hát..."
          placeholderTextColor="#666"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Nút clear */}
        {query.length > 0 && (
          <Pressable onPress={onClear} style={styles.searchClearBtn} hitSlop={10}>
            <X size={16} color="#A0A0A0" />
          </Pressable>
        )}

        {/* Nút submit */}
        <Pressable
          onPress={onSubmit}
          style={[
            styles.searchSubmitBtn,
            isUrlMode && styles.searchSubmitBtnActive,
          ]}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Search size={16} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

/** Storage stats bar */
function StorageStats({ totalBytes }: { totalBytes: number }) {
  const usedMB = Math.round(totalBytes / 1024 / 1024);

  return (
    <View style={styles.storageCard}>
      <View style={styles.storageHeader}>
        <HardDrive size={18} color="#B026FF" />
        <Text style={styles.storageTitle}>Bộ nhớ offline</Text>
        <Text style={styles.storageValue}>{usedMB} MB</Text>
      </View>
      <View style={styles.storageBarBg}>
        <LinearGradient
          colors={['#B026FF', '#6C5CE7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.storageBarFill, { width: `${Math.min((usedMB / 1024) * 100, 100)}%` }]}
        />
      </View>
    </View>
  );
}

/** Active download task item */
function ActiveTaskItem({ task }: { task: DownloadItem }) {
  const isServerProcessing = task.serverStatus === 'processing' || task.serverStatus === 'pending';
  const isDownloading = task.status === 'downloading';
  const isError = task.status === 'error';

  // Tính % hiển thị
  let displayProgress = 0;
  let statusText = '';

  if (isServerProcessing) {
    displayProgress = (task.serverProgress / 100) * 0.5; // 0–50% cho server
    statusText = task.serverProgress > 0
      ? `Đang xử lý... ${task.serverProgress}%`
      : 'Đang chờ server...';
  } else if (isDownloading) {
    displayProgress = 0.5 + task.progress * 0.5; // 50–100% cho download
    statusText = `Đang tải... ${Math.round(task.progress * 100)}%`;
  } else if (isError) {
    statusText = task.errorMessage || 'Lỗi không xác định';
  } else {
    statusText = 'Đang chuẩn bị...';
  }

  return (
    <View style={styles.activeTaskItem}>
      {/* Cover */}
      <View style={styles.activeTaskCover}>
        {task.coverUrl ? (
          <Image source={{ uri: task.coverUrl }} style={styles.activeTaskImage} contentFit="cover" />
        ) : (
          <LinearGradient colors={['#B026FF', '#6C5CE7']} style={styles.activeTaskPlaceholder}>
            <Music size={20} color="#FFFFFF" />
          </LinearGradient>
        )}
      </View>

      {/* Info + Progress */}
      <View style={styles.activeTaskInfo}>
        <Text style={styles.activeTaskTitle} numberOfLines={1}>{task.title}</Text>
        <Text style={[styles.activeTaskStatus, isError && styles.activeTaskError]}>
          {statusText}
        </Text>
        {!isError && (
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#B026FF', '#6C5CE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${Math.max(displayProgress * 100, 2)}%` }]}
            />
          </View>
        )}
      </View>

      {/* Icon trạng thái */}
      <View style={styles.activeTaskStatusIcon}>
        {isError ? (
          <AlertCircle size={20} color={COLORS.error} />
        ) : (
          <Download size={20} color="#B026FF" />
        )}
      </View>
    </View>
  );
}

/** Offline song item (Pill-shaped Glass) */
function OfflineSongItem({
  song,
  onPress,
  onDelete,
}: {
  song: LocalSong;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.offlineItem, pressed && styles.offlineItemPressed]}>
          {/* Cover tròn */}
          <Image
            source={{ uri: song.thumbnailUrl }}
            style={styles.offlineCover}
            contentFit="cover"
          />

          {/* Info */}
          <View style={styles.offlineInfo}>
            <Text style={styles.offlineTitle} numberOfLines={1}>{song.title}</Text>
            <Text style={styles.offlineArtist} numberOfLines={1}>{song.artist}</Text>
          </View>

          {/* Actions */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              Alert.alert(
                'Xoá bài hát',
                `Bạn có chắc muốn xoá "${song.title}" khỏi thiết bị?`,
                [
                  { text: 'Huỷ', style: 'cancel' },
                  { text: 'Xoá', style: 'destructive', onPress: onDelete },
                ],
              );
            }}
            hitSlop={12}
            style={styles.deleteBtn}
          >
            <Trash2 size={16} color="#A0A0A0" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

/** Search result item cũng dạng pill */
function SearchResultItem({
  song,
  isAlreadyDownloaded,
  onDownload,
}: {
  song: any;
  isAlreadyDownloaded: boolean;
  onDownload: () => void;
}) {
  const thumbnailUrl = song.thumbnail_url || song.thumbnailUrl || '';
  return (
    <View style={styles.searchResultItem}>
      <Image
        source={{ uri: thumbnailUrl }}
        style={styles.searchResultCover}
        contentFit="cover"
      />
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.searchResultArtist} numberOfLines={1}>
          {song.artist} {song.duration_formatted ? `• ${song.duration_formatted}` : ''}
        </Text>
      </View>
      {isAlreadyDownloaded ? (
        <CheckCircle size={22} color={COLORS.success} />
      ) : (
        <Pressable onPress={onDownload} style={styles.downloadIconBtn}>
          <Download size={20} color="#B026FF" />
        </Pressable>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DownloadsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    searchQuery, setSearchQuery, isUrlMode, isSearching,
    activeTasks, offlineSongs, searchResults, totalSize,
    handleSubmit, clearSearch, removeTrack, isDownloaded,
  } = useDownloads();

  const playerStore = usePlayerStore();

  const handlePlayOffline = useCallback(async (song: LocalSong) => {
    try {
      logger.info('Phát nhạc offline', { id: song.id, title: song.title });

      // Map LocalSong → Track cho playerStore
      playerStore.setCurrentTrack({
        id: song.id,
        title: song.title,
        artist: song.artist,
        artistId: '',
        coverUrl: song.thumbnailUrl,
        durationSeconds: song.duration,
        streamUrl: song.localAudioUri,
        isDownloaded: true,
      });

      // Load vào AudioManager và phát
      await AudioManager.loadAndPlay({
        id: song.id,
        title: song.title,
        artist: song.artist,
        streamUrl: song.localAudioUri,
        coverUrl: song.thumbnailUrl,
        durationSeconds: song.duration,
      });

      playerStore.setIsPlaying(true);

      // Navigate sang player screen
      router.push(`/player/${song.id}`);
    } catch (error) {
      logger.error('Lỗi phát nhạc offline', error);
      Alert.alert('Lỗi', 'Không thể phát bài hát này. Vui lòng thử lại.');
    }
  }, [playerStore, router]);

  /** Đọc clipboard và điền vào ô tìm kiếm */
  const handlePaste = useCallback(async () => {
    try {
      // Dùng dynamic import để tránh crash nếu native module chưa sẵn sàng
      const Clipboard = await import('expo-clipboard');
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        setSearchQuery(text.trim());
      } else {
        Alert.alert('Clipboard trống', 'Không có nội dung nào trong clipboard.');
      }
    } catch {
      // Fallback: mở keyboard để user paste thủ công
      Alert.alert('Thông báo', 'Nhấn giữ ô tìm kiếm để dán link từ clipboard.');
    }
  }, [setSearchQuery]);

  const isEmpty = offlineSongs.length === 0 && activeTasks.length === 0;

  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.15)', 'transparent']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.ambientGlow}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
          <Text style={styles.headerTitle}>Tải nhạc</Text>
          {offlineSongs.length > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{offlineSongs.length}</Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <SearchBar
          query={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSubmit}
          onClear={clearSearch}
          onPaste={handlePaste}
          isUrlMode={isUrlMode}
          isSearching={isSearching}
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>KẾT QUẢ TÌM KIẾM</Text>
            <View style={styles.sectionContent}>
              {searchResults.map((song) => (
                <SearchResultItem
                  key={song.id}
                  song={song}
                  isAlreadyDownloaded={isDownloaded(song.id)}
                  onDownload={() => {
                    setSearchQuery(song.original_url || '');
                    handleSubmit();
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Active Downloads */}
        {activeTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ĐANG TẢI</Text>
            <View style={styles.sectionContent}>
              {activeTasks.map((task) => (
                <ActiveTaskItem key={task.trackId} task={task} />
              ))}
            </View>
          </View>
        )}

        {/* Storage Stats */}
        {offlineSongs.length > 0 && (
          <View style={styles.storageSection}>
            <StorageStats totalBytes={totalSize} />
          </View>
        )}

        {/* Offline Songs */}
        {offlineSongs.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NHẠC ĐÃ TẢI ({offlineSongs.length})</Text>
            <View style={styles.sectionContent}>
              {offlineSongs.map((song) => (
                <OfflineSongItem
                  key={song.id}
                  song={song}
                  onPress={() => handlePlayOffline(song)}
                  onDelete={() => removeTrack(song.id)}
                />
              ))}
            </View>
          </View>
        ) : (
          isEmpty && (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['#B026FF', '#6C5CE7']}
                style={styles.emptyIcon}
              >
                <Download size={40} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>Tải nhạc từ YouTube</Text>
              <Text style={styles.emptyDesc}>
                Dán link YouTube vào ô tìm kiếm để tải nhạc{'\n'}về thiết bị và nghe offline mọi lúc.
              </Text>
            </View>
          )
        )}

        {/* Bottom spacer */}
        <View style={{ height: 180 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerBadge: {
    backgroundColor: '#B026FF',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    minWidth: 26,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(20, 15, 45, 0.8)',
    height: 48,
    paddingHorizontal: SPACING.sm,
  },
  pasteBtn: {
    marginLeft: SPACING.sm,
    marginRight: SPACING.xs,
    padding: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: '#FFFFFF',
    height: '100%',
  },
  searchClearBtn: {
    padding: SPACING.sm,
  },
  searchSubmitBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitBtnActive: {
    backgroundColor: '#B026FF',
  },

  // Section
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: '#A0A0A0',
    letterSpacing: 1.2,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  // Active Task Item
  activeTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(20, 15, 45, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(176, 38, 255, 0.2)',
  },
  activeTaskCover: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  activeTaskImage: {
    width: '100%',
    height: '100%',
  },
  activeTaskPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTaskInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  activeTaskTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeTaskStatus: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    marginTop: 2,
  },
  activeTaskError: {
    color: COLORS.error,
  },
  activeTaskStatusIcon: {
    marginLeft: SPACING.md,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Offline Song Item (Pill Glass)
  offlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(20, 15, 45, 0.7)',
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  offlineItemPressed: {
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    transform: [{ scale: 0.98 }],
  },
  offlineCover: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
  },
  offlineInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  offlineTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  offlineArtist: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    marginTop: 2,
  },
  deleteBtn: {
    padding: SPACING.md,
  },

  // Search Result Item
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchResultCover: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  searchResultTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchResultArtist: {
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0',
    marginTop: 2,
  },
  downloadIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(176, 38, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Storage
  storageSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  storageCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(20, 15, 45, 0.6)',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  storageTitle: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storageValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#B026FF',
  },
  storageBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
    paddingTop: SPACING['3xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  emptyDesc: {
    fontSize: FONT_SIZE.sm,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
  },
});
