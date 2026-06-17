/* MyListings - adds offline pending-sync badge and sync indicator */

/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { FarmerStackParams } from '../../navigation/RootNavigator';
import { GS, Colors, Space, getCropEmoji } from '@styles/global';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMyListings,
  selectAllListings,
  selectPendingSyncCount,
  selectIsSyncing,
  syncPendingListings,
} from '../../store/slices/listingSlice';
import { selectIsOnline } from '../../store/slices/offlineQueueSlice';
import { Button, EmptyState, SafeScreen, StatusBadge } from '../../components/common';
import { timeAgo } from '../../utils/date';
import type { ProduceListing } from '../../types';

type Nav = NativeStackNavigationProp<FarmerStackParams>;
type Tab = 'active' | 'completed' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
];

export function MyListings() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>('active');
  const listings = useAppSelector(selectAllListings);
  const pendingSyncCount = useAppSelector(selectPendingSyncCount);
  const isSyncing = useAppSelector(selectIsSyncing);
  const isOnline = useAppSelector(selectIsOnline);

  const { isLoading, refetch } = useQuery({
    queryKey: ['listings'],
    queryFn: () => dispatch(fetchMyListings()).unwrap(),
  });

  // When connectivity returns, push any queued listings then refresh
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0) {
      dispatch(syncPendingListings()).then(() => refetch());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const filtered = listings.filter((listing) => {
    if (tab === 'active') return !['PAID', 'REJECTED', 'EXPIRED', 'CANCELLED'].includes(listing.status);
    if (tab === 'completed') return ['PAID', 'REJECTED', 'CANCELLED'].includes(listing.status);
    return true;
  });

  const renderItem = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity
      style={GS.listRow}
      onPress={() => !item.pendingSync && navigation.navigate('ListingDetail', { listingId: item.id })}
      activeOpacity={item.pendingSync ? 1 : 0.75}
    >
      <View style={GS.iconCircleMd}>
        <Text style={{ fontSize: 24 }}>{getCropEmoji(item.commodityId)}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={GS.listRowText}>{item.commodityName} - {item.quantity}{item.unit}</Text>
        <Text style={GS.listRowSub}>{timeAgo(item.createdAt)}</Text>
      </View>
      {item.pendingSync ? (
        <View style={s.queuedBadge}>
          <Text style={s.queuedText}>📶 Queued</Text>
        </View>
      ) : (
        <StatusBadge status={item.status} />
      )}
    </TouchableOpacity>
  );

  return (
   <SafeScreen padded={false} backgroundColor={Colors.bg}>
     <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={styles.header}>
        <Text style={[GS.pageTitle, { marginBottom: Space.sm }]}>My Orders</Text>
        <View style={{ flexDirection: 'row' }}>
          {TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[GS.tab, tab === item.key && GS.tabActive]}
              onPress={() => setTab(item.key)}
            >
              <Text style={[GS.tabText, tab === item.key && GS.tabTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {pendingSyncCount > 0 && (
        <View style={s.syncBanner}>
          <Text style={s.syncText}>
            {isSyncing
              ? '🔄 Syncing queued listings…'
              : isOnline
                ? `📶 ${pendingSyncCount} listing${pendingSyncCount > 1 ? 's' : ''} waiting to sync…`
                : `📴 ${pendingSyncCount} listing${pendingSyncCount > 1 ? 's' : ''} saved offline — will sync when connected`}
          </Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Space.md, gap: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.green} />}
        ListEmptyComponent={
          <EmptyState
            emoji="📋"
            title={tab === 'active' ? 'No active listings' : 'No completed orders'}
            description="List your produce to start receiving offers"
            action={<Button label="+ List Produce" onPress={() => navigation.navigate('ListProduce')} />}
          />
        }
      />
     </View>
   </SafeScreen>
  );
}

export default MyListings;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Space.md,
    paddingTop: Space.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
});

const s = StyleSheet.create({
  syncBanner: {
    backgroundColor: '#FFF3E0', 
    paddingVertical: 8, paddingHorizontal: Space.md,
    borderBottomWidth: 0.5, borderBottomColor: '#FFCC80',
  },
  syncText: { fontSize: 12, color: '#E65100', fontWeight: '500', textAlign: 'center' },
  queuedBadge: {
    backgroundColor: '#FFF3E0', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  queuedText: { fontSize: 11, fontWeight: '600', color: '#E65100' },
});