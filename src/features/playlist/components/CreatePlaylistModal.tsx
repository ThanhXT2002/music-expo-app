/**
 * @file CreatePlaylistModal.tsx
 * @description Modal tạo playlist mới — form nhập tên, mô tả.
 * @module features/playlist
 */

import { View, Text, TextInput, Switch } from 'react-native';
import { useState } from 'react';
import { BottomSheet } from '@shared/components/ui/BottomSheet';
import { Button } from '@shared/components/ui/Button';
import { createLogger } from '@core/logger';
import { useCreatePlaylist } from '../hooks/usePlaylist';
import { usePlaylistStore } from '../store/playlistStore';

const logger = createLogger('create-playlist-modal');

/**
 * Modal tạo playlist mới.
 */
export function CreatePlaylistModal() {
  const { showCreateModal, closeCreateModal } = usePlaylistStore();
  const createPlaylist = useCreatePlaylist();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    logger.info('Người dùng tạo playlist', { title, isPublic });
    createPlaylist.mutate(
      { title: title.trim(), description: description.trim(), isPublic },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setIsPublic(false);
          closeCreateModal();
        },
      },
    );
  };

  return (
    <BottomSheet visible={showCreateModal} onClose={closeCreateModal}>
      <Text className="mb-4 text-lg font-bold text-[#EAEAEA]">Tạo playlist mới</Text>

      {/* Tên playlist */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Tên playlist"
        placeholderTextColor="#6B6B6B"
        className="mb-3 rounded-xl bg-[#1E1E2E] px-4 py-3 text-sm text-[#EAEAEA]"
      />

      {/* Mô tả */}
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả (tuỳ chọn)"
        placeholderTextColor="#6B6B6B"
        className="mb-3 rounded-xl bg-[#1E1E2E] px-4 py-3 text-sm text-[#EAEAEA]"
        multiline
        numberOfLines={3}
      />

      {/* Công khai */}
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-sm text-[#EAEAEA]">Playlist công khai</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: '#6C63FF' }} />
      </View>

      {/* Nút tạo */}
      <Button
        title="Tạo playlist"
        onPress={handleCreate}
        loading={createPlaylist.isPending}
        disabled={!title.trim()}
      />
    </BottomSheet>
  );
}
