// apps/app1-farmer/src/screens/auth/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';

import SplashScreen         from '../SplashScreen';
import GetStartedScreen     from '../getStarted';
import RoleSelectScreen     from './RoleSelectScreen';
import FarmerDetailsScreen  from './FarmerDetailsScreem';
import AgentDetailsScreen   from './AgentDetailsScreen';
import PhonePasswordScreen  from './PhonePasswordScreen';
import OTPVerifyScreen      from './OTPVerifyScreen';
import LoginScreen          from './LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParams>();

/**
 * Registration flow (details-first):
 *   Splash → GetStarted → RoleSelect → FarmerDetails / AgentDetails
 *          → PhonePassword (create login credentials)
 *          → OTPVerify (OTP sent on submit of PhonePassword)
 *          → auto-login → RootNavigator switches to app stack
 *
 * Login flow:
 *   Splash → Login → LoginOTPVerify (handled inside OTPVerify via pendingPurpose)
 */
export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="GetStarted" component={GetStartedScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />

      {/* Step 1: capture profile details per role */}
      <Stack.Screen name="FarmerDetails" component={FarmerDetailsScreen} />
      <Stack.Screen name="AgentDetails" component={AgentDetailsScreen} />

      {/* Step 2: phone + password (shared) */}
      <Stack.Screen name="PhonePassword" component={PhonePasswordScreen} />

      {/* Step 3: OTP verification (shared — register & login) */}
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />

      {/* Returning users */}
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
