/**
 * @file libraryStore.ts
 * @description Store quản lý trạng thái thư viện nhạc.
 * @module features/library/store
 */

import { create } from 'zustand'
import { createLogger } from '@core/logger'
import type { LibraryTab, SortBy } from '../types'

const logger = createLogger('library-store')

interface LibraryStore {
  activeTab: LibraryTab
  sortBy: SortBy
  setActiveTab: (tab: LibraryTab) => void
  setSortBy: (sort: SortBy) => void
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  activeTab: 'tracks',
  sortBy: 'recent',

  setActiveTab: (tab) => {
    logger.debug('Chuyển tab thư viện', { tab })
    set({ activeTab: tab })
  },

  setSortBy: (sort) => {
    logger.debug('Đổi cách sắp xếp', { sort })
    set({ sortBy: sort })
  }
}))
