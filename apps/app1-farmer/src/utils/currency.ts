/**
 * Currency utilities for E-Katale
 * Primary currency: UGX (Ugandan Shilling)
 * PRD spec: always display as 'UGX', comma-separated thousands
 */

/**
 * Format a UGX amount: 1500000 → "UGX 1,500,000"
 */
export function formatUGX(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `UGX ${(amount / 1_000).toFixed(0)}K`;
  }
  return `UGX ${amount.toLocaleString('en-UG')}`;
}

/**
 * Format per-unit price: 1500 → "UGX 1,500/kg"
 */
export function formatUGXPerUnit(amount: number, unit: string): string {
  return `${formatUGX(amount)}/${unit}`;
}

/**
 * Parse a formatted UGX string back to a number
 */
export function parseUGX(formatted: string): number {
  return Number(formatted.replace(/[^0-9]/g, ''));
}

/**
 * Calculate platform commission
 */
export function calculateCommission(
  amount: number,
  commissionPercent: number,
): { commission: number; net: number } {
  const commission = Math.round((amount * commissionPercent) / 100);
  return { commission, net: amount - commission };
}

/**
 * Format trend percentage: 5.3 → "+5.3%" or -2.1 → "-2.1%"
 */
export function formatTrend(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}

/**
 * Get trend colour based on direction (rising is good for sellers)
 */
export function getTrendColor(trend: 'RISING' | 'STABLE' | 'FALLING', isSeller = true): string {
  if (trend === 'STABLE') return '#757575';
  const positiveColor = '#2E7D32';
  const negativeColor = '#C62828';
  if (trend === 'RISING') return isSeller ? positiveColor : negativeColor;
  return isSeller ? negativeColor : positiveColor;
}