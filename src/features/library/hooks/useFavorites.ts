/**
 * @file useFavorites.ts
 * @description Hook quản lý danh sách yêu thích — chỉ dùng SQLite local, không gọi API.
 * @module features/library/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createLogger } from '@core/logger'
import { ToastAndroid } from 'react-native'
import { getFavoriteIdsLocal, toggleFavoriteLocal } from '@core/data/database'

const logger = createLogger('useFavorites')

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const favoriteKeys = {
  all: ['favorites'] as const,
  ids: () => [...favoriteKeys.all, 'ids', 'local'] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách ID bài hát yêu thích từ SQLite local.
 */
export function useFavoriteIdsLocal() {
  return useQuery({
    queryKey: favoriteKeys.ids(),
    queryFn: async () => {
      try {
        return await getFavoriteIdsLocal()
      } catch (error) {
        logger.error('Lỗi khi đọc danh sách yêu thích local', error)
        return []
      }
    },
    staleTime: 0,
  })
}

/**
 * Toggle yêu thích bài hát trong SQLite local với optimistic update.
 */
export function useToggleFavoriteLocal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ trackId, isCurrentlyFavorited }: { trackId: string; isCurrentlyFavorited: boolean }) => {
      await toggleFavoriteLocal(trackId, !isCurrentlyFavorited)
      return { trackId, isCurrentlyFavorited }
    },
    onMutate: async ({ trackId, isCurrentlyFavorited }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.ids() })
      const previousIds = queryClient.getQueryData<string[]>(favoriteKeys.ids())

      // Optimistic update
      queryClient.setQueryData<string[]>(favoriteKeys.ids(), (old = []) =>
        isCurrentlyFavorited
          ? old.filter((id) => id !== trackId)
          : [...old, trackId]
      )

      return { previousIds }
    },
    onError: (_err, _vars, context) => {
      logger.error('Toggle favorite local failed')
      ToastAndroid.show('Đã có lỗi xảy ra', ToastAndroid.SHORT)
      if (context?.previousIds) {
        queryClient.setQueryData(favoriteKeys.ids(), context.previousIds)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.ids() })
    },
    onSuccess: (data) => {
      const msg = data.isCurrentlyFavorited ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích'
      ToastAndroid.show(msg, ToastAndroid.SHORT)
    },
  })
}
