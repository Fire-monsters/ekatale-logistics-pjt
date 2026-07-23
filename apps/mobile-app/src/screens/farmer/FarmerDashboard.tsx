/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';

import {
  Bell,
  ClipboardList,
  CreditCard,
  Globe2,
  HeartPulse,
  Menu,
  Phone,
  Sprout,
  Wheat,
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout } from '@styles/global';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectFarmerProfile, selectUserProfile } from '../../store/slices/userSlice';
import { selectActiveListings, fetchMyListings } from '../../store/slices/listingSlice';
import { selectUnreadCount } from '../../store/slices/notificationSlice';

import { Avatar, SafeScreen } from '../../components';
import FarmerDashboardStyles from '@components/FarmerDashboard.styles';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_W - Space.md * 2;

const heroCards = [
  {
    id: 'market',
    title: 'Smart Market for Fresh Produce',
    subtitle: 'Showcase your harvest, earn better rates with every listing.',
    button: 'Explore Marketplace',
    bg: '#2E7D52',
  },
  {
    id: 'pickup',
    title: 'Fast warehouse pickup',
    subtitle: 'Warehouse buyers are ready to collect from your farm.',
    button: 'Explore Marketplace',
    bg: '#2B6E48',
  },
  {
    id: 'insights',
    title: 'See your farm performance',
    subtitle: 'Track crops, listings and earnings all in one place.',
    button: 'Explore Marketplace',
    bg: '#265E3F',
  },
  {
    id: 'support',
    title: 'Grow with e-katale',
    subtitle: 'Get better crop support, pricing and logistics.',
    button: 'Explore Marketplace',
    bg: '#1F4D32',
  },
];

const featureCards = [
  {
    id: 'crops',
    label: 'My Crops',
    Icon: Sprout,
    target: 'MyListings',
    bg: '#E8F5E9',
    border: '#A5D6A7',
    color: Colors.green,
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    Icon: Globe2,
    target: 'PriceCheck',
    bg: '#E3F2FD',
    border: '#90CAF9',
    color: Colors.info,
  },
  {
    id: 'orders',
    label: 'Orders',
    Icon: ClipboardList,
    target: 'MyListings',
    bg: '#FFF3E0',
    border: '#FFCC80',
    color: Colors.warning,
  },
  {
    id: 'earnings',
    label: 'Earnings',
    Icon: CreditCard,
    target: 'PaymentHistory',
    bg: '#F1F8E5',
    border: '#C8E6C9',
    color: Colors.greenMid,
  },
];

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

  const [activeSlide, setActiveSlide] = useState(0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.fullName?.split(' ')[0] ?? 'Farmer';
  const displayName = profile?.fullName ?? firstName;
  const farmerProfile = useAppSelector(selectFarmerProfile);
  const farmLocation = farmerProfile?.district ? `Green Hills Farm, ${farmerProfile.district}` : 'Green Hills Farm';
  const activeListings = Math.max(listings.length, 3);

  const handleHeroScroll = (event: any) => {
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / HERO_WIDTH);
    setActiveSlide(currentIndex);
  };

  return (
    <SafeScreen padded={false} backgroundColor={Colors.bg} statusBarStyle="dark-content">
      <View style={GS.screen}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Avatar uri={profile?.profilePhotoUrl} name={displayName} size={44} />
            <View style={s.headerMeta}>
              <Text style={s.greeting}>{greeting()}, {displayName}</Text>
              <Text style={s.headerFarm}>{farmLocation}</Text>
            </View>
          </View>

          <View style={s.headerRight}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={s.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Bell size={20} color={Colors.textPrimary} strokeWidth={2.4} />
              {unreadCount > 0 && (
                <View style={[GS.badge, { borderColor: Colors.bg, right: -4, top: -4 }]}> 
                  <Text style={GS.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('FarmerProfile')}
              style={[s.iconBtn, s.menuBtn]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Menu size={20} color={Colors.textInverse} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.body}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.green} />}
        >
          <View style={s.heroCarousel}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.heroScrollContent}
              onMomentumScrollEnd={handleHeroScroll}
            >
              {heroCards.map(card => (
                <View key={card.id} style={[s.heroCard, { backgroundColor: card.bg, width: HERO_WIDTH }]}> 
                  <View style={s.heroCopy}>
                    <View style={s.heroLogoRow}>
                      <Text style={s.heroLogoText}>e-katale</Text>
                    </View>
                    <Text style={s.heroTitle}>{card.title}</Text>
                    <Text style={s.heroSubtitle}>{card.subtitle}</Text>
                    <TouchableOpacity
                      style={s.heroCta}
                      onPress={() => navigation.navigate('PriceCheck')}
                      activeOpacity={0.8}
                    >
                      <Text style={s.heroCtaText}>{card.button}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.heroIllustration}>
                    <View style={s.heroIllustrationInner}>
                      <Wheat size={28} color="rgba(255,255,255,0.95)" strokeWidth={2.3} />
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={s.dotRow}>
              {heroCards.map((card, index) => (
                <View
                  key={card.id}
                  style={[s.dot, activeSlide === index && s.dotActive]}
                />
              ))}
            </View>
          </View>

          <Text style={GS.sectionTitle}>Quick actions</Text>
          <View style={s.actionsGrid}>
            <ActionCard
              Icon={Sprout}
              label="My Crops"
              sublabel="View current harvests"
              bg="#E8F5E9"
              border="#A5D6A7"
              color={Colors.green}
              onPress={() => navigation.navigate('MyListings')}
            />
            <ActionCard
              Icon={Globe2}
              label="Marketplace"
              sublabel="Explore fresh produce demand"
              bg="#E3F2FD"
              border="#90CAF9"
              color={Colors.info}
              onPress={() => navigation.navigate('PriceCheck')}
            />
            <ActionCard
              Icon={ClipboardList}
              label="Orders"
              sublabel="Track your listings"
              bg="#FFF3E0"
              border="#FFCC80"
              color={Colors.warning}
              onPress={() => navigation.navigate('MyListings')}
            />
            <ActionCard
              Icon={CreditCard}
              label="Earnings"
              sublabel="Review your payouts"
              bg="#F1F8E5"
              border="#C8E6C9"
              color={Colors.greenMid}
              onPress={() => navigation.navigate('PaymentHistory')}
            />
          </View>

          <View style={s.overviewCard}>
            <View style={s.overviewHeader}>
              <Text style={s.overviewTitle}>Farm Overview</Text>
              <Text style={GS.seeAll}>Summary</Text>
            </View>

            <View style={s.overviewStats}>
              <View style={s.overviewStat}>
                <View style={[s.statIcon, { backgroundColor: Colors.greenLight }]}> 
                  <Sprout size={18} color={Colors.green} strokeWidth={2.2} />
                </View>
                <Text style={s.overviewStatVal}>5</Text>
                <Text style={s.overviewStatLbl}>Total Crops</Text>
              </View>
              <View style={[s.overviewStat, s.overviewStatBorder]}> 
                <View style={[s.statIcon, { backgroundColor: Colors.infoLight }]}> 
                  <ClipboardList size={18} color={Colors.info} strokeWidth={2.2} />
                </View>
                <Text style={s.overviewStatVal}>{activeListings}</Text>
                <Text style={s.overviewStatLbl}>Active Listings</Text>
              </View>
              <View style={[s.overviewStat, s.overviewStatBorder]}> 
                <View style={[s.statIcon, { backgroundColor: Colors.greenLight }]}> 
                  <CreditCard size={18} color={Colors.greenMid} strokeWidth={2.2} />
                </View>
                <Text style={s.overviewStatVal}>UGX 1.2M</Text>
                <Text style={s.overviewStatLbl}>Total Earnings</Text>
              </View>
              <View style={[s.overviewStat, s.overviewStatBorder]}> 
                <View style={[s.statIcon, { backgroundColor: Colors.goldLight }]}> 
                  <HeartPulse size={18} color={Colors.gold} strokeWidth={2.2} />
                </View>
                <Text style={s.overviewStatVal}>92%</Text>
                <Text style={s.overviewStatLbl}>Farm Health</Text>
              </View>
            </View>

            <View style={s.progressRow}>
              <Text style={s.progressLabel}>Overall Farm Health</Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: '92%' }]} />
              </View>
              <Text style={s.progressPct}>92%</Text>
            </View>
          </View>

          <View style={s.ctaBanner}>
            <View style={s.ctaBannerIcon}> 
              <Phone size={22} color={Colors.textInverse} strokeWidth={2.4} />
            </View>
            <View style={s.ctaBannerCopy}>
              <Text style={s.ctaBannerTitle}>List your produce to start receiving offers from the warehouse</Text>
              <Text style={s.ctaBannerSub}>Quickly create a fresh listing and connect with buyers nearby.</Text>
            </View>
            <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('ListProduce')}>
              <Text style={s.ctaBtnText}>+ New Listing</Text>
            </TouchableOpacity>
          </View>
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
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  headerFarm: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    backgroundColor: Colors.green,
  },

  greeting: {
    fontSize: 22,
    fontWeight: Font.weight.semiBold,
    color: Colors.textPrimary,
  },

  body: { padding: Space.md, gap: Space.md, paddingBottom: 32 },

  heroCarousel: { gap: 12 },
  heroScrollContent: { paddingVertical: 0 },
  heroCard: {
    borderRadius: Layout.radius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 170,
    overflow: 'hidden',
    marginRight: 14,
  },
  heroCopy: { flex: 1, gap: 10 },
  heroLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLogoText: {
    fontSize: 18,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    letterSpacing: -0.3,
  },
  heroTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    lineHeight: 28,
    maxWidth: '85%',
  },
  heroSubtitle: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    maxWidth: '100%',
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.textInverse,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  heroCtaText: {
    fontSize: 12,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },
  heroIllustration: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIllustrationInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: Colors.green,
    width: 14,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  actionCard: {
    width: '47%',
    borderRadius: Layout.radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    minHeight: 110,
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
    textAlign: 'center',
  },

  actionSub: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: 16,
    gap: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  overviewTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  overviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overviewStat: { flex: 1, minWidth: 72, alignItems: 'center', gap: 6 },
  overviewStatBorder: { borderLeftWidth: 0.5, borderColor: Colors.border, paddingLeft: 12 },
  overviewStatVal: { fontSize: 20, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  overviewStatLbl: { fontSize: Font.size.caption, color: Colors.textMuted, textAlign: 'center' },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  progressLabel: { fontSize: Font.size.caption, color: Colors.textMuted, width: 120 },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.green },
  progressPct: { fontSize: Font.size.caption, fontWeight: Font.weight.bold, color: Colors.textPrimary, width: 32, textAlign: 'right' },

  ctaBanner: {
    backgroundColor: '#1B5E20',
    borderRadius: Layout.radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaBannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBannerCopy: {
    flex: 1,
    gap: 4,
  },
  ctaBannerTitle: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  ctaBannerSub: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.72)',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.textInverse,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaBtnText: {
    fontSize: 12,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },

  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 8,
  },

  emptyBtnText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },

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
    color: Colors.warning,
  },
  truckSub: {
    fontSize: Font.size.caption,
    color: '#8D4E00',
  },

  trackBtn: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  trackBtnText: {
    fontSize: 13,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
});
