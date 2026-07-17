import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<AuthStackParams>;

const LOGO = require('../../assets/ekatale-logo.jpg');

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const lift = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 58,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(lift, {
        toValue: 0,
        tension: 58,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'GetStarted' }],
        }),
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [lift, navigation, opacity, scale]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity,
            transform: [{ translateY: lift }, { scale }],
          },
        ]}
      >
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
