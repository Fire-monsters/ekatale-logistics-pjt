/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { GS, Colors } from '@styles/global';
import { agentApi } from '../../services/api/agents.api';
import { formatUGX } from '../../utils/currency';
import { formatDateMedium } from '../../utils/date';

export default function AgentEarnings() {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-earnings'],
    queryFn: () => agentApi.getEarnings(),
  });

  const total = data?.total ?? 0;
  const history = data?.history ?? [];

  return (
    <ScrollView style={GS.screen} contentContainerStyle={GS.scrollContent}>
      <Text style={GS.pageTitle}>My Earnings</Text>

      <View style={[GS.summaryCard, { backgroundColor: '#6A1B9A' }]}>
        <Text style={GS.summaryLabel}>Total commission earned</Text>
        <Text style={GS.summaryValue}>{formatUGX(total)}</Text>
        <Text style={GS.summarySub}>2% per farmer transaction</Text>
      </View>

      {!isLoading && history.length === 0 && (
        <View style={GS.emptyState}>
          <Text style={GS.emptyEmoji}>💰</Text>
          <Text style={GS.emptyTitle}>No earnings yet</Text>
          <Text style={GS.emptyText}>
            You'll earn 2% commission whenever a farmer you registered completes a sale
          </Text>
        </View>
      )}

      {history.map((item) => (
        <View key={item.id} style={GS.listRow}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={GS.listRowText}>{item.farmerName}</Text>
            <Text style={GS.listRowSub}>{formatDateMedium(item.date)}</Text>
          </View>
          <Text style={s.amount}>+{formatUGX(item.amount)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  amount: { fontSize: 15, fontWeight: '700', color: Colors.green },
});