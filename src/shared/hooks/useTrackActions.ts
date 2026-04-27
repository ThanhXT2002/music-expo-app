/**
 * @file useTrackActions.ts
 * @description Hook cung cấp các hàm action chuẩn cho bài hát (Thêm playlist, Tải xuống, Yêu thích).
 * Dùng chung cho TrackListItem trên toàn ứng dụng.
 * @module shared/hooks
 */

import { usePlaylistStore } from '@features/playlist/store/playlistStore'
import { useDownloadStore } from '@features/downloads/store/downloadStore'
import { useToggleFavorite } from '@features/library/hooks/useFavorites'
import { ToastAndroid } from 'react-native'
import { createLogger } from '@core/logger'
import type { Track } from '@shared/types/track'

const logger = createLogger('use-track-actions')

export function useTrackActions(isCurrentlyFavorited: boolean = false) {
  const openAddToPlaylistModal = usePlaylistStore((s) => s.openAddToPlaylistModal)
  const downloadByTrack = useDownloadStore((s) => s.downloadByTrack)
  const { mutate: toggleFavorite } = useToggleFavorite()

  const handlePlaylist = (track: Track) => {
    logger.debug('Kích hoạt AddToPlaylistModal', { trackId: track.id })
    openAddToPlaylistModal(track)
  }

  const handleDownload = (track: Track) => {
    logger.debug('Kích hoạt Download', { trackId: track.id })
    downloadByTrack(track)
    ToastAndroid.show(`Đang tải ${track.title}...`, ToastAndroid.SHORT)
  }

  const handleFavorite = (track: Track) => {
    logger.debug('Kích hoạt Favorite', { trackId: track.id })
    toggleFavorite({ track, isCurrentlyFavorited })
  }

  return {
    onPlaylist: handlePlaylist,
    onDownload: handleDownload,
    onFavorite: handleFavorite,
  }
}
