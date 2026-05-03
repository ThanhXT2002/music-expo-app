# 🎵 Song Identify Feature

Tính năng nhận diện bài hát bằng file audio (Shazam-like).

## 📁 Cấu trúc

```
src/features/identify/
├── services/
│   └── identifyService.ts    # API calls & file picker
├── types.ts                   # TypeScript types
└── README.md                  # Documentation
```

## 🎯 Chức năng

- **Chọn file audio** từ thiết bị (MP3, M4A, WAV, FLAC)
- **Upload file** lên server qua FormData
- **Nhận diện bài hát** thông qua ACRCloud/Shazam API
- **Hiển thị kết quả** với metadata đầy đủ
- **Phát nhạc** ngay sau khi nhận diện

## 🚀 Sử dụng

### 1. Import service

```typescript
import { pickAudioFile, identifySongByFile } from '@features/identify/services/identifyService'
```

### 2. Chọn file và nhận diện

```typescript
const handleIdentify = async () => {
  // Chọn file
  const file = await pickAudioFile()
  if (!file) return

  // Nhận diện
  const result = await identifySongByFile(file.uri, file.name, file.mimeType)
  
  console.log('Tìm thấy:', result.title, 'by', result.artist)
}
```

### 3. Navigate sang màn hình

```typescript
import { useRouter } from 'expo-router'

const router = useRouter()
router.push('/song-identify')
```

## 📡 API Endpoint

### Request

```
POST /songs/identify
Content-Type: multipart/form-data

Body:
- file: File (audio file)
```

### Response

```typescript
{
  "status": true,
  "data": {
    "id": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "artist": "Rick Astley",
    "album": "Whenever You Need Somebody",
    "thumbnailUrl": "https://...",
    "duration": 213,
    "confidence": 0.95
  },
  "message": "Nhận diện thành công"
}
```

## 🎨 UI Components

### Screen: `app/song-identify.tsx`

- **Upload Button** - Dashed border với gradient background
- **Loading State** - ActivityIndicator với file name
- **Error Box** - Alert với icon và message
- **Result Card** - Album art + metadata + action buttons
- **Instructions** - Hướng dẫn sử dụng

### Màu sắc

- Primary: `#B026FF` (Neon Purple)
- Surface: `#1a142c`
- Error: `#FF415B`
- Success: `#1DB954`

## 🔧 Dependencies

- `expo-document-picker` - Chọn file từ thiết bị
- `expo-image` - Hiển thị album art
- `expo-linear-gradient` - Gradient effects
- `lucide-react-native` - Icons

## 📝 Backend Implementation

### FastAPI Controller

```python
@router.post("/songs/identify")
async def identify_song(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(400, "File phải là định dạng audio")
    
    # Read file content
    audio_data = await file.read()
    
    # Call ACRCloud/Shazam API
    result = await identify_song_from_audio(audio_data)
    
    return ApiResponse(
        status=True,
        data=result,
        message="Nhận diện thành công"
    )
```

### Service Integration

Cần tích hợp một trong các dịch vụ:

1. **ACRCloud** (Recommended)
   - API: https://www.acrcloud.com/
   - Accuracy: Cao
   - Free tier: 2000 requests/month

2. **Shazam API** (RapidAPI)
   - API: https://rapidapi.com/apidojo/api/shazam
   - Accuracy: Rất cao
   - Free tier: 500 requests/month

3. **AudD**
   - API: https://audd.io/
   - Accuracy: Trung bình
   - Free tier: 1000 requests/month

## 🐛 Error Handling

```typescript
try {
  const result = await identifySongByFile(uri, name, mimeType)
} catch (error) {
  // Error types:
  // - "Không thể chọn file audio" - File picker error
  // - "File phải là định dạng audio" - Invalid file type
  // - "Không thể nhận diện bài hát" - API error
  // - "Server không trả về dữ liệu" - Empty response
}
```

## 📊 Logging

```typescript
import { createLogger } from '@core/logger'

const logger = createLogger('identify-service')

logger.info('File đã chọn', { name, size, mimeType })
logger.info('Nhận diện thành công', { title, artist, confidence })
logger.error('Nhận diện thất bại', error)
```

## 🎯 Future Improvements

- [ ] Hỗ trợ record audio trực tiếp (microphone)
- [ ] Cache kết quả nhận diện
- [ ] History nhận diện gần đây
- [ ] Share kết quả nhận diện
- [ ] Batch identify nhiều file
- [ ] Preview audio trước khi upload
- [ ] Compress audio trước khi upload (giảm bandwidth)
