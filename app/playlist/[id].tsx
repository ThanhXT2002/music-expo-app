/**
 * @file playlist/[id].tsx
 * @description Route chi tiết playlist — dynamic route theo playlistId.
 * @module app/playlist
 */

import { useLocalSearchParams } from 'expo-router'
import PlaylistScreen from '@features/playlist/components/PlaylistScreen'

/**
 * Route wrapper cho PlaylistScreen — truyền playlistId từ URL params.
 */
export default function PlaylistRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <PlaylistScreen playlistId={id} />
}
