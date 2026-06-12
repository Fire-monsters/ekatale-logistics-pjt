// apps/app1-farmer/src/screens/auth/OTPVerifyScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp }                from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams }           from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout }    from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  verifyOtp,
  requestOtp,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from '../../store/slices/authSlice';

type Nav   = NativeStackNavigationProp<AuthStackParams>;
type Route = RouteProp<AuthStackParams, 'OTPVerify'>;

const N               = 6;
const RESEND_SECONDS  = 60;

export default function OTPVerifyScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const dispatch   = useAppDispatch();

  const { phone, countryCode, mode, role } = route.params;
  const fullPhone  = `+${countryCode}${phone}`;
  const maskedPhone = `+${countryCode} ${phone.slice(0, 3)}*** ${phone.slice(-3)}`;

  const loading  = useAppSelector(selectAuthLoading);
  const apiError = useAppSelector(selectAuthError);

  const [digits,   setDigits]   = useState<string[]>(Array(N).fill(''));
  const [focused,  setFocused]  = useState(0);
  const [error,    setError]    = useState('');
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const refs = useRef<(TextInput | null)[]>([]);

  // Countdown for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const setDigit = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    // Handle paste of full 6-digit code
    if (clean.length > 1) {
      const arr  = clean.slice(0, N).split('');
      const next = Array(N).fill('');
      arr.forEach((d, i) => { next[i] = d; });
      setDigits(next);
      refs.current[Math.min(arr.length, N - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[idx]  = clean;
    setDigits(next);
    setError('');
    dispatch(clearError());
    if (clean && idx < N - 1) refs.current[idx + 1]?.focus();
  };

  const handleBackspace = (idx: number) => {
    if (!digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = digits.join('');
    if (code.length < N) { setError('Enter all 6 digits'); return; }
    Keyboard.dismiss();

    const result = await dispatch(verifyOtp({ phone: fullPhone, code, mode }));

    if (verifyOtp.rejected.match(result)) {
      setError(result.payload as string ?? 'Invalid or expired code');
      // Clear digits so user can retype
      setDigits(Array(N).fill(''));
      refs.current[0]?.focus();
      return;
    }

    // Success:
    // • LOGIN mode  → isAuthenticated=true in Redux → RootNavigator auto-switches
    // • REGISTER mode → navigate to the correct profile setup screen
    if (mode === 'register') {
      if (role === 'village_agent') {
        navigation.navigate('AgentRegister', { phone, countryCode });
      } else {
        navigation.navigate('FarmerRegister', { phone, countryCode });
      }
    }
    // Login: no navigation needed — Redux state change triggers RootNavigator swap
  }, [digits, dispatch, fullPhone, mode, navigation, phone, countryCode, role]);

  // Auto-submit once all 6 digits filled
  useEffect(() => {
    if (digits.every((d) => d) && !loading) handleVerify();
  }, [digits, handleVerify, loading]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    setDigits(Array(N).fill(''));
    setError('');
    dispatch(clearError());
    refs.current[0]?.focus();
    await dispatch(requestOtp({ phone: fullPhone, purpose: mode, role }));
  };

  const displayError = error || apiError || '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity
          style={styles.back}
          onPress={() => { dispatch(clearError()); navigation.goBack(); }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← Edit number</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>💬</Text>
          </View>

          <Text style={styles.title}>Check your messages</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
          </Text>

          {/* Mode badge */}
          <View style={[
            styles.modeBadge,
            mode === 'login'
              ? { backgroundColor: '#E3F2FD', borderColor: '#90CAF9' }
              : { backgroundColor: Colors.greenLight, borderColor: Colors.greenBorder },
          ]}>
            <Text style={[
              styles.modeBadgeText,
              { color: mode === 'login' ? '#1565C0' : Colors.green },
            ]}>
              {mode === 'login' ? '🔑 Logging in' : '✨ Creating account'}
            </Text>
          </View>

          {/* OTP boxes */}
          <View style={styles.boxRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => { refs.current[i] = r; }}
                style={[
                  styles.box,
                  focused === i && styles.boxFocused,
                  d             && styles.boxFilled,
                  !!displayError && styles.boxError,
                ]}
                value={d}
                onChangeText={(v) => setDigit(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(i);
                }}
                onFocus={() => setFocused(i)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                caretHidden
                textContentType="oneTimeCode"
                accessibilityLabel={`Digit ${i + 1} of ${N}`}
              />
            ))}
          </View>

          {/* Error */}
          {!!displayError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {displayError}</Text>
            </View>
          )}

          {/* Resend */}
          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0}>
            <Text style={[styles.resend, cooldown > 0 && styles.resendWaiting]}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code →'}
            </Text>
          </TouchableOpacity>

          {/* Verify button */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (loading || digits.join('').length < N) && styles.verifyBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading || digits.join('').length < N}
          >
            {loading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={styles.verifyBtnText}>
                  {mode === 'login' ? 'Verify & Log In' : 'Verify & Continue'}
                </Text>
            }
          </TouchableOpacity>

          {/* Voice fallback */}
          <TouchableOpacity style={styles.voiceBtn}>
            <Text style={styles.voiceBtnText}>🔊 Call me with the code instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const BOX_SIZE = 52;

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.surface,
    paddingHorizontal: Layout.safePadding, paddingTop: Space.sm,
  },
  back:     { alignSelf: 'flex-start', paddingVertical: Space.sm },
  backText: { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },
  content:  { flex: 1, alignItems: 'center', paddingTop: Space.xl, gap: Space.md },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center',
  },
  icon:     { fontSize: 40 },
  title:    { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center', lineHeight: Font.size.body * 1.6 },
  phoneHighlight: { color: Colors.green, fontWeight: Font.weight.bold },

  modeBadge: {
    borderRadius: Layout.radius.pill, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  modeBadgeText: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold },

  boxRow:   { flexDirection: 'row', gap: 10, marginVertical: Space.sm },
  box: {
    width: BOX_SIZE, height: BOX_SIZE + 8,
    borderWidth: 2.5, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    fontSize: 28, fontWeight: Font.weight.bold, color: Colors.textPrimary,
    textAlign: 'center', backgroundColor: Colors.bg,
  },
  boxFocused: { borderColor: Colors.green, backgroundColor: '#FAFFFE' },
  boxFilled:  { borderColor: Colors.green, color: Colors.green, backgroundColor: Colors.greenLight },
  boxError:   { borderColor: Colors.error, backgroundColor: Colors.errorLight },

  errorBox:  { backgroundColor: Colors.errorLight, borderRadius: Layout.radius.md, paddingVertical: 10, paddingHorizontal: 16, width: '100%' },
  errorText: { fontSize: Font.size.label, color: Colors.error, textAlign: 'center', fontWeight: Font.weight.medium },

  resend:        { fontSize: Font.size.body, color: Colors.info, fontWeight: Font.weight.medium, textDecorationLine: 'underline' },
  resendWaiting: { color: Colors.textDisabled, textDecorationLine: 'none' },

  verifyBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  verifyBtnDisabled: { opacity: 0.4 },
  verifyBtnText:     { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },

  voiceBtn: {
    borderWidth: 2, borderColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.minimum, paddingHorizontal: Space.lg,
    alignItems: 'center', justifyContent: 'center', width: '100%',
  },
  voiceBtnText: { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },
});
