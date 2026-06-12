// apps/app1-farmer/src/screens/FarmerRegisterScreen.tsx
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp }                from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams }           from '../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout, getCropEmoji } from '@styles/global';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  completeRegistration,
  selectAuthLoading,
  selectAuthError,
  clearError,
  selectPendingPhone,
} from '../store/slices/authSlice';
import { getCurrentLocation } from '../utils/permissions';
import { DISTRICTS_MVP }      from '../constants';

type Nav   = NativeStackNavigationProp<AuthStackParams>;
type Route = RouteProp<AuthStackParams, 'FarmerRegister'>;

const CROPS = [
  { id: 'maize',        label: 'Maize'        },
  { id: 'beans',        label: 'Beans'        },
  { id: 'cassava',      label: 'Cassava'      },
  { id: 'matooke',      label: 'Matooke'      },
  { id: 'sweet_potato', label: 'Sweet Potato' },
  { id: 'groundnuts',   label: 'Groundnuts'   },
  { id: 'sorghum',      label: 'Sorghum'      },
  { id: 'vegetables',   label: 'Vegetables'   },
  { id: 'tomatoes',     label: 'Tomatoes'     },
  { id: 'coffee',       label: 'Coffee'       },
];

function StepBar({ step }: { step: number }) {
  return (
    <View style={GS.stepBar}>
      {[1, 2].map((n) => (
        <React.Fragment key={n}>
          <View style={[GS.stepCircle, step >= n && GS.stepCircleActive]}>
            <Text style={[GS.stepNum, step >= n && GS.stepNumActive]}>{n}</Text>
          </View>
          {n < 2 && <View style={[GS.stepLine, step >= 2 && GS.stepLineActive]} />}
        </React.Fragment>
      ))}
      <Text style={s.stepLabel}>Step {step} of 2</Text>
    </View>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={GS.fieldLabel}>
      {label}
      {required && <Text style={{ color: Colors.error }}> *</Text>}
    </Text>
  );
}

export default function FarmerRegisterScreen() {
  const navigation    = useNavigation<Nav>();
  const route         = useRoute<Route>();
  const dispatch      = useAppDispatch();

  const loading       = useAppSelector(selectAuthLoading);
  const apiError      = useAppSelector(selectAuthError);
  // Phone comes from route params OR from Redux pendingPhone (set during OTP verify)
  const pendingPhone  = useAppSelector(selectPendingPhone);
  const rawPhone      = route.params?.phone ?? '';
  const countryCode   = route.params?.countryCode ?? '256';
  const fullPhone     = `+${countryCode}${rawPhone}` || pendingPhone || '';

  const [step,       setStep]       = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Step 1 fields
  const [fullName,  setFullName]  = useState('');
  const [nin,       setNin]       = useState('');
  const [district,  setDistrict]  = useState('');
  const [farmSize,  setFarmSize]  = useState('');
  const [gps,       setGps]       = useState<{ lat: number; lng: number } | null>(null);

  // Step 2 fields
  const [crops,       setCrops]       = useState<string[]>([]);
  const [payProvider, setPayProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [payNumber,   setPayNumber]   = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCrop = (id: string) =>
    setCrops((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) e.fullName = 'Enter your full name';
    if (!nin.trim()      || nin.trim().length < 10)     e.nin      = 'Enter your full National ID';
    if (!district)                                       e.district = 'Select your district';
    if (!farmSize || parseFloat(farmSize) <= 0)          e.farmSize = 'Enter your farm size';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (crops.length === 0)                                         e.crops     = 'Select at least one crop';
    if (!payNumber.trim() || payNumber.replace(/\D/g, '').length < 9) e.payNumber = 'Enter your Mobile Money number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGPS = async () => {
    setGpsLoading(true);
    const loc = await getCurrentLocation();
    if (loc) setGps(loc);
    else Alert.alert('Location', 'Could not get GPS. You can set it later.');
    setGpsLoading(false);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    const result = await dispatch(
      completeRegistration({
        phone:           fullPhone,
        fullName:        fullName.trim(),
        role:            'farmer',
        district,
        village:         '',
        farmSizeAcres:   parseFloat(farmSize) || 0,
        cropsGrown:      crops,
        paymentProvider: payProvider,
        paymentNumber:   payNumber.replace(/\s/g, ''),
        gpsLat:          gps?.lat,
        gpsLng:          gps?.lng,
      }),
    );

    if (completeRegistration.rejected.match(result)) {
      Alert.alert(
        'Registration Failed',
        (result.payload as string) ?? 'Please try again.',
      );
    }
    // On success: Redux isAuthenticated → true → RootNavigator auto-switches to FarmerNavigator
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={s.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={GS.back}
        onPress={() => (step > 1 ? setStep(1) : navigation.goBack())}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={GS.backText}>← {step > 1 ? 'Back' : 'Cancel'}</Text>
      </TouchableOpacity>

      <Text style={GS.screenTitle}>🌾 Farmer Account Setup</Text>
      <StepBar step={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <View style={GS.form}>
          {/* Full name */}
          <View style={GS.field}>
            <FieldLabel label="Full Name" required />
            <TextInput
              style={[GS.input, errors.fullName && GS.inputError]}
              value={fullName}
              onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: '' })); }}
              placeholder="e.g. Amina Nakato"
              placeholderTextColor={Colors.textDisabled}
              autoCapitalize="words"
            />
            {errors.fullName ? <Text style={GS.fieldError}>{errors.fullName}</Text> : null}
          </View>

          {/* NIN */}
          <View style={GS.field}>
            <FieldLabel label="National ID (NIN)" required />
            <TextInput
              style={[GS.input, errors.nin && GS.inputError]}
              value={nin}
              onChangeText={(v) => { setNin(v.toUpperCase()); setErrors((e) => ({ ...e, nin: '' })); }}
              placeholder="CM92010050CXKJ"
              placeholderTextColor={Colors.textDisabled}
              autoCapitalize="characters"
            />
            {errors.nin ? <Text style={GS.fieldError}>{errors.nin}</Text> : null}
          </View>

          {/* District */}
          <View style={GS.field}>
            <FieldLabel label="Your District" required />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={GS.chipRow}>
                {DISTRICTS_MVP.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[GS.chip, district === d && GS.chipActive]}
                    onPress={() => { setDistrict(d); setErrors((e) => ({ ...e, district: '' })); }}
                  >
                    <Text style={[GS.chipText, district === d && GS.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {errors.district ? <Text style={GS.fieldError}>{errors.district}</Text> : null}
          </View>

          {/* Farm size */}
          <View style={GS.field}>
            <FieldLabel label="Farm Size (acres)" required />
            <View style={s.sizeRow}>
              <TouchableOpacity
                style={s.sizeBtn}
                onPress={() => setFarmSize((v) => String(Math.max(0, parseFloat(v || '0') - 0.5)))}
              >
                <Text style={s.sizeBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[s.sizeInput, errors.farmSize && GS.inputError]}
                value={farmSize}
                onChangeText={(v) => { setFarmSize(v); setErrors((e) => ({ ...e, farmSize: '' })); }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textDisabled}
                textAlign="center"
              />
              <TouchableOpacity
                style={s.sizeBtn}
                onPress={() => setFarmSize((v) => String(parseFloat(v || '0') + 0.5))}
              >
                <Text style={s.sizeBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={s.sizeUnit}>acres</Text>
            </View>
            {errors.farmSize ? <Text style={GS.fieldError}>{errors.farmSize}</Text> : null}
          </View>

          {/* GPS */}
          <View style={GS.field}>
            <FieldLabel label="Farm Location (GPS)" />
            <TouchableOpacity
              style={[s.gpsBtn, !!gps && s.gpsBtnActive]}
              onPress={handleGPS}
              disabled={gpsLoading}
            >
              {gpsLoading ? <ActivityIndicator size="small" color={Colors.green} /> : <Text style={s.gpsIcon}>📍</Text>}
              <Text style={[s.gpsBtnText, !!gps && s.gpsBtnTextActive]}>
                {gpsLoading ? 'Detecting...' : gps ? 'GPS set ✓' : 'Use my GPS location'}
              </Text>
            </TouchableOpacity>
            <Text style={GS.fieldHint}>Helps match you with nearby buyers</Text>
          </View>

          <TouchableOpacity style={s.nextBtn} onPress={() => validateStep1() && setStep(2)}>
            <Text style={s.nextBtnText}>Next — Choose Crops →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <View style={GS.form}>
          {/* Crops */}
          <View style={GS.field}>
            <FieldLabel label="Crops You Grow" required />
            <Text style={GS.fieldHint}>Select all that apply</Text>
            <View style={s.cropsGrid}>
              {CROPS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.cropCard, crops.includes(c.id) && s.cropCardActive]}
                  onPress={() => { toggleCrop(c.id); setErrors((e) => ({ ...e, crops: '' })); }}
                >
                  <Text style={s.cropEmoji}>{getCropEmoji(c.id)}</Text>
                  <Text style={[s.cropLabel, crops.includes(c.id) && s.cropLabelActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.crops ? <Text style={GS.fieldError}>{errors.crops}</Text> : null}
          </View>

          {/* Mobile Money provider */}
          <View style={GS.field}>
            <FieldLabel label="Mobile Money Provider" required />
            <View style={s.payRow}>
              {([
                { key: 'mtn',    label: 'MTN MoMo',      emoji: '🟡' },
                { key: 'airtel', label: 'Airtel Money',   emoji: '🔴' },
              ] as const).map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[s.payCard, payProvider === p.key && s.payCardActive]}
                  onPress={() => setPayProvider(p.key)}
                >
                  <Text style={s.payEmoji}>{p.emoji}</Text>
                  <Text style={[s.payLabel, payProvider === p.key && s.payLabelActive]}>{p.label}</Text>
                  {payProvider === p.key && (
                    <View style={s.payCheck}><Text style={s.payCheckText}>✓</Text></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={GS.field}>
            <FieldLabel label="Mobile Money Number" required />
            <TextInput
              style={[GS.input, errors.payNumber && GS.inputError]}
              value={payNumber}
              onChangeText={(v) => { setPayNumber(v); setErrors((e) => ({ ...e, payNumber: '' })); }}
              placeholder="0770 000 000"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="phone-pad"
            />
            {errors.payNumber
              ? <Text style={GS.fieldError}>{errors.payNumber}</Text>
              : <Text style={GS.fieldHint}>Payments will be sent to this number</Text>
            }
          </View>

          {/* API error */}
          {apiError && (
            <View style={s.apiErrorBox}>
              <Text style={s.apiErrorText}>⚠ {apiError}</Text>
            </View>
          )}

          {/* Support */}
          <View style={s.supportBox}>
            <Text style={s.supportText}>📞 Need help? Call your E-Katale field agent</Text>
            <Text style={s.supportPhone}>0800-100-200 (Free)</Text>
          </View>

          <TouchableOpacity
            style={[s.nextBtn, loading && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.textInverse} />
              : <Text style={s.nextBtnText}>✅ Complete Registration</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    padding: Layout.safePadding, paddingTop: Space.sm,
    gap: Space.md, backgroundColor: Colors.surface,
  },
  stepLabel: { fontSize: Font.size.caption, color: Colors.textMuted, marginLeft: 8 },

  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sizeBtn: {
    width: 52, height: 52, borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg, borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  sizeBtnText: { fontSize: 26, color: Colors.textPrimary, fontWeight: Font.weight.medium, lineHeight: 30 },
  sizeInput: {
    flex: 1, borderWidth: 2, borderColor: Colors.green, borderRadius: Layout.radius.md,
    fontSize: 22, fontWeight: Font.weight.bold, color: Colors.textPrimary,
    height: 52, backgroundColor: '#FAFFFE',
  },
  sizeUnit: { fontSize: Font.size.body, color: Colors.textMuted, fontWeight: Font.weight.medium },

  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    padding: 14, minHeight: Layout.touch.comfortable, backgroundColor: Colors.bg,
  },
  gpsBtnActive:     { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  gpsIcon:          { fontSize: 22 },
  gpsBtnText:       { flex: 1, fontSize: Font.size.body, fontWeight: Font.weight.medium, color: Colors.textSecondary },
  gpsBtnTextActive: { color: Colors.green },

  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  cropCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: Layout.radius.pill, borderWidth: 2, borderColor: Colors.greenBorder,
    backgroundColor: Colors.bg,
  },
  cropCardActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  cropEmoji:      { fontSize: 18 },
  cropLabel:      { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textSecondary },
  cropLabelActive:{ color: Colors.textInverse },

  payRow: { flexDirection: 'row', gap: 12 },
  payCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md, backgroundColor: Colors.bg,
  },
  payCardActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  payEmoji:      { fontSize: 22 },
  payLabel:      { flex: 1, fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textMuted },
  payLabelActive:{ color: Colors.green },
  payCheck:      { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
  payCheckText:  { fontSize: 12, color: Colors.textInverse, fontWeight: Font.weight.bold },

  apiErrorBox:  { backgroundColor: Colors.errorLight, borderRadius: Layout.radius.md, padding: 12, borderWidth: 1, borderColor: Colors.error },
  apiErrorText: { fontSize: Font.size.label, color: Colors.error, textAlign: 'center' },

  supportBox: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, gap: 2, borderWidth: 0.5, borderColor: Colors.greenBorder,
  },
  supportText:  { fontSize: Font.size.label, color: Colors.green },
  supportPhone: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },

  nextBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  nextBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
});
