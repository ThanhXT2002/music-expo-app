/**
 * @file AddToPlaylistModal.tsx
 * @description Modal chọn playlist để thêm bài hát vào.
 * @module features/playlist/components
 */

import { View, Text, Pressable, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { Plus, ListMusic } from 'lucide-react-native'
import { BottomSheet } from '@shared/components/ui/BottomSheet'
import { createLogger } from '@core/logger'
import { usePlaylists, useAddSongToPlaylist } from '../hooks/usePlaylist'
import { usePlaylistStore } from '../store/playlistStore'
import { COLORS } from '@shared/constants/colors'
import { SPACING, RADIUS, FONT_SIZE } from '@shared/constants/spacing'
import type { Playlist } from '@shared/types/track'

const logger = createLogger('add-to-playlist-modal')

/**
 * Modal hiển thị danh sách playlist để người dùng chọn và thêm bài hát.
 */
export function AddToPlaylistModal() {
  const { showAddToPlaylistModal, closeAddToPlaylistModal, trackToAdd, openCreateModal } = usePlaylistStore()
  const { playlists, isLoading } = usePlaylists(showAddToPlaylistModal)
  const addSongMutation = useAddSongToPlaylist()

  const handleSelectPlaylist = (playlist: Playlist) => {
    if (!trackToAdd) return

    logger.info('Chọn playlist để thêm bài hát', { playlistId: playlist.id, trackId: trackToAdd.id })
    addSongMutation.mutate(
      { playlistId: playlist.id, trackId: trackToAdd.id },
      {
        onSuccess: () => {
          Alert.alert('Thành công', `Đã thêm vào ${playlist.title}`)
          closeAddToPlaylistModal()
        },
        onError: () => {
          Alert.alert('Lỗi', 'Không thể thêm bài hát vào playlist lúc này.')
        }
      }
    )
  }

  const handleCreateNew = () => {
    closeAddToPlaylistModal()
    // Delay nhẹ để tránh lỗi đụng độ 2 Modal (nếu có) trên iOS/Android
    setTimeout(() => {
      openCreateModal()
    }, 300)
  }

  if (!showAddToPlaylistModal) return null

  return (
    <BottomSheet visible={showAddToPlaylistModal} onClose={closeAddToPlaylistModal}>
      <Text style={styles.title}>Thêm vào Playlist</Text>

      {/* Nút Tạo Playlist Mới */}
      <Pressable
        onPress={handleCreateNew}
        style={styles.createBtn}
      >
        <View style={styles.createIconWrapper}>
          <Plus size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.createText}>Tạo Playlist mới</Text>
      </Pressable>

      <View style={styles.divider} />

      {/* Danh sách Playlist */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : playlists.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Bạn chưa có playlist nào.</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelectPlaylist(item)}
              style={({ pressed }) => [styles.playlistItem, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.playlistIcon}>
                <ListMusic size={24} color={COLORS.textMuted} />
              </View>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.playlistCount}>
                  {item.trackCount} bài hát
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  title: {
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#EAEAEA'
  },
  createBtn: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.md,
    gap: SPACING.md
  },
  createIconWrapper: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  createText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  divider: {
    marginVertical: SPACING.sm,
    height: 1,
    width: '100%',
    backgroundColor: '#2A2A3A'
  },
  centerContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#6B6B6B',
    textAlign: 'center'
  },
  list: {
    flex: 1,
  },
  playlistItem: {
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: 'transparent',
    padding: SPACING.sm,
    gap: SPACING.md
  },
  playlistIcon: {
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: '#2A2A3A'
  },
  playlistInfo: {
    flex: 1
  },
  playlistTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: '#FFFFFF'
  },
  playlistCount: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: '#A0A0A0'
  }
})
