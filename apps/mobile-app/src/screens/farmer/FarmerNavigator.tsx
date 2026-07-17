import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ClipboardList,
  CreditCard,
  Home,
  PresentationIcon,
  Settings,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUserProfile, fetchFarmerProfile } from '../../store/slices/userSlice';
import { selectUserRole } from '../../store/slices/authSlice';
import { Colors, Font, Space } from '../../theme';
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
import { PersonStanding, User } from 'lucide-react-native/icons';

// ─── Tab navigator ────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<FarmerStackParams>();

// Each tab gets its own accent colour when active, instead of one uniform
// green pill for every tab.
const TAB_ACCENTS = {
  home: Colors.green,
  orders: Colors.info,
  payments: '#B45309',
  settings: '#37474F',
} as const;

// Custom tab bar item: inactive = icon only, active = coloured pill + label.
function TabIcon({
  Icon,
  label,
  focused,
  accentColor,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  focused: boolean;
  accentColor: string;
}) {
  return (
    <View
      style={[
        styles.tabItem,
        focused && { backgroundColor: accentColor, minWidth: 104 },
      ]}
    >
      <View style={styles.tabIconWrap}>
        <Icon size={21} color={focused ? Colors.textInverse : Colors.textMuted} strokeWidth={2.4} />
      </View>
      {focused && <Text style={styles.tabLabelFocused}>{label}</Text>}
    </View>
  );
}

function renderHomeTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={Home} label="Home" focused={focused} accentColor={TAB_ACCENTS.home} />;
}

function renderOrdersTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={ClipboardList} label="Orders" focused={focused} accentColor={TAB_ACCENTS.orders} />;
}

function renderPaymentsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={CreditCard} label="Payments" focused={focused} accentColor={TAB_ACCENTS.payments} />;
}

function renderSettingsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon Icon={User} label="Profile" focused={focused} accentColor={TAB_ACCENTS.settings} />;
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
        options={{ tabBarIcon: renderHomeTabIcon }}
      />
      <Tab.Screen
        name="MyListings"
        component={MyListings}
        options={{ tabBarIcon: renderOrdersTabIcon }}
      />
      <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistory}
        options={{ tabBarIcon: renderPaymentsTabIcon }}
      />
      <Tab.Screen
        name="Settings"
        component={FarmerProfile}
        options={{ tabBarIcon: renderSettingsTabIcon }}
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
      <Stack.Screen name="Dashboard" component={FarmerTabs} />

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
  tabIconWrap: {
    position: 'relative',
  },
  tabLabelFocused: {
    color: Colors.textInverse,
    fontWeight: Font.weight.bold,
    fontSize: 12,
  },
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