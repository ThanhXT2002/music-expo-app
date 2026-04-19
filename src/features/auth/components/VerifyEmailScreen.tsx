/**
 * @file VerifyEmailScreen.tsx
 * @description Màn hình xác thực email OTP 6 số — AuthBackground SVG blobs.
 * @module features/auth
 */

import {
  View, Text, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createLogger } from '@core/logger';
import { COLORS } from '@shared/constants/colors';
import { AuthBackground } from '@shared/components/ui/AuthBackground';
import { ArrowLeft, MailCheck, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const logger = createLogger('verify-email');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email, flow } = useLocalSearchParams<{ email: string; flow: string }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  useEffect(() => { setTimeout(() => inputRefs.current[0]?.focus(), 300); }, []);

  const handleChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    if (!digit && text !== '') return;
    const newOtp = [...otp];
    if (digit.length > 1) {
      const digits = digit.slice(0, OTP_LENGTH).split('');
      digits.forEach((d, i) => { if (i < OTP_LENGTH) newOtp[i] = d; });
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length - 1, OTP_LENGTH - 1)]?.focus();
      if (digits.length >= OTP_LENGTH) setTimeout(() => handleVerify(newOtp), 200);
      return;
    }
    newOtp[index] = digit; setOtp(newOtp); setError('');
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && index === OTP_LENGTH - 1 && newOtp.join('').length === OTP_LENGTH)
      setTimeout(() => handleVerify(newOtp), 200);
  }, [otp]);

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const n = [...otp]; n[index - 1] = ''; setOtp(n);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (cur?: string[]) => {
    const code = (cur || otp).join('');
    if (code.length !== OTP_LENGTH) { setError('Vui lòng nhập đủ 6 chữ số'); return; }
    setError(''); setIsLoading(true);
    try {
      logger.info('OTP verified', { email, flow });
      setIsVerified(true);
      setTimeout(() => {
        if (flow === 'forgot-password') router.replace('/auth/login');
        else router.replace('/(tabs)');
      }, 1500);
    } catch {
      setError('Mã OTP không chính xác.');
      setOtp(Array(OTP_LENGTH).fill('')); inputRefs.current[0]?.focus();
    } finally { setIsLoading(false); }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    logger.info('Resend OTP', { email });
    setResendTimer(RESEND_COOLDOWN);
    setOtp(Array(OTP_LENGTH).fill('')); setError('');
    inputRefs.current[0]?.focus();
  };

  const masked = email
    ? `${email.slice(0, 2)}${'*'.repeat(Math.max(email.indexOf('@') - 2, 3))}${email.slice(email.indexOf('@'))}`
    : '***@***.com';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <AuthBackground variant="verify" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <View style={styles.backBtn}><ArrowLeft size={22} color={COLORS.textPrimary} /></View>
        </Pressable>

        <View style={styles.logoRow}>
          <View style={[styles.iconCircle, isVerified && styles.iconCircleOk]}>
            <MailCheck size={32} color={isVerified ? COLORS.success : COLORS.primary} strokeWidth={1.8} />
          </View>
        </View>

        <Text style={styles.title}>{isVerified ? 'Xác thực thành công!' : 'Xác thực Email'}</Text>
        <Text style={styles.subtitle}>{isVerified ? 'Đang chuyển hướng...' : `Nhập mã OTP 6 chữ số đã gửi đến\n${masked}`}</Text>

        {!isVerified && (
          <>
            <View style={styles.otpRow}>
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <TextInput
                  key={i} ref={(r) => { inputRefs.current[i] = r; }}
                  value={otp[i]} onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  keyboardType="number-pad" maxLength={i === 0 ? OTP_LENGTH : 1}
                  style={[styles.otpInput, !!otp[i] && styles.otpFilled]}
                  selectionColor={COLORS.primary}
                />
              ))}
            </View>

            {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

            <Pressable onPress={() => handleVerify()} disabled={isLoading}>
              <View style={styles.primaryBtn}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Xác nhận</Text>}
              </View>
            </Pressable>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Không nhận được mã? </Text>
              {resendTimer > 0
                ? <Text style={styles.resendTimer}>Gửi lại sau {resendTimer}s</Text>
                : <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={handleResend}>
                    <RefreshCw size={14} color={COLORS.primary} /><Text style={styles.resendLink}>Gửi lại</Text>
                  </Pressable>
              }
            </View>
          </>
        )}

        {isVerified && <View style={{ alignItems: 'center', marginTop: 20 }}><ActivityIndicator size="small" color={COLORS.success} /></View>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const OTP_BOX = (width - 48 - (OTP_LENGTH - 1) * 10) / OTP_LENGTH;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#2E2848',
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },

  logoRow: { alignItems: 'center', marginBottom: 24 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1C1235', borderWidth: 1.5, borderColor: '#6B3FA0',
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircleOk: { backgroundColor: '#0D2818', borderColor: '#1DB954' },

  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 21, fontStyle: 'italic', letterSpacing: 0.2 },

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpInput: {
    width: OTP_BOX, height: OTP_BOX * 1.15, maxWidth: 54, maxHeight: 62,
    borderRadius: 16, backgroundColor: '#1A1A2E',
    borderWidth: 1.5, borderColor: '#2E2848',
    color: COLORS.textPrimary, fontSize: 22, fontWeight: '700', textAlign: 'center',
  },
  otpFilled: { borderColor: COLORS.primary, backgroundColor: '#1E1438' },

  errorBox: { backgroundColor: '#2A1520', borderRadius: 27, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1.5, borderColor: '#5A2030', marginBottom: 16 },
  errorText: { color: COLORS.error, fontSize: 13, textAlign: 'center' },

  primaryBtn: {
    height: 54, borderRadius: 27, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: '#B026FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText: { color: COLORS.textSecondary, fontSize: 14 },
  resendTimer: { color: COLORS.textMuted, fontSize: 14 },
  resendLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
