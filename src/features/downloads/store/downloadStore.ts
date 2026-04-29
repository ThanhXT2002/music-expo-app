/**
 * @file downloadStore.ts
 * @description Zustand store quản lý trạng thái tải nhạc toàn cục.
 *
 * Chức năng:
 * - Quản lý danh sách active download tasks (progress, status)
 * - Cache offline songs từ SQLite
 * - Kết quả tìm kiếm từ server
 * - Orchestrate toàn bộ luồng: submit URL → poll → download → save
 *
 * @module features/downloads/store
 */

import { create } from 'zustand'
import { QueryClient } from '@tanstack/react-query'
import { createLogger } from '@core/logger'
import { getDownloadedSongs, type LocalSong } from '@core/data/database'
import { getTotalDownloadSize } from '@core/storage/fileStorage'
import {
  fetchSongInfo,
  pollSongStatus,
  downloadAndSave,
  removeDownloadedSong,
  searchCompletedSongs,
  isYoutubeUrl
} from '../services/downloadService'
import type { DownloadItem, SongInfo, ServerStatus } from '../types'

const logger = createLogger('download-store')

// ─── Global QueryClient Reference ───────────────────────────────────────────
// Sẽ được set từ App root để store có thể invalidate queries
let globalQueryClient: QueryClient | null = null

export function setDownloadStoreQueryClient(client: QueryClient) {
  globalQueryClient = client
  logger.info('QueryClient đã được set cho downloadStore')
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface DownloadState {
  /** Danh sách task đang tải / đang xử lý */
  tasks: DownloadItem[]
  /** Bài hát đã tải xong (từ SQLite) */
  offlineSongs: LocalSong[]
  /** Kết quả tìm kiếm server */
  searchResults: SongInfo[]
  /** Trạng thái searching */
  isSearching: boolean
  /** Tổng dung lượng nhạc offline (bytes) */
  totalSize: number

  // ─── Actions ───
  /** Nạp danh sách bài hát offline từ SQLite */
  loadOfflineSongs: () => Promise<void>
  /** Gửi YouTube URL → lấy info → poll → download */
  submitYouTubeUrl: (url: string) => Promise<void>
  /** Tải bằng Track object có sẵn metadata */
  downloadByTrack: (track: any) => Promise<void>
  /** Tìm kiếm bài hát trên server bằng từ khoá */
  searchByKeyword: (keyword: string) => Promise<void>
  /** Xoá bài hát offline (file + DB) */
  removeTrack: (songId: string) => Promise<void>
  /** Xoá kết quả tìm kiếm */
  clearSearch: () => void
  /** Kiểm tra bài hát đã tải chưa */
  isDownloaded: (songId: string) => boolean
}

// ─── Store Implementation ────────────────────────────────────────────────────

export const useDownloadStore = create<DownloadState>((set, get) => ({
  tasks: [],
  offlineSongs: [],
  searchResults: [],
  isSearching: false,
  totalSize: 0,

  // ─── Load từ SQLite ───
  loadOfflineSongs: async () => {
    try {
      const songs = await getDownloadedSongs()
      const size = await getTotalDownloadSize()
      set({ offlineSongs: songs, totalSize: size })
      logger.info('Loaded downloaded songs mapping', { count: songs.length, sizeMB: (size / 1024 / 1024).toFixed(1) })
    } catch (error) {
      logger.error('Lỗi load offline songs', error)
    }
  },

  // ─── Submit YouTube URL ───
  submitYouTubeUrl: async (url: string) => {
    const state = get()
    logger.info('Submit YouTube URL', { url })

    // 1. Tạo task placeholder
    const tempId = `temp-${Date.now()}`
    const tempTask: DownloadItem = {
      trackId: tempId,
      title: 'Đang lấy thông tin...',
      artist: '',
      coverUrl: '',
      duration: 0,
      status: 'idle',
      serverStatus: 'unknown',
      progress: 0,
      serverProgress: 0,
      filePath: null,
      errorMessage: null
    }
    set({ tasks: [tempTask, ...state.tasks] })

    try {
      // 2. Gọi API lấy info bài hát
      const songInfo = await fetchSongInfo(url)

      // Kiểm tra trùng lặp
      if (get().isDownloaded(songInfo.id)) {
        set({
          tasks: get().tasks.filter((t) => t.trackId !== tempId)
        })
        logger.info('Bài hát đã tải trước đó', { id: songInfo.id })
        return
      }

      // 3. Cập nhật task với info thật
      const realTask: DownloadItem = {
        trackId: songInfo.id,
        title: songInfo.title,
        artist: songInfo.artist,
        coverUrl: songInfo.thumbnail_url,
        duration: songInfo.duration,
        status: 'idle',
        serverStatus: 'pending',
        progress: 0,
        serverProgress: 0,
        filePath: null,
        errorMessage: null
      }
      set({
        tasks: get().tasks.map((t) => (t.trackId === tempId ? realTask : t))
      })

      // 4. Poll server status
      await pollUntilReady(songInfo.id, set, get)

      // 5. Download file MP3
      updateTask(songInfo.id, { status: 'downloading' }, set, get)
      const filePath = await downloadAndSave(songInfo, (progress) => {
        updateTask(songInfo.id, { progress }, set, get)
      })

      // 6. Hoàn thành
      updateTask(
        songInfo.id,
        {
          status: 'completed',
          progress: 1,
          filePath
        },
        set,
        get
      )

      // 7. Refresh danh sách offline
      await get().loadOfflineSongs()

      // 8. Invalidate React Query cache để UI tự động cập nhật
      if (globalQueryClient) {
        globalQueryClient.invalidateQueries({ queryKey: ['library', 'tracks'] })
        logger.info('Đã invalidate library queries sau khi download')
      }

      logger.info('Download hoàn tất', { id: songInfo.id, title: songInfo.title })
    } catch (error: any) {
      // Cập nhật task lỗi
      const currentTasks = get().tasks
      const taskToUpdate = currentTasks.find((t) => t.trackId === tempId) || currentTasks[0]
      if (taskToUpdate) {
        updateTask(
          taskToUpdate.trackId,
          {
            status: 'error',
            errorMessage: error?.message || 'Không thể tải bài hát'
          },
          set,
          get
        )
      }
      logger.error('Submit URL thất bại', { url, error })
    }
  },

  // ─── Download Bằng Track Object (Metadata có sẵn) ───
  downloadByTrack: async (track: any) => {
    const state = get()
    logger.info('Download bằng Track object', { id: track.id })

    // Đã tải rồi thì thôi
    if (state.isDownloaded(track.id)) {
      logger.info('Bài hát đã tải trước đó', { id: track.id })
      return
    }

    // Đang tải thì bỏ qua
    if (state.tasks.some(t => t.trackId === track.id && t.status !== 'error' && t.status !== 'completed')) {
      logger.info('Bài hát đang được tải', { id: track.id })
      return
    }

    // 1. Tạo task ngay lập tức với metadata thật từ Track
    const task: DownloadItem = {
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      coverUrl: track.thumbnailUrl,
      duration: track.durationSeconds,
      status: 'idle',
      serverStatus: 'pending',
      progress: 0,
      serverProgress: 0,
      filePath: null,
      errorMessage: null
    }

    // Ghi đè task cũ nếu bị lỗi trước đó
    set({ tasks: [task, ...state.tasks.filter((t) => t.trackId !== track.id)] })

    try {
      // 2. Gọi API để trigger background task (cần fetchSongInfo để mồi server)
      const youtubeUrl = `https://youtube.com/watch?v=${track.id}`
      const songInfo = await fetchSongInfo(youtubeUrl)

      // 3. Poll server status
      await pollUntilReady(songInfo.id, set, get)

      // 4. Download file MP3
      updateTask(songInfo.id, { status: 'downloading' }, set, get)
      const filePath = await downloadAndSave(songInfo, (progress) => {
        updateTask(songInfo.id, { progress }, set, get)
      })

      // 5. Hoàn thành
      updateTask(
        songInfo.id,
        {
          status: 'completed',
          progress: 1,
          filePath
        },
        set,
        get
      )

      // 6. Refresh danh sách offline
      await get().loadOfflineSongs()

      // 7. Invalidate React Query cache để UI tự động cập nhật
      if (globalQueryClient) {
        globalQueryClient.invalidateQueries({ queryKey: ['library', 'tracks'] })
        logger.info('Đã invalidate library queries sau khi download')
      }

      logger.info('Download bằng Track hoàn tất', { id: songInfo.id, title: songInfo.title })
    } catch (error: any) {
      updateTask(
        track.id,
        {
          status: 'error',
          errorMessage: error?.message || 'Không thể tải bài hát'
        },
        set,
        get
      )
      logger.error('Download bằng Track thất bại', { id: track.id, error })
    }
  },

  // ─── Tìm kiếm ───
  searchByKeyword: async (keyword: string) => {
    set({ isSearching: true })
    try {
      const results = await searchCompletedSongs(keyword)
      set({ searchResults: results, isSearching: false })
    } catch {
      set({ searchResults: [], isSearching: false })
    }
  },

  // ─── Xoá bài hát ───
  removeTrack: async (songId: string) => {
    try {
      await removeDownloadedSong(songId)
      set({
        offlineSongs: get().offlineSongs.filter((s) => s.id !== songId),
        tasks: get().tasks.filter((t) => t.trackId !== songId)
      })
      // Refresh size
      const size = await getTotalDownloadSize()
      set({ totalSize: size })
      logger.info('Xoá bài hát thành công', { songId })
    } catch (error) {
      logger.error('Xoá bài hát thất bại', { songId, error })
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  isDownloaded: (songId: string) => {
    return get().offlineSongs.some((s) => s.id === songId)
  }
}))

// ─── Helper: Update task trong store ─────────────────────────────────────────

function updateTask(trackId: string, updates: Partial<DownloadItem>, set: any, get: any) {
  set({
    tasks: get().tasks.map((t: DownloadItem) => (t.trackId === trackId ? { ...t, ...updates } : t))
  })
}

// ─── Helper: Poll server status cho tới khi completed ────────────────────────

async function pollUntilReady(songId: string, set: any, get: any): Promise<void> {
  const MAX_POLLS = 120 // Tối đa 120 lượt × 3s = 6 phút
  const POLL_INTERVAL = 3000

  for (let i = 0; i < MAX_POLLS; i++) {
    try {
      const statusRes = await pollSongStatus(songId)
      const serverStatus = statusRes.status as ServerStatus

      updateTask(
        songId,
        {
          serverStatus,
          serverProgress: statusRes.progress
        },
        set,
        get
      )

      if (serverStatus === 'completed') {
        logger.info('Server convert hoàn tất', { songId })
        return
      }

      if (serverStatus === 'failed') {
        throw new Error('Server xử lý thất bại')
      }

      // Chờ trước lần poll tiếp theo
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
    } catch (error) {
      logger.error('Poll thất bại', { songId, error })
      throw error
    }
  }

  throw new Error('Timeout: Server xử lý quá lâu (> 6 phút)')
}
