// apps/app1-farmer/src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';                         // ← NEW
import type { AuthStackParams } from '../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguagePreference, selectLanguage } from '../store/slices/userSlice';
import { switchLanguage } from '../i18n';                               // ← NEW

type Nav = NativeStackNavigationProp<AuthStackParams>;

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'lg', label: 'LG' },
  { code: 'sw', label: 'SW' },
  { code: 'rn', label: 'RN' },
];

const LOGO = require('../../assets/ekatale-logo.jpg');

export default function GetStartedScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();
  const lang       = useAppSelector(selectLanguage);
  const { t }      = useTranslation();                                  // ← NEW

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

  /**
   * Picking a language does three things in order:
   *   1. Persists to AsyncStorage + tells i18next to hot-swap strings now
   *   2. Updates Redux so the rest of the app (FarmerProfile lang picker, etc.) stays in sync
   *
   * react-i18next re-renders every component using useTranslation() automatically,
   * so the strings on this screen update immediately without any extra setState.
   */
  const handleLangChange = async (code: string) => {
    await switchLanguage(code);                                          // ← AsyncStorage + i18next
    dispatch(setLanguagePreference(code as any));                       // ← Redux
  };

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
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.appName}>E-Katale</Text>
            {/* ↓ translated */}
            <Text style={styles.tagline}>{t('splash.tagline')}</Text>
          </View>
        </Animated.View>

        <View style={styles.illustration}>
          {/* ↓ translated */}
          <Text style={styles.farmCaption}>{t('splash.farm_caption')}</Text>
        </View>
      </View>

      <Animated.View style={[
        styles.card,
        { opacity: cardOpacity, transform: [{ translateY: slideUp }] },
      ]}>
        <View style={styles.langWrap}>
          {/* ↓ translated */}
          <Text style={styles.langLabel}>{t('splash.choose_language')}</Text>
          <View style={styles.langRow}>
            {LANGS.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[styles.langPill, lang === l.code && styles.langPillActive]}
                onPress={() => handleLangChange(l.code)}
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
            {/* ↓ translated */}
            <Text style={styles.primaryBtnText}>{t('splash.get_started')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.75}
          >
            {/* ↓ translated */}
            <Text style={styles.secondaryBtnText}>{t('splash.have_account')}</Text>
          </TouchableOpacity>
        </View>

        {/* ↓ translated */}
        <Text style={styles.footer}>{t('splash.powered_by')}</Text>
      </Animated.View>
    </View>
  );
}

// Styles are unchanged from the original — copy them in verbatim
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
  logoImage: { width: 64, height: 64 },
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
