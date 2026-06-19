/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';

import {
  AlarmCheck,
  BarChart3,
  Bell,
  Bot,
  ClipboardList,
  CloudRain,
  CloudSun,
  Globe2,
  Lightbulb,
  Menu,
  Sprout,
  Truck,
  Wheat,
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout } from '@styles/global';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectUserProfile } from '../../store/slices/userSlice';
import { selectActiveListings, fetchMyListings } from '../../store/slices/listingSlice';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import { Avatar, SafeScreen } from '../../components';
import { StatusBadge } from '../../components/common';
import { formatUGX } from '../../utils/currency';
import { timeAgo } from '../../utils/date';
import type { ProduceListing } from '../../types';


type Nav = NativeStackNavigationProp<FarmerStackParams>;

export default function FarmerDashboard() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectUserProfile);
  const listings = useAppSelector(selectActiveListings);
  const unreadCount = useAppSelector(selectUnreadCount);

  const { isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => dispatch(fetchMyListings()).unwrap(),
    staleTime: 5 * 60_000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Farmer';
  const pendingCount = listings.filter(l => l.status === 'ORDER_CONFIRMED').length;

  return (
    <SafeScreen padded={false} backgroundColor={Colors.bg} statusBarStyle="dark-content">
      <View style={GS.screen}>
        <View style={s.header}>
               {/* ── Left: avatar + greeting ── */}
  <View style={s.headerLeft}>
    <Avatar
      uri={profile?.profilePhotoUrl}
      name={profile?.fullName ?? firstName}
      size={40}
    />
    <View>
      <Text style={s.helloText}>Hello,</Text>
      <Text style={s.helloName}>{firstName}</Text>
    </View>
  </View>

  {/* ── Right: language, bell, menu ── */}
  <View style={s.headerRight}>
    <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Globe2 size={21} color={Colors.textPrimary} strokeWidth={2.3} />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      style={s.bellWrap}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Bell size={22} color={Colors.textPrimary} strokeWidth={2.4} />
      {unreadCount > 0 && (
        <View style={[GS.badge, { borderColor: Colors.bg }]}>
          <Text style={GS.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Menu size={24} color={Colors.textPrimary} strokeWidth={2.4} />
    </TouchableOpacity>
        </View>

          <Text style={s.greeting}>{greeting()}, {firstName}!</Text>

          {/* Weather strip */}
          <View style={s.weatherStrip}>
            <View style={s.weatherIcon}>
              <CloudSun size={30} color={Colors.textInverse} strokeWidth={2.2} />
            </View>
            <View style={s.weatherCopy}>
              <Text style={s.weatherMain}>24°C, Kampala</Text>
              <Text style={s.weatherPlace}>Kampala</Text>
              <View style={s.weatherTipRow}>
                <Lightbulb size={14} color="rgba(255,255,255,0.82)" strokeWidth={2.2} />
                <Text style={s.weatherTip}>Good weather today - ideal for harvesting</Text>
              </View>
            </View>
            <View style={s.rainTag}>
              <CloudRain size={15} color={Colors.gold} strokeWidth={2.2} />
              <Text style={s.rainText}>Fri</Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.body}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.green} />}
        >
          {/* Stats */}
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.statVal}>{listings.length}</Text>
              <Text style={s.statLbl}>Listings</Text>
            </View>
            <View style={[s.stat, s.statGreen]}>
              <Text style={[s.statVal, { color: Colors.green }]}>
                {formatUGX(0, { compact: true })}
              </Text>
              <Text style={s.statLbl}>Earned</Text>
            </View>
            <View style={[s.stat, pendingCount > 0 && s.statOrange]}>
              <Text style={[s.statVal, pendingCount > 0 && { color: Colors.warning }]}>
                {pendingCount}
              </Text>
              <Text style={s.statLbl}>Pending</Text>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={GS.sectionTitle}>What do you need?</Text>
          <View style={s.actionsGrid}>
            <ActionCard
              Icon={Wheat} label="List Produce" sublabel="Register your harvest"
              bg="#E8F5E9" border="#A5D6A7" color={Colors.green}
              onPress={() => navigation.navigate('ListProduce')}
            />
            <ActionCard
              Icon={BarChart3} label="Market Prices" sublabel="Check today's rates"
              bg="#E3F2FD" border="#90CAF9" color={Colors.info}
              onPress={() => navigation.navigate('PriceCheck')}
            />
            <ActionCard
              Icon={ClipboardList} label="My Orders" sublabel="Track your listings"
              bg="#FFF3E0" border="#FFCC80" color={Colors.warning}
              onPress={() => navigation.navigate('MyListings')}
            />
            <ActionCard
              Icon={Bot} label="E-Katale Advisor" sublabel="Ask about your crops"
              bg="#F3E5F5" border="#CE93D8" color="#6A1B9A"
              onPress={() => navigation.navigate('AIAdvisor')}
            />
          </View>

          {/* Active listings */}
          {listings.length > 0 && (
            <>
              <View style={GS.sectionHeader}>
                <Text style={GS.sectionTitle}>Active Listings</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MyListings')}>
                  <Text style={GS.seeAll}>See all →</Text>
                </TouchableOpacity>
              </View>
              {listings.slice(0, 3).map(l => (
                <ListingRow
                  key={l.id}
                  listing={l}
                  onPress={() => navigation.navigate('ListingDetail', { listingId: l.id })}
                />
              ))}
            </>
          )}

          {/* Empty state */}
          {listings.length === 0 && !isLoading && (
            <View style={GS.emptyState}>
              <Sprout size={48} color={Colors.green} strokeWidth={1.8} />
              <Text style={GS.emptyTitle}>No listings yet</Text>
              <Text style={GS.emptyText}>
                List your produce to start receiving offers from the warehouse
              </Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('ListProduce')}
              >
                <Wheat size={18} color={Colors.textInverse} strokeWidth={2.2} />
                <Text style={s.emptyBtnText}>List Produce Now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Truck tracking shortcut (if active) */}
          {pendingCount > 0 && (
            <View style={s.truckCard}>
              <Truck size={28} color={Colors.warning} strokeWidth={2.2} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.truckTitle}>Truck dispatched</Text>
                <Text style={s.truckSub}>A truck is on the way to collect your produce</Text>
              </View>
              <TouchableOpacity style={s.trackBtn}>
                <Text style={s.trackBtnText}>Track →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeScreen>
  );
}

function ActionCard({
  Icon, label, sublabel, bg, border, color, onPress,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string; sublabel: string;
  bg: string; border: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.actionCard, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[s.actionIcon, { backgroundColor: color }]}>
        <Icon size={25} color={Colors.textInverse} strokeWidth={2.3} />
      </View>
      <Text style={[s.actionLabel, { color }]}>{label}</Text>
      <Text style={s.actionSub}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

function ListingRow({ listing, onPress }: { listing: ProduceListing; onPress: () => void }) {
  return (
    <TouchableOpacity style={GS.listRow} onPress={onPress} activeOpacity={0.75}>
      <View style={GS.iconCircleMd}>
        <Wheat size={22} color={Colors.green} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={GS.listRowText}>{listing.commodityName} — {listing.quantity}{listing.unit}</Text>
        <Text style={GS.listRowSub}>{timeAgo(listing.createdAt)}</Text>
      </View>
      <StatusBadge status={listing.status} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    paddingTop: Space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  helloText: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  helloName: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellWrap: { position: 'relative' },

  greeting: {
    fontSize: 22,
    fontWeight: Font.weight.semiBold,
    color: Colors.textPrimary
  },

  weatherStrip: {
    backgroundColor: '#4C8B6E',
    borderRadius: Layout.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 92, gap: 12,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
  },

  weatherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  weatherCopy: { flex: 1, gap: 3, minWidth: 0 },

  weatherMain: {
    fontSize: 24,
    color: Colors.textInverse,
    fontWeight: Font.weight.bold
  },

  weatherPlace: {
    fontSize: Font.size.label,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: Font.weight.medium
  },

  weatherTipRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  weatherTip: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.78)',
    flexShrink: 1
  },

  rainTag: {
    backgroundColor: 'rgba(249,168,37,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  rainText: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: Font.weight.bold
  },

  // Body
  body: { padding: Space.md, gap: Space.md, paddingBottom: 32 },

  // Stats
  stats: { flexDirection: 'row', gap: 10 },

  stat: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },

  statGreen: {
    backgroundColor: Colors.greenLight,
    borderColor: Colors.greenBorder
  },

  statOrange: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80'
  },

  statVal: {
    fontSize: 22,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary
},
  statLbl: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center'
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },

  actionCard: {
    width: '47%',
    borderRadius: Layout.radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    minHeight: 90,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionLabel: {
    fontSize: 14,
    fontWeight: Font.weight.bold,
    textAlign: 'center'
  },

  actionSub: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    textAlign: 'center'
  },

  // Empty state CTA button
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 8,
  },

  emptyBtnText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse
  },

  // Truck card
  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: Layout.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },

  truckTitle: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.warning
},
  truckSub: {
    fontSize: Font.size.caption,
    color: '#8D4E00'
  },

  trackBtn: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8
  },

  trackBtnText: {
    fontSize: 13,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse
  },
});