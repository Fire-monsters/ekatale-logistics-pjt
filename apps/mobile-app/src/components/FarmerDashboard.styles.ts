import { StyleSheet } from 'react-native';
import { Colors, Font, Space, Layout } from '@styles/global';

export default StyleSheet.create({
  body: { padding: Space.md, gap: Space.md, paddingBottom: 32 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    gap: 12,
    backgroundColor: Colors.bg,
  },

  headerMeta: { flex: 1, gap: 1 },
  headerGreeting: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },

  headerName: {
    fontSize: 16,
    fontWeight: Font.weight.bold,
    color: Colors.textPrimary,
  },

  headerFarmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },

  headerFarm: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuBtn: { backgroundColor: Colors.green },

  // Hero
  heroWrap: { gap: 10 },
  heroCard: {
    backgroundColor: '#2E7D52',
    borderRadius: Layout.radius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 140,
    overflow: 'hidden',
  },
  heroCopy: { flex: 1, gap: 8 },
  heroLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLogoText: {
    fontSize: 18,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.textInverse,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  heroCtaText: { fontSize: 12, fontWeight: Font.weight.bold, color: Colors.green },
  heroIllustration: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIllustrationInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: Colors.green, width: 14 },

  // Quick nav
  quickNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  quickNavItem: { flex: 1, alignItems: 'center', gap: 6 },
  quickNavIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavLabel: { fontSize: Font.size.caption, color: Colors.textPrimary, fontWeight: Font.weight.medium },

  // Farm overview
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: 16,
    gap: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overviewTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  overviewStats: { flexDirection: 'row' },
  overviewStat: { flex: 1, alignItems: 'center', gap: 2 },
  overviewStatBorder: { borderLeftWidth: 0.5, borderColor: Colors.border },
  overviewStatVal: { fontSize: 20, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  overviewStatLbl: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  tagPill: {
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  tagPillText: { fontSize: 8, color: Colors.green, fontWeight: Font.weight.bold },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressLabel: { fontSize: Font.size.caption, color: Colors.textMuted, width: 110 },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.green },
  progressPct: { fontSize: Font.size.caption, fontWeight: Font.weight.bold, color: Colors.textPrimary, width: 32, textAlign: 'right' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Crop cards
  cropsScroll: { gap: 12, paddingRight: Space.md },
  cropCard: {
    width: 148,
    borderRadius: Layout.radius.md,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  cropPhoto: {
    height: 90,
    backgroundColor: '#6BAE85',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cropBadgeText: { fontSize: 9, color: Colors.textInverse, fontWeight: Font.weight.bold },
  cropInfo: { padding: 10, gap: 3 },
  cropName: { fontSize: Font.size.label, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  cropMeta: { fontSize: Font.size.caption, color: Colors.textMuted },
  onTrackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  onTrackPillReady: { backgroundColor: '#C8E6C9' },
  onTrackText: { fontSize: 10, color: Colors.green, fontWeight: Font.weight.semiBold },

  // CTA Banner
  ctaBanner: {
    backgroundColor: '#1B5E20',
    borderRadius: Layout.radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaBannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBannerTitle: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  ctaBannerSub: { fontSize: Font.size.caption, color: 'rgba(255,255,255,0.72)' },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.textInverse,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaBtnText: { fontSize: 12, fontWeight: Font.weight.bold, color: Colors.green },
});
