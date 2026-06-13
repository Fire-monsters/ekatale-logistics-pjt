// apps/app1-farmer/src/screens/PhoneEntryScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { requestOtp, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';

type Nav   = NativeStackNavigationProp<AuthStackParams>;
type Route = RouteProp<AuthStackParams, 'PhoneEntry'>;

const COUNTRY_CODES = [
  { code: '256', flag: '🇺🇬', name: 'Uganda' },
  { code: '254', flag: '🇰🇪', name: 'Kenya' },
  { code: '255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '250', flag: '🇷🇼', name: 'Rwanda' },
];

export default function PhoneEntryScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const dispatch   = useAppDispatch();

  const { mode, role } = route.params;
  const isLogin        = mode === 'login';

  const loading = useAppSelector(selectAuthLoading);
  const apiError = useAppSelector(selectAuthError);

  const inputRef = useRef<TextInput>(null);
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [phone,   setPhone]   = useState('');
  const [error,   setError]   = useState('');

  const isValid = phone.replace(/\s/g, '').length >= 9;

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
    return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
  };

  const handleSubmit = async () => {
    const clean = phone.replace(/\s/g, '');
    if (!isValid) { setError('Enter a valid phone number'); return; }

    const fullPhone = `+${country.code}${clean}`;

    const result = await dispatch(requestOtp({
      phone:   fullPhone,
      purpose: mode,
      role:    role,
    }));

    if (requestOtp.rejected.match(result)) {
      setError(result.payload as string ?? 'Could not send code. Try again.');
      return;
    }

    navigation.navigate('OTPVerify', {
      countryCode: country.code,
      role,
    });
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
        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { dispatch(clearError()); navigation.goBack(); }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📱</Text>
          </View>
          <Text style={styles.title}>
            {isLogin ? 'Welcome back' : 'Enter your phone number'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "We'll send a code to verify it's you"
              : "We'll send a 6-digit code to verify your number"}
          </Text>
        </View>

        {/* Role badge (register mode only) */}
        {!isLogin && role && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {role === 'farmer' ? '🌾 Registering as Farmer' : '🧑‍💼 Registering as Field Agent'}
            </Text>
          </View>
        )}

        {/* Phone input */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.phoneRow, !!displayError && styles.phoneRowError]}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => {
                const idx = COUNTRY_CODES.findIndex(c => c.code === country.code);
                setCountry(COUNTRY_CODES[(idx + 1) % COUNTRY_CODES.length]);
              }}
              accessibilityLabel={`Country: ${country.name}`}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text style={styles.dialCode}>+{country.code}</Text>
            </TouchableOpacity>

            <View style={styles.dividerV} />

            <TextInput
              ref={inputRef}
              style={styles.phoneInput}
              value={phone}
              onChangeText={(v) => { setPhone(formatPhone(v)); setError(''); dispatch(clearError()); }}
              placeholder="7XX XXX XXX"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              autoFocus
              accessibilityLabel="Phone number"
              maxLength={11}
            />
          </View>

          {displayError ? (
            <Text style={styles.errorText}>⚠ {displayError}</Text>
          ) : (
            <Text style={styles.hintText}>ℹ Your number is kept private</Text>
          )}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            🔒 Protected under Uganda's Data Protection Act 2019
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (!isValid || loading) && styles.ctaDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.ctaText}>
              {isLogin ? 'Send Login Code →' : 'Send Verification Code →'}
            </Text>
          )}
        </TouchableOpacity>

        {isLogin && (
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('RoleSelect')}
          >
            <Text style={styles.registerLinkText}>New user? Register here</Text>
          </TouchableOpacity>
        )}
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
  subtitle: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center', lineHeight: Font.size.body * 1.5 },

  roleBadge: {
    backgroundColor: Colors.greenLight,
    borderRadius: Layout.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.greenBorder,
  },
  roleBadgeText: { fontSize: Font.size.label, color: Colors.green, fontWeight: Font.weight.semiBold },

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
  errorText:    { fontSize: Font.size.caption, color: Colors.error,    marginTop: 4 },
  hintText:     { fontSize: Font.size.caption, color: Colors.textMuted, marginTop: 4 },
  privacyBox:   { backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md, padding: 12, borderWidth: 0.5, borderColor: Colors.greenBorder },
  privacyText:  { fontSize: Font.size.caption, color: Colors.green, textAlign: 'center', lineHeight: 18 },
  cta: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  ctaDisabled:    { opacity: 0.45 },
  ctaText:        { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
  registerLink:   { alignItems: 'center', paddingVertical: Space.sm },
  registerLinkText:{ fontSize: 14, color: Colors.green, textDecorationLine: 'underline' },
});