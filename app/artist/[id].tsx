/**
 * @file artist/[id].tsx
 * @description Route trang nghệ sĩ — wrapper cho ArtistDetailScreen.
 * @module app
 */

import { useLocalSearchParams } from 'expo-router'
import ArtistDetailScreen from '@features/home/components/ArtistDetailScreen'

export default function ArtistDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <ArtistDetailScreen artistId={id!} />
}
