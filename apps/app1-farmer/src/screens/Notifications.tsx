/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GS, Colors, Font, Space } from '@styles/global';
import { useAppSelector } from '../store/hooks';
import { selectNotifications } from '../store/slices/notificationSlice';

const MOCK = [
  { id: '1', icon: '🚚', bg: '#FFF3E0', title: 'Truck dispatched', msg: 'Arriving in ~2 hours to collect your maize', ts: '2 hours ago', unread: true },
  { id: '2', icon: '📋', bg: '#E3F2FD', title: 'New order placed', msg: 'Warehouse ordered 500kg of your maize', ts: '5 hours ago', unread: true },
  { id: '3', icon: '💰', bg: '#E8F5E9', title: 'Payment received', msg: 'UGX 150,000 sent to your MTN MoMo', ts: 'Yesterday', unread: false },
];

export function Notifications() {
  useAppSelector(selectNotifications);

  return (
    <View style={GS.screen}>
      <View style={GS.header}>
        <Text style={GS.pageTitle}>Notifications</Text>
        <TouchableOpacity><Text style={GS.linkText}>Mark all read</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: Space.md, gap: 2 }} showsVerticalScrollIndicator={false}>
        {MOCK.map((item, index) => (
          <View key={item.id}>
            {index === 0 && <Text style={s.dayLabel}>TODAY</Text>}
            <TouchableOpacity style={[s.row, item.unread && s.rowUnread]}>
              {item.unread && <View style={[GS.unreadDot, { marginTop: 6 }]} />}
              <View style={[GS.iconCircleSm, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={GS.listRowText}>{item.title}</Text>
                <Text style={GS.listRowSub} numberOfLines={2}>{item.msg}</Text>
                <Text style={GS.listRowMeta}>{item.ts}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default Notifications;

// Only screen-specific styles that have no GS equivalent
const s = StyleSheet.create({
  dayLabel: {
    fontSize: 10,
    fontWeight: Font.weight.bold,
    color: Colors.textMuted,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  rowUnread: { backgroundColor: '#F8FFF8' },
});
