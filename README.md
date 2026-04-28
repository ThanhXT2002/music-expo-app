# 🎵 XTMusic — Mobile App

> Ứng dụng nghe nhạc Offline-First với giao diện **Mood Beat** (Dark Neon Purple).
>
> Stack: **Expo SDK 54 · React Native 0.81 · Expo Router v6 · NativeWind v4 · Zustand · TanStack Query**

---

## 📐 Nguyên tắc tổ chức

| Nguyên tắc                        | Mô tả                                                        |
| --------------------------------- | ------------------------------------------------------------ |
| **`app/`** chỉ chứa routes        | Thin wrapper — import screen từ `features/` và render         |
| **`src/features/`** là trung tâm  | Mỗi feature tự chứa components + hooks + store + services     |
| **`src/shared/`** dùng chung      | Chỉ đặt thứ gì dùng được ở ≥ 2 features                      |
| **`src/core/`** là hạ tầng        | Audio engine, API client, storage — không phụ thuộc feature    |

---

## 🗂 Cấu Trúc Thư Mục Thực Tế

```
music-expo-app/
│
├── app/                                  # Expo Router — CHỈ đặt file route
│   ├── _layout.tsx                       # Root layout (providers, auth guard, onboarding guard)
│   ├── +not-found.tsx                    # Trang 404
│   ├── global.css                        # Tailwind entry
│   ├── onboarding.tsx                    # Màn hình onboarding lần đầu
│   │
│   ├── (tabs)/                           # ── 5 Tab chính ──
│   │   ├── _layout.tsx                   # PillTabBar tùy chỉnh (Liquid Glass + Haptic)
│   │   ├── index.tsx                     # → HomeScreen         (thin wrapper)
│   │   ├── list.tsx                      # → SearchScreen       (thin wrapper)
│   │   ├── library.tsx                   # → LibraryScreen      (thin wrapper)
│   │   ├── downloads.tsx                 # Tab Tải xuống        (inline)
│   │   └── settings.tsx                  # Tab Cài đặt          (inline)
│   │
│   ├── player/[id].tsx                   # Full-screen player (modal, slide_from_bottom)
│   ├── song/[id].tsx                     # Chi tiết bài hát
│   ├── album/[id].tsx                    # Chi tiết album
│   ├── artist/[id].tsx                   # Chi tiết nghệ sĩ
│   ├── playlist/[id].tsx                 # Chi tiết playlist
│   ├── playlists.tsx                     # Danh sách playlist
│   ├── search.tsx                        # Trang tìm kiếm (ngoài tab)
│   ├── song-identify.tsx                 # Nhận diện bài hát (modal)
│   ├── find-song-with-file.tsx           # Tìm bài hát qua file
│   ├── yt-player.tsx                     # YouTube Player
│   ├── profile.tsx                       # Trang hồ sơ
│   ├── privacy-policy.tsx                # Chính sách bảo mật
│   ├── terms-of-service.tsx              # Điều khoản sử dụng
│   │
│   ├── auth/                             # ── Xác thực ──
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── verify-email.tsx
│   │   ├── privacy-policy.tsx
│   │   └── terms-of-service.tsx
│   │
│   ├── settings/                         # ── Cài đặt chi tiết ──
│   │   ├── profile.tsx
│   │   ├── privacy-settings.tsx
│   │   ├── theme.tsx
│   │   ├── help.tsx
│   │   └── app-info.tsx
│   │
│   └── edit-playlist/                    # Chỉnh sửa playlist
│
├── src/
│   ├── features/                         # 🔑 Vertical Slice — 8 features độc lập
│   │   │
│   │   ├── home/                         # 🏠 Trang chủ
│   │   │   ├── components/
│   │   │   │   ├── HomeScreen.tsx
│   │   │   │   ├── AlbumDetailScreen.tsx
│   │   │   │   ├── ArtistDetailScreen.tsx
│   │   │   │   ├── SongDetailScreen.tsx
│   │   │   │   ├── FeaturedBanner.tsx
│   │   │   │   ├── MusicBannerCarousel.tsx
│   │   │   │   ├── RecentlyPlayed.tsx
│   │   │   │   └── RecommendedSection.tsx
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   │
│   │   ├── search/                       # 🔍 Tìm kiếm
│   │   │   ├── components/
│   │   │   │   ├── SearchScreen.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   │
│   │   ├── library/                      # 📚 Thư viện nhạc
│   │   │   ├── components/
│   │   │   │   ├── LibraryScreen.tsx
│   │   │   │   ├── TrackList.tsx
│   │   │   │   └── AlbumGrid.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   │
│   │   ├── player/                       # ▶ Trình phát nhạc
│   │   │   ├── components/
│   │   │   │   ├── PlayerScreen.tsx
│   │   │   │   ├── MiniPlayer.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── ProgressBarMini.tsx
│   │   │   │   ├── PlayerControls.tsx
│   │   │   │   ├── LyricsView.tsx
│   │   │   │   ├── CurrentPlaylistSheet.tsx
│   │   │   │   ├── DraggableTrackItem.tsx
│   │   │   │   └── PlaylistHeader.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   │   └── playerStore.ts        # Zustand — global player state
│   │   │   └── types.ts
│   │   │
│   │   ├── playlist/                     # 🎶 Playlist
│   │   │   ├── components/
│   │   │   │   ├── PlaylistScreen.tsx
│   │   │   │   ├── PlaylistCard.tsx
│   │   │   │   ├── AddToPlaylistModal.tsx
│   │   │   │   └── CreatePlaylistModal.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   │
│   │   ├── downloads/                    # ⬇ Tải nhạc offline
│   │   │   ├── components/
│   │   │   │   ├── DownloadButton.tsx
│   │   │   │   └── DownloadManager.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   │
│   │   ├── auth/                         # 🔐 Xác thực (Firebase)
│   │   │   ├── components/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   │   ├── VerifyEmailScreen.tsx
│   │   │   │   └── SocialAuthButtons.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   │   └── authStore.ts          # Zustand — auth state
│   │   │   └── types.ts
│   │   │
│   │   └── settings/                     # ⚙ Cài đặt
│   │       └── components/
│   │           ├── ProfileScreen.tsx
│   │           ├── PrivacySettingsScreen.tsx
│   │           ├── ThemeSettingsScreen.tsx
│   │           ├── HelpSupportScreen.tsx
│   │           └── AppInfoScreen.tsx
│   │
│   ├── shared/                           # 🔧 Dùng chung (≥ 2 features)
│   │   ├── components/
│   │   │   ├── ui/                       # Atomic components
│   │   │   │   ├── AppLogo.tsx
│   │   │   │   ├── AuthBackground.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── BottomSheet.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   ├── screens/                  # Shared screens
│   │   │   │   ├── PrivacyPolicyScreen.tsx
│   │   │   │   └── TermsOfServiceScreen.tsx
│   │   │   ├── icons/
│   │   │   │   └── SocialIcons.tsx
│   │   │   ├── TrackCard.tsx
│   │   │   ├── TrackListItem.tsx         # Pill-shaped glass component (dùng nhiều nơi)
│   │   │   ├── ArtistCard.tsx
│   │   │   ├── HorizontalCardList.tsx
│   │   │   ├── MediaActionButtons.tsx
│   │   │   ├── PlayButton.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassView.tsx
│   │   │   ├── GradientBackground.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── usePermission.ts
│   │   │   └── useTrackActions.ts
│   │   ├── utils/
│   │   │   ├── formatDuration.ts
│   │   │   ├── formatFileSize.ts
│   │   │   └── trackMapper.ts
│   │   ├── types/
│   │   │   ├── track.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   ├── constants/
│   │   │   ├── colors.ts                 # Bảng màu Mood Beat (#B026FF, #080316...)
│   │   │   ├── spacing.ts               # SPACING, RADIUS, FONT_SIZE, SHADOWS, LAYOUT
│   │   │   └── endpoints.ts
│   │   └── config/
│   │       └── firebase.ts               # Firebase Web SDK config
│   │
│   └── core/                             # ⚙ Hạ tầng kỹ thuật
│       ├── audio/                        # 🔊 Audio Engine
│       │   ├── AudioManager.ts           # Singleton — expo-av + react-native-track-player
│       │   ├── AudioQueue.ts             # Queue/Shuffle/Repeat management
│       │   ├── BackgroundAudio.ts        # Background playback, lock screen controls
│       │   └── types.ts
│       ├── api/
│       │   ├── apiClient.ts              # Axios wrapper + JWT interceptors
│       │   ├── endpoints.ts              # API endpoint definitions
│       │   └── queryClient.ts            # TanStack Query config
│       ├── storage/
│       │   ├── secureStorage.ts          # expo-secure-store (JWT token)
│       │   ├── asyncStorage.ts           # @react-native-async-storage (preferences)
│       │   └── fileStorage.ts            # expo-file-system (offline MP3)
│       ├── data/
│       │   └── database.ts              # expo-sqlite (LocalSong metadata)
│       ├── hooks/
│       │   ├── useBootstrap.ts           # Restore session, init audio, hide splash
│       │   └── useSafePush.ts            # Debounce navigation (chống double-click)
│       ├── notifications/
│       └── logger.ts                     # Logger tập trung (dev only)
│
├── assets/images/                        # Icons, splash, logo
├── patches/                              # patch-package patches
├── android/                              # Native Android project
├── app.json                              # Expo config
├── app.config.ts                         # Dynamic Expo config
├── tsconfig.json                         # Path aliases: @features, @shared, @core
├── tailwind.config.js                    # NativeWind config
├── babel.config.js
├── metro.config.js
└── package.json
```

---

## 🎨 Design System — Mood Beat

### Bảng màu chính

| Token              | Giá trị     | Mô tả                        |
| ------------------ | ----------- | ----------------------------- |
| `background`       | `#080316`   | Deep dark (nền chính)         |
| `surface`          | `#1a142c`   | Surface cards, tab bar        |
| `primary`          | `#B026FF`   | Tím Neon — màu chủ đạo        |
| `primaryLight`     | `#D270FF`   | Hover/Press state             |
| `textPrimary`      | `#EAEAEA`   | Chữ trắng sáng               |
| `textMuted`        | `#9e9e9e`   | Icon inactive, placeholder    |
| `error`            | `#FF415B`   | Destructive actions           |
| `success`          | `#1DB954`   | Spotify green                 |

### Typography & Spacing

- **Font sizes**: `xs(11)` → `4xl(34)` — xem `spacing.ts`
- **Spacing scale**: `xs(4)` → `5xl(48)`
- **Border radius**: `sm(8)` → `full(9999)`
- **Shadows**: `purpleGlow`, `card`, `ambient`

### UI Components chính

| Component          | Mô tả                                                |
| ------------------ | ---------------------------------------------------- |
| `GlassCard`        | Card kính mờ với border rgba                          |
| `GlassView`        | BlurView wrapper                                     |
| `TrackListItem`    | Pill-shaped glass item — dùng ở Home, Library, Downloads |
| `BottomSheet`      | Modal bottom sheet (snap 50% / 95%)                   |
| `PillTabBar`       | Custom tab bar hình viên nhộng với sliding indicator   |

---

## 🗺 Tab Navigation — PillTabBar

| Tab Route    | Icon           | Label      | Screen Component                     |
| ------------ | -------------- | ---------- | ------------------------------------ |
| `index`      | `Home`         | TRANG CHỦ  | `@features/home/HomeScreen`          |
| `list`       | `Search`       | TÌM KIẾM   | `@features/search/SearchScreen`      |
| `library`    | `LibraryBig`   | THƯ VIỆN   | `@features/library/LibraryScreen`    |
| `downloads`  | `DownloadCloud` | TẢI XUỐNG  | Inline `downloads.tsx`               |
| `settings`   | `Settings`     | CÀI ĐẶT   | Inline `settings.tsx`                |

**Đặc điểm:**
- Hiệu ứng **Liquid Glass** (BlurView + rgba overlay)
- **Sliding indicator** animated bằng `Animated.spring`
- **Haptic feedback** khi chuyển tab
- Icon từ thư viện `lucide-react-native`

---

## 🔐 Luồng Auth & Navigation Guard

```
App khởi động
  │
  ├─ useBootstrap(): restore session từ SecureStore, init audio, hide splash
  │
  ├─ Chưa xem Onboarding? ──→ /onboarding
  ├─ Chưa đăng nhập?       ──→ /auth/login
  └─ Đã đăng nhập           ──→ /(tabs)
```

- **Firebase Auth**: Google OAuth, Email/Password, Facebook
- **Token**: JWT lưu trong `expo-secure-store` (mã hóa Keychain/Keystore)
- **Guard**: Xử lý tại `app/_layout.tsx` → `RootContent`

---

## 🔊 Audio Architecture

```
PlayerScreen / MiniPlayer
  └── playerStore (Zustand)        ← UI state: currentTrack, isPlaying, queue
        └── AudioManager (Singleton) ← expo-av + react-native-track-player
              ├── AudioQueue         ← Shuffle, Repeat, Next/Previous
              └── BackgroundAudio    ← Lock screen controls, background playback
```

- **Singleton pattern**: Toàn app chỉ 1 instance `AudioManager`
- **Background playback**: Config trong `app.json` (`UIBackgroundModes`, `WAKE_LOCK`)
- **Offline-first**: Kiểm tra file local (SQLite + FileSystem) trước khi stream online

---

## 💾 Storage Architecture

| Tầng               | Công nghệ           | Dữ liệu                           |
| ------------------- | -------------------- | ---------------------------------- |
| **Secure**          | `expo-secure-store`  | JWT Token, sensitive credentials   |
| **Preferences**     | `AsyncStorage`       | Onboarding flag, theme, settings   |
| **Metadata**        | `expo-sqlite`        | LocalSong records (offline tracks) |
| **Binary Files**    | `expo-file-system`   | MP3/M4A files offline              |

---

## 📦 Tech Stack & Dependencies

### Core

| Package                   | Version  | Vai trò                          |
| ------------------------- | -------- | -------------------------------- |
| `expo`                    | `54.x`   | Platform SDK                     |
| `react-native`            | `0.81.x` | UI Framework                     |
| `expo-router`             | `6.x`    | File-based routing               |
| `zustand`                 | `5.x`    | Global state (player, auth)      |
| `@tanstack/react-query`   | `5.x`    | Server state / data fetching     |
| `axios`                   | `1.x`    | HTTP client                      |

### Audio & Media

| Package                         | Vai trò                    |
| ------------------------------- | -------------------------- |
| `expo-av`                       | Audio playback chính       |
| `react-native-track-player`     | Background audio, controls |
| `expo-image`                    | Optimized image loading    |

### Auth & Security

| Package                                | Vai trò              |
| -------------------------------------- | -------------------- |
| `firebase`                             | Auth SDK (Web)       |
| `@react-native-google-signin/google-signin` | Google OAuth    |
| `react-native-fbsdk-next`              | Facebook Login       |
| `expo-secure-store`                    | Encrypted token      |
| `expo-local-authentication`            | Biometric auth       |

### UI & Animation

| Package                          | Vai trò                     |
| -------------------------------- | --------------------------- |
| `nativewind`                     | Tailwind CSS for RN         |
| `expo-blur`                      | Glass morphism effects      |
| `expo-linear-gradient`           | Gradient backgrounds        |
| `expo-haptics`                   | Haptic feedback             |
| `lucide-react-native`            | Icon library                |
| `react-native-reanimated`        | Smooth animations           |
| `react-native-gesture-handler`   | Gestures (swipe, drag)      |
| `react-native-draggable-flatlist`| Drag-and-drop playlist      |
| `@react-native-community/slider` | Progress bar slider         |

### Storage & Data

| Package              | Vai trò                    |
| -------------------- | -------------------------- |
| `expo-sqlite`        | Local DB (offline metadata)|
| `expo-file-system`   | File download/management   |
| `expo-clipboard`     | Paste YouTube URLs         |

---

## 🚀 Cài đặt & Chạy

### Yêu cầu

- Node.js ≥ 18
- Android Studio (SDK, Emulator) hoặc thiết bị thật
- File `google-services.json` (Firebase) đặt ở root
- File `.env` (copy từ `.env.example`)

### Cài đặt

```bash
# Clone & install
cd music-expo-app
npm install

# Tạo file môi trường
cp .env.example .env
# Sửa các giá trị trong .env cho phù hợp
```

### Chạy Development

```bash
# Android
npm run android
# hoặc
expo run:android

# iOS
npm run ios

# Web
npm run web
```

### Các lệnh khác

```bash
npm run lint          # ESLint check
npm run format        # Prettier format
npm start             # Expo dev server
```

---

## 🔧 Path Aliases (tsconfig.json)

```json
{
  "@/*":        ["./*"],
  "@src/*":     ["./src/*"],
  "@features/*": ["./src/features/*"],
  "@shared/*":  ["./src/shared/*"],
  "@core/*":    ["./src/core/*"]
}
```

---

## 🧩 Quy ước đặt tên file

| Loại              | Quy ước                | Ví dụ                  |
| ----------------- | ---------------------- | ---------------------- |
| Screen component  | `PascalCase + Screen`  | `PlayerScreen.tsx`     |
| Hook              | `camelCase + use`      | `usePlayer.ts`         |
| Store (Zustand)   | `camelCase + Store`    | `playerStore.ts`       |
| Service           | `camelCase + Service`  | `playerService.ts`     |
| Types             | `types.ts`             | Mỗi feature có riêng   |
| Shared UI         | `PascalCase`           | `TrackCard.tsx`        |
| Constants         | `camelCase`            | `colors.ts`            |

---

## 🚦 Luồng dữ liệu trong mỗi feature

```
Route (app/)
  └── Screen Component (features/.../components/)
        └── Hook (features/.../hooks/)            ← UI state + business logic
              ├── Store (features/.../store/)      ← Global state (Zustand)
              └── Service (features/.../services/) ← API / Audio / Storage
                    └── Core (src/core/)           ← ApiClient, AudioManager, Database
```

---

## ⚠ Quy tắc quan trọng

1. **`app/` chỉ có 1 việc** — import screen từ `features/` và render (thin wrapper)
2. **Features không import lẫn nhau** — nếu cần share thì đưa vào `shared/`
3. **`core/` không biết features tồn tại** — dependency chỉ đi 1 chiều: `feature → shared → core`
4. **Audio Engine là Singleton** — toàn app chỉ có 1 instance `AudioManager`
5. **Background audio cần config** — `app.json` (`UIBackgroundModes`, `WAKE_LOCK`, `FOREGROUND_SERVICE`)
6. **Token lưu bằng SecureStore** — KHÔNG dùng AsyncStorage cho JWT
7. **Comment bằng tiếng Việt** — theo chuẩn JSDoc, giải thích _tại sao_ chứ không phải _cái gì_
8. **Offline-First** — luôn kiểm tra local DB/file trước khi gọi API

---

## 📄 Expo Config Highlights

```jsonc
{
  "name": "XTMusic",
  "scheme": "musicexpoapp",
  "newArchEnabled": true,           // React Native New Architecture
  "experiments": {
    "typedRoutes": true,            // Type-safe routing
    "reactCompiler": true           // React Compiler (auto-memoize)
  },
  "android": {
    "package": "com.thanhtx2002.musicexpoapp",
    "permissions": ["WAKE_LOCK", "FOREGROUND_SERVICE"]
  },
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["audio"]
    }
  }
}
```
