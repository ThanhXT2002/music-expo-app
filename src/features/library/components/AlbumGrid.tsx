/**
 * @file AlbumGrid.tsx
 * @description Lưới album dạng grid — hiển thị trong thư viện.
 * @module features/library
 */

import { FlatList, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import type { Album } from '@shared/types/track';

interface AlbumGridProps {
  albums: Album[];
}

/**
 * AlbumGrid — hiển thị album dạng lưới 2 cột.
 */
export function AlbumGrid({ albums }: AlbumGridProps) {

  return (
    <FlatList
      data={albums}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Pressable className="flex-1 active:opacity-80">
          <Image source={{ uri: item.coverUrl }} className="aspect-square w-full rounded-xl" contentFit="cover" />
          <Text className="mt-2 text-sm font-medium text-[#EAEAEA]" numberOfLines={1}>{item.title}</Text>
          <Text className="text-xs text-[#A0A0A0]" numberOfLines={1}>{item.artist}</Text>
        </Pressable>
      )}
    />
  );
}
