import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ClipboardList,
  CreditCard,
  Home,
  Settings,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile, fetchFarmerProfile } from '../../store/slices/userSlice';
import { selectUserRole } from '../../store/slices/authSlice';
import { Colors, Font, Space } from '../../../theme';
import type { FarmerStackParams } from '../../navigation/RootNavigator';
import { UserRole } from '../../types';

// ─── Screens ──────────────────────────────────────────────────────────────────
import FarmerDashboard from './FarmerDashboard';
import ListProduce from './ListProduce';
import ListProducePhotos from './ListProducePhotos';
import { MyListings } from './MyListings';
import { PriceCheck } from './PriceCheck';
import { PaymentHistory } from '../PaymentHistory';
import { AIAdvisor } from '../AIAdvisor';
import { Notifications } from '../Notifications';
import FarmerProfile from './FarmerProfile';
import ListingDetail from './ListingDetail';
import { TransportTracker } from '../TransportTracker';

// ─── Tab navigator ────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<FarmerStackParams>();

// Custom tab bar item: inactive icons only, active tab gets the label.
function TabIcon({
  Icon,
  label,
  focused,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      <View style={styles.tabIconWrap}>
        <Icon size={21} color={focused ? Colors.textInverse : Colors.textMuted} strokeWidth={2.4} />
      </View>
      {focused && <Text style={styles.tabLabelFocused}>{label}</Text>}
    </View>
  );
}

function renderHomeTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={Home} label="Home" focused={focused} />;
}

function renderOrdersTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={ClipboardList} label="Orders" focused={focused} />;
}

function renderPaymentsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={CreditCard} label="Payments" focused={focused} />;
}

function renderSettingsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={Settings} label="Settings" focused={focused} />;
}

// Bottom tab navigator - the 4 primary tabs
function FarmerTabs() {
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
          tabBarIcon: renderHomeTabIcon,
        }}
      />
      <Tab.Screen
        name="MyListings"
        component={MyListings}
        options={{
          tabBarIcon: renderOrdersTabIcon,
        }}
      />
      <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistory}
        options={{
          tabBarIcon: renderPaymentsTabIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={FarmerProfile}
        options={{
          tabBarIcon: renderSettingsTabIcon,
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
        name="PriceCheck"
        component={PriceCheck}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
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
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    minWidth: 48,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
  },
  tabItemFocused: {
    minWidth: 104,
    backgroundColor: Colors.greenMid,
  },
  tabIconWrap: {
    position: 'relative',
  },
  tabLabelFocused: {
    color: Colors.textInverse,
    fontWeight: Font.weight.bold,
    fontSize: 12,
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
