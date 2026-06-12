/**
 * Role Navigators — stubs for Sprint 3–8
 * Each will be expanded with their full screen sets as those sprints are built.
 * The structure mirrors FarmerNavigator.tsx pattern exactly.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// ─────────────────────────────────────────────
// PLACEHOLDER SCREEN (used until real screens are built)
// ─────────────────────────────────────────────

function PlaceholderScreen({ route }: { route: any }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderEmoji}>🚧</Text>
      <Text style={styles.placeholderTitle}>{route.name}</Text>
      <Text style={styles.placeholderSub}>Coming in Sprint {sprintForRoute(route.name)}</Text>
    </View>
  );
}

function sprintForRoute(name: string): string {
  if (['Warehouse', 'WHDashboard'].includes(name)) return '3';
  if (['SME', 'Grocery'].includes(name)) return '6';
  if (['Consumer', 'Home', 'Cart'].includes(name)) return '6';
  if (['Transport', 'Jobs'].includes(name)) return '5';
  if (['Admin'].includes(name)) return '8';
  return '?';
}

const Tab = createBottomTabNavigator();

// ─────────────────────────────────────────────
// WAREHOUSE NAVIGATOR
// ─────────────────────────────────────────────

export function WarehouseNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="WHDashboard" component={PlaceholderScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Listings" component={PlaceholderScreen} />
      <Tab.Screen name="Inventory" component={PlaceholderScreen} />
      <Tab.Screen name="Procurement" component={PlaceholderScreen} />
      <Tab.Screen name="Dispatch" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────
// SME NAVIGATOR
// ─────────────────────────────────────────────

export function SMENavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="SMEDashboard" component={PlaceholderScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Catalogue" component={PlaceholderScreen} />
      <Tab.Screen name="Storefront" component={PlaceholderScreen} />
      <Tab.Screen name="SMEOrders" component={PlaceholderScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Finance" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────
// GROCERY NAVIGATOR
// ─────────────────────────────────────────────

export function GroceryNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="GroceryDashboard" component={PlaceholderScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="GroceryCatalogue" component={PlaceholderScreen} options={{ title: 'Catalogue' }} />
      <Tab.Screen name="AppShop" component={PlaceholderScreen} options={{ title: 'Shop' }} />
      <Tab.Screen name="POS" component={PlaceholderScreen} />
      <Tab.Screen name="GroceryStock" component={PlaceholderScreen} options={{ title: 'Stock' }} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────
// CONSUMER NAVIGATOR
// ─────────────────────────────────────────────

export function ConsumerNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={PlaceholderScreen} />
      <Tab.Screen name="Search" component={PlaceholderScreen} />
      <Tab.Screen name="Cart" component={PlaceholderScreen} />
      <Tab.Screen name="Orders" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────
// TRANSPORT NAVIGATOR
// ─────────────────────────────────────────────

export function TransportNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Jobs" component={PlaceholderScreen} />
      <Tab.Screen name="Navigation" component={PlaceholderScreen} />
      <Tab.Screen name="Earnings" component={PlaceholderScreen} />
      <Tab.Screen name="DriverProfile" component={PlaceholderScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────
// ADMIN NAVIGATOR
// ─────────────────────────────────────────────

export function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="AdminDashboard" component={PlaceholderScreen} options={{ title: 'Overview' }} />
      <Tab.Screen name="Users" component={PlaceholderScreen} />
      <Tab.Screen name="Disputes" component={PlaceholderScreen} />
      <Tab.Screen name="Reports" component={PlaceholderScreen} />
      <Tab.Screen name="Config" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderEmoji: { fontSize: 48 },
  placeholderTitle: { fontSize: 18, fontWeight: '600', color: '#424242' },
  placeholderSub: { fontSize: 13, color: '#757575' },
});
