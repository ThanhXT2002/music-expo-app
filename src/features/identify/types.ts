/**
 * @file types.ts
 * @description Type definitions cho feature nhận diện bài hát.
 * @module features/identify
 */

/**
 * Response từ API nhận diện bài hát
 */
export interface IdentifySongResponse {
  /** ID bài hát (YouTube video ID hoặc song ID) */
  id: string
  /** Tên bài hát */
  title: string
  /** Nghệ sĩ */
  artist: string
  /** Album (optional) */
  album?: string
  /** URL ảnh bìa */
  thumbnailUrl: string
  /** Thời lượng (giây) */
  duration: number
  /** Độ chính xác (0-1) */
  confidence: number
}

/**
 * Trạng thái nhận diện
 */
export type IdentifyStatus = 'idle' | 'picking' | 'uploading' | 'identifying' | 'success' | 'error'
