/**
 * @file ThemeSettingsScreen.tsx
 * @description Màn hình Cài đặt Chủ đề & Hiển thị.
 * @module features/settings
 */

import { View, ScrollView, Pressable, StyleSheet, Text, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native'
import { GlassIconButton } from '@shared/components/GlassIconButton'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { GlassCard } from '@shared/components/GlassCard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'

const MOOD_BEAT_COLORS = {
  primary: '#B026FF',
  background: '#0F0C29'
}

const THEMES = [
  { id: 'system', name: 'Thích ứng Hệ thống', desc: 'Tự động thay đổi theo dế yêu của bạn' },
  { id: 'dark', name: 'Đen Đặc (Pitch Black)', desc: 'Tiết kiệm pin tối đa cho màn OLED' },
  { id: 'mood_beat', name: 'Mood Beat (Mặc định)', desc: 'Chế độ hiển thị dải ngân hà Đèn Neon' }
]

export default function ThemeSettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [activeTheme, setActiveTheme] = useState('mood_beat')

  const handleChangeTheme = (id: string, name: string) => {
    setActiveTheme(id)
    Alert.alert('Đã chuyển giao diện', `Áp dụng thành công cài đặt giao diện: ${name}`)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 210, 255, 0.15)', 'transparent']}
        style={styles.ambientGlow}
      />

      <View style={[styles.headerRow, { paddingTop: insets.top + SPACING.md }]}>
        <GlassIconButton size={44} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </GlassIconButton>
        <Text style={styles.headerTitle}>Chủ đề & Hiển thị</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Chọn giao diện</Text>

        {THEMES.map(theme => {
          const isActive = activeTheme === theme.id
          return (
            <Pressable key={theme.id} onPress={() => handleChangeTheme(theme.id, theme.name)}>
              <GlassCard style={[styles.themeCard, isActive && styles.themeCardActive]}>
                <View style={styles.textStack}>
                  <Text style={[styles.themeName, isActive && { color: MOOD_BEAT_COLORS.primary }]}>{theme.name}</Text>
                  <Text style={styles.themeDesc}>{theme.desc}</Text>
                </View>
                {isActive && <CheckCircle2 size={24} color={MOOD_BEAT_COLORS.primary} />}
              </GlassCard>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MOOD_BEAT_COLORS.background },
  ambientGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING['3xl'], paddingTop: SPACING.lg },

  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.md, marginLeft: SPACING.sm },
  themeCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  themeCardActive: {
    borderWidth: 1.5,
    borderColor: MOOD_BEAT_COLORS.primary,
    backgroundColor: 'rgba(176, 38, 255, 0.1)'
  },
  textStack: { flex: 1, paddingRight: SPACING.md },
  themeName: { fontSize: FONT_SIZE.md, color: '#FFFFFF', fontWeight: '600', marginBottom: 4 },
  themeDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)' }
})
