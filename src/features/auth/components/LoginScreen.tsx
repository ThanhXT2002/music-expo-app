/**
 * @file LoginScreen.tsx
 * @description Màn hình đăng nhập — Dark Mode, chủ đề âm nhạc.
 * Dùng AuthBackground (SVG RadialGradient neon blobs).
 * @module features/auth
 */

import {
  View, Text, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, Pressable, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { createLogger } from '@core/logger';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '@shared/constants/colors';
import { GoogleIcon, FacebookIcon, AppleIcon } from '@shared/components/icons/SocialIcons';
import { AppLogo } from '@shared/components/ui/AppLogo';
import { AuthBackground } from '@shared/components/ui/AuthBackground';

import { Mail, Lock, Eye, EyeOff, Fingerprint, ChevronRight } from 'lucide-react-native';

const logger = createLogger('login-screen');

// ─── Input Component ──────────────────────────────────────────────────────────

function AuthInput({
  value, onChangeText, placeholder, icon,
  secureEntry = false, keyboardType = 'default', autoCapitalize = 'none',
}: {
  value: string; onChangeText: (t: string) => void;
  placeholder: string; icon: React.ReactNode;
  secureEntry?: boolean; keyboardType?: any; autoCapitalize?: any;
}) {
  const [hidden, setHidden] = useState(secureEntry);
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
      <View style={styles.inputIconBox}>{icon}</View>
      <TextInput
        value={value} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor={COLORS.textMuted}
        secureTextEntry={hidden} keyboardType={keyboardType}
        autoCapitalize={autoCapitalize} autoCorrect={false}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={styles.inputText}
      />
      {secureEntry && (
        <Pressable onPress={() => setHidden(!hidden)} style={{ padding: 6 }}>
          {hidden ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.primary} />}
        </Pressable>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Vui lòng nhập đầy đủ email và mật khẩu'); return; }
    setError('');
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      {/* Background — SVG radial gradient blobs */}
      <AuthBackground variant="login" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <AppLogo size={110} />
        </View>

        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Giai điệu yêu thích đang chờ bạn ♪</Text>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput value={email} onChangeText={setEmail} placeholder="Địa chỉ Email" keyboardType="email-address" icon={<Mail size={18} color={COLORS.textMuted} />} />
          <AuthInput value={password} onChangeText={setPassword} placeholder="Mật khẩu" secureEntry icon={<Lock size={18} color={COLORS.textMuted} />} />

          <Pressable style={styles.forgotRow} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </Pressable>

          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          {/* Primary Login Button */}
          <Pressable onPress={handleLogin} disabled={isLoading}>
            <View style={styles.primaryBtn}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <View style={styles.primaryBtnInner}>
                  <Text style={styles.primaryBtnText}>Đăng nhập</Text>
                  <ChevronRight size={18} color="#fff" />
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc tiếp tục với</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialList}>
          <Pressable onPress={() => logger.info('Biometric')}>
            <View style={[styles.socialBtn, { backgroundColor: '#1C1235', borderColor: '#6B3FA0' }]}>
              <Fingerprint size={20} color={COLORS.primary} />
              <Text style={[styles.socialBtnText, { color: COLORS.primary }]}>Đăng nhập bằng sinh trắc học</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => logger.info('Google login')}>
            <View style={[styles.socialBtn, { backgroundColor: '#1A1A2E', borderColor: '#3D3558' }]}>
              <GoogleIcon size={20} />
              <Text style={styles.socialBtnText}>Tiếp tục với Google</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => logger.info('Facebook login')}>
            <View style={[styles.socialBtn, { backgroundColor: '#121A30', borderColor: '#1E3A6E' }]}>
              <FacebookIcon size={20} />
              <Text style={[styles.socialBtnText, { color: '#5B9DFF' }]}>Tiếp tục với Facebook</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => logger.info('Apple login')}>
            <View style={[styles.socialBtn, { backgroundColor: '#1A1A2E', borderColor: '#3D3558' }]}>
              <AppleIcon size={20} />
              <Text style={styles.socialBtnText}>Tiếp tục với Apple</Text>
            </View>
          </Pressable>
        </View>

        {/* Register */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <Pressable onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoRow: { alignItems: 'center', marginBottom: 20 },

  title: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 28, fontStyle: 'italic', letterSpacing: 0.3 },

  form: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 27,
    backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#2E2848', paddingHorizontal: 20,
  },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: '#1E1438' },
  inputIconBox: { marginRight: 10 },
  inputText: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },

  forgotRow: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  errorBox: { backgroundColor: '#2A1520', borderRadius: 27, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1.5, borderColor: '#5A2030' },
  errorText: { color: COLORS.error, fontSize: 13 },

  primaryBtn: {
    height: 54, borderRadius: 27, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: '#B026FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  primaryBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { color: COLORS.textMuted, fontSize: 12 },

  socialList: { gap: 10 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 27, borderWidth: 1.5,
    borderColor: '#3D3558', backgroundColor: '#1A1A2E', paddingHorizontal: 20, gap: 12,
  },
  socialBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  registerText: { color: COLORS.textSecondary, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
