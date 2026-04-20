/**
 * @file database.ts
 * @description Module SQLite trung tâm — Singleton connection + Migration system.
 *
 * Kiến trúc:
 * - 1 file duy nhất quản lý kết nối database cho toàn app
 * - Hệ thống migration tự động chạy CREATE TABLE khi cần
 * - Các feature khác import `getDb()` để truy vấn
 * - Các repository helper (saveOfflineSong, getOfflineSongs...) export sẵn
 *
 * Cách thêm bảng mới:
 * 1. Thêm `CREATE TABLE IF NOT EXISTS ...` vào mảng `MIGRATIONS`
 * 2. Export interface + helper functions tương ứng
 *
 * @module core/data
 */
import * as SQLite from 'expo-sqlite';
import { createLogger } from '@core/logger';

const logger = createLogger('database');

// ─── Config ──────────────────────────────────────────────────────────────────

/** Tên file database duy nhất */
const DB_NAME = 'musicPlayer.db';

// ─── Migrations ──────────────────────────────────────────────────────────────

/**
 * Danh sách migration SQL — chạy tuần tự khi khởi tạo database.
 * Mỗi lệnh dùng `IF NOT EXISTS` nên an toàn chạy lại nhiều lần.
 * Thêm bảng mới? Chỉ cần append vào cuối mảng này.
 */
const MIGRATIONS: string[] = [
  // ── Bảng 1: Bài hát offline ──
  `CREATE TABLE IF NOT EXISTS offline_songs (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    artist TEXT,
    thumbnailUrl TEXT,
    localAudioUri TEXT NOT NULL,
    duration INTEGER DEFAULT 0
  )`,

  // ── Bảng 2: Lịch sử tìm kiếm ──
  `CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    type TEXT DEFAULT 'keyword',
    createdAt TEXT DEFAULT (datetime('now'))
  )`,

  // ── Bảng 3: Lịch sử nghe nhạc ──
  `CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trackId TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    thumbnailUrl TEXT,
    playedAt TEXT DEFAULT (datetime('now'))
  )`,
];

// ─── Singleton Connection ────────────────────────────────────────────────────

/** Promise duy nhất giữ kết nối database đã khởi tạo */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Lấy database instance (singleton).
 * Lần đầu gọi sẽ mở connection + chạy toàn bộ migrations.
 * Các lần sau trả về connection đã cache.
 *
 * @returns SQLiteDatabase instance
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);

        // Bật WAL mode cho performance tốt hơn
        await db.execAsync('PRAGMA journal_mode = WAL');

        // Chạy từng migration tuần tự
        for (const sql of MIGRATIONS) {
          await db.execAsync(sql);
        }

        logger.info('Database khởi tạo thành công', {
          tables: MIGRATIONS.length,
        });
        return db;
      } catch (error) {
        // Reset để lần gọi sau thử lại
        dbPromise = null;
        logger.error('Database khởi tạo thất bại', error);
        throw error;
      }
    })();
  }
  return dbPromise;
}

/**
 * Khởi tạo database — gọi từ bootstrap để warm up sớm.
 * An toàn gọi nhiều lần (singleton).
 */
export async function initDb(): Promise<void> {
  await getDb();
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** Bài hát offline đã tải về thiết bị */
export interface LocalSong {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  localAudioUri: string;
  duration: number;
}

/** Mục lịch sử tìm kiếm */
export interface SearchHistoryItem {
  id: number;
  query: string;
  type: 'keyword' | 'url';
  createdAt: string;
}

/** Mục lịch sử nghe nhạc */
export interface PlayHistoryItem {
  id: number;
  trackId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  playedAt: string;
}

// ─── Repository: Offline Songs ───────────────────────────────────────────────

/** Lưu / cập nhật bài hát offline */
export async function saveOfflineSong(song: LocalSong): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO offline_songs (id, title, artist, thumbnailUrl, localAudioUri, duration)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [song.id, song.title, song.artist, song.thumbnailUrl, song.localAudioUri, song.duration],
  );
}

/** Lấy toàn bộ bài hát offline */
export async function getOfflineSongs(): Promise<LocalSong[]> {
  const db = await getDb();
  return db.getAllAsync<LocalSong>('SELECT * FROM offline_songs ORDER BY rowid DESC');
}

/** Xoá bài hát offline theo ID */
export async function deleteOfflineSong(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM offline_songs WHERE id = ?', [id]);
}

/** Đếm số bài hát offline */
export async function countOfflineSongs(): Promise<number> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM offline_songs');
  return result?.count ?? 0;
}

// ─── Repository: Search History ──────────────────────────────────────────────

/** Lưu lịch sử tìm kiếm */
export async function saveSearchHistory(query: string, type: 'keyword' | 'url' = 'keyword'): Promise<void> {
  const db = await getDb();
  // Xoá bản ghi cũ trùng query để đẩy lên đầu
  await db.runAsync('DELETE FROM search_history WHERE query = ?', [query]);
  await db.runAsync('INSERT INTO search_history (query, type) VALUES (?, ?)', [query, type]);
}

/** Lấy lịch sử tìm kiếm gần nhất */
export async function getSearchHistory(limit: number = 20): Promise<SearchHistoryItem[]> {
  const db = await getDb();
  return db.getAllAsync<SearchHistoryItem>(
    'SELECT * FROM search_history ORDER BY createdAt DESC LIMIT ?',
    [limit],
  );
}

/** Xoá toàn bộ lịch sử tìm kiếm */
export async function clearSearchHistory(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM search_history');
}

// ─── Repository: Play History ────────────────────────────────────────────────

/** Ghi nhận lượt nghe */
export async function savePlayHistory(track: Omit<PlayHistoryItem, 'id' | 'playedAt'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO play_history (trackId, title, artist, thumbnailUrl) VALUES (?, ?, ?, ?)',
    [track.trackId, track.title, track.artist, track.thumbnailUrl],
  );
}

/** Lấy lịch sử nghe gần nhất */
export async function getPlayHistory(limit: number = 50): Promise<PlayHistoryItem[]> {
  const db = await getDb();
  return db.getAllAsync<PlayHistoryItem>(
    'SELECT * FROM play_history ORDER BY playedAt DESC LIMIT ?',
    [limit],
  );
}

/** Xoá toàn bộ lịch sử nghe */
export async function clearPlayHistory(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM play_history');
}
