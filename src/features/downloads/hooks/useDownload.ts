/**
 * @file useDownload.ts
 * @description Hook quản lý tải một bài hát offline (dùng cho các component riêng lẻ).
 * @module features/downloads/hooks
 */

import { useState, useCallback } from 'react';
import { createLogger } from '@core/logger';
import { downloadAndSave, removeDownloadedSong } from '../services/downloadService';
import type { DownloadStatus, SongInfo } from '../types';

const logger = createLogger('use-download');

/**
 * Hook quản lý tải một bài hát offline.
 *
 * @param songInfo - Metadata bài hát
 * @returns Trạng thái tải và hàm điều khiển
 */
export function useDownload(songInfo: SongInfo) {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);

  const download = useCallback(async () => {
    logger.info('Bắt đầu tải', { trackId: songInfo.id });
    setStatus('downloading');
    setProgress(0);

    try {
      await downloadAndSave(songInfo, (p: number) => setProgress(p));
      setStatus('completed');
      setProgress(1);
      logger.info('Tải thành công', { trackId: songInfo.id });
    } catch (error) {
      setStatus('error');
      logger.error('Tải thất bại', { trackId: songInfo.id, error });
    }
  }, [songInfo]);

  const remove = useCallback(async () => {
    logger.info('Xoá file offline', { trackId: songInfo.id });
    await removeDownloadedSong(songInfo.id);
    setStatus('idle');
    setProgress(0);
  }, [songInfo]);

  return { status, progress, download, remove };
}
