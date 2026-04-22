/**
 * @file useCurrentPlaylist.ts
 * @description Hook tổng hợp state và actions chuyên dụng cho màn hình Current Playlist Sheet.
 * @module features/player/hooks
 */

import { useMemo } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { usePlayer } from './usePlayer'
import { formatDuration } from '@shared/utils/formatDuration'
import type { Track } from '@shared/types/track'
import * as AudioManager from '@core/audio/AudioManager'

interface UseCurrentPlaylistReturn {
  // --- State ---
  queue: Track[]
  currentTrack: Track | null
  currentIndex: number
  isPlaying: boolean
  shuffleEnabled: boolean
  progressPercentage: number
  remainingTimeText: string
  
  // --- Actions ---
  playSongAtIndex: (track: Track, index: number) => Promise<void>
  reorderQueue: (fromIndex: number, toIndex: number) => void
  removeFromQueue: (index: number) => void
  clearPlaylist: () => void
  togglePlayPause: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  toggleShuffle: () => void
}

export function useCurrentPlaylist(): UseCurrentPlaylistReturn {
  const store = usePlayerStore()
  
  // Gọi usePlayer không truyền trackId để lấy trạng thái Global Player hiện hành
  const player = usePlayer(undefined)

  const currentIndex = useMemo(() => {
    if (!store.currentTrack) return -1
    return store.queue.findIndex(t => t.id === store.currentTrack?.id)
  }, [store.queue, store.currentTrack])

  const progressPercentage = useMemo(() => {
    if (player.duration === 0) return 0
    return (player.currentTime / player.duration) * 100
  }, [player.currentTime, player.duration])

  const remainingTimeText = useMemo(() => {
    const remaining = Math.max(0, player.duration - player.currentTime)
    return `-${formatDuration(remaining)}`
  }, [player.duration, player.currentTime])

  const playSongAtIndex = async (track: Track, index: number) => {
    store.setCurrentTrack(track)
    if (!track.streamUrl) {
      console.warn('Track thiếu streamUrl:', track.id)
      return
    }
    await AudioManager.loadAndPlay(track as Track & { streamUrl: string })
  }

  const togglePlayPause = async () => {
    if (store.isPlaying) {
      await player.pause()
    } else {
      await player.play()
    }
  }

  return {
    queue: store.queue,
    currentTrack: store.currentTrack,
    currentIndex,
    isPlaying: store.isPlaying,
    shuffleEnabled: store.shuffleEnabled,
    progressPercentage,
    remainingTimeText,

    playSongAtIndex,
    reorderQueue: store.reorderQueue,
    removeFromQueue: store.removeFromQueue,
    clearPlaylist: store.clearQueue,
    togglePlayPause,
    next: player.next,
    previous: player.previous,
    toggleShuffle: store.toggleShuffle
  }
}
