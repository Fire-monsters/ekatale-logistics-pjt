import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '../../store/hooks';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import { Colors, Font } from '../../../theme';
import type { AgentStackParams } from '../../navigation/RootNavigator';

import AgentDashboard from './AgentDashboard';
import MyFarmers from './MyFarmers';
import RegisterFarmer from './RegisterFarmer';
import AgentEarnings from './AgentEarnings';
import AgentProfile from '../field-agents/Agentprofile';
import FarmerProfileView from '../farmer/FarmerProfileView';
import { Notifications } from '../Notifications';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AgentStackParams>();

function TabIcon({
  emoji, label, focused, badge,
}: {
  emoji: string; label: string; focused: boolean; badge?: number;
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

function AgentTabs() {
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
        name="AgentDashboard"
        component={AgentDashboard}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="MyFarmers"
        component={MyFarmers}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Farmers" focused={focused} /> }}
      />
      <Tab.Screen
        name="AgentEarnings"
        component={AgentEarnings}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Earnings" focused={focused} /> }}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" label="Alerts" focused={focused} badge={unreadCount} /> }}
      />
      <Tab.Screen
        name="AgentProfile"
        component={AgentProfile}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function AgentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgentDashboard" component={AgentTabs} />
      <Stack.Screen
        name="RegisterFarmer"
        component={RegisterFarmer}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="FarmerProfileView"
        component={FarmerProfileView}
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
  tabItem: { alignItems: 'center', gap: 2, minWidth: 48 },
  tabIconWrap: { position: 'relative' },
  tabEmoji: { fontSize: 22, opacity: 0.45 },
  tabEmojiFocused: { opacity: 1 },
  tabLabel: { fontSize: 10, color: Colors.textDisabled, fontWeight: Font.weight.medium },
  tabLabelFocused: { color: '#6A1B9A', fontWeight: Font.weight.bold },
  tabBadge: {
    position: 'absolute', top: -4, right: -6,
    backgroundColor: Colors.error, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 1.5, borderColor: Colors.surface,
  },
  tabBadgeText: { fontSize: 9, color: Colors.textInverse, fontWeight: Font.weight.bold },
});