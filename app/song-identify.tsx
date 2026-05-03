/**
 * @file song-identify.tsx
 * @description Màn hình nhận diện bài hát bằng file audio.
 * Modal presentation từ dưới lên, cho phép user chọn file và nhận diện.
 * @module app
 */

import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView, ToastAndroid, Platform } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Upload, Music, AlertCircle, ArrowLeft, CloudUpload } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  pickAudioFile,
  identifySongByFile,
  type IdentifySongResponse
} from '@features/identify/services/identifyService'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { createLogger } from '@core/logger'
import { GlassIconButton } from '@shared/components/GlassIconButton'

const logger = createLogger('song-identify-screen')

export default function SongIdentifyScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IdentifySongResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    }
  }

  const handlePickAndIdentify = async () => {
    try {
      setError(null)
      setResult(null)
      setSelectedFileName(null)

      // 1. Chọn file
      const file = await pickAudioFile()
      if (!file) return

      setSelectedFileName(file.name)
      logger.info('File đã chọn', { name: file.name, size: file.size })

      // 2. Gửi lên server nhận diện
      setLoading(true)
      const identified = await identifySongByFile(file.uri, file.name, file.mimeType)

      setResult(identified)
      showToast(`Tìm thấy: ${identified.title}`)

      logger.info('Nhận diện thành công', {
        title: identified.title,
        confidence: identified.confidence
      })
    } catch (err: any) {
      const message = err?.message || 'Không thể nhận diện bài hát'
      setError(message)
      showToast(message)
      logger.error('Nhận diện thất bại', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySong = () => {
    if (!result) return
    router.back()
    // Navigate sang player hoặc song detail
    router.push(`/player/${result.id}` as any)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }]}>
      {/* Ambient purple glow */}
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.15)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents='none'
      />

      {/* Header */}
      <View style={styles.header}>
        <GlassIconButton size={44} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </GlassIconButton>
        <Text style={styles.headerTitle}>Nhận diện bài hát</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Button */}
        <View style={styles.uploadBtnWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.uploadBtn,
              pressed && styles.uploadBtnPressed
            ]}
            onPress={handlePickAndIdentify}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.uploadTextLoading}>Đang nhận diện...</Text>
                {selectedFileName && (
                  <Text style={styles.uploadHint} numberOfLines={1}>
                    {selectedFileName}
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.uploadContent}>
                <View style={styles.uploadIconCircle}>
                  <CloudUpload size={56} color="#C8B6FF" strokeWidth={1.5} />
                </View>
                <Text style={styles.uploadText}>Chọn file audio</Text>
                <Text style={styles.uploadSubtitle}>Hoặc kéo thả file vào đây</Text>
                <Text style={styles.uploadHint}>Hỗ trợ: MP3, WAV, M4A (Max 10MB)</Text>
              </View>
            )}
          </Pressable>
          {/* Dashed border overlay */}
          <View style={styles.dashedBorder} pointerEvents="none" />
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            {/* Album Art */}
            <View style={styles.resultImageWrapper}>
              <Image
                source={{ uri: result.thumbnailUrl }}
                style={styles.resultImage}
                contentFit="cover"
                transition={300}
              />
              {/* Glow effect */}
              <View style={styles.resultImageGlow} />
            </View>

            {/* Info */}
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle} numberOfLines={2}>
                {result.title}
              </Text>
              <Text style={styles.resultArtist} numberOfLines={1}>
                {result.artist}
              </Text>
              {result.album && (
                <Text style={styles.resultAlbum} numberOfLines={1}>
                  {result.album}
                </Text>
              )}
              {result.confidence > 0 && (
                <View style={styles.confidenceRow}>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      Độ chính xác: {(result.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.playBtn,
                  pressed && styles.playBtnPressed
                ]}
                onPress={handlePlaySong}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playBtnGradient}
                >
                  <Music size={20} color="#FFFFFF" />
                  <Text style={styles.playBtnText}>Phát nhạc</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={handlePickAndIdentify}
              >
                <Upload size={18} color={COLORS.primary} />
                <Text style={styles.secondaryBtnText}>Thử lại</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Instructions */}
        {!result && !loading && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Cách sử dụng:</Text>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Nhấn nút &quot;Chọn file audio&quot; ở trên
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Chọn file nhạc từ thiết bị của bạn
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Đợi hệ thống nhận diện bài hát
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Nhấn &quot;Phát nhạc&quot; để nghe bài hát
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['3xl'],
    alignItems: 'center'
  },

  // Upload Button
  uploadBtnWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center'
  },
  uploadBtn: {
    width: '100%',
    borderRadius: RADIUS['2xl'],
    borderWidth: 2,
    borderColor: 'rgba(176, 38, 255, 0.4)',
    backgroundColor: 'rgba(20, 20, 40, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: 48
  },
  uploadBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }]
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: SPACING.xl
  },
  dashedBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: RADIUS['2xl'] + 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(176, 38, 255, 0.6)'
  },
  uploadIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: 'rgba(50, 50, 70, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  uploadText: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 8
  },
  uploadSubtitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    width: '100%',
    marginBottom: 16
  },
  uploadTextLoading: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: SPACING.md,
    textAlign: 'center'
  },
  uploadHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    marginTop: 0
  },

  // Error Box
  errorBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255, 65, 91, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 65, 91, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 480
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    lineHeight: 20
  },

  // Result Card
  resultCard: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    maxWidth: 480
  },
  resultImageWrapper: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: SPACING.lg
  },
  resultImage: {
    width: 200,
    height: 200,
    borderRadius: RADIUS.lg
  },
  resultImageGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.lg,
    backgroundColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },
  resultInfo: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
    alignItems: 'center'
  },
  resultTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 28
  },
  resultArtist: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  resultAlbum: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs
  },
  confidenceRow: {
    marginTop: SPACING.sm,
    alignItems: 'center'
  },
  confidenceBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(176, 38, 255, 0.3)'
  },
  confidenceText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.primary
  },

  // Action Buttons
  actionButtons: {
    gap: SPACING.sm
  },
  playBtn: {
    height: 52,
    borderRadius: RADIUS.full,
    overflow: 'hidden'
  },
  playBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  playBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm
  },
  playBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  secondaryBtn: {
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm
  },
  secondaryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary
  },

  // Instructions
  instructions: {
    marginTop: SPACING['2xl'],
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(176, 38, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(176, 38, 255, 0.08)',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 480
  },
  instructionsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xs
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(176, 38, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  instructionNumberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500'
  }
})
