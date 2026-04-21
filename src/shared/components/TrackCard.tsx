/**
 * @file TrackCard.tsx
 * @description Component thẻ bài hát — dùng chung ở home, library, search.
 * Hiển thị ảnh bìa, tên bài, nghệ sĩ và thời lượng.
 * @module shared/components
 */

import { View, Pressable, Text } from 'react-native'

import { Image } from 'expo-image'
import { formatDuration } from '@shared/utils/formatDuration'
import type { Track } from '@shared/types/track'

/**
 * Props của TrackCard.
 */
interface TrackCardProps {
  /** Thông tin bài hát */
  track: Track
  /** Hàm xử lý khi nhấn vào thẻ bài hát */
  onPress: (track: Track) => void
  /** Hàm xử lý khi nhấn giữ — mở menu ngữ cảnh */
  onLongPress?: (track: Track) => void
  /** Hiển thị dạng compact (nhỏ gọn hơn) */
  compact?: boolean
}

/**
 * TrackCard — thẻ bài hát dùng chung cho nhiều màn hình.
 * Hiển thị dạng hàng ngang với ảnh bìa, thông tin bài hát và thời lượng.
 *
 * @example
 * <TrackCard
 *   track={track}
 *   onPress={(t) => navigation.push('player', { id: t.id })}
 *   onLongPress={(t) => setSelectedTrack(t)}
 * />
 */
export function TrackCard({ track, onPress, onLongPress, compact = false }: TrackCardProps) {
  const imageSize = compact ? 'h-10 w-10' : 'h-14 w-14'

  return (
    <Pressable
      onPress={() => onPress(track)}
      onLongPress={() => onLongPress?.(track)}
      className='flex-row items-center gap-3 rounded-xl px-3 py-2 active:bg-white/5'
    >
      {/* Ảnh bìa */}
      <Image
        source={{ uri: track.coverUrl }}
        className={`rounded-lg ${imageSize}`}
        contentFit='cover'
        transition={200}
      />

      {/* Thông tin bài hát */}
      <View className='flex-1'>
        <Text className='text-sm font-semibold text-[#EAEAEA]' numberOfLines={1}>
          {track.title}
        </Text>
        <Text className='mt-0.5 text-xs text-[#A0A0A0]' numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      {/* Thời lượng */}
      <Text className='text-xs text-[#6B6B6B]'>{formatDuration(track.durationSeconds)}</Text>
    </Pressable>
  )
}
