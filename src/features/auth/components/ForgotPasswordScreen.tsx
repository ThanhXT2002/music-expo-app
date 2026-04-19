/**
 * @file ForgotPasswordScreen.tsx
 * @description Màn hình quên mật khẩu — AuthBackground SVG blobs.
 * @module features/auth
 */

import {
  View, Text, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { createLogger } from '@core/logger';
import { COLORS } from '@shared/constants/colors';
import { AppLogo } from '@shared/components/ui/AppLogo';
import { AuthBackground } from '@shared/components/ui/AuthBackground';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';

const logger = createLogger('forgot-password');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) { setError('Vui lòng nhập địa chỉ email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Email không đúng định dạng'); return; }
    setError(''); setIsLoading(true);
    try {
      logger.info('Gửi OTP', { email });
      router.push({ pathname: '/auth/verify-email', params: { email: email.trim(), flow: 'forgot-password' } });
    } catch { setError('Gửi OTP thất bại.'); }
    finally { setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <AuthBackground variant="forgot" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <View style={styles.backBtn}><ArrowLeft size={22} color={COLORS.textPrimary} /></View>
        </Pressable>

        <View style={styles.logoRow}><AppLogo size={90} /></View>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email đã đăng ký để nhận mã khôi phục</Text>

        <View style={styles.form}>
          <View style={[styles.inputWrapper, focused && styles.inputFocused, !!error && styles.inputError]}>
            <View style={styles.inputIconBox}><Mail size={18} color={focused ? COLORS.primary : COLORS.textMuted} /></View>
            <TextInput
              value={email} onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="Nhập email đã đăng ký" placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              style={styles.inputText}
            />
          </View>

          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          <Pressable onPress={handleSendOTP} disabled={isLoading}>
            <View style={styles.primaryBtn}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <View style={styles.primaryBtnInner}><Send size={18} color="#fff" /><Text style={styles.primaryBtnText}>Gửi mã OTP</Text></View>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>💡 Mã OTP gồm 6 chữ số sẽ được gửi đến email trong vòng 1-2 phút.</Text>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Nhớ mật khẩu rồi? </Text>
          <Pressable onPress={() => router.back()}><Text style={styles.loginLink}>Đăng nhập</Text></Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },

  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#2E2848',
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },

  logoRow: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 12, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 21, paddingHorizontal: 8, fontStyle: 'italic', letterSpacing: 0.2 },

  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 27,
    backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#2E2848', paddingHorizontal: 20,
  },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: '#1E1438' },
  inputError: { borderColor: COLORS.error },
  inputIconBox: { marginRight: 10 },
  inputText: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

  errorBox: { backgroundColor: '#2A1520', borderRadius: 27, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1.5, borderColor: '#5A2030' },
  errorText: { color: COLORS.error, fontSize: 13 },

  primaryBtn: {
    height: 54, borderRadius: 27, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#B026FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  primaryBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  noteBox: { marginTop: 24, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#161230', borderRadius: 20, borderWidth: 1.5, borderColor: '#2E2848' },
  noteText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  loginText: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
