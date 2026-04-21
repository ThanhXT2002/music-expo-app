/**
 * @file song-identify.tsx
 * @description Trang nhận diện bài hát — Shazam-like feature.
 * Nút ghi âm tròn lớn, waveform animation, kết quả nhận dạng.
 * @module app
 */

import { View, Pressable, StyleSheet, Dimensions, Text } from 'react-native'

import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { X, Mic, Music } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS, SHADOWS } from '@shared/constants/spacing'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const BUTTON_SIZE = 140

export default function SongIdentifyScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<{
    title: string
    artist: string
    coverUrl: string
  } | null>(null)

  const handleToggle = () => {
    if (isListening) {
      setIsListening(false)
      // Mock result
      setResult({
        title: 'Chạy Ngay Đi',
        artist: 'Sơn Tùng M-TP',
        coverUrl: 'https://picsum.photos/seed/identify/200/200'
      })
    } else {
      setResult(null)
      setIsListening(true)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F0C29', '#1a1240', '#120d20']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <X size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Nhận diện bài hát</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Status text */}
        <Text style={styles.statusText}>
          {isListening ? 'Đang lắng nghe...' : result ? 'Đã tìm thấy!' : 'Nhấn để nhận diện bài hát'}
        </Text>

        {/* Waveform rings (decorative) */}
        {isListening && (
          <View style={styles.ringsContainer}>
            <View style={[styles.ring, styles.ring1]} />
            <View style={[styles.ring, styles.ring2]} />
            <View style={[styles.ring, styles.ring3]} />
          </View>
        )}

        {/* Main button */}
        <Pressable onPress={handleToggle} style={styles.mainBtnWrap}>
          <LinearGradient
            colors={isListening ? ['#FF6B6B', '#EE5A24'] : ['#B026FF', '#6C5CE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.mainBtn, SHADOWS.purpleGlow]}
          >
            {isListening ? <View style={styles.stopIcon} /> : <Mic size={48} color='#FFFFFF' />}
          </LinearGradient>
        </Pressable>

        {/* Hint */}
        <Text style={styles.hintText}>
          {isListening ? 'Đưa điện thoại lại gần nguồn phát nhạc' : 'Nhận dạng bài hát đang phát xung quanh'}
        </Text>
      </View>

      {/* Result */}
      {result && (
        <View style={styles.resultSection}>
          <View style={styles.resultCard}>
            <View style={styles.resultCover}>
              <Music size={24} color={COLORS.primary} />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultArtist}>{result.artist}</Text>
            </View>
            <Pressable onPress={() => router.push('/player/identify-result')} style={styles.playResultBtn}>
              <LinearGradient colors={['#B026FF', '#6C5CE7']} style={styles.playResultGradient}>
                <Text style={styles.playResultText}>Phát</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary
  },

  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60
  },
  statusText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING['3xl']
  },

  // Rings
  ringsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(176, 38, 255, 0.15)'
  },
  ring1: {
    width: BUTTON_SIZE + 50,
    height: BUTTON_SIZE + 50
  },
  ring2: {
    width: BUTTON_SIZE + 100,
    height: BUTTON_SIZE + 100,
    borderColor: 'rgba(176, 38, 255, 0.08)'
  },
  ring3: {
    width: BUTTON_SIZE + 150,
    height: BUTTON_SIZE + 150,
    borderColor: 'rgba(176, 38, 255, 0.04)'
  },

  // Main button
  mainBtnWrap: {
    marginBottom: SPACING['2xl']
  },
  mainBtn: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF'
  },
  hintText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING['3xl']
  },

  // Result
  resultSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl']
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md
  },
  resultCover: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(176, 38, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resultInfo: {
    flex: 1
  },
  resultTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  resultArtist: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginTop: 2
  },
  playResultBtn: {
    borderRadius: RADIUS.full,
    overflow: 'hidden'
  },
  playResultGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full
  },
  playResultText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#FFFFFF'
  }
})
