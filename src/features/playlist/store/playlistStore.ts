/**
 * @file playlistStore.ts
 * @description Store quản lý trạng thái UI cho playlist.
 * @module features/playlist/store
 */

import { create } from 'zustand'
import { createLogger } from '@core/logger'
import type { Track } from '@shared/types/track'

const logger = createLogger('playlist-store')

interface PlaylistUIStore {
  /** Đang hiển thị modal tạo playlist */
  showCreateModal: boolean
  /** ID playlist đang được chỉnh sửa */
  editingPlaylistId: string | null
  /** Đang hiển thị modal thêm bài hát vào playlist */
  showAddToPlaylistModal: boolean
  /** Bài hát đang chuẩn bị được thêm vào playlist */
  trackToAdd: Track | null

  openCreateModal: () => void
  closeCreateModal: () => void
  setEditingPlaylist: (id: string | null) => void
  openAddToPlaylistModal: (track: Track) => void
  closeAddToPlaylistModal: () => void
}

export const usePlaylistStore = create<PlaylistUIStore>((set) => ({
  showCreateModal: false,
  editingPlaylistId: null,
  showAddToPlaylistModal: false,
  trackToAdd: null,

  openCreateModal: () => {
    logger.debug('Mở modal tạo playlist')
    set({ showCreateModal: true })
  },

  closeCreateModal: () => {
    logger.debug('Đóng modal tạo playlist')
    set({ showCreateModal: false })
  },

  setEditingPlaylist: (id) => {
    logger.debug('Chọn playlist để chỉnh sửa', { playlistId: id })
    set({ editingPlaylistId: id })
  },

  openAddToPlaylistModal: (track) => {
    logger.debug('Mở modal thêm vào playlist', { trackId: track.id })
    set({ showAddToPlaylistModal: true, trackToAdd: track })
  },

  closeAddToPlaylistModal: () => {
    logger.debug('Đóng modal thêm vào playlist')
    set({ showAddToPlaylistModal: false, trackToAdd: null })
  }
}))
