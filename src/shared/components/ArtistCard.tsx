/**
 * @file ArtistCard.tsx
 * @description Component thẻ nghệ sĩ — hiển thị avatar, tên và số followers.
 * @module shared/components
 */

import { View, Pressable, Text } from 'react-native'

import { Avatar } from './ui/Avatar'
import type { Artist } from '@shared/types/track'

/**
 * Props của ArtistCard.
 */
interface ArtistCardProps {
  /** Thông tin nghệ sĩ */
  artist: Artist
  /** Hàm xử lý khi nhấn */
  onPress: (artist: Artist) => void
  /** Hiển thị dạng ngang (mặc định) hoặc dọc */
  layout?: 'horizontal' | 'vertical'
}

/**
 * ArtistCard — thẻ nghệ sĩ dùng ở home (gợi ý) và search (kết quả).
 *
 * @example
 * <ArtistCard artist={artist} onPress={(a) => navigate('artist', { id: a.id })} />
 */
export function ArtistCard({ artist, onPress, layout = 'horizontal' }: ArtistCardProps) {
  if (layout === 'vertical') {
    return (
      <Pressable onPress={() => onPress(artist)} className='items-center gap-2 active:opacity-80'>
        <Avatar imageUrl={artist.avatarUrl} name={artist.name} size='lg' />
        <Text className='text-xs font-medium text-[#EAEAEA]' numberOfLines={1}>
          {artist.name}
        </Text>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={() => onPress(artist)}
      className='flex-row items-center gap-3 rounded-xl px-3 py-2 active:bg-white/5'
    >
      <Avatar imageUrl={artist.avatarUrl} name={artist.name} size='md' />

      <View className='flex-1'>
        <Text className='text-sm font-semibold text-[#EAEAEA]' numberOfLines={1}>
          {artist.name}
        </Text>
        <Text className='mt-0.5 text-xs text-[#A0A0A0]'>{artist.followers.toLocaleString()} người theo dõi</Text>
      </View>
    </Pressable>
  )
}
