/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { AgentStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Space } from '@styles/global';
import { Button, EmptyState } from '../../components/common';
import { agentApi } from '../../services/api/agents.api';
import type { FarmerProfile } from '../../types';

type Nav = NativeStackNavigationProp<AgentStackParams>;

export default function MyFarmers() {
  const navigation = useNavigation<Nav>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['agent-farmers'],
    queryFn: () => agentApi.getMyFarmers(),
  });

  const farmers = data ?? [];

  const renderItem = ({ item }: { item: FarmerProfile }) => (
    <TouchableOpacity
      style={GS.listRow}
      onPress={() => navigation.navigate('FarmerProfileView', { farmerId: item.userId ?? '' })}
      activeOpacity={0.75}
    >
      <View style={[GS.iconCircleMd, { backgroundColor: '#EDE7F6' }]}>
        <Text style={{ fontSize: 22 }}>🌾</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={GS.listRowText}>{item.fullName ?? 'Unnamed farmer'}</Text>
        <Text style={GS.listRowSub}>
          {item.district ?? 'No district'} · {item.farmSizeAcres ?? 0} acres
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: '#6A1B9A' }}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={styles.header}>
        <Text style={GS.pageTitle}>My Farmers</Text>
        <Text style={GS.fieldHint}>{farmers.length} registered</Text>
      </View>

      <FlatList
        data={farmers}
        keyExtractor={(item, idx) => item.userId ?? String(idx)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Space.md, gap: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#6A1B9A" />}
        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title="No farmers registered yet"
            description="Register farmers in your territory to start earning commission"
            action={<Button label="+ Register Farmer" onPress={() => navigation.navigate('RegisterFarmer')} />}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Space.md,
    paddingTop: Space.md,
    paddingBottom: Space.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: 2,
  },
});