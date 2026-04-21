/**
 * @file song/[id].tsx
 * @description Route chi tiết bài hát — wrapper cho SongDetailScreen.
 * @module app
 */

import { useLocalSearchParams } from 'expo-router'
import SongDetailScreen from '@features/home/components/SongDetailScreen'

export default function SongDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <SongDetailScreen songId={id!} />
}
