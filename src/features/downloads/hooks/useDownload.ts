/**
 * @file useDownload.ts
 * @description Hook quản lý tải bài hát offline.
 * @module features/downloads/hooks
 */

import { useState, useCallback } from 'react';
import { createLogger } from '@core/logger';
import { downloadTrackForOffline, removeOfflineTrack } from '../services/downloadService';
import type { DownloadStatus } from '../types';

const logger = createLogger('use-download');

/**
 * Hook quản lý tải một bài hát offline.
 *
 * @param trackId - ID bài hát
 * @returns Trạng thái tải và hàm điều khiển
 */
export function useDownload(trackId: string) {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);

  const download = useCallback(async () => {
    logger.info('Bắt đầu tải', { trackId });
    setStatus('downloading');
    setProgress(0);

    try {
      await downloadTrackForOffline(trackId, (p) => setProgress(p));
      setStatus('completed');
      setProgress(1);
      logger.info('Tải thành công', { trackId });
    } catch (error) {
      setStatus('error');
      logger.error('Tải thất bại', { trackId, error });
    }
  }, [trackId]);

  const remove = useCallback(async () => {
    logger.info('Xoá file offline', { trackId });
    await removeOfflineTrack(trackId);
    setStatus('idle');
    setProgress(0);
  }, [trackId]);

  return { status, progress, download, remove };
}
