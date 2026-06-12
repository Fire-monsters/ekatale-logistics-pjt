/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  tinted?: boolean;
  noPad?: boolean;
}

export function Card({ children, onPress, style, tinted, noPad }: CardProps) {
  const content = (
    <View style={[styles.card, tinted && styles.cardTinted, noPad && styles.noPad, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────

type BadgeVariant = 'green' | 'orange' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  green: { bg: '#E8F5E9', text: '#2E7D32' },
  orange: { bg: '#FFF3E0', text: '#E65100' },
  blue: { bg: '#E3F2FD', text: '#1565C0' },
  yellow: { bg: '#FFF9C4', text: '#F57F17' },
  red: { bg: '#FFEBEE', text: '#C62828' },
  purple: { bg: '#F3E5F5', text: '#6A1B9A' },
  gray: { bg: '#F5F5F5', text: '#616161' },
};

export function Badge({ label, variant = 'gray', style, textStyle }: BadgeProps) {
  const { bg, text } = BADGE_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: text }, textStyle]}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// STATUS BADGE — maps domain statuses to colours
// ─────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: 'Draft', variant: 'gray' },
  PENDING_REVIEW: { label: 'Pending Review', variant: 'yellow' },
  ACTIVE: { label: 'Active', variant: 'green' },
  ORDER_CONFIRMED: { label: 'Confirmed', variant: 'blue' },
  COLLECTED: { label: 'Collected', variant: 'orange' },
  PAID: { label: 'Paid ✓', variant: 'green' },
  REJECTED: { label: 'Rejected', variant: 'red' },
  DISPATCHED: { label: 'Dispatched 🚚', variant: 'orange' },
  DELIVERED: { label: 'Delivered ✓', variant: 'green' },
  COMPLETED: { label: 'Completed', variant: 'green' },
  CANCELLED: { label: 'Cancelled', variant: 'red' },
  PROCESSING: { label: 'Processing', variant: 'purple' },
  PENDING: { label: 'Pending', variant: 'yellow' },
  FAILED: { label: 'Failed', variant: 'red' },
  NEW: { label: 'New', variant: 'blue' },
};

interface StatusBadgeProps {
  status: string;
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const mapped = STATUS_MAP[status] ?? { label: status, variant: 'gray' as BadgeVariant };
  return <Badge label={mapped.label} variant={mapped.variant} style={style} />;
}

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────

interface AvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ name, size = 40, style }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ emoji = '📭', title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

// ─────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <Card style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.skeletonContent}>
          <Skeleton height={14} width="60%" />
          <Skeleton height={12} width="40%" style={{ marginTop: 6 }} />
        </View>
      </View>
    </Card>
  );
}

// ─────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTinted: {
    backgroundColor: '#F1F8F1',
    borderColor: '#C8E6C9',
  },
  noPad: {
    padding: 0,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  avatar: {
    backgroundColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1E5631',
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 8,
    width: '100%',
  },
  skeleton: {
    backgroundColor: '#E8E8E8',
  },
  skeletonCard: {
    marginBottom: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonContent: {
    flex: 1,
    gap: 6,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  sectionHeader: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5631',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
