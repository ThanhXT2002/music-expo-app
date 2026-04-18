/**
 * @file useLyrics.ts
 * @description Hook tải lyrics bài hát.
 * @module features/player/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { createLogger } from '@core/logger';
import { getLyrics } from '../services/playerService';

const logger = createLogger('use-lyrics');

/**
 * Hook tải lyrics của bài hát.
 *
 * @param trackId - ID bài hát
 * @returns Lyrics và trạng thái loading
 */
export function useLyrics(trackId?: string) {
  const query = useQuery({
    queryKey: ['lyrics', trackId],
    queryFn: async () => {
      if (!trackId) return null;
      logger.info('Tải lyrics', { trackId });
      return getLyrics(trackId);
    },
    enabled: !!trackId,
  });

  return {
    /** Nội dung lyrics */
    lyrics: query.data ?? null,
    /** Đang tải lyrics */
    isLoading: query.isLoading,
    /** true nếu bài hát có lyrics */
    hasLyrics: !!query.data,
  };
}
