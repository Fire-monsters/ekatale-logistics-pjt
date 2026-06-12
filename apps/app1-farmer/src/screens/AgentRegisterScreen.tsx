// apps/app1-farmer/src/screens/auth/AgentRegisterScreen.tsx
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
import { GS, Colors, Font, Space, Layout } from '@styles/global';
import { useAppDispatch, useAppSelector }  from '../store/hooks';
import {
  completeRegistration,
  selectAuthLoading,
  selectAuthError,
  clearError,
  selectPendingPhone,
} from '../store/slices/authSlice';
import { DISTRICTS_MVP } from '../constants';

type Nav   = NativeStackNavigationProp<AuthStackParams>;
type Route = RouteProp<AuthStackParams, 'AgentRegister'>;

export default function AgentRegisterScreen() {
  const navigation   = useNavigation<Nav>();
  const route        = useRoute<Route>();
  const dispatch     = useAppDispatch();

  const loading      = useAppSelector(selectAuthLoading);
  const apiError     = useAppSelector(selectAuthError);
  const pendingPhone = useAppSelector(selectPendingPhone);
  const rawPhone     = route.params?.phone ?? '';
  const countryCode  = route.params?.countryCode ?? '256';
  const fullPhone    = `+${countryCode}${rawPhone}` || pendingPhone || '';

  const [fullName,   setFullName]   = useState('');
  const [district,   setDistrict]   = useState('');
  const [villages,   setVillages]   = useState('');   // comma-separated
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) e.fullName = 'Enter your full name';
    if (!district)                                       e.district = 'Select your territory district';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const villageList = villages
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const result = await dispatch(
      completeRegistration({
        phone:             fullPhone,
        fullName:          fullName.trim(),
        role:              'village_agent',
        territoryDistrict: district,
        territoryVillages: villageList,
      }),
    );

    if (completeRegistration.rejected.match(result)) {
      Alert.alert(
        'Registration Failed',
        (result.payload as string) ?? 'Please try again.',
      );
    }
    // On success: Redux isAuthenticated → true → RootNavigator auto-switches
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={s.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity
        style={GS.back}
        onPress={() => { dispatch(clearError()); navigation.goBack(); }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={GS.backText}>← Cancel</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={s.headerSection}>
        <Text style={s.emoji}>🧑‍💼</Text>
        <Text style={GS.screenTitle}>Field Agent Setup</Text>
        <Text style={s.subtitle}>
          You'll help farmers in your territory register, list produce, and get paid.
        </Text>
      </View>

      <View style={GS.form}>
        {/* Full name */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Full Name <Text style={{ color: Colors.error }}>*</Text></Text>
          <TextInput
            style={[GS.input, errors.fullName && GS.inputError]}
            value={fullName}
            onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: '' })); }}
            placeholder="e.g. David Ssempala"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="words"
          />
          {errors.fullName ? <Text style={GS.fieldError}>{errors.fullName}</Text> : null}
        </View>

        {/* Territory district */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Territory District <Text style={{ color: Colors.error }}>*</Text></Text>
          <Text style={GS.fieldHint}>The main district where you operate</Text>
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

        {/* Villages */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Villages / Sub-counties (optional)</Text>
          <TextInput
            style={GS.input}
            value={villages}
            onChangeText={setVillages}
            placeholder="Namugongo, Kira, Kasangati"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="words"
          />
          <Text style={GS.fieldHint}>Separate multiple villages with commas</Text>
        </View>

        {/* Commission info card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>💰 How you earn</Text>
          <Text style={s.infoText}>
            You earn a 2% commission on every transaction completed by farmers you register.
            Payments are sent to your Mobile Money account within 24 hours of each sale.
          </Text>
        </View>

        {/* API error */}
        {apiError ? (
          <View style={s.apiErrorBox}>
            <Text style={s.apiErrorText}>⚠ {apiError}</Text>
          </View>
        ) : null}

        {/* Support */}
        <View style={s.supportBox}>
          <Text style={s.supportText}>📞 Need help? Call E-Katale operations</Text>
          <Text style={s.supportPhone}>0800-100-200 (Free)</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={s.submitBtnText}>✅ Create Agent Account</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    padding: Layout.safePadding, paddingTop: Space.sm,
    gap: Space.md, backgroundColor: Colors.surface,
  },
  headerSection: { alignItems: 'center', gap: Space.sm, paddingVertical: Space.md },
  emoji:         { fontSize: 48 },
  subtitle:      { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },

  infoCard: {
    backgroundColor: '#EDE7F6', borderRadius: Layout.radius.md,
    padding: Space.md, gap: 6, borderWidth: 1, borderColor: '#CE93D8',
  },
  infoTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: '#6A1B9A' },
  infoText:  { fontSize: Font.size.caption, color: '#7B1FA2', lineHeight: 20 },

  apiErrorBox:  { backgroundColor: Colors.errorLight, borderRadius: Layout.radius.md, padding: 12, borderWidth: 1, borderColor: Colors.error },
  apiErrorText: { fontSize: Font.size.label, color: Colors.error, textAlign: 'center' },

  supportBox: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, gap: 2, borderWidth: 0.5, borderColor: Colors.greenBorder,
  },
  supportText:  { fontSize: Font.size.label, color: Colors.green },
  supportPhone: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },

  submitBtn: {
    backgroundColor: '#6A1B9A', borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
});