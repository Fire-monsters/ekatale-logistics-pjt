/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import {
  sendRegistrationOtp,
  selectAuthLoading,
  selectAuthError,
  clearError,
  selectRegistrationDraft,
} from '../../store/slices/authSlice';
import { useFeedbackDialog } from 'src/providers/FeedbackDialogProvider';

type Nav   = NativeStackNavigationProp<AuthStackParams>;
type Route = RouteProp<AuthStackParams, 'PhonePassword'>;

const COUNTRY_CODES = [
  { code: '256', label: 'UG', name: 'Uganda' },
  { code: '254', label: 'KE', name: 'Kenya' },
  { code: '255', label: 'TZ', name: 'Tanzania' },
  { code: '250', label: 'RW', name: 'Rwanda' },
];

function StepIndicator({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[si.dot, i < current && { backgroundColor: color }]} />
      ))}
      <Text style={si.label}>Step {current} of {total}</Text>
    </View>
  );
}
const si = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:  { width: 28, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB' },
  label:{ fontSize: Font.size.caption, color: Colors.textMuted, marginLeft: 4 },
});

export default function PhonePasswordScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const dispatch   = useAppDispatch();
  const { role }   = route.params;

  const loading  = useAppSelector(selectAuthLoading);
  const apiError = useAppSelector(selectAuthError);
  const draft    = useAppSelector(selectRegistrationDraft);

  const { showSuccess, showError } = useFeedbackDialog();

  const isFarmer = role === 'farmer';
  const isShopper = role === 'consumer';
  const accentColor = isFarmer ? Colors.green : isShopper ? '#1565C0' : '#6A1B9A';
  const roleLabel = isFarmer ? 'Farmer' : isShopper ? 'Shopper' : 'Field Agent';
  const headerBadge = isFarmer ? 'F' : isShopper ? 'S' : 'VA';

  const [country,        setCountry]        = useState(COUNTRY_CODES[0]);
  const [phone,          setPhone]          = useState('');
  const [password,       setPassword]       = useState('');
  const [confirmPw,      setConfirmPw]      = useState('');
  const [showPw,         setShowPw]         = useState(false);
  const [showConfirmPw,  setShowConfirmPw]  = useState(false);
  const [payProvider,    setPayProvider]    = useState<'mtn' | 'airtel'>('mtn');
  const [payNumber,      setPayNumber]      = useState('');
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 9) e.phone = 'Enter a valid phone number';

    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    if (password !== confirmPw)           e.confirmPw = 'Passwords do not match';

    if (isFarmer) {
      const cleanPay = payNumber.replace(/\D/g, '');
      if (cleanPay.length < 9) e.payNumber = 'Enter your Mobile Money number';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isSubmittingRef = useRef(false)

  const handleSubmit = async () => {
      if (!validate()) return
      if (isSubmittingRef.current) return  // ← guard against double-tap
      isSubmittingRef.current = true

      dispatch(clearError());

    const fullPhone = `+${country.code}${phone.replace(/\s/g, '')}`;

    const payload: any = {
      phone:       fullPhone,
      password,
      fullName:    draft.fullName!,
      role,
      languagePref: 'en',
    };

    if (isFarmer) {
      Object.assign(payload, {
        nin:             draft.nin,
        district:        draft.district,
        village:         draft.village,
        farmSizeAcres:   draft.farmSizeAcres,
        cropsGrown:      draft.cropsGrown,
        gpsLat:          draft.gpsLat,
        gpsLng:          draft.gpsLng,
        paymentProvider: payProvider,
        paymentNumber:   payNumber.replace(/\D/g, ''),
      });
    } else if (!isShopper) {
      Object.assign(payload, {
        territoryDistrict: draft.territoryDistrict,
        territoryVillages: draft.territoryVillages,
      });
    }

    const result = await dispatch(sendRegistrationOtp(payload));

    if (sendRegistrationOtp.rejected.match(result)) {
      showError('Registration Failed',
        (result.payload as string) ?? 'Please check your details and try again.');
      isSubmittingRef.current = false;
      return;
    }

    navigation.navigate('OTPVerify', {
      countryCode: country.code,
      role,
    });

    isSubmittingRef.current = false

  };

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
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerBlock}>
          <View style={[styles.pageBadge, { borderColor: accentColor }]}>
            <Text style={[styles.pageBadgeText, { color: accentColor }]}>{headerBadge}</Text>
          </View>
          <Text style={styles.pageTitle}>Phone &amp; Password</Text>
          <Text style={styles.pageSubtitle}>
            {`Creating ${roleLabel.toLowerCase()} account for ${draft.fullName ?? roleLabel}`}
          </Text>
        </View>

        <StepIndicator current={2} total={3} color={accentColor} />

        {/* Phone input */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone Number <Text style={styles.req}>*</Text></Text>
          <View style={[styles.phoneRow, !!errors.phone && styles.inputError]}>
            <TouchableOpacity
              style={styles.countryBtn}
              onPress={() => {
                const idx = COUNTRY_CODES.findIndex((c) => c.code === country.code);
                setCountry(COUNTRY_CODES[(idx + 1) % COUNTRY_CODES.length]);
              }}
            >
              <Text style={styles.countryLabel}>{country.label}</Text>
              <Text style={styles.dialCode}>+{country.code}</Text>
            </TouchableOpacity>
            <View style={styles.dividerV} />
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(v) => { setPhone(formatPhone(v)); setErrors((e) => ({ ...e, phone: '' })); }}
              placeholder="7XX XXX XXX"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="phone-pad"
              maxLength={11}
              autoFocus
            />
          </View>
          {errors.phone ? <Text style={styles.error}>{errors.phone}</Text>
            : <Text style={styles.hint}>This becomes your login number</Text>}
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Create Password <Text style={styles.req}>*</Text></Text>
          <View style={[styles.pwRow, !!errors.password && styles.inputError]}>
            <TextInput
              style={styles.pwInput}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
              placeholder="At least 6 characters"
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry={!showPw}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPw((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeIcon}>{showPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
        </View>

        {/* Confirm password */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password <Text style={styles.req}>*</Text></Text>
          <View style={[styles.pwRow, !!errors.confirmPw && styles.inputError]}>
            <TextInput
              style={styles.pwInput}
              value={confirmPw}
              onChangeText={(v) => { setConfirmPw(v); setErrors((e) => ({ ...e, confirmPw: '' })); }}
              placeholder="Re-enter your password"
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry={!showConfirmPw}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPw((v) => !v)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeIcon}>{showConfirmPw ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPw ? <Text style={styles.error}>{errors.confirmPw}</Text> : null}
        </View>

        {/* Payment — only for farmers */}
        {isFarmer && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Mobile Money Provider <Text style={styles.req}>*</Text></Text>
              <Text style={styles.hint}>Payments for your produce will be sent here</Text>
              <View style={styles.payRow}>
                {([
                  { key: 'mtn',    label: 'MTN MoMo',    color: '#F9C80E' },
                  { key: 'airtel', label: 'Airtel Money', color: '#E53935' },
                ] as const).map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.payCard, payProvider === p.key && styles.payCardActive]}
                    onPress={() => setPayProvider(p.key)}
                  >
                    <View style={[styles.payDot, { backgroundColor: p.color }]} />
                    <Text style={[styles.payLabel, payProvider === p.key && styles.payLabelActive]}>
                      {p.label}
                    </Text>
                    {payProvider === p.key && (
                      <View style={styles.payCheck}>
                        <Text style={styles.payCheckText}>OK</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mobile Money Number <Text style={styles.req}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.payNumber && styles.inputError]}
                value={payNumber}
                onChangeText={(v) => { setPayNumber(v); setErrors((e) => ({ ...e, payNumber: '' })); }}
                placeholder="0770 000 000"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="phone-pad"
              />
              {errors.payNumber
                ? <Text style={styles.error}>{errors.payNumber}</Text>
                : <Text style={styles.hint}>Must match your selected provider</Text>
              }
            </View>
          </>
        )}

        {/* API error */}
        {apiError && (
          <View style={styles.apiErrorBox}>
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        )}

        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>
            An OTP will be sent to your phone to verify this number.
            Protected under Uganda's Data Protection Act 2019.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: accentColor }, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={styles.submitBtnText}>Create Account &amp; Send OTP →</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: Layout.safePadding,
    paddingTop: Space.sm,
    gap: Space.md,
    paddingBottom: 40,
    backgroundColor: Colors.surface,
  },
  backBtn:  { alignSelf: 'flex-start', paddingVertical: Space.sm },
  backText: { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },

  headerBlock:  { alignItems: 'center', gap: 6, paddingVertical: Space.sm },
  pageBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  pageBadgeText: { fontSize: 20, fontWeight: Font.weight.bold },
  pageTitle:    { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  pageSubtitle: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center' },

  field: { gap: 6 },
  label: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textSecondary },
  req:   { color: Colors.error },
  hint:  { fontSize: Font.size.caption, color: Colors.textMuted },
  error: { fontSize: Font.size.caption, color: Colors.error },

  input: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: Font.size.body, color: Colors.textPrimary,
    minHeight: Layout.touch.comfortable, backgroundColor: Colors.bg,
  },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },

  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md, backgroundColor: Colors.surface,
    minHeight: Layout.touch.comfortable, overflow: 'hidden',
  },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 14,
    minHeight: Layout.touch.comfortable,
  },
  countryLabel: { fontSize: 13, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  dialCode: { fontSize: 14, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  dividerV: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  phoneInput: {
    flex: 1, fontSize: Font.size.title, fontWeight: Font.weight.medium,
    color: Colors.textPrimary, paddingHorizontal: 12, paddingVertical: 12, letterSpacing: 1,
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
  eyeIcon: { fontSize: 13, fontWeight: Font.weight.semiBold, color: Colors.green },

  payRow: { flexDirection: 'row', gap: 12 },
  payCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md, backgroundColor: Colors.bg,
  },
  payCardActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  payDot:        { width: 14, height: 14, borderRadius: 7 },
  payLabel:      { flex: 1, fontSize: 13, fontWeight: Font.weight.medium, color: Colors.textMuted },
  payLabelActive:{ color: Colors.green },
  payCheck:      { minWidth: 24, height: 20, borderRadius: 10, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  payCheckText:  { fontSize: 10, color: Colors.textInverse, fontWeight: Font.weight.bold },

  apiErrorBox:  { backgroundColor: Colors.errorLight, borderRadius: Layout.radius.md, padding: 12, borderWidth: 1, borderColor: Colors.error },
  apiErrorText: { fontSize: Font.size.label, color: Colors.error, textAlign: 'center' },

  privacyBox: { backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md, padding: 12, borderWidth: 0.5, borderColor: Colors.greenBorder },
  privacyText:{ fontSize: Font.size.caption, color: Colors.green, textAlign: 'center', lineHeight: 18 },

  submitBtn: {
    borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Space.sm,
  },
  btnDisabled:   { opacity: 0.5 },
  submitBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
});
