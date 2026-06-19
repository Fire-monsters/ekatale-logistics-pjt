// apps/app1-farmer/src/screens/auth/AgentDetailsScreen.tsx

import React, { useState } from 'react';

import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { requestCameraPermission, requestGalleryPermission } from '../../utils/permissions';

import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import {
  updateRegistrationDraft,
  selectRegistrationDraft,
} from '../../store/slices/authSlice';
import { DISTRICTS_MVP } from '../../constants';

type Nav = NativeStackNavigationProp<AuthStackParams>;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[si.dot, i < current && si.dotDone]} />
      ))}
      <Text style={si.label}>Step {current} of {total}</Text>
    </View>
  );
}
const si = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:    { width: 28, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB' },
  dotDone:{ backgroundColor: '#6A1B9A' },
  label:  { fontSize: Font.size.caption, color: Colors.textMuted, marginLeft: 4 },
});

export default function AgentDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();
  const draft      = useAppSelector(selectRegistrationDraft);

  const [profilePhotoUri, setProfilePhotoUri] = useState<string>(
  draft.profilePhotoUri ?? ''
);

  const [fullName,  setFullName]  = useState(draft.fullName ?? '');
  const [district,  setDistrict]  = useState(draft.territoryDistrict ?? '');
  const [villages,  setVillages]  = useState((draft.territoryVillages ?? []).join(', '));
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) e.fullName = 'Enter your full name';
    if (!district)                                       e.district = 'Select your territory district';
    if (!profilePhotoUri) e.photo = 'Please add a profile photo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    const villageList = villages
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    dispatch(updateRegistrationDraft({
      fullName,
      territoryDistrict: district,
      territoryVillages: villageList,
    }));
    navigation.navigate('PhonePassword', { role: 'village_agent' });
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerBlock}>
        <Text style={styles.pageEmoji}>🧑‍💼</Text>
        <Text style={styles.pageTitle}>Field Agent Details</Text>
        <Text style={styles.pageSubtitle}>Tell us about your territory and role</Text>
      </View>

      <StepIndicator current={1} total={3} />

      {/* Full name */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name <Text style={styles.req}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={fullName}
          onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: '' })); }}
          placeholder="e.g. David Ssempala"
          placeholderTextColor={Colors.textDisabled}
          autoCapitalize="words"
        />
        {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}
      </View>

      {/* Territory district */}
      <View style={styles.field}>
        <Text style={styles.label}>Territory District <Text style={styles.req}>*</Text></Text>
        <Text style={styles.hint}>The main district where you operate</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {DISTRICTS_MVP.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, district === d && styles.chipActive]}
                onPress={() => { setDistrict(d); setErrors((e) => ({ ...e, district: '' })); }}
              >
                <Text style={[styles.chipText, district === d && styles.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {errors.district ? <Text style={styles.error}>{errors.district}</Text> : null}
      </View>

      {/* Villages */}
      <View style={styles.field}>
        <Text style={styles.label}>Villages / Sub-counties <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.input}
          value={villages}
          onChangeText={setVillages}
          placeholder="Namugongo, Kira, Kasangati"
          placeholderTextColor={Colors.textDisabled}
          autoCapitalize="words"
        />
        <Text style={styles.hint}>Separate multiple with commas</Text>
      </View>

      {/* Commission info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💰 How you earn</Text>
        <Text style={styles.infoText}>
          You earn a 2% commission on every transaction completed by farmers you register.
          Payments go to your Mobile Money within 24 hours of each sale.
        </Text>
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Next → Phone &amp; Password</Text>
      </TouchableOpacity>

      <View style={styles.supportBox}>
        <Text style={styles.supportText}>📞 Need help? Call E-Katale operations</Text>
        <Text style={styles.supportPhone}>0800-100-200 (Free)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    padding: Layout.safePadding, paddingTop: Space.sm,
    gap: Space.md, paddingBottom: 40,
  },
  backBtn:  { alignSelf: 'flex-start', paddingVertical: Space.sm },
  backText: { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },

  headerBlock:  { alignItems: 'center', gap: 6, paddingVertical: Space.sm },
  pageEmoji:    { fontSize: 40 },
  pageTitle:    { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  pageSubtitle: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center' },

  field:    { gap: 6 },
  label:    { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textSecondary },
  req:      { color: Colors.error },
  optional: { color: Colors.textMuted, fontWeight: Font.weight.regular },
  hint:     { fontSize: Font.size.caption, color: Colors.textMuted },
  error:    { fontSize: Font.size.caption, color: Colors.error },

  input: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: Font.size.body, color: Colors.textPrimary,
    minHeight: Layout.touch.comfortable, backgroundColor: Colors.bg,
  },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorLight },

  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Layout.radius.pill, borderWidth: 2, borderColor: '#E5E7EB',
    backgroundColor: Colors.bg,
  },
  chipActive:     { borderColor: '#6A1B9A', backgroundColor: '#EDE7F6' },
  chipText:       { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textMuted },
  chipTextActive: { color: '#6A1B9A' },

  infoCard: {
    backgroundColor: '#EDE7F6', borderRadius: Layout.radius.md,
    padding: Space.md, gap: 6, borderWidth: 1, borderColor: '#CE93D8',
  },
  infoTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: '#6A1B9A' },
  infoText:  { fontSize: Font.size.caption, color: '#7B1FA2', lineHeight: 20 },

  nextBtn: {
    backgroundColor: '#6A1B9A', borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
  },
  nextBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },

  supportBox: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, gap: 2, borderWidth: 0.5, borderColor: Colors.greenBorder,
    alignItems: 'center',
  },
  supportText:  { fontSize: Font.size.label, color: Colors.green },
  supportPhone: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },
});