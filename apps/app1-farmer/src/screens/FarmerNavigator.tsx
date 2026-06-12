import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile, fetchFarmerProfile } from '../store/slices/userSlice';
import { selectUserRole } from '../store/slices/authSlice';
import { selectUnreadCount } from '../store/slices/notificationSlice';
import { Colors, Font, Space } from '../../theme';
import type { FarmerStackParams } from '../navigation/RootNavigator';
import { UserRole } from '../types';

// ─── Screens ──────────────────────────────────────────────────────────────────
import FarmerDashboard from './FarmerDashboard';
import ListProduce from './ListProduce';
import ListProducePhotos from './ListProducePhotos';
import { MyListings } from './MyListings';
import { PriceCheck } from './PriceCheck';
import { PaymentHistory } from './PaymentHistory';
import { AIAdvisor } from './AIAdvisor';
import { Notifications } from './Notifications';
import FarmerProfile from './FarmerProfile';
import ListingDetail from './ListingDetail';
import { TransportTracker } from './TransportTracker';

// ─── Tab navigator ────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<FarmerStackParams>();

// Custom tab bar icon with badge support
function TabIcon({
  emoji,
  label,
  focused,
  badge,
}: {
  emoji: string;
  label: string;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={styles.tabItem}>
      <View style={styles.tabIconWrap}>
        <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
        {!!badge && badge > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

// Back button header component
function BackHeader({ title }: { title: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParams>>();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );
}

// Bottom tab navigator - the 5 primary tabs
function FarmerTabs() {
  const unreadCount = useAppSelector(selectUnreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="FarmerDashboard"
        component={FarmerDashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MyListings"
        component={MyListings}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Orders" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PriceCheck"
        component={PriceCheck}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📊" label="Prices" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistory}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label="Payments" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔔" label="Alerts" focused={focused} badge={unreadCount} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Full stack navigator wrapping the tabs (allows pushing detail screens on top)
export function FarmerNavigator() {
  const dispatch = useAppDispatch();
  const role = useAppSelector(selectUserRole);

  useEffect(() => {
    dispatch(fetchUserProfile());
    if (role === UserRole.FARMER || !role) {
      dispatch(fetchFarmerProfile());
    }
  }, [dispatch, role]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tab shell */}
      <Stack.Screen name="Dashboard" component={FarmerTabs} />

      {/* Full-screen stacked screens */}
      <Stack.Screen
        name="ListProduce"
        component={ListProduce}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ListProducePhotos"
        component={ListProducePhotos}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetail}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AIAdvisor"
        component={AIAdvisor}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="FarmerProfile"
        component={FarmerProfile}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TransportTracker"
        component={TransportTracker}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 48,
  },
  tabIconWrap: {
    position: 'relative',
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.45,
  },
  tabEmojiFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textDisabled,
    fontWeight: Font.weight.medium,
  },
  tabLabelFocused: {
    color: Colors.green,
    fontWeight: Font.weight.bold,
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  tabBadgeText: {
    fontSize: 9,
    color: Colors.textInverse,
    fontWeight: Font.weight.bold,
  },
  // Header shared by stack screens
  header: {
    height: 56,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: Colors.green,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
});