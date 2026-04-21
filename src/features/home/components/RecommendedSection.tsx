/**
 * @file RecommendedSection.tsx
 * @description Section hiển thị danh sách playlist gợi ý trên trang chủ.
 * @module features/home
 */

import { View, ScrollView, Pressable, Text } from 'react-native'

import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import type { RecommendedPlaylist } from '../types'

/**
 * Props của RecommendedSection.
 */
interface RecommendedSectionProps {
  /** Danh sách playlist gợi ý */
  playlists: RecommendedPlaylist[]
}

/**
 * RecommendedSection — hiển thị playlist gợi ý dạng cuộn ngang.
 */
export function RecommendedSection({ playlists }: RecommendedSectionProps) {
  const router = useRouter()

  if (playlists.length === 0) return null

  return (
    <View className='mt-6'>
      <Text className='mb-3 px-4 text-lg font-bold text-[#EAEAEA]'>Gợi ý cho bạn</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {playlists.map((playlist) => (
          <Pressable
            key={playlist.id}
            onPress={() => router.push(`/playlist/${playlist.id}`)}
            className='w-40 active:opacity-80'
          >
            <Image
              source={{ uri: playlist.coverUrl }}
              className='h-40 w-40 rounded-xl'
              contentFit='cover'
              transition={200}
            />
            <Text className='mt-2 text-sm font-medium text-[#EAEAEA]' numberOfLines={1}>
              {playlist.title}
            </Text>
            <Text className='mt-0.5 text-xs text-[#A0A0A0]' numberOfLines={2}>
              {playlist.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
