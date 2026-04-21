/**
 * @file PlaylistCard.tsx
 * @description Thẻ playlist — hiển thị ảnh bìa, tên và số bài hát.
 * @module features/playlist
 */

import { View, Pressable, Text } from 'react-native'

import { Image } from 'expo-image'
import type { Playlist } from '@shared/types/track'

interface PlaylistCardProps {
  playlist: Playlist
  onPress: (playlist: Playlist) => void
}

/**
 * PlaylistCard — thẻ playlist dạng hàng ngang.
 */
export function PlaylistCard({ playlist, onPress }: PlaylistCardProps) {
  return (
    <Pressable
      onPress={() => onPress(playlist)}
      className='flex-row items-center gap-3 rounded-xl px-3 py-2 active:bg-white/5'
    >
      <Image source={{ uri: playlist.coverUrl }} className='h-14 w-14 rounded-lg' contentFit='cover' transition={200} />
      <View className='flex-1'>
        <Text className='text-sm font-semibold text-[#EAEAEA]' numberOfLines={1}>
          {playlist.title}
        </Text>
        <Text className='mt-0.5 text-xs text-[#A0A0A0]'>{playlist.trackCount} bài hát</Text>
      </View>
    </Pressable>
  )
}
