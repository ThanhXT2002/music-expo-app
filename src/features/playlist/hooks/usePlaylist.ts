/**
 * @file usePlaylist.ts
 * @description Hook tải chi tiết playlist.
 * @module features/playlist/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createLogger } from '@core/logger'
import * as playlistService from '../services/playlistService'
import type { PlaylistFormData } from '../types'

const logger = createLogger('use-playlist')

/**
 * Hook tải chi tiết một playlist.
 *
 * @param playlistId - ID playlist
 */
export function usePlaylistDetail(playlistId: string) {
  const query = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => playlistService.getPlaylistDetail(playlistId),
    enabled: !!playlistId
  })

  return {
    playlist: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error
  }
}

/**
 * Hook tải danh sách tất cả playlist.
 */
export function usePlaylists() {
  const query = useQuery({
    queryKey: ['playlists'],
    queryFn: playlistService.getPlaylists
  })

  return {
    playlists: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch
  }
}

/**
 * Hook tạo playlist mới.
 */
export function useCreatePlaylist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaylistFormData) => playlistService.createPlaylist(data),
    onSuccess: () => {
      logger.info('Tạo playlist thành công — invalidate cache')
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    },
    onError: (error) => {
      logger.error('Tạo playlist thất bại', error)
    }
  })
}
