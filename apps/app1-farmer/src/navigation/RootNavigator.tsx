// apps/app1-farmer/src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { restoreSession } from '../store/slices/authSlice';
import { Colors } from '../../theme';

import { AuthNavigator } from '../screens/auth/AuthNavigator';
import { FarmerNavigator } from '../screens/farmer/FarmerNavigator';

// ─── Auth Stack Param Types ────────────────────────────────────────────────────
// NEW FLOW:
//   Splash → RoleSelect → FarmerDetails/AgentDetails → PhonePassword → OTPVerify → App

export type AuthStackParams = {
  Splash:          undefined;
  RoleSelect:      undefined;
  /** Collect farmer profile details before phone/password */
  FarmerDetails:   undefined;
  /** Collect agent profile details before phone/password */
  AgentDetails:    undefined;
  /** Phone number + password entry — always comes after details */
  PhonePassword:   { role: 'farmer' | 'village_agent' };
  /** OTP sent to phone on registration completion */
  OTPVerify:       { countryCode: string; role: 'farmer' | 'village_agent' };
  /** Returning user login — phone + password only */
  Login:           undefined;
  /** Forgot / reset password via OTP */
  LoginOTPVerify:  { countryCode: string };
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

// Agent stack mirrors farmer for now; expanded in Sprint 3
export type AgentStackParams = {
  AgentDashboard:  undefined;
  MyFarmers:       undefined;
  RegisterFarmer:  undefined;
  AgentEarnings:   undefined;
  Notifications:   undefined;
};

export type RootStackParamList = AuthStackParams & FarmerStackParams & AgentStackParams;

const Root = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.green} />
    </View>
  );
}

export function RootNavigator() {
  const dispatch        = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [booting, setBooting] = React.useState(true);

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