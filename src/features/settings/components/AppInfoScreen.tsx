/**
 * @file AppInfoScreen.tsx
 * @description Màn hình Thông tin ứng dụng - Phiên bản, Bản quyền.
 * @module features/settings
 */

import { View, ScrollView, Pressable, StyleSheet, Text, Alert } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Constants from 'expo-constants'
import { ArrowLeft, RefreshCw, Layers } from 'lucide-react-native'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { GlassCard } from '@shared/components/GlassCard'
import { AppLogo } from '@shared/components/ui/AppLogo'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const MOOD_BEAT_COLORS = {
  primary: '#B026FF',
  background: '#0F0C29',
  accent: '#FF007A'
}

export default function AppInfoScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(176, 38, 255, 0.15)', 'transparent']}
        style={styles.ambientGlow}
      />

      <View style={[styles.headerRow, { paddingTop: insets.top + SPACING.md }]}>
        <Pressable style={styles.backBtnWrapper} onPress={() => router.back()}>
          <BlurView intensity={20} tint="dark" style={styles.backBtn}>
            <ArrowLeft size={22} color={COLORS.textPrimary} />
          </BlurView>
        </Pressable>
        <Text style={styles.headerTitle}>Thông tin ứng dụng</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandingBox}>
          <AppLogo size={100} style={{ marginBottom: SPACING.lg, borderRadius: 50, overflow: 'hidden' }} />
          <Text style={styles.appName}>
            <Text style={{ color: MOOD_BEAT_COLORS.primary }}>XT</Text>Music
          </Text>
          <Text style={styles.appVersion}>
            Phiên bản {Constants.nativeAppVersion || Constants.expoConfig?.version}
          </Text>
        </View>

        <GlassCard style={styles.card}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => Alert.alert('Tuyệt vời!', 'Ứng dụng của bạn đang ở phiên bản mới nhất.')}
          >
            <RefreshCw size={20} color={MOOD_BEAT_COLORS.primary} />
            <Text style={styles.actionText}>Kiểm tra bản cập nhật</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.actionBtn}
            onPress={() => Alert.alert('Thông tin bản quyền', 'Bản quyền giao diện thuộc về tác giả Tran Xuan Thanh.\nMã nguồn mở sử dụng giấy phép MIT.')}
          >
            <Layers size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.actionTextNormal}>Giấy phép mã nguồn mở (OSS)</Text>
          </Pressable>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.copyright}>© 2026 Crafted by Tran Xuan Thanh.</Text>
          <Text style={styles.copyright}>Made with ❤️ & React Native Expo.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MOOD_BEAT_COLORS.background },
  ambientGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  backBtnWrapper: { borderRadius: 22, overflow: 'hidden' },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING['3xl'], paddingTop: SPACING.lg },

  brandingBox: { alignItems: 'center', marginTop: SPACING['2xl'], marginBottom: SPACING['3xl'] },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  appVersion: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  card: { borderRadius: RADIUS.xl, padding: 0 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  actionText: { flex: 1, fontSize: 15, color: MOOD_BEAT_COLORS.primary, fontWeight: '600' },
  actionTextNormal: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: SPACING.lg },

  footer: { marginTop: SPACING['3xl'], alignItems: 'center' },
  copyright: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }
})
