// apps/app1-farmer/src/screens/auth/LoginScreen.tsx
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loginWithCredentials,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from '../../store/slices/authSlice';

type Nav = NativeStackNavigationProp<AuthStackParams>;

const COUNTRY_CODES = [
  { code: '256', flag: '🇺🇬', name: 'Uganda' },
  { code: '254', flag: '🇰🇪', name: 'Kenya' },
  { code: '255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '250', flag: '🇷🇼', name: 'Rwanda' },
];

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();

  const loading  = useAppSelector(selectAuthLoading);
  const apiError = useAppSelector(selectAuthError);

  const [country,  setCountry]  = useState(COUNTRY_CODES[0]);
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const handleSubmit = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 9) { setError('Enter a valid phone number'); return; }
    if (!password) { setError('Enter your password'); return; }

    const fullPhone = `+${country.code}${cleanPhone}`;
    const result = await dispatch(loginWithCredentials({ phone: fullPhone, password }));

    if (loginWithCredentials.rejected.match(result)) {
      setError(result.payload as string ?? 'Login failed. Try again.');
      return;
    }

    navigation.navigate('OTPVerify', { countryCode: country.code, role: 'farmer' });
  };

  const displayError = error || apiError || '';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { dispatch(clearError()); navigation.goBack(); }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>👋</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to your E-Katale account</Text>
        </View>

        {/* Phone */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.phoneRow, !!displayError && styles.phoneRowError]}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => {
                const idx = COUNTRY_CODES.findIndex((c) => c.code === country.code);
                setCountry(COUNTRY_CODES[(idx + 1) % COUNTRY_CODES.length]);
              }}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={styles.dialCode}>+{country.code}</Text>
            </TouchableOpacity>
            <View style={styles.dividerV} />
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(v) => { setPhone(formatPhone(v)); setError(''); dispatch(clearError()); }}
              placeholder="7XX XXX XXX"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="phone-pad"
              maxLength={11}
              autoFocus
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.pwRow, !!displayError && styles.phoneRowError]}>
            <TextInput
              style={styles.pwInput}
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); dispatch(clearError()); }}
              placeholder="Enter your password"
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={() => setShowPw((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {displayError ? <Text style={styles.errorText}>⚠ {displayError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.cta, loading && styles.ctaDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.ctaText}>Send Login Code →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('RoleSelect')}
        >
          <Text style={styles.registerLinkText}>New user? Register here</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: Colors.surface,
    padding: Layout.safePadding,
    paddingTop: Space.sm,
    gap: Space.lg,
  },
  backBtn:  { alignSelf: 'flex-start', paddingVertical: Space.sm },
  backText: { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },
  header:   { alignItems: 'center', gap: Space.sm, paddingVertical: Space.md },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 36 },
  title:    { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center' },

  inputBlock: { gap: Space.xs },
  inputLabel: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textSecondary, marginBottom: 2 },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md, backgroundColor: Colors.surface,
    minHeight: Layout.touch.comfortable, overflow: 'hidden',
  },
  phoneRowError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 14,
    minHeight: Layout.touch.comfortable,
  },
  flag:     { fontSize: 22 },
  dialCode: { fontSize: 15, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  dividerV: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  phoneInput: {
    flex: 1, fontSize: Font.size.title, fontWeight: Font.weight.medium,
    color: Colors.textPrimary, paddingHorizontal: 14, paddingVertical: 12, letterSpacing: 1,
  },

  pwRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md, backgroundColor: Colors.bg,
    minHeight: Layout.touch.comfortable, overflow: 'hidden',
  },
  pwInput: {
    flex: 1, fontSize: Font.size.body, color: Colors.textPrimary,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  eyeBtn:  { paddingRight: 14, paddingLeft: 8 },
  eyeIcon: { fontSize: 18 },
  errorText: { fontSize: Font.size.caption, color: Colors.error, marginTop: 4 },

  cta: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText:     { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
  registerLink:     { alignItems: 'center', paddingVertical: Space.sm },
  registerLinkText: { fontSize: 14, color: Colors.green, textDecorationLine: 'underline' },
});