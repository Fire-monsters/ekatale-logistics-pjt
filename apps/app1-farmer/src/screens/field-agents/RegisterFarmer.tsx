/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AgentStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout, getCropEmoji } from '@styles/global';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { agentApi } from '../../services/api/agents.api';
import { getCurrentLocation } from '../../utils/permissions';
import { DISTRICTS_MVP } from '../../constants';

type Nav = NativeStackNavigationProp<AgentStackParams>;

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

const COUNTRY_CODE = '256';

export default function RegisterFarmer() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();

  const [fullName,  setFullName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [nin,       setNin]       = useState('');
  const [district,  setDistrict]  = useState('');
  const [farmSize,  setFarmSize]  = useState('');
  const [crops,     setCrops]     = useState<string[]>([]);
  const [payProvider, setPayProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [payNumber,   setPayNumber]   = useState('');
  const [gps,       setGps]       = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const toggleCrop = (id: string) =>
    setCrops((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  const handleGPS = async () => {
    setGpsLoading(true);
    const loc = await getCurrentLocation();
    if (loc) setGps(loc);
    setGpsLoading(false);
  };

  const mutation = useMutation({
    mutationFn: agentApi.registerFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-farmers'] });
      queryClient.invalidateQueries({ queryKey: ['agent-summary'] });
      Alert.alert('✅ Farmer Registered', `${fullName} has been added to your farmer list.`, [
        { text: 'OK', onPress: () => navigation.navigate('MyFarmers') },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Registration Failed', err.message ?? 'Please try again.');
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) e.fullName = 'Enter the farmer\'s full name';
    if (phone.replace(/\D/g, '').length < 9)            e.phone = 'Enter a valid phone number';
    if (!nin.trim() || nin.trim().length < 10)          e.nin = 'Enter the farmer\'s National ID';
    if (!district)                                       e.district = 'Select a district';
    if (!farmSize || parseFloat(farmSize) <= 0)          e.farmSize = 'Enter farm size in acres';
    if (crops.length === 0)                              e.crops = 'Select at least one crop';
    if (payNumber.replace(/\D/g, '').length < 9)         e.payNumber = 'Enter Mobile Money number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      fullName: fullName.trim(),
      phone: `+${COUNTRY_CODE}${phone.replace(/\D/g, '')}`,
      nin: nin.trim().toUpperCase(),
      district,
      farmSizeAcres: parseFloat(farmSize),
      cropsGrown: crops,
      paymentProvider: payProvider,
      paymentNumber: payNumber.replace(/\D/g, ''),
      gpsLat: gps?.lat,
      gpsLng: gps?.lng,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={s.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={GS.back} onPress={() => navigation.goBack()}>
        <Text style={GS.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={GS.screenTitle}>👥 Register a Farmer</Text>
      <Text style={GS.fieldHint}>Fill in the farmer's details on their behalf</Text>

      <View style={GS.form}>
        {/* Full name */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Farmer's Full Name <Text style={{ color: Colors.error }}>*</Text></Text>
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

        {/* Phone */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Phone Number <Text style={{ color: Colors.error }}>*</Text></Text>
          <View style={[s.phoneRow, errors.phone && GS.inputError]}>
            <Text style={s.dialCode}>+{COUNTRY_CODE}</Text>
            <TextInput
              style={s.phoneInput}
              value={phone}
              onChangeText={(v) => { setPhone(v.replace(/\D/g, '').slice(0, 9)); setErrors((e) => ({ ...e, phone: '' })); }}
              placeholder="7XX XXX XXX"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone ? <Text style={GS.fieldError}>{errors.phone}</Text> : null}
        </View>

        {/* NIN */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>National ID (NIN) <Text style={{ color: Colors.error }}>*</Text></Text>
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
          <Text style={GS.fieldLabel}>District <Text style={{ color: Colors.error }}>*</Text></Text>
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
          <Text style={GS.fieldLabel}>Farm Size (acres) <Text style={{ color: Colors.error }}>*</Text></Text>
          <TextInput
            style={[GS.input, errors.farmSize && GS.inputError]}
            value={farmSize}
            onChangeText={(v) => { setFarmSize(v); setErrors((e) => ({ ...e, farmSize: '' })); }}
            keyboardType="decimal-pad"
            placeholder="e.g. 2.5"
            placeholderTextColor={Colors.textDisabled}
          />
          {errors.farmSize ? <Text style={GS.fieldError}>{errors.farmSize}</Text> : null}
        </View>

        {/* GPS */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Farm Location (GPS) <Text style={{ color: Colors.textMuted, fontWeight: Font.weight.regular }}>(optional)</Text></Text>
          <TouchableOpacity style={[s.gpsBtn, !!gps && s.gpsBtnActive]} onPress={handleGPS} disabled={gpsLoading}>
            {gpsLoading ? <ActivityIndicator size="small" color={Colors.green} /> : <Text style={{ fontSize: 20 }}>📍</Text>}
            <Text style={[s.gpsBtnText, !!gps && s.gpsBtnTextActive]}>
              {gpsLoading ? 'Detecting…' : gps ? 'GPS set ✓' : 'Use current location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Crops */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Crops Grown <Text style={{ color: Colors.error }}>*</Text></Text>
          <View style={s.cropsGrid}>
            {CROPS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[s.cropCard, crops.includes(c.id) && s.cropCardActive]}
                onPress={() => { toggleCrop(c.id); setErrors((e) => ({ ...e, crops: '' })); }}
              >
                <Text style={{ fontSize: 18 }}>{getCropEmoji(c.id)}</Text>
                <Text style={[s.cropLabel, crops.includes(c.id) && s.cropLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.crops ? <Text style={GS.fieldError}>{errors.crops}</Text> : null}
        </View>

        {/* Mobile Money */}
        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Mobile Money Provider <Text style={{ color: Colors.error }}>*</Text></Text>
          <View style={s.payRow}>
            {([
              { key: 'mtn', label: 'MTN MoMo', emoji: '🟡' },
              { key: 'airtel', label: 'Airtel Money', emoji: '🔴' },
            ] as const).map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[s.payCard, payProvider === p.key && s.payCardActive]}
                onPress={() => setPayProvider(p.key)}
              >
                <Text style={{ fontSize: 20 }}>{p.emoji}</Text>
                <Text style={[s.payLabel, payProvider === p.key && s.payLabelActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={GS.field}>
          <Text style={GS.fieldLabel}>Mobile Money Number <Text style={{ color: Colors.error }}>*</Text></Text>
          <TextInput
            style={[GS.input, errors.payNumber && GS.inputError]}
            value={payNumber}
            onChangeText={(v) => { setPayNumber(v); setErrors((e) => ({ ...e, payNumber: '' })); }}
            placeholder="0770 000 000"
            placeholderTextColor={Colors.textDisabled}
            keyboardType="phone-pad"
          />
          {errors.payNumber ? <Text style={GS.fieldError}>{errors.payNumber}</Text> : null}
        </View>

        <TouchableOpacity
          style={[s.submitBtn, mutation.isPending && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? <ActivityIndicator color={Colors.textInverse} />
            : <Text style={s.submitBtnText}>✅ Register Farmer</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: Layout.safePadding, paddingTop: Space.sm, gap: Space.md, backgroundColor: Colors.surface, paddingBottom: 40 },

  phoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    paddingHorizontal: 14, minHeight: Layout.touch.comfortable, backgroundColor: Colors.bg,
  },
  dialCode: { fontSize: Font.size.body, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },
  phoneInput: { flex: 1, fontSize: Font.size.body, color: Colors.textPrimary, paddingVertical: 12 },

  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: Layout.radius.md,
    padding: 14, minHeight: Layout.touch.comfortable, backgroundColor: Colors.bg,
  },
  gpsBtnActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  gpsBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.medium, color: Colors.textSecondary },
  gpsBtnTextActive: { color: Colors.green },

  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cropCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 11,
    borderRadius: Layout.radius.pill, borderWidth: 2, borderColor: '#CE93D8',
    backgroundColor: Colors.bg,
  },
  cropCardActive: { backgroundColor: '#6A1B9A', borderColor: '#6A1B9A' },
  cropLabel: { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textSecondary },
  cropLabelActive: { color: Colors.textInverse },

  payRow: { flexDirection: 'row', gap: 12 },
  payCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    padding: 14, borderWidth: 2, borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md, backgroundColor: Colors.bg,
  },
  payCardActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  payLabel: { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textMuted },
  payLabelActive: { color: Colors.green },

  submitBtn: {
    backgroundColor: '#6A1B9A', borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  submitBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
});