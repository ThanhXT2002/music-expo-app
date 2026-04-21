/**
 * @file AudioQueue.ts
 * @description Quản lý hàng đợi phát nhạc (queue).
 * Hỗ trợ thêm/xoá/sắp xếp bài, chuyển bài tiếp/trước, shuffle và repeat.
 * @module core/audio
 */

import { createLogger } from '@core/logger'
import type { AudioTrack } from './types'

const logger = createLogger('audio-queue')

/** Danh sách bài hát trong queue */
let queue: AudioTrack[] = []

/** Vị trí hiện tại trong queue */
let currentIndex = -1

/** Chế độ lặp */
let repeatMode: 'none' | 'one' | 'all' = 'none'

/** Chế độ phát ngẫu nhiên */
let shuffleEnabled = false

/**
 * Thêm một bài hát vào cuối queue.
 * Bỏ qua nếu bài đã tồn tại trong queue.
 *
 * @param track - Bài hát cần thêm
 */
export function addToQueue(track: AudioTrack): void {
  if (queue.some((t) => t.id === track.id)) {
    logger.warn('Bài đã có trong queue — bỏ qua', { trackId: track.id })
    return
  }
  queue.push(track)
  logger.info('Thêm bài vào queue', { trackId: track.id, title: track.title, queueSize: queue.length })
}

/**
 * Thay thế toàn bộ queue bằng danh sách mới.
 *
 * @param tracks - Danh sách bài hát mới
 * @param startIndex - Vị trí bắt đầu phát (mặc định 0)
 */
export function setQueue(tracks: AudioTrack[], startIndex = 0): void {
  queue = [...tracks]
  currentIndex = startIndex
  logger.info('Cập nhật queue mới', { total: tracks.length, startIndex })
}

/**
 * Xoá một bài hát khỏi queue.
 *
 * @param trackId - ID bài hát cần xoá
 */
export function removeFromQueue(trackId: string): void {
  const index = queue.findIndex((t) => t.id === trackId)
  if (index === -1) return

  queue.splice(index, 1)

  // Điều chỉnh currentIndex nếu bài bị xoá nằm trước hoặc tại vị trí đang phát
  if (index < currentIndex) {
    currentIndex--
  } else if (index === currentIndex) {
    currentIndex = Math.min(currentIndex, queue.length - 1)
  }

  logger.info('Xoá bài khỏi queue', { trackId, queueSize: queue.length })
}

/**
 * Xoá toàn bộ queue.
 */
export function clearQueue(): void {
  logger.info('Xoá toàn bộ queue', { previousSize: queue.length })
  queue = []
  currentIndex = -1
}

/**
 * Lấy bài tiếp theo trong queue.
 * Xử lý logic repeat và shuffle.
 *
 * @returns Bài hát tiếp theo hoặc null nếu hết queue
 */
export function getNextTrack(): AudioTrack | null {
  if (queue.length === 0) return null

  if (repeatMode === 'one') {
    logger.debug('Chế độ lặp 1 bài — phát lại bài hiện tại')
    return queue[currentIndex] ?? null
  }

  if (shuffleEnabled) {
    const randomIndex = Math.floor(Math.random() * queue.length)
    currentIndex = randomIndex
    logger.debug('Shuffle — chọn bài ngẫu nhiên', { index: randomIndex })
    return queue[randomIndex]
  }

  const nextIndex = currentIndex + 1

  if (nextIndex >= queue.length) {
    if (repeatMode === 'all') {
      currentIndex = 0
      logger.debug('Lặp lại toàn bộ queue từ đầu')
      return queue[0]
    }
    logger.info('Đã hết queue — không còn bài để phát')
    return null
  }

  currentIndex = nextIndex
  return queue[currentIndex]
}

/**
 * Lấy bài trước đó trong queue.
 *
 * @returns Bài hát trước đó hoặc null
 */
export function getPreviousTrack(): AudioTrack | null {
  if (queue.length === 0 || currentIndex <= 0) return null
  currentIndex--
  logger.debug('Chuyển về bài trước', { index: currentIndex })
  return queue[currentIndex]
}

/**
 * Lấy toàn bộ queue hiện tại.
 *
 * @returns Bản sao của danh sách queue
 */
export function getQueue(): AudioTrack[] {
  return [...queue]
}

/**
 * Lấy vị trí đang phát trong queue.
 *
 * @returns Index hiện tại
 */
export function getCurrentIndex(): number {
  return currentIndex
}

/**
 * Đặt chế độ lặp.
 *
 * @param mode - Chế độ lặp: none | one | all
 */
export function setRepeatMode(mode: 'none' | 'one' | 'all'): void {
  logger.debug('Đổi chế độ lặp', { from: repeatMode, to: mode })
  repeatMode = mode
}

/**
 * Bật/tắt chế độ phát ngẫu nhiên.
 *
 * @param enabled - true để bật shuffle
 */
export function setShuffle(enabled: boolean): void {
  logger.debug('Đổi chế độ shuffle', { enabled })
  shuffleEnabled = enabled
}
