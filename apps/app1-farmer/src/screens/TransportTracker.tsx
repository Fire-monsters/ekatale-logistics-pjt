/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FarmerStackParams } from '../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout } from '@styles/global';
import { useAppSelector } from '../store/hooks';
import { selectIsOnline } from '../store/slices/offlineQueueSlice';

type Nav = NativeStackNavigationProp<FarmerStackParams>;
type Route = RouteProp<FarmerStackParams, 'TransportTracker'>;

// Status steps visible in the tracker
const STEPS = [
  { key: 'confirmed', emoji: '📋', label: 'Order Confirmed', done: true },
  { key: 'dispatched', emoji: '🚚', label: 'Truck Dispatched', done: true },
  { key: 'en_route', emoji: '📍', label: 'En Route to Farm', done: false, active: true },
  { key: 'collected', emoji: '🌾', label: 'Produce Collected', done: false },
  { key: 'warehouse', emoji: '🏭', label: 'Delivered to Warehouse', done: false },
];

export function TransportTracker() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const jobId = route.params?.jobId;
  const isOnline = useAppSelector(selectIsOnline);

  const [eta, setEta] = useState('~2 hours');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Poll every 60s when online (matches PRD spec)
  useEffect(() => {
    if (!jobId || !isOnline) return;
    const poll = async () => {
      setLoading(true);
      try {
        const { transportApi } = await import('../services');
        await transportApi.getDriverLocation(jobId);
        setLastUpdated(new Date());
      } catch {
        // Keep showing last known
      } finally {
        setLoading(false);
      }
    };
    poll();
    const t = setInterval(poll, 60_000);
    return () => clearInterval(t);
  }, [jobId, isOnline]);

  const timeStr = lastUpdated.toLocaleTimeString('en-UG', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Track Delivery</Text>
        {loading ? (
          <ActivityIndicator size="small" color={Colors.green} style={{ width: 40 }} />
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: Space.md, gap: Space.md }}>
        {/* Map placeholder */}
        <View style={s.mapPlaceholder}>
          <Text style={s.mapEmoji}>🗺️</Text>
          <Text style={s.mapLabel}>Live Map</Text>
          <Text style={s.mapSub}>Driver location updates every 60 seconds</Text>
          {!isOnline && (
            <View style={s.offlineBanner}>
              <Text style={s.offlineText}>📶 Offline — showing last known location</Text>
            </View>
          )}
        </View>

        {/* ETA card */}
        <View style={s.etaCard}>
          <View style={s.etaRow}>
            <Text style={{ fontSize: 32 }}>🚚</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={GS.summaryLabel}>Estimated Arrival</Text>
              <Text style={s.etaValue}>{eta}</Text>
            </View>
            <View style={s.etaBadge}>
              <Text style={s.etaBadgeText}>EN ROUTE</Text>
            </View>
          </View>
          <Text style={GS.summarySub}>Updated at {timeStr}</Text>
        </View>

        {/* Driver info */}
        <View style={s.driverCard}>
          <View style={s.driverAvatar}>
            <Text style={{ fontSize: 24 }}>🧑‍✈️</Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={GS.listRowText}>Your E-Katale Driver</Text>
            <Text style={GS.listRowSub}>Verified Transport Partner</Text>
          </View>
          <TouchableOpacity style={s.callBtn}>
            <Text style={s.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>

        {/* Steps timeline */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>Delivery Progress</Text>
          {STEPS.map((step, i) => (
            <View key={step.key} style={s.stepRow}>
              <View style={s.stepLeft}>
                <View style={[
                  s.stepDot,
                  step.done && s.stepDotDone,
                  step.active && s.stepDotActive,
                ]}>
                  <Text style={{ fontSize: 14 }}>{step.emoji}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.stepLine, step.done && s.stepLineDone]} />
                )}
              </View>
              <Text style={[
                s.stepLabel,
                step.done && s.stepLabelDone,
                step.active && s.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Collection OTP */}
        <View style={s.otpCard}>
          <Text style={s.otpTitle}>🔐 Collection Code</Text>
          <Text style={s.otpSub}>Share this code with the driver when they arrive</Text>
          <View style={s.otpBadge}>
            <Text style={s.otpCode}>4 2 7 8</Text>
          </View>
          <Text style={s.otpNote}>The driver must enter this code to confirm collection</Text>
        </View>

        {/* Support */}
        <View style={s.supportCard}>
          <Text style={s.supportText}>📞 Problem with delivery?</Text>
          <Text style={s.supportPhone}>Call 0800-100-200 (Free)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default TransportTracker;

const s = StyleSheet.create({
  header: {
    height: 56, backgroundColor: Colors.surface,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.md,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: Colors.green },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },

  mapPlaceholder: {
    height: 180, backgroundColor: '#E8F5E9', borderRadius: Layout.radius.lg,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.greenBorder, overflow: 'hidden',
  },
  mapEmoji: { fontSize: 48 },
  mapLabel: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },
  mapSub: { fontSize: Font.size.caption, color: Colors.textMuted },
  offlineBanner: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF3E0', padding: 6, alignItems: 'center',
  },
  offlineText: { fontSize: Font.size.caption, color: Colors.warning },

  etaCard: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.lg,
    padding: Space.md, gap: 8,
  },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaValue: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textInverse },
  etaBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  etaBadgeText: { fontSize: 9, fontWeight: Font.weight.bold, color: Colors.textInverse, letterSpacing: 1 },
  driverCard: {
    backgroundColor: Colors.surface, borderRadius: Layout.radius.lg,
    padding: Space.md, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  driverAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.greenLight,
    alignItems: 'center', justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  callBtnText: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.textInverse },

  stepsCard: {
    backgroundColor: Colors.surface, borderRadius: Layout.radius.lg,
    padding: Space.md, borderWidth: 0.5, borderColor: Colors.border, gap: 0,
  },
  stepsTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary, marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepLeft: { alignItems: 'center', width: 36 },
  stepDot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  stepDotDone: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  stepDotActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  stepLine: { width: 2, minHeight: 20, backgroundColor: '#E0E0E0', marginVertical: 2, flex: 1 },
  stepLineDone: { backgroundColor: Colors.green },
  stepLabel: { fontSize: Font.size.label, color: Colors.textDisabled, paddingTop: 8, flex: 1 },
  stepLabelDone: { color: Colors.textMuted },
  stepLabelActive: { color: Colors.green, fontWeight: Font.weight.bold },

  otpCard: {
    backgroundColor: '#EDE7F6', borderRadius: Layout.radius.lg,
    padding: Space.md, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#CE93D8',
  },
  otpTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: '#4A148C' },
  otpSub: { fontSize: Font.size.caption, color: '#7B1FA2', textAlign: 'center' },
  otpBadge: {
    backgroundColor: '#6A1B9A', borderRadius: Layout.radius.md,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  otpCode: { fontSize: 32, fontWeight: Font.weight.bold, color: Colors.textInverse, letterSpacing: 12 },
  otpNote: { fontSize: Font.size.caption, color: '#7B1FA2', textAlign: 'center' },

  supportCard: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: Colors.greenBorder,
  },
  supportText: { fontSize: Font.size.label, color: Colors.green },
  supportPhone: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },
});