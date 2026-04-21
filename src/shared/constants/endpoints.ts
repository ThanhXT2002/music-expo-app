/**
 * @file endpoints.ts
 * @description Các hằng số endpoint dùng cho shared layer.
 * Re-export từ core/api/endpoints để tiện import.
 * @module shared/constants
 */

export { API_ENDPOINTS } from '@core/api/endpoints'

/** Base URL của API — đọc từ env */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api'

/** Timeout mặc định cho API request (ms) */
export const API_TIMEOUT = 15000
