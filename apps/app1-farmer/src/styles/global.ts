/**
 * Global Stylesheet — single import for all screens.
 *
 * Usage:
 *   import { GS, Colors, Font, Space, Layout, Atoms, Shadow } from '@styles/global';
 *
 * Screens should import GS for structural/common styles, then define only their
 * own screen-specific overrides in a local StyleSheet.create block.
 */

import { StyleSheet } from 'react-native';
import { Colors, Font, Space, Layout, Shadow, Atoms } from '../../theme';

// Re-export theme tokens so screens have a single import point
export { Colors, Font, Space, Layout, Shadow, Atoms, CROP_EMOJI, getCropEmoji, isSmallScreen, isLargeScreen } from '../../theme';

export const GS = StyleSheet.create({

  // ─────────────────────────────────────────────
  // SCREEN CONTAINERS
  // ─────────────────────────────────────────────

  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenSurface: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    padding: Space.md,
    paddingBottom: 100,
    gap: Space.md,
  },
  scrollContentSurface: {
    padding: Space.md,
    paddingBottom: 100,
    gap: Space.md,
    backgroundColor: Colors.surface,
  },

  // ─────────────────────────────────────────────
  // SCREEN HEADER BAR
  // ─────────────────────────────────────────────

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerGreen: {
    backgroundColor: Colors.green,
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  headerTitleInverse: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    flex: 1,
  },

  // ─────────────────────────────────────────────
  // BACK NAVIGATION
  // ─────────────────────────────────────────────

  back: {
    alignSelf: 'flex-start',
    paddingVertical: Space.sm,
    paddingRight: Space.sm,
  },
  backText: {
    fontSize: Font.size.body,
    color: Colors.green,
    fontWeight: Font.weight.medium,
  },

  // ─────────────────────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────────────────────

  screenTitle: {
    fontSize: Font.size.heading,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontSize: Font.size.label,
    color: Colors.green,
    fontWeight: Font.weight.medium,
  },
  pageTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Font.size.body,
    color: Colors.textMuted,
    lineHeight: Font.size.body * 1.6,
    textAlign: 'center',
  },
  hint: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },
  linkText: {
    fontSize: Font.size.label,
    color: Colors.info,
    fontWeight: Font.weight.medium,
  },
  greenText: {
    color: Colors.green,
    fontWeight: Font.weight.bold,
  },

  // ─────────────────────────────────────────────
  // LIST ROWS — the most duplicated pattern
  // ─────────────────────────────────────────────

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  listRowHighlighted: {
    backgroundColor: Colors.greenLight,
    borderColor: Colors.greenBorder,
  },
  listRowText: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.semiBold,
    color: Colors.textPrimary,
  },
  listRowSub: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },
  listRowMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  // ─────────────────────────────────────────────
  // ICON CONTAINERS
  // ─────────────────────────────────────────────

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleMd: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─────────────────────────────────────────────
  // TABS
  // ─────────────────────────────────────────────

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.green,
  },
  tabText: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.medium,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.green,
    fontWeight: Font.weight.bold,
  },

  // ─────────────────────────────────────────────
  // FORM — field, input, error
  // ─────────────────────────────────────────────

  form: {
    gap: Space.md,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.semiBold,
    color: Colors.textSecondary,
  },
  fieldHint: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },
  fieldError: {
    fontSize: Font.size.caption,
    color: Colors.error,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: Font.size.body,
    color: Colors.textPrimary,
    minHeight: Layout.touch.comfortable,
    backgroundColor: Colors.bg,
  },
  inputFocused: {
    borderColor: Colors.green,
    backgroundColor: '#FAFFFE',
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  inputMultiline: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: Layout.radius.md,
    padding: 14,
    fontSize: Font.size.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.bg,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  required: {
    color: Colors.error,
  },

  // ─────────────────────────────────────────────
  // CHIPS / SELECTABLE PILLS
  // ─────────────────────────────────────────────

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Layout.radius.pill,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.bg,
    minHeight: Layout.touch.minimum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenLight,
  },
  chipText: {
    fontSize: 14,
    fontWeight: Font.weight.medium,
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: Colors.green,
    fontWeight: Font.weight.semiBold,
  },
  chipSquare: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: Colors.bg,
  },
  chipSquareActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  chipSquareText: {
    fontSize: 14,
    fontWeight: Font.weight.medium,
    color: Colors.textMuted,
  },
  chipSquareTextActive: {
    color: Colors.textInverse,
  },

  // ─────────────────────────────────────────────
  // STEP / PROGRESS INDICATORS
  // ─────────────────────────────────────────────

  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.green,
  },
  stepCircleComplete: {
    backgroundColor: Colors.greenMid,
  },
  stepNum: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.textMuted,
  },
  stepNumActive: {
    color: Colors.textInverse,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.green,
  },
  stepLabel: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  progressDot: {
    width: 32,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: Colors.green,
  },
  progressText: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    marginLeft: 4,
  },

  // ─────────────────────────────────────────────
  // NOTIFICATION / BADGE
  // ─────────────────────────────────────────────

  badgeWrap: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  badge: {
    backgroundColor: Colors.gold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    fontSize: 9,
    color: Colors.textPrimary,
    fontWeight: Font.weight.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.info,
    flexShrink: 0,
  },

  // ─────────────────────────────────────────────
  // BOTTOM ACTION BAR (chat input, footer CTA)
  // ─────────────────────────────────────────────

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  bottomBarInput: {
    flex: 1,
    fontSize: Font.size.body,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    backgroundColor: Colors.bg,
  },

  // ─────────────────────────────────────────────
  // EARNINGS / SUMMARY CARD (green banner)
  // ─────────────────────────────────────────────

  summaryCard: {
    backgroundColor: Colors.green,
    borderRadius: Layout.radius.lg,
    padding: Space.md,
    gap: 4,
  },
  summaryLabel: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  summarySub: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.75)',
  },

  // ─────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    padding: Space.xl,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Font.size.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: Font.size.body * 1.6,
  },

  // ─────────────────────────────────────────────
  // DIVIDER
  // ─────────────────────────────────────────────

  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: Space.sm,
  },
  dividerStrong: {
    height: 1,
    backgroundColor: Colors.borderStrong,
    marginVertical: Space.sm,
  },
});
