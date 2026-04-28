/**
 * @file playerStore.ts
 * @description Global state cho trình phát nhạc.
 * Lưu trạng thái hiện tại, queue và lịch sử phát.
 * @module features/player/store
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createLogger } from '@core/logger'
import type { Track } from '@shared/types/track'
import type { RepeatMode } from '../types'

const logger = createLogger('player-store')

/**
 * Cấu trúc state và actions của player store.
 */
interface PlayerStore {
  /** Bài hát đang phát */
  currentTrack: Track | null
  /** Danh sách bài chờ phát */
  queue: Track[]
  /** Trạng thái đang phát/dừng */
  isPlaying: boolean
  /** Chế độ lặp */
  repeatMode: RepeatMode
  /** Chế độ shuffle */
  shuffleEnabled: boolean

  /** Hiển thị bottom sheet current playlist */
  showCurrentPlaylist: boolean
  /** Vị trí phát cuối cùng (tính bằng giây) */
  lastPosition: number

  // --- Actions ---
  setCurrentTrack: (track: Track | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  setQueue: (tracks: Track[]) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void
  setRepeatMode: (mode: RepeatMode) => void
  toggleShuffle: () => void
  setLastPosition: (position: number) => void
  
  openCurrentPlaylist: () => void
  closeCurrentPlaylist: () => void
}

/**
 * Zustand store quản lý trạng thái trình phát nhạc.
 */
export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // --- Initial state ---
      currentTrack: null,
      queue: [],
      isPlaying: false,
      repeatMode: 'none',
      shuffleEnabled: false,
      showCurrentPlaylist: false,
      lastPosition: 0,

      // --- Actions ---
      setCurrentTrack: (track) => {
        logger.debug('Cập nhật track hiện tại', { trackId: track?.id ?? 'null' })
        set({ currentTrack: track, lastPosition: 0 })
      },

      setIsPlaying: (isPlaying) => {
        logger.debug('Cập nhật trạng thái phát', { isPlaying })
        set({ isPlaying })
      },

      setQueue: (tracks) => {
        logger.info('Cập nhật queue', { total: tracks.length })
        set({ queue: tracks })
      },

      addToQueue: (track) => {
        const currentQueue = get().queue
        if (currentQueue.some((t) => t.id === track.id)) {
          logger.warn('Bài đã có trong queue — bỏ qua', { trackId: track.id })
          return
        }
        logger.info('Thêm bài vào queue', { trackId: track.id, title: track.title })
        set({ queue: [...currentQueue, track] })
      },

      removeFromQueue: (index) => {
        const currentQueue = [...get().queue]
        currentQueue.splice(index, 1)
        if (currentQueue.length === 0) {
          set({ queue: [], currentTrack: null, isPlaying: false })
          return
        }
        set({ queue: currentQueue })
      },

      reorderQueue: (fromIndex, toIndex) => {
        const newQueue = [...get().queue]
        const [moved] = newQueue.splice(fromIndex, 1)
        newQueue.splice(toIndex, 0, moved)
        set({ queue: newQueue })
      },

      clearQueue: () => {
        logger.info('Xoá toàn bộ queue', { previousLength: get().queue.length })
        set({ queue: [] })
      },

      setRepeatMode: (mode) => {
        logger.debug('Đổi chế độ lặp', { from: get().repeatMode, to: mode })
        set({ repeatMode: mode })
      },

      toggleShuffle: () => {
        const newValue = !get().shuffleEnabled
        logger.debug('Đổi chế độ shuffle', { enabled: newValue })
        set({ shuffleEnabled: newValue })
      },

      setLastPosition: (position) => {
        set({ lastPosition: position })
      },

      openCurrentPlaylist: () => {
        set({ showCurrentPlaylist: true })
      },

      closeCurrentPlaylist: () => {
        set({ showCurrentPlaylist: false })
      }
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        repeatMode: state.repeatMode,
        shuffleEnabled: state.shuffleEnabled,
        currentTrack: state.currentTrack,
        queue: state.queue,
        lastPosition: state.lastPosition
      })
    }
  )
)
