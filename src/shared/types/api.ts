/**
 * @file api.ts
 * @description Kiểu dữ liệu chuẩn cho response API — khớp với format backend.
 * Mọi response từ server đều bọc trong ApiResponse<T>.
 * @module shared/types
 */

// ─── Response chuẩn ──────────────────────────────────────────────────────────

/**
 * Wrapper chuẩn cho mọi response API từ backend.
 *
 * @template T - Kiểu dữ liệu trả về trong data
 *
 * @example
 * // Single item
 * ApiResponse<Track>
 *
 * // List
 * ApiResponse<Track[]>
 *
 * // Paginated — dùng PaginatedApiResponse thay thế
 * ApiResponse<PaginatedData<Track>>
 */
export interface ApiResponse<T = unknown> {
  /** true = thành công, false = lỗi */
  status: boolean;
  /** HTTP-like status code (200, 400, 401, 404, v.v.) */
  code: number;
  /** Dữ liệu trả về — undefined khi lỗi */
  data?: T;
  /** Thông báo từ server */
  message?: string;
  /** Chi tiết lỗi validation — mảng field errors */
  errors?: unknown;
  /** Thời điểm server xử lý request (ISO 8601) */
  timestamp?: string;
}

// ─── Phân trang ───────────────────────────────────────────────────────────────

/**
 * Metadata phân trang — nằm bên trong ApiResponse.data.
 */
export interface PaginationMeta {
  /** Tổng số item */
  total: number;
  /** Trang hiện tại (bắt đầu từ 1) */
  page: number;
  /** Số item mỗi trang */
  pageSize: number;
  /** Tổng số trang */
  totalPages: number;
  /** Còn trang tiếp theo? */
  hasNextPage: boolean;
  /** Có trang trước? */
  hasPreviousPage: boolean;
}

/**
 * Dữ liệu phân trang — nằm trong ApiResponse.data khi list có phân trang.
 *
 * @template T - Kiểu item trong danh sách
 */
export interface PaginatedData<T> {
  /** Danh sách item trong trang hiện tại */
  data: T[];
  /** Metadata phân trang */
  meta: PaginationMeta;
}

/**
 * Shortcut: ApiResponse bọc danh sách phân trang.
 *
 * @template T - Kiểu item trong danh sách
 *
 * @example
 * const response = await apiClient.get<PaginatedApiResponse<Track>>('/tracks?page=1');
 * const { data: tracks, meta } = response.data!;
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

// ─── Lỗi ─────────────────────────────────────────────────────────────────────

/**
 * Kiểu lỗi chuẩn hoá từ Axios interceptor — xem apiClient.ts.
 */
export interface AppError {
  /** Thông báo lỗi thân thiện */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Mã lỗi nội bộ từ backend */
  code?: string;
}
