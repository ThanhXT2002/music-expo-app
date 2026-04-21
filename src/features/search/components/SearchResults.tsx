/**
 * @file SearchResults.tsx
 * @description Hiển thị kết quả tìm kiếm — chia theo tracks, albums, artists.
 * @module features/search
 */

import { View, ScrollView, Text } from 'react-native'

import { useRouter } from 'expo-router'
import { TrackCard } from '@shared/components/TrackCard'
import { ArtistCard } from '@shared/components/ArtistCard'
import type { SearchResult } from '../types'

interface SearchResultsProps {
  results: SearchResult
}

/**
 * SearchResults — hiển thị kết quả tìm kiếm phân theo loại.
 */
export function SearchResults({ results }: SearchResultsProps) {
  const router = useRouter()

  return (
    <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
      {/* Bài hát */}
      {results.tracks.length > 0 && (
        <View className='mt-4'>
          <Text className='mb-2 px-4 text-base font-bold text-[#EAEAEA]'>Bài hát</Text>
          {results.tracks.slice(0, 5).map((track) => (
            <TrackCard key={track.id} track={track} onPress={(t) => router.push(`/player/${t.id}`)} />
          ))}
        </View>
      )}

      {/* Nghệ sĩ */}
      {results.artists.length > 0 && (
        <View className='mt-6'>
          <Text className='mb-2 px-4 text-base font-bold text-[#EAEAEA]'>Nghệ sĩ</Text>
          {results.artists.slice(0, 5).map((artist) => (
            <ArtistCard key={artist.id} artist={artist} onPress={() => {}} />
          ))}
        </View>
      )}

      {/* Khoảng trống cho MiniPlayer */}
      <View className='h-24' />
    </ScrollView>
  )
}
