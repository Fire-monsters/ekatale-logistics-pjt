import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Keyboard, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout, Atoms } from '@styles/global';

type Nav = NativeStackNavigationProp<AuthStackParams>;
type Route = RouteProp<AuthStackParams, 'OTPVerify'>;

const N = 6; // OTP length
const RESEND_SECONDS = 60;

export default function OTPVerifyScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone, countryCode } = route.params;

  const [digits, setDigits] = useState<string[]>(Array(N).fill(''));
  const [focused, setFocused] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  const refs = useRef<(TextInput | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const setDigit = (idx: number, val: string) => {
    // Handle paste of full code
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      const arr = clean.slice(0, N).split('');
      const next = [...Array(N).fill('')];
      arr.forEach((d, i) => { next[i] = d; });
      setDigits(next);
      const focusIdx = Math.min(arr.length, N - 1);
      refs.current[focusIdx]?.focus();
      return;
    }
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError('');
    if (clean && idx < N - 1) refs.current[idx + 1]?.focus();
  };

  const handleBackspace = (idx: number) => {
    if (!digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = useCallback(() => {
    const code = digits.join('');
    if (code.length < N) { setError('Enter all 6 digits'); return; }
    Keyboard.dismiss();
    // Static flow: treat every login as a new user going to profile setup.
    navigation.navigate('FarmerRegister', { phone });
  }, [digits, phone, navigation]);

  // Auto-submit when all digits entered
  useEffect(() => {
    if (digits.every(d => d) && !loading) handleVerify();
  }, [digits, handleVerify, loading]);

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    setDigits(Array(N).fill(''));
    setError('');
    refs.current[0]?.focus();
  };

  const maskedPhone = `+${countryCode} ${phone.slice(0, 3)}*** ${phone.slice(-3)}`;

  return (
    <KeyboardAvoidingView
      style={[Atoms.screen, { backgroundColor: Colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={GS.back}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={GS.backText}>← Edit number</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={GS.iconCircle}>
            <Text style={styles.icon}>💬</Text>
          </View>

          <Text style={[GS.screenTitle, { textAlign: 'center' }]}>Check your messages</Text>
          <Text style={GS.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={GS.greenText}>{maskedPhone}</Text>
          </Text>

          {/* OTP boxes */}
          <View style={styles.boxRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={r => { refs.current[i] = r; }}
                style={[
                  styles.box,
                  focused === i && styles.boxFocused,
                  d ? styles.boxFilled : null,
                  !!error && styles.boxError,
                ]}
                value={d}
                onChangeText={v => setDigit(i, v)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(i);
                }}
                onFocus={() => setFocused(i)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                caretHidden
                textContentType="oneTimeCode" // iOS SMS autofill
                accessibilityLabel={`Digit ${i + 1} of ${N}`}
              />
            ))}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Resend */}
          <TouchableOpacity onPress={handleResend} disabled={cooldown > 0}>
            <Text style={[styles.resend, cooldown > 0 && styles.resendWaiting]}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.verifyBtn, (loading || digits.join('').length < N) && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={loading || digits.join('').length < N}
          >
            <Text style={styles.verifyBtnText}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

          {/* Voice option */}
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
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Layout.safePadding,
    paddingTop: Space.sm,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Space.xl,
    gap: Space.md,
  },
  icon: { fontSize: 40 },
  boxRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: Space.sm,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderWidth: 2.5,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    fontSize: 28,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    backgroundColor: Colors.bg,
  },
  boxFocused: {
    borderColor: Colors.green,
    backgroundColor: '#FAFFFE',
  },
  boxFilled: {
    borderColor: Colors.green,
    color: Colors.green,
    backgroundColor: Colors.greenLight,
  },
  boxError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    borderRadius: Layout.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  errorText: {
    fontSize: Font.size.label,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: Font.weight.medium,
  },
  resend: {
    fontSize: Font.size.body,
    color: Colors.info,
    fontWeight: Font.weight.medium,
    textDecorationLine: 'underline',
  },
  resendWaiting: {
    color: Colors.textDisabled,
    textDecorationLine: 'none',
  },
  verifyBtn: {
    backgroundColor: Colors.green,
    borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  verifyBtnDisabled: {
    opacity: 0.4,
  },
  verifyBtnText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  voiceBtn: {
    borderWidth: 2,
    borderColor: Colors.green,
    borderRadius: Layout.radius.md,
    minHeight: Layout.touch.minimum,
    paddingHorizontal: Space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  voiceBtnText: {
    fontSize: Font.size.body,
    color: Colors.green,
    fontWeight: Font.weight.medium,
  },
});
