import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectIsOnline } from '../store/slices/offlineQueueSlice';
import { useAppSelector } from '../store/hooks';

interface SafeScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  keyboardAware?: boolean;
}

/**
 * Base wrapper for every screen.
 * Handles: safe area, status bar, offline banner, optional scroll & padding.
 */
export function SafeScreen({
  children,
  scroll = false,
  padded = true,
  backgroundColor = '#F5F5F5',
  statusBarStyle = 'dark-content',
  keyboardAware = false,
}: SafeScreenProps) {
  const isOnline = useAppSelector(selectIsOnline);

  const content = (
    <>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📶 You're offline — showing cached data</Text>
        </View>
      )}
      <View style={[styles.inner, padded && styles.padded]}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {scroll ? (
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </KeyboardAvoidingView>
      ) : scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  offlineBanner: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#FFCC80',
  },
  offlineText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
    textAlign: 'center',
  },
});
