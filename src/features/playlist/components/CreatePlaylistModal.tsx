/**
 * @file CreatePlaylistModal.tsx
 * @description Modal tạo playlist mới — form nhập tên, mô tả.
 * @module features/playlist
 */

import { View, Switch, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { BottomSheet } from '@shared/components/ui/BottomSheet'
import { createLogger } from '@core/logger'
import { useCreatePlaylist } from '../hooks/usePlaylist'
import { usePlaylistStore } from '../store/playlistStore'
import { SPACING, RADIUS, FONT_SIZE } from '@shared/constants/spacing'
import { COLORS } from '@shared/constants/colors'
import { ListMusic, AlignLeft, Globe, Lock } from 'lucide-react-native'

const logger = createLogger('create-playlist-modal')

/**
 * Modal tạo playlist mới với UI tinh chỉnh.
 */
export function CreatePlaylistModal() {
  const { showCreateModal, closeCreateModal } = usePlaylistStore()
  const createPlaylist = useCreatePlaylist()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'title' | 'desc' | null>(null)

  const handleCreate = async () => {
    if (!title.trim()) return

    logger.info('Người dùng tạo playlist', { title, isPublic })
    createPlaylist.mutate(
      { title: title.trim(), description: description.trim(), isPublic },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setIsPublic(false)
          closeCreateModal()
        }
      }
    )
  }

  if (!showCreateModal) return null

  return (
    <BottomSheet visible={showCreateModal} onClose={closeCreateModal}>
      <View style={styles.header}>
        <Text style={styles.title}>Tạo playlist mới</Text>
      </View>

      <View style={styles.formGroup}>
        <View style={[styles.inputContainer, focusedInput === 'title' && styles.inputFocused]}>
          <ListMusic size={20} color={focusedInput === 'title' ? COLORS.primary : '#6B6B6B'} style={styles.inputIcon} />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder='Tên playlist'
            placeholderTextColor='#6B6B6B'
            style={styles.input}
            onFocus={() => setFocusedInput('title')}
            onBlur={() => setFocusedInput(null)}
            selectionColor={COLORS.primary}
          />
        </View>

        <View style={[styles.inputContainer, styles.textAreaContainer, focusedInput === 'desc' && styles.inputFocused]}>
          <AlignLeft size={20} color={focusedInput === 'desc' ? COLORS.primary : '#6B6B6B'} style={styles.inputIcon} />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder='Mô tả ngắn (tuỳ chọn)'
            placeholderTextColor='#6B6B6B'
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            onFocus={() => setFocusedInput('desc')}
            onBlur={() => setFocusedInput(null)}
            selectionColor={COLORS.primary}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <View style={[styles.iconBox, { backgroundColor: isPublic ? 'rgba(108, 99, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)' }]}>
              {isPublic ? <Globe size={20} color={COLORS.primary} /> : <Lock size={20} color="#A0A0A0" />}
            </View>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Chế độ công khai</Text>
              <Text style={styles.switchDesc}>
                {isPublic ? 'Mọi người có thể tìm thấy playlist này' : 'Chỉ mình bạn có thể xem playlist này'}
              </Text>
            </View>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ true: COLORS.primary, false: '#2A2A3A' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>

      {/* Submit Button giống LoginScreen */}
      <Pressable
        onPress={handleCreate}
        disabled={createPlaylist.isPending || !title.trim()}
      >
        <View style={[
          styles.primaryBtn,
          (!title.trim() || createPlaylist.isPending) && styles.primaryBtnDisabled
        ]}>
          {createPlaylist.isPending ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.primaryBtnText}>Tạo Playlist</Text>
          )}
        </View>
      </Pressable>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#EAEAEA',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: '#A0A0A0',
  },
  formGroup: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: RADIUS.lg,
    backgroundColor: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#2E2848',
    paddingHorizontal: 20,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
    height: 120,
    borderRadius: RADIUS.lg,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#1E1438',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  textArea: {
    paddingVertical: 0,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  settingsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  switchTextContainer: {
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: '#EAEAEA',
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: FONT_SIZE.xs,
    color: '#6B6B6B',
  },
  primaryBtn: {
    height: 54,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#B026FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10
  },
  primaryBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
})
