/**
 * @file tabBarStore.ts
 * @description Store lưu tuỳ chỉnh giao diện tab bar.
 *
 * Hiện tại hỗ trợ:
 * - searchPosition: vị trí Search circle ('left' | 'right')
 *
 * Dữ liệu persist qua AsyncStorage để giữ lại sau khi restart app.
 *
 * @module shared/store
 */

import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createLogger } from '@core/logger'

const logger = createLogger('tab-bar-store')

const STORAGE_KEY = 'tabbar_search_position'

interface TabBarState {
  /** Vị trí Search circle: 'left' (mặc định) hoặc 'right' */
  searchPosition: 'left' | 'right'

  /** Đổi vị trí Search circle */
  toggleSearchPosition: () => void

  /** Nạp preference đã lưu từ AsyncStorage */
  loadPreference: () => Promise<void>
}

export const useTabBarStore = create<TabBarState>((set, get) => ({
  searchPosition: 'left',

  toggleSearchPosition: () => {
    const newPos = get().searchPosition === 'left' ? 'right' : 'left'
    set({ searchPosition: newPos })

    // Persist ngầm — không block UI
    AsyncStorage.setItem(STORAGE_KEY, newPos).catch((err) =>
      logger.error('Lưu preference thất bại', err)
    )

    logger.info('Đổi vị trí Search circle', { position: newPos })
  },

  loadPreference: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY)
      if (saved === 'left' || saved === 'right') {
        set({ searchPosition: saved })
        logger.info('Loaded tab bar preference', { searchPosition: saved })
      }
    } catch (err) {
      logger.error('Load preference thất bại', err)
    }
  }
}))
