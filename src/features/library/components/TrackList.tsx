/**
 * @file TrackList.tsx
 * @description Danh sách bài hát dạng cuộn dọc — dùng trong thư viện.
 * @module features/library
 */

import { FlatList, View } from 'react-native'
import { useRouter } from 'expo-router'
import { TrackCard } from '@shared/components/TrackCard'
import { Skeleton } from '@shared/components/ui/Skeleton'
import type { Track } from '@shared/types/track'

interface TrackListProps {
  tracks: Track[]
  isLoading: boolean
}

/**
 * TrackList — danh sách bài hát cuộn dọc với FlatList.
 */
export function TrackList({ tracks, isLoading }: TrackListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <View className='gap-3 px-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} className='flex-row items-center gap-3'>
            <Skeleton width='w-14' height='h-14' />
            <View className='flex-1 gap-2'>
              <Skeleton width='w-3/4' height='h-4' />
              <Skeleton width='w-1/2' height='h-3' />
            </View>
          </View>
        ))}
      </View>
    )
  }

  return (
    <FlatList
      data={tracks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TrackCard track={item} onPress={(t) => router.push(`/player/${t.id}`)} />}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  )
}
