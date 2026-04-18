/**
 * @file LibraryScreen.tsx
 * @description Màn hình thư viện nhạc — hiển thị bài hát đã thích, album, playlist đã lưu.
 * @module features/library
 */

import { View, Text } from 'react-native';
import { useLibrary } from '../hooks/useLibrary';
import { TrackList } from './TrackList';
import { EmptyState } from '@shared/components/EmptyState';

/**
 * Màn hình thư viện nhạc của người dùng.
 */
export default function LibraryScreen() {
  const { tracks, isLoading } = useLibrary();

  if (!isLoading && tracks.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Thư viện trống"
        description="Hãy thích các bài hát để thêm vào thư viện."
      />
    );
  }

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <View className="px-4 pb-2 pt-14">
        <Text className="text-2xl font-bold text-[#EAEAEA]">Thư viện</Text>
      </View>

      <TrackList tracks={tracks} isLoading={isLoading} />
    </View>
  );
}
