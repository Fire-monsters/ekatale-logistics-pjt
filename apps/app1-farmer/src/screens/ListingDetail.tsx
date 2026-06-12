/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout, getCropEmoji } from '../../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchListingById, selectListingById } from '../store/slices/listingSlice';
import { StatusBadge } from '../components/common';
import { formatUGX } from '../utils/currency';
import { formatDateMedium, timeAgo } from '../utils/date';

type Nav = NativeStackNavigationProp<FarmerStackParams>;
type Route = RouteProp<FarmerStackParams, 'ListingDetail'>;

// Status timeline definition — ordered progression
const TIMELINE: { status: string; emoji: string; label: string }[] = [
  { status: 'PENDING_REVIEW', emoji: '🔍', label: 'Submitted for review' },
  { status: 'ACTIVE',         emoji: '✅', label: 'Listing approved' },
  { status: 'ORDER_CONFIRMED',emoji: '📋', label: 'Order confirmed' },
  { status: 'COLLECTED',      emoji: '🚜', label: 'Produce collected' },
  { status: 'DISPATCHED',     emoji: '🚚', label: 'En route to warehouse' },
  { status: 'DELIVERED',      emoji: '🏭', label: 'Delivered to warehouse' },
  { status: 'PAID',           emoji: '💰', label: 'Payment sent to MoMo' },
];

const STATUS_ORDER = TIMELINE.map(t => t.status);

function getTimelineIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function ListingDetail() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useAppDispatch();
  const { listingId } = route.params;

  const listing = useAppSelector(selectListingById(listingId));

  const { isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => dispatch(fetchListingById(listingId)).unwrap(),
    enabled: !listing,
  });

  if (isLoading || !listing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator color={Colors.green} size="large" />
      </View>
    );
  }

  const timelineIdx = getTimelineIndex(listing.status);
  const isTerminal = ['PAID', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(listing.status);
  const isRejected = ['REJECTED', 'CANCELLED'].includes(listing.status);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Listing Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: Space.md, gap: Space.md }}>
        {/* Hero card */}
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View style={s.cropIcon}>
              <Text style={{ fontSize: 36 }}>{getCropEmoji(listing.commodityId)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.cropName}>{listing.commodityName}</Text>
              <Text style={s.cropMeta}>
                {listing.quantity} {listing.unit} · Grade {listing.grade}
              </Text>
              <StatusBadge status={listing.status} />
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Listed</Text>
              <Text style={s.metaValue}>{formatDateMedium(listing.createdAt)}</Text>
            </View>
            {listing.askingPricePerUnit && (
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Asking Price</Text>
                <Text style={s.metaValue}>{formatUGX(listing.askingPricePerUnit)}/{listing.unit}</Text>
              </View>
            )}
            {listing.availabilityDate && (
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Available from</Text>
                <Text style={s.metaValue}>{formatDateMedium(listing.availabilityDate)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status timeline */}
        {!isRejected && (
          <View style={s.timelineCard}>
            <Text style={s.sectionTitle}>Order Progress</Text>
            {TIMELINE.map((step, i) => {
              const done = i <= timelineIdx;
              const current = i === timelineIdx;
              return (
                <View key={step.status} style={s.timelineRow}>
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, done && s.timelineDotDone, current && s.timelineDotCurrent]}>
                      <Text style={{ fontSize: current ? 14 : 12 }}>{done ? step.emoji : '○'}</Text>
                    </View>
                    {i < TIMELINE.length - 1 && (
                      <View style={[s.timelineLine, i < timelineIdx && s.timelineLineDone]} />
                    )}
                  </View>
                  <Text style={[s.timelineLabel, done && s.timelineLabelDone, current && s.timelineLabelCurrent]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Rejected / cancelled state */}
        {isRejected && (
          <View style={s.rejectedCard}>
            <Text style={{ fontSize: 32 }}>❌</Text>
            <Text style={s.rejectedTitle}>
              {listing.status === 'REJECTED' ? 'Listing Rejected' : 'Order Cancelled'}
            </Text>
            <Text style={s.rejectedSub}>
              Please contact your E-Katale field agent or re-list with updated details.
            </Text>
            <TouchableOpacity
              style={s.relistBtn}
              onPress={() => navigation.navigate('ListProduce')}
            >
              <Text style={s.relistBtnText}>Re-list Produce →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Transport tracker shortcut */}
        {listing.status === 'DISPATCHED' && (
          <TouchableOpacity
            style={s.truckCard}
            onPress={() => navigation.navigate('TransportTracker', {})}
          >
            <Text style={{ fontSize: 28 }}>🚚</Text>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={s.truckTitle}>Truck en route</Text>
              <Text style={s.truckSub}>Tap to track driver location</Text>
            </View>
            <Text style={{ fontSize: 20, color: Colors.warning }}>→</Text>
          </TouchableOpacity>
        )}

        {/* Support */}
        <View style={s.supportCard}>
          <Text style={s.supportText}>📞 Need help with this order?</Text>
          <Text style={s.supportPhone}>Call 0800-100-200 (Free)</Text>
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
  backArrow: { fontSize: 22, color: Colors.green },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },

  heroCard: {
    backgroundColor: Colors.surface, borderRadius: Layout.radius.lg,
    padding: Space.md, gap: 12, borderWidth: 0.5, borderColor: Colors.border,
  },
  heroTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  cropIcon: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.greenLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cropName: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  cropMeta: { fontSize: Font.size.label, color: Colors.textMuted },
  divider: { height: 0.5, backgroundColor: Colors.border },
  metaRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: Font.size.caption, color: Colors.textMuted },
  metaValue: { fontSize: Font.size.label, fontWeight: Font.weight.semiBold, color: Colors.textPrimary },

  sectionTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary, marginBottom: 8 },
  timelineCard: {
    backgroundColor: Colors.surface, borderRadius: Layout.radius.lg,
    padding: Space.md, borderWidth: 0.5, borderColor: Colors.border,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E0E0E0',
  },
  timelineDotDone: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  timelineDotCurrent: { backgroundColor: Colors.green, borderColor: Colors.green },
  timelineLine: { width: 2, flex: 1, minHeight: 20, backgroundColor: '#E0E0E0', marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.green },
  timelineLabel: { fontSize: Font.size.label, color: Colors.textDisabled, paddingTop: 6, flex: 1 },
  timelineLabelDone: { color: Colors.textMuted },
  timelineLabelCurrent: { color: Colors.green, fontWeight: Font.weight.bold },

  rejectedCard: {
    backgroundColor: '#FFF8F8', borderRadius: Layout.radius.lg,
    padding: Space.lg, borderWidth: 1, borderColor: '#FFCDD2',
    alignItems: 'center', gap: 10,
  },
  rejectedTitle: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.error },
  rejectedSub: { fontSize: Font.size.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  relistBtn: {
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 4,
  },
  relistBtnText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },

  truckCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF3E0', borderRadius: Layout.radius.lg,
    padding: Space.md, borderWidth: 1, borderColor: '#FFCC80',
  },
  truckTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.warning },
  truckSub: { fontSize: Font.size.caption, color: '#8D4E00' },

  supportCard: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: Colors.greenBorder,
  },
  supportText: { fontSize: Font.size.label, color: Colors.green },
  supportPhone: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },
});