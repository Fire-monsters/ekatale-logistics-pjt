// apps/app1-farmer/src/screens/farmer/FarmerProfile.tsx
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe2,
  HelpCircle,
  Info,
  LogOut,
  MapPin,
  Phone,
  Shield,
  Sprout,
  User,
  Wheat,
} from 'lucide-react-native';
import { SafeScreen } from '../../components';
import { Avatar, Badge, Divider } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAuthUser, logoutThunk } from '../../store/slices/authSlice';
import { selectFarmerProfile, selectLanguage, setLanguagePreference } from '../../store/slices/userSlice';
import { Colors, Font, Space, Layout } from '../../../theme';
import type { Language } from '../../types';

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English',  native: 'English'  },
  { code: 'lg', label: 'Luganda',  native: 'Luganda'  },
  { code: 'sw', label: 'Swahili',  native: 'Kiswahili' },
  { code: 'rn', label: 'Runyoro',  native: 'Runyoro'  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}

function SettingRow({
  Icon,
  label,
  value,
  onPress,
  destructive = false,
  rightElement,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}) {
  const iconColor = destructive ? Colors.error : Colors.textMuted;
  const labelColor = destructive ? Colors.error : Colors.textPrimary;

  return (
    <TouchableOpacity
      style={s.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[s.settingIconWrap, destructive && s.settingIconDestructive]}>
        <Icon size={18} color={iconColor} strokeWidth={2.2} />
      </View>
      <Text style={[s.settingLabel, { color: labelColor }]}>{label}</Text>
      <View style={s.settingRight}>
        {value ? <Text style={s.settingValue}>{value}</Text> : null}
        {rightElement ?? (onPress ? (
          <ChevronRight size={16} color={Colors.textDisabled} strokeWidth={2} />
        ) : null)}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function FarmerProfile() {
  const dispatch      = useAppDispatch();
  const user          = useAppSelector(selectAuthUser);
  const farmerProfile = useAppSelector(selectFarmerProfile);
  const language      = useAppSelector(selectLanguage);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [langOpen,     setLangOpen]     = useState(false);

  const fullName    = user?.fullName ?? farmerProfile?.fullName ?? 'Farmer';
  const phone       = user?.phone ?? '—';
  const district    = farmerProfile?.district ?? '—';
  const farmSize    = farmerProfile?.farmSizeAcres;
  const payProvider = farmerProfile?.paymentProvider ?? '—';
  const payNumber   = farmerProfile?.paymentNumber ?? '—';
  const crops       = (farmerProfile as any)?.cropsGrown ?? farmerProfile?.crops ?? [];

  const selectedLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => dispatch(logoutThunk()),
        },
      ],
    );
  };

  return (
    <SafeScreen padded={false} backgroundColor={Colors.bg} statusBarStyle="dark-content">
      {/* ── Header bar ───────────────────────────────────────────── */}
      <View style={s.topBar}>
        <Text style={s.topBarTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Profile card ─────────────────────────────────────────── */}
        <View style={s.profileCard}>
          <Avatar name={fullName} size={60} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.profileName}>{fullName}</Text>
            <Text style={s.profilePhone}>{phone}</Text>
            <Badge label="Farmer" variant="green" />
          </View>
        </View>

        {/* ── Farm overview ─────────────────────────────────────────── */}
        <View style={s.farmBanner}>
          <View style={s.farmBannerRow}>
            <View style={s.farmStat}>
              <Wheat size={20} color={Colors.green} strokeWidth={2.2} />
              <Text style={s.farmStatVal}>{farmSize != null ? `${farmSize} ac` : '—'}</Text>
              <Text style={s.farmStatLbl}>Farm size</Text>
            </View>
            <View style={s.farmDividerV} />
            <View style={s.farmStat}>
              <MapPin size={20} color={Colors.green} strokeWidth={2.2} />
              <Text style={s.farmStatVal}>{district}</Text>
              <Text style={s.farmStatLbl}>District</Text>
            </View>
            <View style={s.farmDividerV} />
            <View style={s.farmStat}>
              <Sprout size={20} color={Colors.green} strokeWidth={2.2} />
              <Text style={s.farmStatVal}>{crops.length}</Text>
              <Text style={s.farmStatLbl}>Crops</Text>
            </View>
          </View>
        </View>

        {/* ── Account ───────────────────────────────────────────────── */}
        <SectionTitle title="Account" />
        <View style={s.card}>
          <SettingRow
            Icon={User}
            label="Full name"
            value={fullName}
          />
          <Divider />
          <SettingRow
            Icon={Phone}
            label="Phone number"
            value={phone}
          />
          <Divider />
          <SettingRow
            Icon={Shield}
            label="KYC status"
            value="Verified"
          />
        </View>

        {/* ── Payment ───────────────────────────────────────────────── */}
        <SectionTitle title="Payment" />
        <View style={s.card}>
          <SettingRow
            Icon={CreditCard}
            label="Provider"
            value={payProvider === 'MTN_MOMO' ? 'MTN MoMo' : payProvider === 'AIRTEL_MONEY' ? 'Airtel Money' : payProvider}
          />
          <Divider />
          <SettingRow
            Icon={CreditCard}
            label="Mobile Money number"
            value={payNumber !== '—' ? `0${payNumber.slice(-9)}` : '—'}
          />
        </View>

        {/* ── Preferences ───────────────────────────────────────────── */}
        <SectionTitle title="Preferences" />
        <View style={s.card}>
          {/* Language picker */}
          <SettingRow
            Icon={Globe2}
            label="Language"
            value={selectedLang.native}
            onPress={() => setLangOpen(v => !v)}
          />
          {langOpen && (
            <View style={s.langPicker}>
              {LANGUAGES.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={[s.langOption, l.code === language && s.langOptionActive]}
                  onPress={() => {
                    dispatch(setLanguagePreference(l.code));
                    setLangOpen(false);
                  }}
                >
                  <Text style={[s.langOptionText, l.code === language && s.langOptionTextActive]}>
                    {l.native}
                  </Text>
                  {l.code === language && (
                    <Text style={s.langCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Divider />
          <SettingRow
            Icon={Bell}
            label="Push notifications"
            rightElement={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: Colors.border, true: Colors.greenBorder }}
                thumbColor={notifEnabled ? Colors.green : Colors.textDisabled}
              />
            }
          />
        </View>

        {/* ── Support ───────────────────────────────────────────────── */}
        <SectionTitle title="Support" />
        <View style={s.card}>
          <SettingRow
            Icon={HelpCircle}
            label="Help & FAQ"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            Icon={Phone}
            label="Call E-Katale support"
            value="0800-100-200"
            onPress={() => {}}
          />
          <Divider />
          <SettingRow
            Icon={Info}
            label="App version"
            value="v1.0.0"
          />
        </View>

        {/* ── Danger zone ───────────────────────────────────────────── */}
        <View style={s.card}>
          <SettingRow
            Icon={LogOut}
            label="Log out"
            onPress={handleLogout}
            destructive
          />
        </View>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <Text style={s.footer}>
          E-Katale Farmer · Powered by GASTER AI{'\n'}
          Protected under Uganda's Data Protection Act 2019
        </Text>
      </ScrollView>
    </SafeScreen>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  topBar: {
    height: 56,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    paddingHorizontal: Space.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  topBarTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },

  scroll: {
    padding: Space.md,
    gap: Space.md,
    paddingBottom: 48,
  },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: Space.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  profileName: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  profilePhone: {
    fontSize: Font.size.label,
    color: Colors.textMuted,
  },

  // Farm banner
  farmBanner: {
    backgroundColor: Colors.greenLight,
    borderRadius: Layout.radius.lg,
    padding: Space.md,
    borderWidth: 0.5,
    borderColor: Colors.greenBorder,
  },
  farmBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  farmStat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  farmStatVal: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },
  farmStatLbl: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },
  farmDividerV: {
    width: 0.5,
    height: 40,
    backgroundColor: Colors.greenBorder,
  },

  // Section title
  sectionTitle: {
    fontSize: Font.size.caption,
    fontWeight: Font.weight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },

  // Card container
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  // Individual setting row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Space.md,
    paddingVertical: 14,
    minHeight: 52,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDestructive: {
    backgroundColor: Colors.errorLight,
  },
  settingLabel: {
    flex: 1,
    fontSize: Font.size.body,
    fontWeight: Font.weight.medium,
    color: Colors.textPrimary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: Font.size.label,
    color: Colors.textMuted,
    maxWidth: 160,
    textAlign: 'right',
  },

  // Language picker dropdown
  langPicker: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    gap: 2,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: Layout.radius.md,
  },
  langOptionActive: {
    backgroundColor: Colors.greenLight,
  },
  langOptionText: {
    fontSize: Font.size.body,
    color: Colors.textSecondary,
    fontWeight: Font.weight.medium,
  },
  langOptionTextActive: {
    color: Colors.green,
    fontWeight: Font.weight.bold,
  },
  langCheckmark: {
    fontSize: 16,
    color: Colors.green,
    fontWeight: Font.weight.bold,
  },

  // Footer
  footer: {
    fontSize: Font.size.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 18,
    paddingTop: Space.sm,
  },
});