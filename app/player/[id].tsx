/**
 * @file player/[id].tsx
 * @description Route phát nhạc — dynamic route theo trackId.
 * @module app/player
 */

import { useLocalSearchParams } from 'expo-router'
import PlayerScreen from '@features/player/components/PlayerScreen'

/**
 * Route wrapper cho PlayerScreen — truyền trackId từ URL params.
 */
export default function PlayerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <PlayerScreen trackId={id} />
}
