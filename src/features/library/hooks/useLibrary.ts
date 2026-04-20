/**
 * @file useLibrary.ts
 * @description Hook tải dữ liệu thư viện nhạc của người dùng.
 * @module features/library/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOfflineSongs } from '@core/data/database';
import { hardDeleteLocalSong } from '@features/downloads/services/downloadService';
import { createLogger } from '@core/logger';
import type { Track } from '@shared/types/track';

const logger = createLogger('use-library');

/**
 * Hook tải danh sách bài hát trong thư viện.
 *
 * @returns Dữ liệu thư viện và trạng thái loading
 */
export function useLibrary() {
  const queryClient = useQueryClient();

  const query = useQuery<Track[]>({
    queryKey: ['library', 'tracks'],
    queryFn: async (): Promise<Track[]> => {
      logger.info('Tải danh sách bài hát offline (Library)');
      const offlineSongs = await getOfflineSongs();
      return offlineSongs.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist ?? 'Khuyết danh',
        artistId: '',
        coverUrl: song.thumbnailUrl,
        streamUrl: song.localAudioUri,
        durationSeconds: song.duration,
        isDownloaded: true,
      }));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (trackId: string) => hardDeleteLocalSong(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'tracks'] });
    },
  });

  return {
    tracks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    removeTrack: removeMutation.mutateAsync,
  };
}
