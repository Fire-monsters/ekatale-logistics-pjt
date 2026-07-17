/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';

import { Avatar } from '../../components';
import { selectUserProfile } from '../../store/slices/userSlice';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { AgentStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Font, Space, Layout } from '@styles/global';
import { useAppSelector } from '../../store/hooks';
import { selectAuthUser } from '../../store/slices/authSlice';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import { agentApi } from '../../services/api/agents.api';

type Nav = NativeStackNavigationProp<AgentStackParams>;

export default function AgentDashboard() {
  const navigation = useNavigation<Nav>();
  const user = useAppSelector(selectAuthUser);
  const profile = useAppSelector(selectUserProfile);
  const unreadCount = useAppSelector(selectUnreadCount);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['agent-summary'],
    queryFn: () => agentApi.getSummary(),
    staleTime: 5 * 60_000,
  });

  const firstName = user?.fullName?.split(' ')[0] ?? 'Agent';
  const farmersRegistered = data?.totalFarmersReg ?? 0;
  const totalEarnings = data?.totalEarnings ?? 0;

  return (
    <View style={GS.screen}>
      {/* Header */}
      <View style={s.header}>
  {/* ── Left: avatar + greeting ── */}
  <View style={s.headerLeft}>
    <Avatar
      uri={profile?.profilePhotoUrl}
      name={user?.fullName ?? firstName}
      size={40}
      style={s.avatarBorder}
    />
    <View>
      <Text style={s.helloLabel}>Hello,</Text>
      <Text style={s.helloName}>{firstName}</Text>
    </View>
  </View>

  {/* ── Right: bell + menu ── */}
  <View style={s.headerRight}>
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      style={s.bellWrap}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={{ fontSize: 22, color: '#fff' }}>🔔</Text>
      {unreadCount > 0 && (
        <View style={[GS.badge, { borderColor: '#6A1B9A' }]}>
          <Text style={GS.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={s.menuIcon}>☰</Text>
    </TouchableOpacity>
  </View>
</View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.body}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6A1B9A" />}
      >
        {/* Stats */}
        <View style={s.stats}>
          <View style={[s.stat, s.statPurple]}>
            <Text style={[s.statVal, { color: '#6A1B9A' }]}>{farmersRegistered}</Text>
            <Text style={s.statLbl}>Farmers Registered</Text>
          </View>
          <View style={[s.stat, s.statGreen]}>
            <Text style={[s.statVal, { color: Colors.green }]}>
              UGX {totalEarnings.toLocaleString('en-UG')}
            </Text>
            <Text style={s.statLbl}>Earnings</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={GS.sectionTitle}>What do you need?</Text>
        <View style={s.actionsGrid}>
          <ActionCard
            emoji="👥" label="Register Farmer" sublabel="Add a new farmer"
            bg="#EDE7F6" border="#CE93D8" color="#6A1B9A"
            onPress={() => navigation.navigate('RegisterFarmer')}
          />
          <ActionCard
            emoji="📋" label="My Farmers" sublabel="View registered farmers"
            bg="#E8F5E9" border="#A5D6A7" color={Colors.green}
            onPress={() => navigation.navigate('MyFarmers')}
          />
          <ActionCard
            emoji="💰" label="Earnings" sublabel="Track your commission"
            bg="#FFF3E0" border="#FFCC80" color={Colors.warning}
            onPress={() => navigation.navigate('AgentEarnings')}
          />
          <ActionCard
            emoji="👤" label="Profile" sublabel="Your account details"
            bg="#E3F2FD" border="#90CAF9" color={Colors.info}
            onPress={() => navigation.navigate('AgentProfile')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ActionCard({
  emoji, label, sublabel, bg, border, color, onPress,
}: {
  emoji: string; label: string; sublabel: string;
  bg: string; border: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.actionCard, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={s.actionEmoji}>{emoji}</Text>
      <Text style={[s.actionLabel, { color }]}>{label}</Text>
      <Text style={s.actionSub}>{sublabel}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#6A1B9A',
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
  avatarBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  helloLabel: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
  },
  helloName: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellWrap: { position: 'relative' },
  menuIcon: { fontSize: 22, color: Colors.textInverse },

  greeting: { fontSize: Font.size.body, fontWeight: Font.weight.semiBold, color: Colors.textInverse },

  body: { padding: Space.md, gap: Space.md, paddingBottom: 48 },

  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Layout.radius.md,
    padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border,
  },
  statPurple: { backgroundColor: '#EDE7F6', borderColor: '#CE93D8' },
  statGreen: { backgroundColor: Colors.greenLight, borderColor: Colors.greenBorder },
  statVal: { fontSize: 18, fontWeight: Font.weight.bold, color: Colors.textPrimary, textAlign: 'center' },
  statLbl: { fontSize: Font.size.caption, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: '47%', borderRadius: Layout.radius.lg, padding: 16,
    alignItems: 'center', gap: 5, borderWidth: 1,
    minHeight: 90,
  },
  actionEmoji: { fontSize: 30 },
  actionLabel: { fontSize: 14, fontWeight: Font.weight.bold, textAlign: 'center' },
  actionSub: { fontSize: Font.size.caption, color: Colors.textMuted, textAlign: 'center' },
});