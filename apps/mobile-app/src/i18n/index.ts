// apps/app1-farmer/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, SUPPORTED_LANGUAGES } from '../constants';

import en from './locales/en.json';
import lg from './locales/lg.json';
import sw from './locales/sw.json';

// The set of langs we actually have translations for right now.
// rn (Runyoro) will fall back to English until translations are added.
const TRANSLATION_MAP = { en, lg, sw } as const;
const LANG_SET = new Set<string>(SUPPORTED_LANGUAGES);

/**
 * Resolution order:
 *   1. User's saved preference in AsyncStorage
 *   2. Device locale reported by expo-localization
 *   3. English
 */
async function resolveInitialLanguage(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (stored && LANG_SET.has(stored)) return stored;
  } catch {
    // AsyncStorage unavailable — proceed
  }

  const deviceLang = getLocales()[0]?.languageCode ?? '';
  if (deviceLang && LANG_SET.has(deviceLang)) return deviceLang;

  return 'en';
}

/**
 * Must be awaited before the React tree mounts.
 * Returns the i18n instance so the caller can read `i18n.language`
 * and sync it into Redux if needed.
 */
export async function initI18n(): Promise<typeof i18n> {
  const lng = await resolveInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: TRANSLATION_MAP.en },
      lg: { translation: TRANSLATION_MAP.lg },
      sw: { translation: TRANSLATION_MAP.sw },
    },
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React/RN escapes for us
    },
    react: {
      useSuspense: false, // we gate rendering on initI18n() instead
    },
  });

  return i18n;
}

/**
 * Call this from the UI whenever the user explicitly picks a language.
 * Persists to AsyncStorage so the choice survives restarts, then tells
 * i18next to hot-swap all strings immediately (react-i18next re-renders
 * any component that called useTranslation automatically).
 */
export async function switchLanguage(lang: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;