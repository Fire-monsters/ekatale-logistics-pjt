import { StyleSheet } from 'react-native';
import { GS, Colors, Font, Space, Layout } from '@styles/global';

export default StyleSheet.create({

  // Header
  header: {
    paddingHorizontal: Space.md,
    paddingVertical: Space.md,
    paddingTop: Space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  headerFarm: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    backgroundColor: Colors.green,
  },

  greeting: {
    fontSize: 22,
    fontWeight: Font.weight.semiBold,
    color: Colors.textPrimary,
  },

  body: { padding: Space.md, gap: Space.md, paddingBottom: 32 },

  heroCarousel: { gap: 12 },
  heroScrollContent: { paddingVertical: 0 },
  heroCard: {
    borderRadius: Layout.radius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 170,
    overflow: 'hidden',
    marginRight: 14,
  },
  heroCopy: { flex: 1, gap: 10 },
  heroLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroLogoText: {
    fontSize: 18,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    letterSpacing: -0.3,
  },
  heroTitle: {
    fontSize: Font.size.title,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
    lineHeight: 28,
    maxWidth: '85%',
  },
  heroSubtitle: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    maxWidth: '100%',
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.textInverse,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  heroCtaText: {
    fontSize: 12,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },
  heroIllustration: {
    width: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIllustrationInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: Colors.green,
    width: 14,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  actionCard: {
    width: '47%',
    borderRadius: Layout.radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    minHeight: 110,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionLabel: {
    fontSize: 14,
    fontWeight: Font.weight.bold,
    textAlign: 'center',
  },

  actionSub: {
    fontSize: Font.size.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.lg,
    padding: 16,
    gap: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  overviewTitle: { fontSize: Font.size.body, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  overviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overviewStat: { flex: 1, minWidth: 72, alignItems: 'center', gap: 6 },
  overviewStatBorder: { borderLeftWidth: 0.5, borderColor: Colors.border, paddingLeft: 12 },
  overviewStatVal: { fontSize: 20, fontWeight: Font.weight.bold, color: Colors.textPrimary },
  overviewStatLbl: { fontSize: Font.size.caption, color: Colors.textMuted, textAlign: 'center' },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  progressLabel: { fontSize: Font.size.caption, color: Colors.textMuted, width: 120 },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.green },
  progressPct: { fontSize: Font.size.caption, fontWeight: Font.weight.bold, color: Colors.textPrimary, width: 32, textAlign: 'right' },

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
  ctaBannerCopy: {
    flex: 1,
    gap: 4,
  },
  ctaBannerTitle: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },
  ctaBannerSub: {
    fontSize: Font.size.caption,
    color: 'rgba(255,255,255,0.72)',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.textInverse,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaBtnText: {
    fontSize: 12,
    fontWeight: Font.weight.bold,
    color: Colors.green,
  },

  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.green, borderRadius: Layout.radius.md,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 8,
  },

  emptyBtnText: {
    fontSize: Font.size.body,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
  },

  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: Layout.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFCC80',
  },

  truckTitle: {
    fontSize: Font.size.label,
    fontWeight: Font.weight.bold,
    color: Colors.warning,
  },
  truckSub: {
    fontSize: Font.size.caption,
    color: '#8D4E00',
  },

  trackBtn: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  trackBtnText: {
    fontSize: 13,
    fontWeight: Font.weight.bold,
    color: Colors.textInverse,
},
});
