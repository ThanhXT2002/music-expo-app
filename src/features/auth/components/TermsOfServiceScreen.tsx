/**
 * @file TermsOfServiceScreen.tsx
 * @description Trang Điều khoản dịch vụ — nội dung giống web, style dark mode.
 * @module features/auth
 */

import { View, ScrollView, Pressable, StyleSheet, Linking, Text } from 'react-native'

import { useRouter } from 'expo-router'
import { COLORS } from '@shared/constants/colors'
import { AuthBackground } from '@shared/components/ui/AuthBackground'
import { ArrowLeft, ScrollText, Copyright, ShieldCheck, Power, Mail, Lightbulb } from 'lucide-react-native'

const CARDS = [
  {
    icon: ScrollText,
    title: 'Quy định sử dụng',
    color: '#6B3FA0',
    bg: '#1C1235',
    items: [
      'Chỉ sử dụng ứng dụng cho mục đích cá nhân, không thương mại',
      'Không sử dụng ứng dụng cho các hành vi vi phạm pháp luật',
      'Không tải lên hoặc chia sẻ nội dung vi phạm bản quyền'
    ]
  },
  {
    icon: Copyright,
    title: 'Quyền sở hữu trí tuệ',
    color: '#0EA5E9',
    bg: '#0C1A2A',
    text: 'Toàn bộ mã nguồn, logo, giao diện thuộc sở hữu của tác giả Tran Xuan Thanh. Không được sao chép, chỉnh sửa, phân phối khi chưa có sự đồng ý.'
  },
  {
    icon: ShieldCheck,
    title: 'Giới hạn trách nhiệm',
    color: '#64748B',
    bg: '#151B28',
    text: 'XTMusic cung cấp "nguyên trạng" (as is), không chịu trách nhiệm với bất kỳ thiệt hại nào phát sinh từ việc sử dụng ứng dụng.'
  },
  {
    icon: Power,
    title: 'Thay đổi & chấm dứt dịch vụ',
    color: '#3B82F6',
    bg: '#111827',
    text: 'Chúng tôi có thể thay đổi hoặc ngừng cung cấp dịch vụ bất cứ lúc nào mà không cần báo trước.'
  },
  {
    icon: Mail,
    title: 'Liên hệ',
    color: '#A855F7',
    bg: '#1A1040',
    text: 'Mọi thắc mắc, khiếu nại vui lòng liên hệ:',
    extra: 'tranxuanthanhtxt2002@gmail.com'
  },
  {
    icon: Lightbulb,
    title: 'Lưu ý sử dụng',
    color: '#F59E42',
    bg: '#1F1810',
    items: ['Đảm bảo cập nhật ứng dụng và trình duyệt thường xuyên để có trải nghiệm tốt nhất.']
  }
]

export default function TermsOfServiceScreen() {
  const router = useRouter()

  return (
    <View style={styles.flex}>
      <AuthBackground variant='register' />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <View style={styles.backBtn}>
              <ArrowLeft size={22} color={COLORS.textPrimary} />
            </View>
          </Pressable>
          <Text style={styles.headerTitle}>Điều khoản dịch vụ</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.updated}>Cập nhật lần cuối: 01/07/2025</Text>
        <Text style={styles.intro}>
          Bằng việc sử dụng ứng dụng XTMusic, bạn đồng ý với các điều khoản dưới đây. Ứng dụng KHÔNG sử dụng cho mục
          đích thương mại hoặc kiếm tiền từ bất kỳ cá nhân/tổ chức nào.
        </Text>

        {/* Cards */}
        {CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <View key={i} style={[styles.card, { backgroundColor: card.bg, borderColor: card.color + '40' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: card.color + '25' }]}>
                  <Icon size={20} color={card.color} />
                </View>
                <Text style={[styles.cardTitle, { color: card.color }]}>{card.title}</Text>
              </View>
              {card.items?.map((item, j) => (
                <View key={j} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
              {card.text && <Text style={styles.cardText}>{card.text}</Text>}
              {card.extra && (
                <Pressable onPress={() => Linking.openURL(`mailto:${card.extra}`)}>
                  <Text
                    style={[styles.cardText, { color: COLORS.primary, textDecorationLine: 'underline', marginTop: 6 }]}
                  >
                    {card.extra}
                  </Text>
                </Pressable>
              )}
            </View>
          )
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            <Text style={{ color: COLORS.primary }}>XT</Text>Music ♪
          </Text>
          <Text style={styles.footerCopy}>© 2025 XTMusic. Phi thương mại. Không quảng cáo. Không bán dữ liệu.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A2E',
    borderWidth: 1.5,
    borderColor: '#2E2848',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },

  updated: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  intro: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 20, textAlign: 'justify' },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6, paddingRight: 8 },
  bullet: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  bulletText: { flex: 1, color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
  cardText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },

  footer: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2E2848', alignItems: 'center', gap: 6 },
  footerBrand: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  footerCopy: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' }
})
