/**
 * @file database.ts
 * @description Local SQLite database methods for offline downloaded songs.
 */
import * as SQLite from 'expo-sqlite';

export interface LocalSong {
  id: string; // YouTube ID or similar
  title: string;
  artist: string;
  thumbnailUrl: string;
  localAudioUri: string;
  duration: number;
}

// Mở database async từ Expo SQLite (với Expo SQLite Next gen nó là openDatabaseSync nhưng ở đây dùng openDatabaseAsync mới nhất trong version được cài đặt)
// Thường expo-sqlite v13+ sẽ dùng hàm openDatabaseSync / Async
// Hãy cài đặt bảng khi khởi tạo app
const getDb = async () => {
  return await SQLite.openDatabaseAsync('musicPlayer.db');
};

export const initDb = async () => {
  try {
    const db = await getDb();
    // Tạo bảng songs lưu local info
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS offline_songs (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        artist TEXT,
        thumbnailUrl TEXT,
        localAudioUri TEXT NOT NULL,
        duration INTEGER DEFAULT 0
      );
    `);
    console.log('DB initialized');
  } catch (error) {
    console.error('Error initDb', error);
  }
};

export const saveOfflineSong = async (song: LocalSong) => {
  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO offline_songs (id, title, artist, thumbnailUrl, localAudioUri, duration) VALUES (?, ?, ?, ?, ?, ?)`,
      [song.id, song.title, song.artist, song.thumbnailUrl, song.localAudioUri, song.duration]
    );
  } catch (error) {
    console.error('Error saving song to DB:', error);
  }
};

export const getOfflineSongs = async (): Promise<LocalSong[]> => {
  try {
    const db = await getDb();
    const result = await db.getAllAsync<LocalSong>('SELECT * FROM offline_songs');
    return result;
  } catch (error) {
    console.error('Error fetching offline songs', error);
    return [];
  }
};

export const deleteOfflineSong = async (id: string) => {
  try {
    const db = await getDb();
    await db.runAsync('DELETE FROM offline_songs WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting offline song', error);
  }
};
