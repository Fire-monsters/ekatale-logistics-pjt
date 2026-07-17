// apps/app1-farmer/src/screens/auth/FarmerDetailsScreen.tsx
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native';


import * as ImagePicker from 'expo-image-picker';
import { requestCameraPermission, requestGalleryPermission } from '../../utils/permissions';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import {
    updateRegistrationDraft,
    selectRegistrationDraft,
} from '../../store/slices/authSlice';

import { getCurrentLocation } from '../../utils/permissions';
import { DISTRICTS_MVP } from '../../constants';

type Nav = NativeStackNavigationProp<AuthStackParams>;

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

/** Simple step indicator */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[si.dot, i < current && si.dotDone, i === current - 1 && si.dotActive]} />
      ))}
      <Text style={si.label}>Step {current} of {total}</Text>
    </View>
  );
}
const si = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:       { width: 28, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB' },
  dotDone:   { backgroundColor: Colors.green },
  dotActive: { backgroundColor: Colors.green },
  label:     { fontSize: Font.size.caption, color: Colors.textMuted, marginLeft: 4 },
});

export default function FarmerDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();
  const draft      = useAppSelector(selectRegistrationDraft);

  const [fullName,    setFullName]    = useState(draft.fullName ?? '');
  const [nin,         setNin]         = useState(draft.nin ?? '');
  const [district,    setDistrict]    = useState(draft.district ?? '');
  const [farmSize,    setFarmSize]    = useState(draft.farmSizeAcres?.toString() ?? '');
  const [crops,       setCrops]       = useState<string[]>(draft.cropsGrown ?? []);
  const [gps,         setGps]         = useState<{ lat: number; lng: number } | null>(
    draft.gpsLat ? { lat: draft.gpsLat, lng: draft.gpsLng! } : null,
  )

  const [profilePhotoUri, setProfilePhotoUri] = useState<string>(
  draft.profilePhotoUri ?? ''
);

  const [gpsLoading, setGpsLoading]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const toggleCrop = (id: string) =>
    setCrops((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const validate = () => {
  const e: Record<string, string> = {};
  if (!profilePhotoUri)                                        e.photo    = 'Please add a profile photo';
  if (!fullName.trim() || fullName.trim().length < 3)         e.fullName = 'Enter your full name (min 3 chars)';
  if (!nin.trim() || nin.trim().length < 10)                  e.nin      = 'Enter your National ID number';
  if (!district)                                              e.district = 'Select your district';
  if (!farmSize || parseFloat(farmSize) <= 0)                 e.farmSize = 'Enter farm size in acres';
  if (crops.length === 0)                                     e.crops    = 'Select at least one crop';
  setErrors(e);
  return Object.keys(e).length === 0;
};

  const handleGPS = async () => {
    setGpsLoading(true);
    const loc = await getCurrentLocation();
    if (loc) setGps(loc);
    setGpsLoading(false);
  };

  const handleNext = () => {
    if (!validate()) return;
    dispatch(updateRegistrationDraft({
      fullName:      fullName.trim(),
      nin:           nin.trim().toUpperCase(),
      district,
      farmSizeAcres: parseFloat(farmSize),
      cropsGrown:    crops,
      gpsLat:        gps?.lat,
      gpsLng:        gps?.lng,
    }));
    navigation.navigate('PhonePassword', { role: 'farmer' });
  };

  const pickPhoto = async (source: 'camera' | 'gallery') => {
  const perm = source === 'camera'
    ? await requestCameraPermission()
    : await requestGalleryPermission();
  if (perm !== 'granted') return;

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] })
    : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });

  if (!result.canceled && result.assets[0]) {
    const uri = result.assets[0].uri;
    setProfilePhotoUri(uri);
    dispatch(updateRegistrationDraft({ profilePhotoUri: uri }));
    setErrors((e) => ({ ...e, photo: '' }));
  }
};

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerBlock}>
        <Text style={styles.pageEmoji}>🌾</Text>
        <Text style={styles.pageTitle}>Farmer Details</Text>
        <Text style={styles.pageSubtitle}>Tell us about yourself and your farm</Text>
      </View>

      <StepIndicator current={1} total={3} />

      {/* Profile Photo */}
      <View style={styles.field}>
         <Text style={styles.label}>
            Profile Photo <Text style={styles.req}>*</Text>
         </Text>
              <Text style={[styles.hint, { marginBottom: 8 }]}>
                Used to identify you on the platform
         </Text>

         <View style={styles.row}>
           {profilePhotoUri ? (
             <Image source={{ uri: profilePhotoUri }} style={styles.preview} />
           ) : (
             <View style={styles.placeholder}>
               <Text style={styles.placeholderIcon}>📷</Text>
             </View>
           )}
           <View style={styles.btns}>
             <TouchableOpacity style={styles.btn} onPress={() => pickPhoto('camera')}>
               <Text style={styles.btnText}>📷 Camera</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.btn} onPress={() => pickPhoto('gallery')}>
               <Text style={styles.btnText}>🖼️ Gallery</Text>
             </TouchableOpacity>
           </View>
         </View>
         {errors.photo ? <Text style={styles.error}>{errors.photo}</Text> : null}
       </View>

      {/* Full name */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name <Text style={styles.req}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={fullName}
          onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: '' })); }}
          placeholder="e.g. Amina Nakato"
          placeholderTextColor={Colors.textDisabled}
          autoCapitalize="words"
        />
        {errors.fullName ? <Text style={styles.error}>{errors.fullName}</Text> : null}
      </View>

      {/* NIN */}
      <View style={styles.field}>
        <Text style={styles.label}>National ID (NIN) <Text style={styles.req}>*</Text></Text>
        <TextInput
          style={[styles.input, errors.nin && styles.inputError]}
          value={nin}
          onChangeText={(v) => { setNin(v.toUpperCase()); setErrors((e) => ({ ...e, nin: '' })); }}
          placeholder="CM92010050CXKJ"
          placeholderTextColor={Colors.textDisabled}
          autoCapitalize="characters"
        />
        {errors.nin ? <Text style={styles.error}>{errors.nin}</Text> : null}
      </View>

      {/* District */}
      <View style={styles.field}>
        <Text style={styles.label}>Your District <Text style={styles.req}>*</Text></Text>
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

      {/* Farm size */}
      <View style={styles.field}>
        <Text style={styles.label}>Farm Size (acres) <Text style={styles.req}>*</Text></Text>
        <View style={styles.sizeRow}>
          <TouchableOpacity
            style={styles.sizeBtn}
            onPress={() => setFarmSize((v) => String(Math.max(0, parseFloat(v || '0') - 0.5)))}
          >
            <Text style={styles.sizeBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.sizeInput, errors.farmSize && styles.inputError]}
            value={farmSize}
            onChangeText={(v) => { setFarmSize(v); setErrors((e) => ({ ...e, farmSize: '' })); }}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={Colors.textDisabled}
            textAlign="center"
          />
          <TouchableOpacity
            style={styles.sizeBtn}
            onPress={() => setFarmSize((v) => String(parseFloat(v || '0') + 0.5))}
          >
            <Text style={styles.sizeBtnText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.sizeUnit}>acres</Text>
        </View>
        {errors.farmSize ? <Text style={styles.error}>{errors.farmSize}</Text> : null}
      </View>

      {/* GPS */}
      <View style={styles.field}>
        <Text style={styles.label}>Farm Location (GPS) <Text style={styles.optional}>(optional)</Text></Text>
        <TouchableOpacity
          style={[styles.gpsBtn, !!gps && styles.gpsBtnActive]}
          onPress={handleGPS}
          disabled={gpsLoading}
        >
          {gpsLoading
            ? <ActivityIndicator size="small" color={Colors.green} />
            : <Text style={styles.gpsIcon}>📍</Text>
          }
          <Text style={[styles.gpsBtnText, !!gps && styles.gpsBtnTextActive]}>
            {gpsLoading ? 'Detecting…' : gps ? `GPS set ✓  (${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)})` : 'Use my GPS location'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Helps match you with nearby buyers</Text>
      </View>

      {/* Crops */}
      <View style={styles.field}>
        <Text style={styles.label}>Crops You Grow <Text style={styles.req}>*</Text></Text>
        <Text style={styles.hint}>Select all that apply</Text>
        <View style={styles.cropsGrid}>
          {CROPS.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.cropCard, crops.includes(c.id) && styles.cropCardActive]}
              onPress={() => { toggleCrop(c.id); setErrors((e) => ({ ...e, crops: '' })); }}
            >
              <Text style={styles.cropEmoji}>{getCropEmoji(c.id)}</Text>
              <Text style={[styles.cropLabel, crops.includes(c.id) && styles.cropLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.crops ? <Text style={styles.error}>{errors.crops}</Text> : null}
      </View>

      {/* Next */}
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>Next → Phone &amp; Password</Text>
      </TouchableOpacity>

      <View style={styles.supportBox}>
        <Text style={styles.supportText}>📞 Need help? Call your E-Katale field agent</Text>
        <Text style={styles.supportPhone}>0800-100-200 (Free)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    padding: Layout.safePadding,
    paddingTop: Space.sm,
    gap: Space.md,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 32 },
  btns: { flex: 1, gap: 10 },
  btn: {
    borderWidth: 2,
    borderColor: Colors.greenBorder,
    borderRadius: Layout.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: Colors.greenLight,
  },
  btnText: {
    fontSize: Font.size.label,
    color: Colors.green,
    fontWeight: Font.weight.semiBold,
  },

  headerBlock: { alignItems: 'center', gap: 6, paddingVertical: Space.sm },
  pageEmoji:   { fontSize: 40 },
  pageTitle:   { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  pageSubtitle:{ fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center' },

  field: { gap: 6 },
  label: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textSecondary },
  req:   { color: Colors.error },
  optional: { color: Colors.textMuted, fontWeight: Font.weight.regular },
  hint:  { fontSize: Font.size.caption, color: Colors.textMuted },
  error: { fontSize: Font.size.caption, color: Colors.error },

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
  chipActive:     { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  chipText:       { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textMuted },
  chipTextActive: { color: Colors.green },

  sizeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sizeBtn: {
    width: 52, height: 52, borderRadius: Layout.radius.md,
    backgroundColor: Colors.bg, borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  sizeBtnText: { fontSize: 24, color: Colors.textPrimary, fontWeight: Font.weight.medium },
  sizeInput: {
    flex: 1, borderWidth: 2, borderColor: Colors.green, borderRadius: Layout.radius.md,
    fontSize: 22, fontWeight: Font.weight.bold, color: Colors.textPrimary,
    height: 52, backgroundColor: '#FAFFFE',
  },
  sizeUnit: { fontSize: Font.size.body, color: Colors.textMuted },

  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    padding: 14, minHeight: Layout.touch.comfortable, backgroundColor: Colors.bg,
  },
  gpsBtnActive:     { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  gpsIcon:          { fontSize: 20 },
  gpsBtnText:       { flex: 1, fontSize: Font.size.body, fontWeight: Font.weight.medium, color: Colors.textSecondary },
  gpsBtnTextActive: { color: Colors.green },

  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cropCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Layout.radius.pill, borderWidth: 2, borderColor: Colors.greenBorder,
    backgroundColor: Colors.bg,
  },
  cropCardActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  cropEmoji:      { fontSize: 18 },
  cropLabel:      { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textSecondary },
  cropLabelActive:{ color: Colors.textInverse },

  nextBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
    marginTop: Space.sm,
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