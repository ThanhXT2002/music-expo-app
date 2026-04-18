/**
 * @file PlaylistScreen.tsx
 * @description Màn hình chi tiết playlist — hiển thị danh sách bài hát.
 * @module features/playlist
 */

import { View, Text } from 'react-native';
import { usePlaylistDetail } from '../hooks/usePlaylist';
import { TrackCard } from '@shared/components/TrackCard';
import { useRouter } from 'expo-router';
import { EmptyState } from '@shared/components/EmptyState';

interface PlaylistScreenProps {
  playlistId: string;
}

/**
 * Màn hình chi tiết playlist.
 */
export default function PlaylistScreen({ playlistId }: PlaylistScreenProps) {
  const { playlist, isLoading } = usePlaylistDetail(playlistId);
  const router = useRouter();

  if (!playlist && !isLoading) {
    return <EmptyState icon="list-outline" title="Không tìm thấy playlist" />;
  }

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <View className="px-4 pb-4 pt-14">
        <Text className="text-2xl font-bold text-[#EAEAEA]">{playlist?.title ?? '...'}</Text>
        {playlist?.description && (
          <Text className="mt-1 text-sm text-[#A0A0A0]">{playlist.description}</Text>
        )}
        <Text className="mt-2 text-xs text-[#6B6B6B]">{playlist?.trackCount ?? 0} bài hát</Text>
      </View>

      {playlist?.tracks?.map((track) => (
        <TrackCard key={track.id} track={track} onPress={(t) => router.push(`/player/${t.id}`)} />
      ))}
    </View>
  );
}
