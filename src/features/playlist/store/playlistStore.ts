/**
 * @file playlistStore.ts
 * @description Store quản lý trạng thái UI cho playlist.
 * @module features/playlist/store
 */

import { create } from 'zustand'
import { createLogger } from '@core/logger'

const logger = createLogger('playlist-store')

interface PlaylistUIStore {
  /** Đang hiển thị modal tạo playlist */
  showCreateModal: boolean
  /** ID playlist đang được chỉnh sửa */
  editingPlaylistId: string | null

  openCreateModal: () => void
  closeCreateModal: () => void
  setEditingPlaylist: (id: string | null) => void
}

export const usePlaylistStore = create<PlaylistUIStore>((set) => ({
  showCreateModal: false,
  editingPlaylistId: null,

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
  }
}))
