/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { GS, Colors, Font, Space, Layout } from '@styles/global';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAuthUser, logoutThunk } from '../../store/slices/authSlice';

export default function AgentProfile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
    ]);
  };

  return (
    <ScrollView style={GS.screen} contentContainerStyle={GS.scrollContent}>
      <Text style={GS.pageTitle}>My Profile</Text>

      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 32 }}>🧑‍💼</Text>
        </View>
        <Text style={s.name}>{user?.fullName ?? 'Field Agent'}</Text>
        <Text style={s.phone}>{user?.phone ?? '—'}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleBadgeText}>Field Agent</Text>
        </View>
      </View>

      <View style={s.infoCard}>
        <Text style={s.infoTitle}>💰 Commission</Text>
        <Text style={s.infoText}>
          You earn 2% commission on every transaction completed by farmers you've registered.
          Payments go to your Mobile Money within 24 hours of each sale.
        </Text>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={s.supportBox}>
        <Text style={s.supportText}>📞 Need help? Call E-Katale operations</Text>
        <Text style={s.supportPhone}>0800-100-200 (Free)</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: Layout.radius.lg,
    padding: Space.lg, alignItems: 'center', gap: 6,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EDE7F6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  name: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  phone: { fontSize: Font.size.body, color: Colors.textMuted },
  roleBadge: {
    backgroundColor: '#EDE7F6', borderRadius: Layout.radius.pill,
    paddingHorizontal: 14, paddingVertical: 6, marginTop: 6,
    borderWidth: 1, borderColor: '#CE93D8',
  },
  roleBadgeText: { fontSize: Font.size.label, color: '#6A1B9A', fontWeight: Font.weight.semiBold },

  infoCard: {
    backgroundColor: '#EDE7F6', borderRadius: Layout.radius.md,
    padding: Space.md, gap: 6, borderWidth: 1, borderColor: '#CE93D8',
  },
  infoTitle: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: '#6A1B9A' },
  infoText: { fontSize: Font.size.caption, color: '#7B1FA2', lineHeight: 20 },

  logoutBtn: {
    backgroundColor: Colors.errorLight, borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.error },

  supportBox: {
    backgroundColor: Colors.greenLight, borderRadius: Layout.radius.md,
    padding: 14, gap: 2, borderWidth: 0.5, borderColor: Colors.greenBorder,
    alignItems: 'center',
  },
  supportText: { fontSize: Font.size.label, color: Colors.green },
  supportPhone: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.green },
});