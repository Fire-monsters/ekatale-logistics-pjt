// apps/app1-farmer/src/screens/auth/SplashScreen.tsx
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguagePreference, selectLanguage } from '../store/slices/userSlice';

type Nav = NativeStackNavigationProp<AuthStackParams>;

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'lg', label: 'LG' },
  { code: 'sw', label: 'SW' },
  { code: 'rn', label: 'RN' },
];

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();
  const lang       = useAppSelector(selectLanguage);

  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const slideUp     = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, useNativeDriver: true, tension: 55, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(slideUp,     { toValue: 0, useNativeDriver: true, tension: 60, friction: 8 }),
      ]),
    ]).start();
  }, [cardOpacity, logoOpacity, logoScale, slideUp]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green} />

      <View style={styles.hero}>
        <Animated.View style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          alignItems: 'center',
          gap: 14,
        }}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.appName}>E-Katale</Text>
            <Text style={styles.tagline}>AI &amp; Robotics for a Smarter Uganda</Text>
          </View>
        </Animated.View>

        <View style={styles.illustration}>
          <Text style={styles.farmCaption}>Farm smarter · Earn more · Track everything</Text>
        </View>
      </View>

      <Animated.View style={[
        styles.card,
        { opacity: cardOpacity, transform: [{ translateY: slideUp }] },
      ]}>
        <View style={styles.langWrap}>
          <Text style={styles.langLabel}>Choose language / Lulimi</Text>
          <View style={styles.langRow}>
            {LANGS.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[styles.langPill, lang === l.code && styles.langPillActive]}
                onPress={() => dispatch(setLanguagePreference(l.code as any))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('RoleSelect')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>🌱 Get Started — Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryBtnText}>I already have an account →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Powered by GASTER AI · v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.green },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
    gap: Space.xl,
  },
  logoMark: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  logoEmoji: { fontSize: 42 },
  appName: {
    fontSize: 36,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: Font.size.body,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
  },
  illustration: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Layout.radius.xl,
    paddingHorizontal: Space.xl,
    paddingVertical: Space.md,
  },
  farmCaption: {
    fontSize: Font.size.label,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Layout.safePadding,
    paddingTop: Space.lg,
    paddingBottom: Space.xl,
    gap: Space.md,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  langWrap:  { gap: Space.sm },
  langLabel: { fontSize: Font.size.caption, color: Colors.textMuted, textAlign: 'center' },
  langRow:   { flexDirection: 'row', justifyContent: 'center', gap: Space.sm },
  langPill: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: Layout.radius.pill,
    borderWidth: 1.5, borderColor: Colors.border,
    minWidth: 52, alignItems: 'center',
  },
  langPillActive:  { backgroundColor: Colors.green, borderColor: Colors.green },
  langText:        { fontSize: 13, fontWeight: Font.weight.semiBold, color: Colors.textMuted },
  langTextActive:  { color: Colors.textInverse },
  actions:         { gap: Space.sm },
  primaryBtn: {
    backgroundColor: Colors.green,
    borderRadius: Layout.radius.md,
    minHeight: Layout.touch.comfortable,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText:   { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textInverse },
  secondaryBtn:     { minHeight: Layout.touch.minimum, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { fontSize: 14, color: Colors.green, textDecorationLine: 'underline' },
  footer:           { fontSize: Font.size.caption, color: Colors.textDisabled, textAlign: 'center' },
});