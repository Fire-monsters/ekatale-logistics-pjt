import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout, Atoms } from '../../theme';
import { useAppDispatch } from '../store/hooks';
import { otpRequested } from '../store/slices/authSlice';

type Nav = NativeStackNavigationProp<AuthStackParams>;

const COUNTRY_CODES = [
  { code: '256', flag: '🇺🇬', name: 'Uganda' },
  { code: '254', flag: '🇰🇪', name: 'Kenya' },
  { code: '255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '250', flag: '🇷🇼', name: 'Rwanda' },
];

export default function PhoneEntryScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const inputRef = useRef<TextInput>(null);

  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const isValid = phone.replace(/\s/g, '').length >= 9;

  const handleSubmit = () => {
    const clean = phone.replace(/\s/g, '');
    if (!isValid) { setError('Enter a valid phone number'); return; }
    dispatch(otpRequested(`+${country.code}${clean}`));
    navigation.navigate('OTPVerify', { phone: clean, countryCode: country.code });
  };

  const formatPhone = (raw: string) => {
    // Auto-format: 7XX XXX XXX
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0,3)} ${digits.slice(3)}`;
    return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
  };

  return (
    <KeyboardAvoidingView
      style={Atoms.screen}
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
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📱</Text>
          </View>
          <Text style={styles.title}>Enter your phone number</Text>
          <Text style={styles.subtitle}>We'll send a 6-digit code to verify it's you</Text>
        </View>

        {/* Phone input */}
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[styles.phoneRow, error ? styles.phoneRowError : null]}>
            {/* Country picker */}
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
              onChangeText={(v) => { setPhone(formatPhone(v)); setError(''); }}
              placeholder="7XX XXX XXX"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              autoFocus
              accessibilityLabel="Phone number"
              maxLength={11} // formatted: 3+1+3+1+3
            />
          </View>
          {error ? (
            <Text style={styles.errorText}>⚠ {error}</Text>
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
          style={[styles.cta, !isValid && styles.ctaDisabled]}
          onPress={handleSubmit}
          disabled={!isValid}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Send Verification Code →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('PhoneEntry')}
        >
          <Text style={styles.loginLinkText}>Already registered? Log in</Text>
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
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: Space.sm,
  },
  backText: {
    fontSize: Font.size.body,
    color: Colors.green,
    fontWeight: Font.weight.medium,
  },
  header: {
    alignItems: 'center',
    gap: Space.sm,
    paddingVertical: Space.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 36 },
  title: {
    fontSize: Font.size.heading,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Font.size.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Font.size.body * 1.5,
  },
  inputBlock: {
    gap: Space.xs,
  },
  inputLabel: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.semiBold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.surface,
    minHeight: Layout.touch.comfortable,
    overflow: 'hidden',
  },
  phoneRowError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: Layout.touch.comfortable,
  },
  flag: { fontSize: 22 },
  dialCode: {
    fontSize: 15,
    fontWeight: Font.weight.semiBold,
    color: Colors.textPrimary,
  },
  dividerV: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  phoneInput: {
    flex: 1,
    fontSize: Font.size.title,
    fontWeight: Font.weight.medium,
    color: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    letterSpacing: 1,
  },
  errorText: {
    fontSize: Font.size.caption,
    color: Colors.error,
    marginTop: 4,
  },
  hintText: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  privacyBox: {
    backgroundColor: Colors.greenLight,
    borderRadius: Layout.radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.greenBorder,
  },
  privacyText: {
    fontSize: Font.size.caption,
    color: Colors.green,
    textAlign: 'center',
    lineHeight: 18,
  },
  cta: {
    backgroundColor: Colors.green,
    borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: Space.sm,
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.green,
    textDecorationLine: 'underline',
  },
});
