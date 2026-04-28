/**
 * @file usePlayer.ts
 * @description Hook trung tâm quản lý phát nhạc.
 * Kết nối UI với AudioManager và playerStore.
 *
 * Fix:
 * - Sync isPlaying từ AudioManager status (không set thủ công)
 * - play/pause gọi AudioManager trước, rồi sync store
 *
 * @module features/player/hooks
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import * as AudioManager from '@core/audio/AudioManager'
import { createLogger } from '@core/logger'
import { usePlayerStore } from '../store/playerStore'
import type { UsePlayerReturn } from '../types'
import type { RepeatMode } from '../types'

const logger = createLogger('use-player')

/**
 * Hook quản lý toàn bộ vòng đời phát nhạc.
 * Kết nối playerStore (Zustand) với AudioManager (expo-av).
 *
 * @param trackId - ID bài hát muốn phát khi hook khởi tạo (tuỳ chọn)
 * @returns Trạng thái và điều khiển trình phát
 */
export function usePlayer(trackId?: string): UsePlayerReturn {
  const store = usePlayerStore()
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)

  // Ref tracking last saved position to throttle Zustand store writes
  const lastSavedPositionRef = useRef<number>(0)
  
  // Dùng ref để đảm bảo gọi handleNextTrack đúng 1 lần khi chuyển bài tự động
  const handledTrackEndRef = useRef<string | null>(null)

  const handleNextTrack = useCallback(async (manual = false) => {
    const s = usePlayerStore.getState()
    if (!s.currentTrack) return

    // Đánh dấu đã xử lý hết bài cho track hiện tại (khi bấm next thủ công)
    handledTrackEndRef.current = s.currentTrack.id

    // Nếu chế độ lặp bài 1 bài và không phải user bấm Next thủ công
    if (!manual && s.repeatMode === 'one') {
      logger.info('Phát lại bài hiện tại (Repeat 1)')
      await AudioManager.seekTo(0)
      await AudioManager.play()
      return
    }

    if (s.queue.length === 0) {
      logger.info('Queue trống — dừng phát')
      return
    }

    let nextTrack
    const currentIndex = s.queue.findIndex((t) => t.id === s.currentTrack?.id)

    if (s.shuffleEnabled && s.queue.length > 1) {
      // Shuffle logic
      let randomIndex = currentIndex
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * s.queue.length)
      }
      nextTrack = s.queue[randomIndex]
    } else {
      // Normal logic
      if (currentIndex === -1 || currentIndex === s.queue.length - 1) {
        if (s.repeatMode === 'all' || manual) {
          nextTrack = s.queue[0] // Quay lại đầu list
        } else {
          logger.info('Queue đã hết — dừng phát')
          return // Hết list
        }
      } else {
        nextTrack = s.queue[currentIndex + 1]
      }
    }

    logger.info('Chuyển sang bài:', { title: nextTrack.title })
    s.setCurrentTrack(nextTrack)
    await AudioManager.loadAndPlay(nextTrack as any)
  }, [])

  // Đăng ký listener nhận cập nhật tiến trình từ AudioManager
  useEffect(() => {
    const unsubscribe = AudioManager.subscribe((state, progressData) => {
      setProgress(progressData.progress)
      setCurrentTime(progressData.currentTime)
      setDuration(progressData.duration)

      // Sync isPlaying từ AudioManager state (source of truth)
      const isNowPlaying = state === 'playing'
      const storeIsPlaying = usePlayerStore.getState().isPlaying
      if (isNowPlaying !== storeIsPlaying) {
        usePlayerStore.getState().setIsPlaying(isNowPlaying)
      }

      // Sync isBuffering — true khi AudioManager đang loading
      setIsBuffering(state === 'loading')

      // Cập nhật lastPosition vào store mỗi 5 giây để lưu vị trí khi thoát app
      const currentInt = Math.floor(progressData.currentTime)
      if (currentInt > 0 && currentInt % 5 === 0 && currentInt !== lastSavedPositionRef.current) {
        lastSavedPositionRef.current = currentInt
        usePlayerStore.getState().setLastPosition(currentInt)
      }

      // Tự động chuyển bài khi kết thúc
      if (state === 'stopped' && progressData.progress > 0) {
        const currentId = usePlayerStore.getState().currentTrack?.id
        if (currentId && handledTrackEndRef.current !== currentId) {
          handledTrackEndRef.current = currentId
          handleNextTrack(false)
        }
      }
    })

    return () => unsubscribe()
  }, [handleNextTrack])

  // ─── Core Hook Playback Logic ──────────────────────────────────────────

  // Tự động load và phát bài nếu được truyền trackId
  useEffect(() => {
    if (!trackId) return
    logger.info('Khởi tạo player với track', { trackId })
  }, [trackId])

  const play = useCallback(async () => {
    logger.debug('Gọi play()', { trackId: store.currentTrack?.id })
    try {
      if (!AudioManager.getCurrentTrack() && store.currentTrack) {
        logger.info('Khôi phục và load bài hát từ session cũ', { lastPosition: store.lastPosition })
        await AudioManager.loadAndPlay(store.currentTrack as any, store.lastPosition || 0)
      } else {
        await AudioManager.play()
      }
      // isPlaying sẽ được sync từ AudioManager listener ở trên
    } catch (error) {
      logger.error('Lỗi khi phát nhạc', error)
    }
  }, [store])

  const pause = useCallback(async () => {
    logger.debug('Gọi pause()', { trackId: store.currentTrack?.id })
    try {
      await AudioManager.pause()
      // isPlaying sẽ được sync từ AudioManager listener ở trên
    } catch (error) {
      logger.error('Lỗi khi dừng nhạc', error)
    }
  }, [store])

  const next = useCallback(async () => {
    logger.info('Chuyển bài tiếp theo')
    await handleNextTrack(true)
  }, [handleNextTrack])

  const previous = useCallback(async () => {
    logger.info('Quay lại bài trước')
    const s = usePlayerStore.getState()
    if (!s.currentTrack || s.queue.length === 0) return

    // Nếu bài hát đang phát > 3s, click previous sẽ chỉ là tua lại đầu bài
    if (currentTime > 3) {
      await AudioManager.seekTo(0)
      return
    }

    const currentIndex = s.queue.findIndex((t) => t.id === s.currentTrack?.id)
    let prevTrack

    if (currentIndex <= 0) {
      prevTrack = s.queue[s.queue.length - 1] // Cuốn lại từ cuối
    } else {
      prevTrack = s.queue[currentIndex - 1]
    }

    logger.info('Quay lại chuyển bài:', { title: prevTrack.title })
    s.setCurrentTrack(prevTrack)
    await AudioManager.loadAndPlay(prevTrack as any)
  }, [currentTime])

  const seekTo = useCallback(async (position: number) => {
    logger.debug('Tua tới vị trí', { position })
    await AudioManager.seekTo(position)
  }, [])

  // ─── Toggle Shuffle / Repeat ───────────────────────────────────────────

  const toggleShuffle = useCallback(() => {
    store.toggleShuffle()
  }, [store])

  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['none', 'all', 'one']
    const currentIdx = modes.indexOf(store.repeatMode)
    const nextMode = modes[(currentIdx + 1) % modes.length]
    logger.debug('Đổi chế độ lặp', { from: store.repeatMode, to: nextMode })
    store.setRepeatMode(nextMode)
  }, [store])

  return {
    currentTrack: store.currentTrack,
    isPlaying: store.isPlaying,
    isBuffering,
    shuffleEnabled: store.shuffleEnabled,
    repeatMode: store.repeatMode,
    progress,
    currentTime,
    duration,
    play,
    pause,
    next,
    previous,
    seekTo,
    toggleShuffle,
    toggleRepeat
  }
}
