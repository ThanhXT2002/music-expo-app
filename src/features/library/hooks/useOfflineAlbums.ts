/**
 * @file useOfflineAlbums.ts
 * @description Tạo danh sách "album" tự động từ bài hát offline bằng cách nhóm theo nghệ sĩ.
 * Thumbnail lấy từ bài hát đầu tiên của nhóm.
 * @module features/library/hooks
 */

import { useMemo } from 'react'
import type { Track } from '@shared/types/track'

export interface OfflineAlbum {
  /** ID = tên nghệ sĩ (dùng làm key) */
  id: string
  /** Tên nghệ sĩ */
  artist: string
  /** Ảnh bìa lấy từ bài hát đầu tiên */
  coverUrl: string
  /** Số lượng bài hát */
  trackCount: number
  /** Danh sách bài hát */
  tracks: Track[]
}

/**
 * Nhóm danh sách bài hát offline theo nghệ sĩ để tạo "album" tự động.
 */
export function useOfflineAlbums(tracks: Track[]): OfflineAlbum[] {
  return useMemo(() => {
    const map = new Map<string, Track[]>()

    for (const track of tracks) {
      const key = track.artist || 'Khuyết danh'
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(track)
    }

    return Array.from(map.entries()).map(([artist, artistTracks]) => ({
      id: artist,
      artist,
      coverUrl: artistTracks[0].coverUrl,
      trackCount: artistTracks.length,
      tracks: artistTracks,
    }))
  }, [tracks])
}
