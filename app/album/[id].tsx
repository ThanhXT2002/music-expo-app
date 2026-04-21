/**
 * @file album/[id].tsx
 * @description Route chi tiết album — wrapper cho AlbumDetailScreen.
 * @module app
 */

import { useLocalSearchParams } from 'expo-router'
import AlbumDetailScreen from '@features/home/components/AlbumDetailScreen'

export default function AlbumDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <AlbumDetailScreen albumId={id!} />
}
