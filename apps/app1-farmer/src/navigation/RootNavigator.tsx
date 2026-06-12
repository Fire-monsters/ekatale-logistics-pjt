import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { loginSuccess } from '../store/slices/authSlice';
import { Colors } from '../../theme';

// ─── Navigators ───────────────────────────────────────────────────────────────
import { AuthNavigator } from '../screens/auth/AuthNavigator';
import { FarmerNavigator } from '../screens/FarmerNavigator';

// ─── Type exports (used by screens for navigation typing) ─────────────────────
export type AuthStackParams = {
  Splash: undefined;
  RoleSelect: undefined;
  PhoneEntry: undefined;
  OTPVerify: { phone: string; countryCode: string; role?: string };
  FarmerRegister: { phone: string } | undefined;
};

export type FarmerStackParams = {
  Dashboard: undefined;
  FarmerDashboard: undefined;
  ListProduce: undefined;
  ListProducePhotos: { listingDraftId: string };
  MyListings: undefined;
  ListingDetail: { listingId: string };
  PriceCheck: undefined;
  PaymentHistory: undefined;
  TransportTracker: { jobId?: string } | undefined;
  AIAdvisor: undefined;
  Notifications: undefined;
  FarmerProfile: undefined;
};

export type RootStackParamList = AuthStackParams & FarmerStackParams;

// ─── Stack ────────────────────────────────────────────────────────────────────
const Root = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.green} />
    </View>
  );
}

export function RootNavigator() {
  const dispatch = useAppDispatch( );
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [booting, setBooting] = React.useState(true);

  // On cold start, restore persisted token so the user stays logged in
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          // Minimal rehydration — full profile loaded by FarmerNavigator on mount
          dispatch(
            loginSuccess({
              user: { id: '', phone: '', role: 'FARMER' as any, language: 'en' },
              tokens: { accessToken: token, refreshToken: '' },
            }),
          );
        }
      } catch {
        // Ignore — treat as logged out
      } finally {
        setBooting(false);
      }
    })();
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