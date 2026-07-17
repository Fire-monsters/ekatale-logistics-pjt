// apps/app1-farmer/src/navigation/RootNavigator.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';
import { restoreSession } from '../store/slices/authSlice';
import { Colors } from '../theme';
import { UserRole } from '../types';

import { AuthNavigator } from '../screens/auth/AuthNavigator';
import { FarmerNavigator } from '../screens/farmer/FarmerNavigator';
import { AgentNavigator } from '../screens/field-agents/AgentNavigator';
import { ConsumerNavigator } from '../screens/auth/RoleNavigator';
import { FeedbackDialogProvider } from 'src/providers/FeedbackDialogProvider';

// ─── Auth Stack Param Types ────────────────────────────────────────────────────
// FLOW (details-first):
//   Splash → GetStarted → RoleSelect → FarmerDetails/AgentDetails → PhonePassword → OTPVerify → App

export type AuthStackParams = {
  Splash:          undefined;
  GetStarted:      undefined;
  RoleSelect:      undefined;
  /** Collect farmer profile details before phone/password */
  FarmerDetails:   undefined;
  /** Collect agent profile details before phone/password */
  AgentDetails:    undefined;
  /** Phone number + password entry — shoppers go here directly */
  PhonePassword:   { role: 'farmer' | 'village_agent' | 'consumer' };
  /** OTP sent to phone on registration completion (and on login) */
  OTPVerify:       { countryCode: string; role: 'farmer' | 'village_agent' | 'consumer' };
  /** Returning user login — phone + password only */
  Login:           undefined;
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
  Settings:          undefined;
  TransportTracker:  { jobId?: string } | undefined;
  AIAdvisor:         undefined;
  Notifications:     undefined;
  FarmerProfile:     undefined;
};

export type AgentStackParams = {
  AgentDashboard:    undefined;
  MyFarmers:         undefined;
  RegisterFarmer:    undefined;
  FarmerProfileView: { farmerId: string };
  AgentEarnings:     undefined;
  Notifications:     undefined;
  AgentProfile:      undefined;
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
  const role            = useAppSelector(selectUserRole);
  const [booting, setBooting] = React.useState(true);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setBooting(false));
  }, [dispatch]);

  if (booting) return <LoadingScreen />;

  return (
    <FeedbackDialogProvider>
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isAuthenticated ? (
          role === UserRole.VILLAGE_AGENT ? (
            <Root.Screen name="Agent" component={AgentNavigator} />
          ) : role === UserRole.CONSUMER ? (
            <Root.Screen name="Consumer" component={ConsumerNavigator} />
          ) : (
            <Root.Screen name="Farmer" component={FarmerNavigator} />
          )
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
 </FeedbackDialogProvider>
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
