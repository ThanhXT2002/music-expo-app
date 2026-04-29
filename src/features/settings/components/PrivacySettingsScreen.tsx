/**
 * @file PrivacySettingsScreen.tsx
 * @description Màn hình Cài đặt Quyền riêng tư - FaceID, Đồng bộ, Ẩn Playlist.
 * @module features/settings
 */

import { View, ScrollView, Pressable, StyleSheet, Text, Switch, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Fingerprint, Lock, Trash2, EyeOff } from 'lucide-react-native'
import { GlassIconButton } from '@shared/components/GlassIconButton'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { GlassCard } from '@shared/components/GlassCard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'

const MOOD_BEAT_COLORS = {
  primary: '#B026FF',
  secondary: '#00D2FF',
  accent: '#FF007A',
  background: '#0F0C29'
}

export default function PrivacySettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [faceId, setFaceId] = useState(false)
  const [privatePlaylist, setPrivatePlaylist] = useState(true)
  const [analytics, setAnalytics] = useState(false)

  const handleDeleteAccount = () => {
    Alert.alert(
      'Cảnh báo nguy hiểm',
      'Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản và toàn bộ dữ liệu âm nhạc không? Thao tác này không thể hoàn tác.',
      [
        { text: 'Suy nghĩ lại', style: 'cancel' },
        { text: 'Xóa vĩnh viễn', style: 'destructive', onPress: () => Alert.alert('Đã gửi yêu cầu', 'Yêu cầu xóa dữ liệu của bạn sẽ được xử lý trong 14 ngày tới.') }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255, 0, 122, 0.15)', 'transparent']}
        style={styles.ambientGlow}
      />

      <View style={[styles.headerRow, { paddingTop: insets.top + SPACING.md }]}>
        <GlassIconButton size={44} onPress={() => router.back()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </GlassIconButton>
        <Text style={styles.headerTitle}>Quyền riêng tư</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Bảo vệ lối tắt</Text>
        <GlassCard style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.iconBox}>
              <Fingerprint size={20} color={MOOD_BEAT_COLORS.secondary} />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.toggleTitle}>Mở khóa bằng sinh trắc</Text>
              <Text style={styles.toggleSubtitle}>Sử dụng Face ID hoặc Vân tay</Text>
            </View>
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ true: MOOD_BEAT_COLORS.primary, false: 'rgba(255,255,255,0.2)' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Dữ liệu & Chia sẻ</Text>
        <GlassCard style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.iconBox}>
              <EyeOff size={20} color={MOOD_BEAT_COLORS.primary} />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.toggleTitle}>Ẩn Playlist cá nhân</Text>
              <Text style={styles.toggleSubtitle}>Không hiển thị ở trang cá nhân công khai</Text>
            </View>
            <Switch
              value={privatePlaylist}
              onValueChange={setPrivatePlaylist}
              trackColor={{ true: MOOD_BEAT_COLORS.primary, false: 'rgba(255,255,255,0.2)' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.iconBox}>
              <Lock size={20} color={MOOD_BEAT_COLORS.accent} />
            </View>
            <View style={styles.textStack}>
              <Text style={styles.toggleTitle}>Chia sẻ lỗi ẩn danh</Text>
              <Text style={styles.toggleSubtitle}>Gửi tự động để cải thiện ứng dụng</Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ true: MOOD_BEAT_COLORS.primary, false: 'rgba(255,255,255,0.2)' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>Vùng nguy hiểm</Text>
        <GlassCard style={[styles.card, { padding: 0, borderColor: 'rgba(255,0,0,0.3)', borderWidth: 1 }]}>
          <Pressable style={styles.actionBtn} onPress={handleDeleteAccount}>
            <Trash2 size={20} color={COLORS.error} />
            <Text style={styles.dangerText}>Yêu cầu xoá tài khoản</Text>
          </Pressable>
        </GlassCard>
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

  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.md, marginLeft: SPACING.sm, marginTop: SPACING.lg },
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg },

  toggleRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  textStack: { flex: 1 },
  toggleTitle: { fontSize: FONT_SIZE.md, color: '#FFFFFF', fontWeight: '600' },
  toggleSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: SPACING.md },

  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  dangerText: { fontSize: FONT_SIZE.md, color: COLORS.error, fontWeight: '600' }
})
