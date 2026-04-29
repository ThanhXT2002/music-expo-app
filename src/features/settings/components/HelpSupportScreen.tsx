/**
 * @file HelpSupportScreen.tsx
 * @description Màn hình Trợ giúp & Hỗ trợ - FAQ, liên hệ.
 * @module features/settings
 */

import { View, ScrollView, Pressable, StyleSheet, Text, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react-native'
import { GlassIconButton } from '@shared/components/GlassIconButton'
import { COLORS } from '@shared/constants/colors'
import { FONT_SIZE, SPACING, RADIUS } from '@shared/constants/spacing'
import { GlassCard } from '@shared/components/GlassCard'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'

const MOOD_BEAT_COLORS = {
  primary: '#B026FF',
  background: '#0F0C29',
  accent: '#FF007A',
  secondary: '#00D2FF'
}

const FAQS = [
  {
    q: 'Làm sao để tải nhạc về máy nghe Offline?',
    a: 'Bạn chỉ cần bấm vào biểu tượng Đám Mây bên cạnh tên bài hát. Hệ thống sẽ tự động ghép nối và đẩy vào tab Tải xuống.'
  },
  {
    q: 'Tại sao app không chạy nền được?',
    a: 'Hãy kiểm tra lại quyền chạy nền trong Cài đặt của Android (Battery Optimization). Đảm bảo XTMusic được cho phép "Không hạn chế".'
  },
  {
    q: 'Chế độ Mood Beat là gì?',
    a: 'Mood Beat là Giao diện hiển thị tự động trích xuất màu sắc Neon từ ảnh bìa Album để tô màu nền app, mang lại cảm giác sống động như tại Bar.'
  }
]

export default function HelpSupportScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

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
        <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconHeader}>
          <HelpCircle size={48} color={MOOD_BEAT_COLORS.accent} />
          <Text style={styles.introText}>Chào bạn, chúng tôi có thể giúp gì?</Text>
        </View>

        <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
        <GlassCard style={styles.card}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedIndex === index
            return (
              <View key={index} style={[styles.faqItem, index === FAQS.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Pressable style={styles.faqHeader} onPress={() => setExpandedIndex(isExpanded ? null : index)}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <ChevronDown size={18} color="rgba(255,255,255,0.5)" style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                </Pressable>
                {isExpanded && <Text style={styles.faqA}>{faq.a}</Text>}
              </View>
            )
          })}
        </GlassCard>

        <Text style={styles.sectionTitle}>Liên hệ với chúng tôi</Text>
        <GlassCard style={[styles.card, { padding: 0 }]}>
          <Pressable style={styles.contactBtn} onPress={() => Linking.openURL('mailto:tranxuanthanhtxt2002@gmail.com')}>
            <MessageCircle size={20} color={MOOD_BEAT_COLORS.secondary} />
            <Text style={styles.contactText}>Chat với Bộ phận CSKH</Text>
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
  backBtnWrapper: { borderRadius: 22, overflow: 'hidden' },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING['3xl'], paddingTop: SPACING.lg },

  iconHeader: { alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.md },
  introText: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.7)', marginTop: SPACING.md, fontWeight: '500' },

  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: SPACING.md, marginLeft: SPACING.sm },
  card: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.xl },

  faqItem: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', paddingBottom: SPACING.md, marginBottom: SPACING.md },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF', paddingRight: SPACING.md, lineHeight: 22 },
  faqA: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: SPACING.sm, lineHeight: 21 },

  contactBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  contactText: { fontSize: FONT_SIZE.md, color: '#FFFFFF', fontWeight: '600' }
})
