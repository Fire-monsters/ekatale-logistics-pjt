/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { AgentStackParams } from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '../../theme';
import { agentApi } from '../../services/api/agents.api';

type Nav = NativeStackNavigationProp<AgentStackParams>;
type Route = RouteProp<AgentStackParams, 'FarmerProfileView'>;

export default function FarmerProfileView() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { farmerId } = route.params;

  const { data: farmers, isLoading } = useQuery({
    queryKey: ['agent-farmers'],
    queryFn: () => agentApi.getMyFarmers(),
  });

  const farmer = farmers?.find((f) => f.userId === farmerId);

  if (isLoading || !farmer) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color="#6A1B9A" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Farmer Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: Space.md, gap: Space.md }}>
        <View style={s.card}>
          <Text style={s.name}>{farmer.fullName ?? 'Unnamed farmer'}</Text>
          <Text style={s.meta}>NIN: {farmer.nin ?? '—'}</Text>
          <Text style={s.meta}>District: {farmer.district ?? '—'}{farmer.village ? ` · ${farmer.village}` : ''}</Text>
          <Text style={s.meta}>Farm size: {farmer.farmSizeAcres ?? 0} acres</Text>
          {farmer.gpsLat && farmer.gpsLng && (
            <Text style={s.meta}>GPS: {farmer.gpsLat.toFixed(4)}, {farmer.gpsLng.toFixed(4)}</Text>
          )}
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Crops Grown</Text>
          <View style={s.cropsRow}>
            {(farmer.crops ?? []).map((c) => (
              <View key={c} style={s.cropPill}>
                <Text style={{ fontSize: 16 }}>{getCropEmoji(c)}</Text>
                <Text style={s.cropText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Payment Details</Text>
          <Text style={s.meta}>Provider: {farmer.paymentProvider ?? '—'}</Text>
          <Text style={s.meta}>Number: {farmer.paymentNumber ?? '—'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    height: 56, backgroundColor: Colors.surface,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#6A1B9A' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },

  card: {
    backgroundColor: Colors.surface, borderRadius: Layout.radius.lg,
    padding: Space.md, gap: 6, borderWidth: 0.5, borderColor: Colors.border,
  },
  name: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary, marginBottom: 4 },
  meta: { fontSize: Font.size.label, color: Colors.textMuted },
  sectionTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary, marginBottom: 6 },

  cropsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cropPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Layout.radius.pill, backgroundColor: '#EDE7F6',
    borderWidth: 1, borderColor: '#CE93D8',
  },
  cropText: { fontSize: 12, fontWeight: Font.weight.medium, color: '#6A1B9A', textTransform: 'capitalize' },
});