/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Font, Layout, Space, getCropEmoji } from '../../theme';
import { SectionHeader } from '../components/common';
import { formatTrend, formatUGX } from '../utils/currency';

const PRICE_CROPS = [
  { id: 'maize', label: 'Maize' },
  { id: 'beans', label: 'Beans' },
  { id: 'cassava', label: 'Cassava' },
  { id: 'matooke', label: 'Matooke' },
];

export function PriceCheck() {
  const [crop, setCrop] = useState('maize');
  const price = { current: 1500, trendPct: 5.3 };
  const markets = [
    { name: 'Owek. Market', price: 1200, vs: 'lower' },
    { name: 'E-Katale Offer', price: 1500, vs: 'katale' },
    { name: 'Kampala Whlsl.', price: 1800, vs: 'higher' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Market Prices</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRICE_CROPS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.cropPill, crop === item.id && styles.cropPillActive]}
              onPress={() => setCrop(item.id)}
            >
              <Text style={styles.cropEmoji}>{getCropEmoji(item.id)}</Text>
              <Text style={[styles.cropPillText, crop === item.id && styles.cropPillTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>E-Katale farmgate price today</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Text style={styles.priceVal}>{formatUGX(price.current)}<Text style={styles.priceUnit}>/kg</Text></Text>
          <View style={[styles.trendBadge, { backgroundColor: Colors.greenLight }]}>
            <Text style={[styles.trendText, { color: Colors.green }]}>↑ {formatTrend(price.trendPct)}</Text>
          </View>
        </View>
      </View>

      <SectionHeader title="Market Comparison" />
      {markets.map((market) => (
        <View key={market.name} style={[styles.marketRow, market.vs === 'katale' && styles.marketRowKatale]}>
          <Text style={styles.marketName}>{market.name}</Text>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <View
              style={[
                styles.marketBar,
                {
                  width: `${(market.price / 1800) * 100}%`,
                  backgroundColor: market.vs === 'katale' ? Colors.green : market.vs === 'higher' ? Colors.info : '#E0E0E0',
                },
              ]}
            />
          </View>
          <Text style={styles.marketPrice}>{formatUGX(market.price)}/kg</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export default PriceCheck;

const styles = StyleSheet.create({
  scroll: { padding: Space.md, gap: Space.md },
  title: { fontSize: Font.size.title, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  cropPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.radius.pill,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.bg,
  },
  cropPillActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  cropEmoji: { fontSize: 18 },
  cropPillText: { fontSize: 14, fontWeight: Font.weight.medium, color: Colors.textMuted },
  cropPillTextActive: { color: Colors.green },
  priceCard: {
    backgroundColor: Colors.greenLight,
    borderRadius: Layout.radius.lg,
    padding: Space.md,
    borderWidth: 0.5,
    borderColor: Colors.greenBorder,
    gap: 8,
  },
  priceLabel: { fontSize: Font.size.caption, color: Colors.textMuted },
  priceVal: { fontSize: 32, fontWeight: Font.weight.bold, color: Colors.green },
  priceUnit: { fontSize: 16, color: Colors.textMuted, fontWeight: Font.weight.regular },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  trendText: { fontSize: 14, fontWeight: Font.weight.bold },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  marketRowKatale: { borderColor: Colors.greenBorder, backgroundColor: Colors.greenLight },
  marketName: { fontSize: Font.size.label, fontWeight: Font.weight.medium, color: Colors.textSecondary, width: 110 },
  marketBar: { height: 8, borderRadius: 4 },
  marketPrice: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.green },
});
