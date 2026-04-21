# 🎵 music-expo-app — Cấu Trúc Thư Mục Chuẩn

> Stack: **Expo SDK 52+ · Expo Router v4 · NativeWind/Tailwind CSS v4 · Vertical Slice Architecture**

---

## 📐 Nguyên tắc tổ chức

| Nguyên tắc                       | Mô tả                                                       |
| -------------------------------- | ----------------------------------------------------------- |
| **`app/`** chỉ chứa routes       | Không đặt component hay logic ở đây                         |
| **`src/features/`** là trung tâm | Mỗi feature tự chứa screen + hook + store + service         |
| **`src/shared/`** dùng chung     | Chỉ đặt thứ gì dùng được ở ≥ 2 features                     |
| **`src/core/`** là hạ tầng       | Audio engine, API client, storage — không phụ thuộc feature |

---

## 🗂 Cấu Trúc Đầy Đủ

```
music-expo-app/
│
├── app/                              # Expo Router — CHỈ đặt file route
│   ├── _layout.tsx                   # Root layout, providers, font loading
│   ├── +not-found.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab navigator
│   │   ├── index.tsx                 # → Home
│   │   ├── library.tsx               # → Library
│   │   ├── search.tsx                # → Search
│   │   └── profile.tsx               # → Profile
│   ├── player/
│   │   └── [id].tsx                  # Full-screen player (dynamic route)
│   ├── playlist/
│   │   ├── [id].tsx                  # Playlist detail
│   │   └── create.tsx                # Create playlist
│   └── auth/
│       ├── login.tsx
│       └── register.tsx
│
├── src/
│   │
│   ├── features/                     # 🔑 Vertical Slice — mỗi feature độc lập
│   │   │
│   │   ├── player/                   # ▶ Trình phát nhạc
│   │   │   ├── components/
│   │   │   │   ├── PlayerScreen.tsx
│   │   │   │   ├── MiniPlayer.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── PlayerControls.tsx
│   │   │   │   └── LyricsView.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── usePlayer.ts      # Main player hook
│   │   │   │   ├── useQueue.ts
│   │   │   │   └── useLyrics.ts
│   │   │   ├── store/
│   │   │   │   └── playerStore.ts    # Zustand store
│   │   │   ├── services/
│   │   │   │   └── playerService.ts  # Giao tiếp với audio engine
│   │   │   └── types.ts
│   │   │
│   │   ├── library/                  # 📚 Thư viện nhạc
│   │   │   ├── components/
│   │   │   │   ├── LibraryScreen.tsx
│   │   │   │   ├── TrackList.tsx
│   │   │   │   └── AlbumGrid.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useLibrary.ts
│   │   │   ├── store/
│   │   │   │   └── libraryStore.ts
│   │   │   ├── services/
│   │   │   │   └── libraryService.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── search/                   # 🔍 Tìm kiếm
│   │   │   ├── components/
│   │   │   │   ├── SearchScreen.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSearch.ts      # Debounce, query state
│   │   │   ├── services/
│   │   │   │   └── searchService.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── playlist/                 # 🎶 Playlist
│   │   │   ├── components/
│   │   │   │   ├── PlaylistScreen.tsx
│   │   │   │   ├── PlaylistCard.tsx
│   │   │   │   └── CreatePlaylistModal.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePlaylist.ts
│   │   │   ├── store/
│   │   │   │   └── playlistStore.ts
│   │   │   ├── services/
│   │   │   │   └── playlistService.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── downloads/                # ⬇ Tải nhạc offline
│   │   │   ├── components/
│   │   │   │   ├── DownloadButton.tsx
│   │   │   │   └── DownloadManager.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDownload.ts
│   │   │   ├── services/
│   │   │   │   └── downloadService.ts  # expo-file-system
│   │   │   └── types.ts
│   │   │
│   │   ├── auth/                     # 🔐 Xác thực
│   │   │   ├── components/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── RegisterScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   └── types.ts
│   │   │
│   │   └── home/                     # 🏠 Trang chủ
│   │       ├── components/
│   │       │   ├── HomeScreen.tsx
│   │       │   ├── FeaturedBanner.tsx
│   │       │   ├── RecentlyPlayed.tsx
│   │       │   └── RecommendedSection.tsx
│   │       ├── hooks/
│   │       │   └── useHome.ts
│   │       └── types.ts
│   │
│   ├── shared/                       # 🔧 Dùng chung (≥ 2 features mới đặt ở đây)
│   │   ├── components/
│   │   │   ├── ui/                   # Atomic components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── BottomSheet.tsx
│   │   │   ├── TrackCard.tsx         # Dùng ở home + library + search
│   │   │   ├── ArtistCard.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useTheme.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── usePermission.ts      # Microphone/notification
│   │   ├── utils/
│   │   │   ├── formatDuration.ts     # 3:45 → "3 phút 45 giây"
│   │   │   ├── formatFileSize.ts
│   │   │   └── logger.ts
│   │   ├── types/
│   │   │   ├── track.ts              # Track, Album, Artist interfaces
│   │   │   ├── user.ts
│   │   │   └── api.ts                # ApiResponse<T>, PaginatedResponse<T>
│   │   └── constants/
│   │       ├── colors.ts
│   │       ├── spacing.ts
│   │       └── endpoints.ts
│   │
│   └── core/                         # ⚙ Hạ tầng kỹ thuật
│       ├── audio/                    # 🔊 Audio Engine (quan trọng nhất)
│       │   ├── AudioManager.ts       # Singleton — expo-av / react-native-track-player
│       │   ├── AudioQueue.ts         # Queue management
│       │   ├── BackgroundAudio.ts    # Background playback, lock screen controls
│       │   └── types.ts
│       ├── api/
│       │   ├── apiClient.ts          # Axios/fetch wrapper, interceptors
│       │   ├── endpoints.ts
│       │   └── queryClient.ts        # TanStack Query config
│       ├── storage/
│       │   ├── secureStorage.ts      # expo-secure-store (token)
│       │   ├── asyncStorage.ts       # Preferences, cache
│       │   └── fileStorage.ts        # expo-file-system (offline tracks)
│       └── notifications/
│           └── notificationService.ts  # expo-notifications
│
├── assets/
│   ├── images/
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── adaptive-icon.png
│   └── fonts/                        # Custom fonts
│
└── node_modules/
```

---

## 📦 Dependencies chính cần cài

```bash
# Audio
npx expo install expo-av
# hoặc mạnh hơn:
npm install react-native-track-player

# State
npm install zustand

# Data fetching
npm install @tanstack/react-query

# Storage
npx expo install expo-secure-store expo-file-system

# Notifications (media controls)
npx expo install expo-notifications
```

---

## 🧩 Quy ước đặt tên file

| Loại             | Quy ước               | Ví dụ                |
| ---------------- | --------------------- | -------------------- |
| Screen component | `PascalCase + Screen` | `PlayerScreen.tsx`   |
| Hook             | `camelCase + use`     | `usePlayer.ts`       |
| Store (Zustand)  | `camelCase + Store`   | `playerStore.ts`     |
| Service          | `camelCase + Service` | `playerService.ts`   |
| Types            | `types.ts`            | mỗi feature có riêng |
| Shared UI        | `PascalCase`          | `TrackCard.tsx`      |

---

## 🚦 Luồng dữ liệu trong mỗi feature

```
Route (app/)
  └── Screen Component (features/.../components/)
        └── Hook (features/.../hooks/)           ← UI state + business logic
              ├── Store (features/.../store/)    ← Global state (Zustand)
              └── Service (features/.../services/) ← API / Audio / Storage
                    └── Core (src/core/)          ← ApiClient, AudioManager
```

---

## ⚠ Quy tắc quan trọng

1. **`app/` chỉ có 1 việc** — import screen từ `features/` và render
2. **Features không import lẫn nhau** — nếu cần share thì đưa vào `shared/`
3. **`core/` không biết features tồn tại** — dependency chỉ đi 1 chiều: feature → core
4. **Audio Engine là singleton** — toàn app chỉ có 1 instance `AudioManager`
5. **Background audio cần config riêng** — `app.json` + `BackgroundAudio.ts`
