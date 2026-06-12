/**
 * E-Katale Farmer Design Theme
 *
 * Human-centred principles baked in:
 * - 52dp minimum touch targets (rough hands, outdoor use)
 * - 16px minimum font (readability in sunlight)
 * - High contrast ratios (7:1+ for outdoor daylight)
 * - Visual cues alongside every text label (emojis/icons)
 * - One primary action per screen
 */

// @ts-ignore: react-native types may not be available in this build environment
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─────────────────────────────────────────────
// COLOURS
// ─────────────────────────────────────────────

export const Colors = {
  // Brand
  green: '#1B5E20',
  greenMid: '#2E7D32',
  greenLight: '#E8F5E9',
  greenBorder: '#A5D6A7',
  gold: '#F9A825',
  goldLight: '#FFF8E1',

  // Semantic
  error: '#C62828',
  errorLight: '#FFEBEE',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  info: '#1565C0',
  infoLight: '#E3F2FD',
  success: '#1B5E20',
  successLight: '#E8F5E9',

  // Neutrals
  bg: '#FAFAF7',         // warm off-white — easier on eyes than pure white
  surface: '#FFFFFF',
  surfaceAlt: '#F4F4F0',
  border: 'rgba(0,0,0,0.10)',
  borderStrong: 'rgba(0,0,0,0.18)',

  // Text — high contrast for sunlight
  textPrimary: '#1A1A1A',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textDisabled: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Role accents
  farmer: '#1B5E20',
  warehouse: '#1565C0',
  consumer: '#00695C',
  transport: '#E65100',
  admin: '#37474F',

  // Status map (used by StatusBadge)
  statusMap: {
    DRAFT:           { bg: '#F5F5F5',  text: '#616161' },
    PENDING_REVIEW:  { bg: '#FFF9C4',  text: '#F57F17' },
    ACTIVE:          { bg: '#E8F5E9',  text: '#1B5E20' },
    ORDER_CONFIRMED: { bg: '#E3F2FD',  text: '#1565C0' },
    COLLECTED:       { bg: '#FFF3E0',  text: '#E65100' },
    DISPATCHED:      { bg: '#FFF3E0',  text: '#E65100' },
    DELIVERED:       { bg: '#E8F5E9',  text: '#1B5E20' },
    PAID:            { bg: '#E8F5E9',  text: '#1B5E20' },
    COMPLETED:       { bg: '#E8F5E9',  text: '#1B5E20' },
    CANCELLED:       { bg: '#F5F5F5',  text: '#616161' },
    REJECTED:        { bg: '#FFEBEE',  text: '#C62828' },
    PROCESSING:      { bg: '#F3E5F5',  text: '#6A1B9A' },
    PENDING:         { bg: '#FFF9C4',  text: '#F57F17' },
    FAILED:          { bg: '#FFEBEE',  text: '#C62828' },
    NEW:             { bg: '#E3F2FD',  text: '#1565C0' },
  } as Record<string, { bg: string; text: string }>,
} as const;

// ─────────────────────────────────────────────
// SPACING — 8dp base grid
// ─────────────────────────────────────────────

export const Space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────

export const Font = {
  // Sizes — all ≥ 12px, body ≥ 16px
  size: {
    caption: 12,
    label:   13,
    body:    16,   // PRD minimum
    title:   20,
    heading: 24,
    display: 30,
  },
  weight: {
    regular: '400' as const,
    medium:  '500' as const,
    semiBold:'600' as const,
    bold:    '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

// ─────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────

export const Layout = {
  screenW: SCREEN_W,
  screenH: SCREEN_H,
  safePadding: 20,

  // Touch targets — WCAG 2.1 AA + outdoor use
  touch: {
    minimum: 48,      // WCAG minimum
    comfortable: 56,  // Preferred for primary actions
    large: 64,        // Hero CTAs
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    pill: 999,
  },
} as const;

// ─────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────

export const Shadow = {
  sm: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    android: { elevation: 2 },
  }),
  md: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8 },
    android: { elevation: 4 },
  }),
  lg: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16 },
    android: { elevation: 8 },
  }),
  header: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    android: { elevation: 3 },
  }),
} as const;

// ─────────────────────────────────────────────
// SHARED STYLESHEET ATOMS
// Reused across screens — import and spread
// ─────────────────────────────────────────────

export const Atoms = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Layout.safePadding,
  },

  // Typography
  heading: {
    fontSize: Font.size.heading,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    lineHeight: Font.size.heading * Font.lineHeight.tight,
  },
  title: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.regular,
    color: Colors.textPrimary,
    lineHeight: Font.size.body * Font.lineHeight.normal,
  },
  label: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.semiBold,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: Font.size.caption,
    fontWeight: Font.weight.regular,
    color: Colors.textMuted,
  },
  muted: {
    color: Colors.textMuted,
  },
  green: {
    color: Colors.green,
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: Space.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cardGreen: {
    backgroundColor: Colors.greenLight,
    borderColor: Colors.greenBorder,
  },
  cardGold: {
    backgroundColor: Colors.goldLight,
    borderColor: '#FFD54F',
  },

  // Flex helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
  },
});

// ─────────────────────────────────────────────
// CROP EMOJI MAP
// ─────────────────────────────────────────────

export const CROP_EMOJI: Record<string, string> = {
  maize:        '🌽',
  beans:        '🫘',
  cassava:      '🍠',
  matooke:      '🍌',
  sweet_potato: '🥔',
  vegetables:   '🥬',
  tomatoes:     '🍅',
  groundnuts:   '🥜',
  sorghum:      '🌾',
  coffee:       '☕',
  fruits:       '🍊',
  default:      '🌾',
};

export function getCropEmoji(id: string): string {
  return CROP_EMOJI[id] ?? CROP_EMOJI.default;
}

// ─────────────────────────────────────────────
// SCREEN DIMENSIONS HELPERS
// ─────────────────────────────────────────────

export const isSmallScreen = SCREEN_H < 680;
export const isLargeScreen = SCREEN_H > 900;