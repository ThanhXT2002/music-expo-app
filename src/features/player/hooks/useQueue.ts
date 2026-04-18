/**
 * @file useQueue.ts
 * @description Hook quản lý hàng đợi phát nhạc.
 * @module features/player/hooks
 */

import { createLogger } from '@core/logger';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '@shared/types/track';

const logger = createLogger('use-queue');

/**
 * Hook cung cấp các thao tác trên queue phát nhạc.
 *
 * @returns Danh sách queue và các hàm thao tác
 */
export function useQueue() {
  const { queue, addToQueue, clearQueue, setQueue } = usePlayerStore();

  const removeFromQueue = (trackId: string) => {
    logger.info('Xoá bài khỏi queue', { trackId });
    const filtered = queue.filter((t) => t.id !== trackId);
    setQueue(filtered);
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    logger.debug('Sắp xếp lại queue', { fromIndex, toIndex });
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);
    setQueue(newQueue);
  };

  return {
    /** Danh sách queue hiện tại */
    queue,
    /** Thêm bài vào cuối queue */
    addToQueue: (track: Track) => addToQueue(track),
    /** Xoá bài khỏi queue */
    removeFromQueue,
    /** Xoá toàn bộ queue */
    clearQueue,
    /** Sắp xếp lại vị trí trong queue */
    reorder,
    /** Số bài trong queue */
    queueLength: queue.length,
  };
}
