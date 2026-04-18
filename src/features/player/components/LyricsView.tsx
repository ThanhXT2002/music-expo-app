/**
 * @file LyricsView.tsx
 * @description Component hiển thị lời bài hát.
 * @module features/player
 */

import { View, Text, ScrollView } from 'react-native';
import { useLyrics } from '../hooks/useLyrics';
import { Skeleton } from '@shared/components/ui/Skeleton';

/**
 * Props của LyricsView.
 */
interface LyricsViewProps {
  /** ID bài hát */
  trackId: string;
}

/**
 * LyricsView — hiển thị lời bài hát trong player.
 */
export function LyricsView({ trackId }: LyricsViewProps) {
  const { lyrics, isLoading, hasLyrics } = useLyrics(trackId);

  if (isLoading) {
    return (
      <View className="gap-3 px-6 py-4">
        <Skeleton width="w-3/4" height="h-4" />
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-2/3" height="h-4" />
      </View>
    );
  }

  if (!hasLyrics) {
    return (
      <View className="items-center py-8">
        <Text className="text-sm text-[#6B6B6B]">Chưa có lời bài hát</Text>
      </View>
    );
  }

  return (
    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
      <Text className="text-base leading-7 text-[#A0A0A0]">{lyrics}</Text>
    </ScrollView>
  );
}
