/**
 * @file PrivacyPolicyScreen.tsx
 * @description Trang Chính sách bảo mật — nội dung giống web, style dark mode.
 * @module features/auth
 */

import {
  View, Text, ScrollView, Pressable, StyleSheet, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@shared/constants/colors';
import { AuthBackground } from '@shared/components/ui/AuthBackground';
import {
  ArrowLeft, Database, Target, ShieldCheck, Lock, Clock, Lightbulb, Mail,
} from 'lucide-react-native';

const CARDS = [
  {
    icon: Database,
    title: 'Thông tin thu thập',
    color: '#6B3FA0',
    bg: '#1C1235',
    items: [
      'Email, tài khoản Google (chỉ dùng cho xác thực và cá nhân hóa trải nghiệm)',
      'Lịch sử nghe nhạc, playlist, bài hát yêu thích (lưu trữ cục bộ, không chia sẻ ra ngoài)',
      'Thông tin thiết bị (chỉ dùng để cải thiện bảo mật và hiệu năng)',
    ],
  },
  {
    icon: Target,
    title: 'Mục đích sử dụng',
    color: '#0EA5E9',
    bg: '#0C1A2A',
    items: [
      'Cá nhân hóa trải nghiệm nghe nhạc',
      'Cải thiện tính năng, bảo mật ứng dụng',
      'Không sử dụng cho quảng cáo, không bán dữ liệu',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Quyền của người dùng',
    color: '#64748B',
    bg: '#151B28',
    items: [
      'Yêu cầu truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân',
      'Rút lại quyền truy cập bất cứ lúc nào',
    ],
    extra: 'tranxuanthanhtxt2002@gmail.com',
  },
  {
    icon: Lock,
    title: 'Bảo mật dữ liệu',
    color: '#3B82F6',
    bg: '#111827',
    text: 'Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn. Tuy nhiên, không có phương thức nào an toàn tuyệt đối.',
  },
  {
    icon: Clock,
    title: 'Thay đổi chính sách',
    color: '#A855F7',
    bg: '#1A1040',
    text: 'Chính sách này có thể được cập nhật. Mọi thay đổi sẽ được thông báo trên trang này.',
  },
  {
    icon: Lightbulb,
    title: 'Lưu ý bảo mật',
    color: '#F59E42',
    bg: '#1F1810',
    items: [
      'Không chia sẻ thông tin cá nhân hoặc tài khoản cho người khác.',
      'Luôn kiểm tra quyền truy cập ứng dụng trên thiết bị của bạn.',
      'Đọc kỹ các thông báo cập nhật về bảo mật từ XTMusic.',
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.flex}>
      <AuthBackground variant="login" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <View style={styles.backBtn}><ArrowLeft size={22} color={COLORS.textPrimary} /></View>
          </Pressable>
          <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={styles.updated}>Cập nhật lần cuối: 01/07/2025</Text>
        <Text style={styles.intro}>
          Ứng dụng XTMusic cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng. Ứng dụng KHÔNG sử dụng cho mục đích thương mại hoặc kiếm tiền từ bất kỳ cá nhân/tổ chức nào.
        </Text>

        {/* Cards */}
        {CARDS.map((card, i) => {
          const Icon = card.icon;
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
                  <View style={styles.bulletRow}>
                    <Mail size={14} color={COLORS.primary} />
                    <Text style={[styles.bulletText, { color: COLORS.primary, textDecorationLine: 'underline' }]}>{card.extra}</Text>
                  </View>
                </Pressable>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}><Text style={{ color: COLORS.primary }}>XT</Text>Music ♪</Text>
          <Text style={styles.footerCopy}>© 2025 XTMusic. Phi thương mại. Không quảng cáo. Không bán dữ liệu.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#2E2848',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },

  updated: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  intro: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 20, textAlign: 'justify' },

  card: {
    borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 12,
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
  footerCopy: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
});
