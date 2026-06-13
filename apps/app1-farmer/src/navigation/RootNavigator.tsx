// apps/app1-farmer/src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { restoreSession } from '../store/slices/authSlice';
import { Colors } from '../../theme';

// ─── Navigators ───────────────────────────────────────────────────────────────
import { AuthNavigator } from '../screens/auth/AuthNavigator';
import { FarmerNavigator } from '../screens/FarmerNavigator';

// ─── Route param types ─────────────────────────────────────────────────────────

export type AuthStackParams = {
  Splash:         undefined;
  RoleSelect:     undefined;
  /** mode='register' → new user flow; mode='login' → returning user */
  PhoneEntry:     { mode: 'register' | 'login'; role?: 'farmer' | 'village_agent' };
  /** phone+purpose are in Redux; only role (for post-verify routing) and countryCode needed here */
  OTPVerify:      { countryCode: string; role?: 'farmer' | 'village_agent' };
  FarmerRegister: { phone: string; countryCode: string };
  AgentRegister:  { phone: string; countryCode: string };
};

export type FarmerStackParams = {
  Dashboard:         undefined;
  FarmerDashboard:   undefined;
  ListProduce:       undefined;
  ListProducePhotos: { listingDraftId: string };
  MyListings:        undefined;
  ListingDetail:     { listingId: string };
  PriceCheck:        undefined;
  PaymentHistory:    undefined;
  TransportTracker:  { jobId?: string } | undefined;
  AIAdvisor:         undefined;
  Notifications:     undefined;
  FarmerProfile:     undefined;
};

export type RootStackParamList = AuthStackParams & FarmerStackParams;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Root = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.green} />
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function RootNavigator() {
  const dispatch       = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [booting, setBooting] = React.useState(true);

  // On cold start: validate persisted token by calling /auth/me
  useEffect(() => {
    dispatch(restoreSession()).finally(() => setBooting(false));
  }, [dispatch]);

  if (booting) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          <Root.Screen name="Farmer" component={FarmerNavigator} />
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});