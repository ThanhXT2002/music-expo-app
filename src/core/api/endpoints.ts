/**
 * @file endpoints.ts
 * @description Danh sách các API endpoint dùng trong toàn dự án.
 * Tập trung tại một file để dễ bảo trì và tránh hardcode rải rác.
 * @module core/api
 */

/**
 * Enum chứa tất cả các endpoint API của hệ thống.
 * Sử dụng hàm helper cho dynamic routes có tham số.
 */
export const API_ENDPOINTS = {
  // --- Auth ---
  /** Đăng nhập hoặc đăng ký bằng Google token */
  AUTH_GOOGLE: '/auth/google',
  /** Làm mới token (nếu backend có hỗ trợ) */
  AUTH_REFRESH: '/auth/refresh',
  /** Đăng xuất (thường client tự xoá token, nhưng có thể gọi BE nếu cần) */
  AUTH_LOGOUT: '/auth/logout',

  // --- Core Songs Processing (YouTube & Local Database) ---
  /** Lấy danh sách các bài hát đã tải hoàn tất. Params: ?limit=50&key=keyword */
  SONGS_COMPLETED: '/songs/completed',
  /** Lấy thông tin bài hát từ YouTube URL / Start Background Job */
  SONG_INFO: '/songs/info',
  /** Kiểm tra trạng thái xử lý/tải xuống của bài hát trên mảng queue Server */
  SONG_STATUS: (id: string) => `/songs/status/${id}`,
  /** Bắt đầu down file audio thật về máy client (yêu cầu BE đã completed) */
  SONG_DOWNLOAD: (id: string) => `/songs/download/${id}`,
  /** Stream download realtime thông qua proxy (có process tracking) */
  SONG_PROXY_DOWNLOAD: (id: string) => `/songs/proxy-download/${id}`,
  /** Lấy thumbnail của bài hát */
  SONG_THUMBNAIL: (id: string) => `/songs/thumbnail/${id}`,
  /** Nhận dạng bài hát bằng âm thanh (audio file) */
  SONG_IDENTIFY: '/songs/identify',

  // --- YouTube Music API wrapper ---
  /** Tìm kiếm trên YT Music. Params: ?query=keyword */
  YTM_SEARCH: '/search',
  /** Lấy danh sách search suggestions. Params: ?query=keyword */
  YTM_SEARCH_SUGGESTIONS: '/search-suggestions',
  /** Thông tin một bài hát từ YT Music */
  YTM_SONG_DETAIL: (id: string) => `/song/${id}`,
  /** Top songs theo khu vực / type */
  YTM_TOP_SONGS: '/top-songs',
  /** Get lyrics bài hát */
  YTM_SONG_LYRICS: (id: string) => `/song/${id}/lyrics`,
  /** Lấy URL Stream trực tiếp (nếu có hỗ trợ qua API Youtube) */
  YTM_STREAM: (id: string) => `/stream/${id}`,
  
  // --- Album / Playlist / Artist (YT Music) ---
  /** Thông tin album */
  YTM_ALBUM: (id: string) => `/album/${id}`,
  /** Thông tin playlist */
  YTM_PLAYLIST: (id: string) => `/playlist/${id}`,
  /** Lấy thông tin playlist (watch) có kèm danh sách bài */
  YTM_PLAYLIST_WITH_SONG: (id: string) => `/playlist-with-song/${id}`,
  /** Thông tin nghệ sĩ */
  YTM_ARTIST: (id: string) => `/artist/${id}`,
  /** Danh sách liên quan (related / up next) */
  YTM_RELATED: (id: string) => `/related/${id}`,

  // --- User / Local Custom Playlists (Giả định tuơng lai) ---
  USER_PROFILE: '/user/profile',
  PLAYLISTS: '/playlists',
  PLAYLIST_DETAIL: (id: string) => `/playlists/${id}`,
  PLAYLIST_TRACKS: (id: string) => `/playlists/${id}/tracks`,
} as const;
