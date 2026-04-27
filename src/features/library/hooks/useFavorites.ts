/**
 * @file useFavorites.ts
 * @description Hook quan ly danh sach yeu thich bang TanStack Query.
 * Co the lay danh sach, lay ID, va toggle (add/remove) cung voi Optimistic Update.
 * Hỗ trợ Offline-first thông qua SQLite local database.
 * @module features/library/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@core/api/apiClient'
import { API_ENDPOINTS } from '@core/api/endpoints'
import { createLogger } from '@core/logger'
import type { Track } from '@shared/types/track'
import { ToastAndroid } from 'react-native'
import { getFavoriteIdsLocal, syncFavoritesLocal, toggleFavoriteLocal } from '@core/data/database'

const logger = createLogger('useFavorites')

// Keys cho React Query
export const favoriteKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoriteKeys.all, 'list'] as const,
  ids: () => [...favoriteKeys.all, 'ids'] as const,
}

interface FavoriteIdsResponse {
  song_ids: string[]
}

/**
 * Hook de lay danh sach ID cac bai hat da yeu thich.
 * Dung de hien thi UI (trang thai Heart icon).
 * Hỗ trợ Offline: đọc từ SQLite trước, sau đó fetch API và sync.
 */
export function useFavoriteIds() {
  return useQuery({
    queryKey: favoriteKeys.ids(),
    queryFn: async () => {
      logger.debug('Fetching favorite IDs')
      
      try {
        // Đọc từ local database trước để có data ngay lập tức khi offline
        const localIds = await getFavoriteIdsLocal()
        
        try {
          // Thử fetch từ server
          const response = await apiClient.get<FavoriteIdsResponse>(`${API_ENDPOINTS.FAVORITES}/ids`)
          const serverIds = response.data?.song_ids || []
          
          // Sync xuống local database
          await syncFavoritesLocal(serverIds)
          
          return serverIds
        } catch (apiError) {
          logger.warn('Lỗi API lấy danh sách yêu thích, fallback về local db', apiError)
          return localIds
        }
      } catch (error) {
        logger.error('Lỗi khi đọc danh sách yêu thích', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phut
  })
}

/**
 * Hook de them hoac xoa bai hat yeu thich (Toggle)
 * Co tich hop Optimistic Update de UI phan hoi tuc thi.
 * Hỗ trợ Offline: Lưu vào SQLite ngay lập tức.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ track, isCurrentlyFavorited }: { track: Track; isCurrentlyFavorited: boolean }) => {
      // 1. Cập nhật local DB ngay lập tức
      await toggleFavoriteLocal(track.id, !isCurrentlyFavorited)
      
      try {
        // 2. Thử gọi API
        if (isCurrentlyFavorited) {
          logger.info('Removing from favorites', { trackId: track.id })
          await apiClient.delete(API_ENDPOINTS.FAVORITES_DELETE(track.id))
        } else {
          logger.info('Adding to favorites', { trackId: track.id })
          await apiClient.post(API_ENDPOINTS.FAVORITES, { song_id: track.id })
        }
      } catch (error: any) {
        // Nếu lỗi do mất mạng, ta coi như thành công trên local, background sync sẽ xử lý sau (hoặc kệ để lần sau user online tự sync)
        if (error?.statusCode === 0 || error?.message?.includes('Network Error') || error?.message?.includes('Kết nối')) {
          logger.warn('Mất mạng khi toggle favorite, đã lưu tạm vào local db')
          return { track, isCurrentlyFavorited, offline: true }
        }
        // Throw lỗi thật nếu backend trả về lỗi logic
        throw error
      }
      return { track, isCurrentlyFavorited, offline: false }
    },
    onMutate: async ({ track, isCurrentlyFavorited }) => {
      // Huy cac query dang chay de khong ghi de cache
      await queryClient.cancelQueries({ queryKey: favoriteKeys.ids() })

      // Luu lai cache cu de co the rollback
      const previousIds = queryClient.getQueryData<string[]>(favoriteKeys.ids())

      // Optimistic update
      queryClient.setQueryData<string[]>(favoriteKeys.ids(), (old = []) => {
        if (isCurrentlyFavorited) {
          return old.filter((id) => id !== track.id) // Xoa khoi UI
        } else {
          return [...old, track.id] // Them vao UI
        }
      })

      // Tra ve context de rollback khi loi
      return { previousIds }
    },
    onError: (err, newTodo, context) => {
      logger.error('Toggle favorite failed', err)
      ToastAndroid.show('Đã có lỗi xảy ra', ToastAndroid.SHORT)
      // Rollback ve state cu neu call API that bai
      if (context?.previousIds) {
        queryClient.setQueryData(favoriteKeys.ids(), context.previousIds)
        // Rollback local db if needed (but complex, so skip for now)
      }
    },
    onSettled: () => {
      // Invalidate queries de lay du lieu moi nhat (chac chan)
      queryClient.invalidateQueries({ queryKey: favoriteKeys.ids() })
      // Cung invalidate list hien thi Library neu co
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() })
    },
    onSuccess: (data) => {
      const offlineMsg = data.offline ? ' (Offline)' : ''
      const msg = data.isCurrentlyFavorited ? `Đã bỏ yêu thích${offlineMsg}` : `Đã thêm vào yêu thích${offlineMsg}`
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    }
  })
}
