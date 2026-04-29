/**
 * @file useTrackActions.ts
 * @description Hook cung cấp các hàm action chuẩn cho bài hát (Thêm playlist, Tải xuống).
 * Favorite được xử lý trực tiếp qua useToggleFavoriteLocal tại từng component.
 * @module shared/hooks
 */

import { usePlaylistStore } from '@features/playlist/store/playlistStore'
import { useDownloadStore } from '@features/downloads/store/downloadStore'
import { ToastAndroid } from 'react-native'
import { createLogger } from '@core/logger'
import type { Track } from '@shared/types/track'

const logger = createLogger('use-track-actions')

export function useTrackActions() {
  const openAddToPlaylistModal = usePlaylistStore((s) => s.openAddToPlaylistModal)
  const downloadByTrack = useDownloadStore((s) => s.downloadByTrack)

  const handlePlaylist = (track: Track) => {
    logger.debug('Kích hoạt AddToPlaylistModal', { trackId: track.id })
    openAddToPlaylistModal(track)
  }

  const handleDownload = (track: Track) => {
    logger.debug('Kích hoạt Download', { trackId: track.id })
    downloadByTrack(track)
    ToastAndroid.show(`Đang tải ${track.title}...`, ToastAndroid.SHORT)
  }

  return {
    onPlaylist: handlePlaylist,
    onDownload: handleDownload,
  }
}
