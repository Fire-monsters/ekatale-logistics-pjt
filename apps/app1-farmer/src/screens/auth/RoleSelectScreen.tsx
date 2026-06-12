// apps/app1-farmer/src/screens/auth/RoleSelectScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';
import { Colors, Font, Space, Layout } from '../../../theme';
import { useAppDispatch } from '../../store/hooks';
import { roleSelected } from '../../store/slices/authSlice';

type Nav = NativeStackNavigationProp<AuthStackParams>;

interface RoleCard {
  role:      'farmer' | 'village_agent';
  emoji:     string;
  title:     string;
  subtitle:  string;
  perks:     string[];
  bg:        string;
  border:    string;
  color:     string;
}

const ROLES: RoleCard[] = [
  {
    role:     'farmer',
    emoji:    '🌾',
    title:    'Farmer',
    subtitle: 'Sell your produce directly to the E-Katale warehouse',
    perks: [
      '📊 Check live market prices',
      '🤖 AI crop quality grading',
      '🚚 Free transport arranged',
      '💰 Same-day Mobile Money payment',
    ],
    bg:     '#E8F5E9',
    border: '#A5D6A7',
    color:  Colors.green,
  },
  {
    role:     'village_agent',
    emoji:    '🧑‍💼',
    title:    'Field Agent',
    subtitle: 'Help farmers in your area register and list produce',
    perks: [
      '👥 Register farmers in your zone',
      '💼 Earn commission per transaction',
      '📋 Manage farmer listings',
      '📍 Track collections in real time',
    ],
    bg:     '#EDE7F6',
    border: '#CE93D8',
    color:  '#6A1B9A',
  },
];

export default function RoleSelectScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch   = useAppDispatch();

  const handleSelect = (card: RoleCard) => {
    dispatch(roleSelected(card.role));
    navigation.navigate('PhoneEntry', { mode: 'register', role: card.role });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose your role to get started</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {ROLES.map((card) => (
          <TouchableOpacity
            key={card.role}
            style={[styles.card, { backgroundColor: card.bg, borderColor: card.border }]}
            onPress={() => handleSelect(card)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={`Select ${card.title} role`}
          >
            {/* Top row */}
            <View style={styles.cardTop}>
              <View style={[styles.emojiCircle, { backgroundColor: card.border }]}>
                <Text style={styles.emoji}>{card.emoji}</Text>
              </View>
              <View style={styles.cardTitles}>
                <Text style={[styles.cardTitle, { color: card.color }]}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              </View>
              <Text style={[styles.arrow, { color: card.color }]}>→</Text>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: card.border }]} />

            {/* Perks */}
            <View style={styles.perks}>
              {card.perks.map((perk) => (
                <Text key={perk} style={styles.perk}>{perk}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Login link */}
        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => navigation.navigate('PhoneEntry', { mode: 'login' })}
        >
          <Text style={styles.loginText}>
            Already registered?{' '}
            <Text style={styles.loginLink}>Log in →</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.bg },
  header:     {
    backgroundColor: Colors.surface,
    paddingHorizontal: Layout.safePadding,
    paddingTop: Space.md,
    paddingBottom: Space.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Space.xs,
  },
  backBtn:    { alignSelf: 'flex-start', marginBottom: Space.sm },
  backText:   { fontSize: Font.size.body, color: Colors.green, fontWeight: Font.weight.medium },
  title:      { fontSize: Font.size.heading, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  subtitle:   { fontSize: Font.size.body, color: Colors.textMuted },
  scroll:     { padding: Layout.safePadding, gap: Space.md, paddingBottom: 48 },

  card: {
    borderRadius: Layout.radius.xl,
    borderWidth: 1.5,
    padding: Space.md,
    gap: Space.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTop:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emojiCircle:{
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  emoji:       { fontSize: 28 },
  cardTitles:  { flex: 1, gap: 3 },
  cardTitle:   { fontSize: Font.size.title, fontWeight: Font.weight.bold },
  cardSubtitle:{ fontSize: Font.size.caption, color: Colors.textSecondary, lineHeight: 18 },
  arrow:       { fontSize: 22, fontWeight: Font.weight.bold },
  divider:     { height: 1, opacity: 0.4 },
  perks:       { gap: 6 },
  perk:        { fontSize: Font.size.label, color: Colors.textSecondary, lineHeight: 22 },

  loginRow:   { alignItems: 'center', marginTop: Space.sm },
  loginText:  { fontSize: Font.size.body, color: Colors.textMuted },
  loginLink:  { color: Colors.green, fontWeight: Font.weight.semiBold, textDecorationLine: 'underline' },
});
