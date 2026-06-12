/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '../components/common';
import { GS, Colors } from '@styles/global';
import { formatUGX } from '../utils/currency';

export function PaymentHistory() {
  const payments = [
    { id: '1', crop: 'Maize 500kg', date: 'Apr 5', amount: 727500, status: 'PAID', commission: 22500 },
    { id: '2', crop: 'Beans 200kg', date: 'Apr 10', amount: 142500, status: 'PAID', commission: 7500 },
    { id: '3', crop: 'Sweet Potato 300kg', date: 'Apr 12', amount: 300000, status: 'PROCESSING', commission: 0 },
  ];
  const total = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <ScrollView style={GS.screen} contentContainerStyle={GS.scrollContent}>
      <Text style={GS.pageTitle}>My Payments</Text>

      <View style={GS.summaryCard}>
        <Text style={GS.summaryLabel}>Total earned this month</Text>
        <Text style={GS.summaryValue}>{formatUGX(total)}</Text>
        <Text style={GS.summarySub}>MTN Mobile Money - Active</Text>
      </View>

      {payments.map((payment) => (
        <View key={payment.id} style={GS.listRow}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={GS.listRowText}>{payment.crop} - {payment.date}</Text>
            {payment.commission > 0 && (
              <Text style={GS.listRowSub}>Platform fee: {formatUGX(payment.commission)}</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={[s.rowAmount, payment.status !== 'PAID' && { color: Colors.warning }]}>
              +{formatUGX(payment.amount)}
            </Text>
            <StatusBadge status={payment.status} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default PaymentHistory;

const s = StyleSheet.create({
  rowAmount: { fontSize: 15, fontWeight: '700', color: Colors.green },
});
