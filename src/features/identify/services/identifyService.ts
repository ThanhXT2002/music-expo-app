/**
 * @file identifyService.ts
 * @description Service nhận diện bài hát từ file audio (Shazam-like).
 * Upload file lên server, server gọi ACRCloud/Shazam API để nhận diện.
 * @module features/identify/services
 */

import { apiClient } from '@core/api/apiClient'
import * as DocumentPicker from 'expo-document-picker'
import { createLogger } from '@core/logger'
import type { ApiResponse } from '@shared/types/api'

const logger = createLogger('identify-service')

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── File Picker ─────────────────────────────────────────────────────────────

/**
 * Mở DocumentPicker để chọn file audio từ thiết bị.
 *
 * @returns File asset hoặc null nếu user cancel
 */
export async function pickAudioFile() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
      copyToCacheDirectory: true,
      multiple: false
    })

    if (result.canceled) {
      logger.debug('User đã hủy chọn file')
      return null
    }

    const file = result.assets[0]
    logger.info('File đã chọn', {
      name: file.name,
      size: file.size,
      mimeType: file.mimeType
    })

    return file
  } catch (error) {
    logger.error('Lỗi khi chọn file', error)
    throw new Error('Không thể chọn file audio')
  }
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Upload file audio lên server để nhận diện bài hát.
 *
 * @param fileUri - URI của file audio (từ DocumentPicker)
 * @param fileName - Tên file
 * @param mimeType - MIME type của file (audio/mpeg, audio/mp4, etc.)
 * @returns Thông tin bài hát đã nhận diện
 * @throws Error nếu không nhận diện được hoặc lỗi network
 */
export async function identifySongByFile(
  fileUri: string,
  fileName: string,
  mimeType?: string
): Promise<IdentifySongResponse> {
  try {
    logger.info('Bắt đầu nhận diện bài hát', { fileName })

    // Tạo FormData để upload file
    const formData = new FormData()

    // Append file với format phù hợp React Native
    formData.append('file', {
      uri: fileUri,
      type: mimeType || 'audio/mpeg',
      name: fileName
    } as any)

    // Gọi API với timeout dài hơn (30s) vì file có thể lớn
    const response = await apiClient.post<ApiResponse<IdentifySongResponse>>(
      '/songs/identify',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds
      }
    )

    const result = response.data.data
    if (!result) {
      throw new Error('Server không trả về dữ liệu')
    }

    logger.info('Nhận diện thành công', {
      title: result.title,
      artist: result.artist,
      confidence: result.confidence
    })

    return result
  } catch (error: any) {
    logger.error('Nhận diện thất bại', error)

    // Parse error message từ server
    const message = error?.response?.data?.message
      || error?.message
      || 'Không thể nhận diện bài hát'

    throw new Error(message)
  }
}
