/**
 * Date utilities — DD/MM/YYYY format per PRD spec (East Africa context)
 */

/** Format: "15/04/2026" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
}

/** Format: "15 Apr 2026" */
export function formatDateMedium(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Format: "Today, 9:41 AM" or "Yesterday, 3:22 PM" or "15/04/2026" */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

/** Format: "2 hours ago", "5 minutes ago", "Just now" */
export function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

/** Format countdown: "Arriving in ~2 hours" */
export function formatETA(etaDateStr: string): string {
  const diffMs = new Date(etaDateStr).getTime() - Date.now();
  if (diffMs <= 0) return 'Arriving now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.ceil(minutes / 60);
  return `~${hours} hour${hours > 1 ? 's' : ''}`;
}

/** Harvest month number to short name */
export function monthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleString('en', { month: 'short' });
}