/**
 * @file RecentlyPlayed.tsx
 * @description Section hiển thị danh sách bài hát nghe gần đây — cuộn ngang.
 * @module features/home
 */

import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { Track } from '@shared/types/track';

/**
 * Props của RecentlyPlayed.
 */
interface RecentlyPlayedProps {
  /** Danh sách bài hát nghe gần đây */
  tracks: Track[];
}

/**
 * RecentlyPlayed — hiển thị dạng grid/scroll ngang các bài hát đã nghe.
 */
export function RecentlyPlayed({ tracks }: RecentlyPlayedProps) {
  const router = useRouter();

  if (tracks.length === 0) return null;

  return (
    <View className="mt-6">
      <Text className="mb-3 px-4 text-lg font-bold text-[#EAEAEA]">Nghe gần đây</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {tracks.map((track) => (
          <Pressable
            key={track.id}
            onPress={() => router.push(`/player/${track.id}`)}
            className="w-32 active:opacity-80"
          >
            <Image
              source={{ uri: track.coverUrl }}
              className="h-32 w-32 rounded-xl"
              contentFit="cover"
              transition={200}
            />
            <Text className="mt-2 text-xs font-medium text-[#EAEAEA]" numberOfLines={1}>
              {track.title}
            </Text>
            <Text className="mt-0.5 text-xs text-[#A0A0A0]" numberOfLines={1}>
              {track.artist}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
