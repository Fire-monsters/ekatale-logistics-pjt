import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';

import SplashScreen from '../SplashScreen';
import PhoneEntryScreen from '../PhoneEntryScreen';
import OTPVerifyScreen from './OTPVerifyScreen';
import FarmerRegisterScreen from '../FarmerRegisterScreen';
import RoleSelectScreen from './RoleSelectScreen';

const Stack = createNativeStackNavigator<AuthStackParams>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="FarmerRegister" component={FarmerRegisterScreen} />
    </Stack.Navigator>
  );
}
