// apps/app1-farmer/src/screens/auth/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';

import SplashScreen        from '../SplashScreen';
import RoleSelectScreen    from './RoleSelectScreen';
import PhoneEntryScreen    from '../PhoneEntryScreen';
import OTPVerifyScreen     from './OTPVerifyScreen';
import FarmerRegisterScreen from '../farmer/FarmerRegisterScreen';
import AgentRegisterScreen  from '../field-agents/AgentRegisterScreen';

const Stack = createNativeStackNavigator<AuthStackParams>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash"         component={SplashScreen} />
      <Stack.Screen name="RoleSelect"     component={RoleSelectScreen} />

      <Stack.Screen name={"PhoneEntry" as unknown as keyof AuthStackParams} component={PhoneEntryScreen} />
      <Stack.Screen name="OTPVerify"      component={OTPVerifyScreen} />

      <Stack.Screen name={"FarmerRegister" as unknown as keyof AuthStackParams} component={FarmerRegisterScreen} />
      <Stack.Screen name={"AgentRegister" as unknown as keyof AuthStackParams}  component={AgentRegisterScreen} />
    </Stack.Navigator>
  );
}