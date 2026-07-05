/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Expiration status types for inventory items
 */
export type ExpirationStatus = 'expired' | 'expiring-soon' | 'expiring-warning' | 'safe';

/**
 * Calculates the expiration status of an item based on its expiration date
 * @param expirationDate - ISO date string of the expiration date
 * @returns ExpirationStatus indicating the urgency level
 * @example
 * getExpirationStatus("2024-01-15") // 'expired' if past date
 * getExpirationStatus("2024-08-01") // 'expiring-soon' if within 30 days
 */
export function getExpirationStatus(expirationDate?: string): ExpirationStatus {
  if (!expirationDate) return 'safe';

  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring-soon';
  if (diffDays <= 60) return 'expiring-warning';
  return 'safe';
}

/**
 * Returns Tailwind CSS classes for styling based on expiration status and theme
 * @param status - The expiration status
 * @param darkMode - Whether dark mode is enabled
 * @returns Tailwind CSS class string for borders and backgrounds
 */
export function getExpirationColors(status: ExpirationStatus, darkMode: boolean): string {
  const colors = {
    expired: darkMode
      ? 'border-red-500/40 bg-red-500/10'
      : 'border-red-300 bg-red-50',
    'expiring-soon': darkMode
      ? 'border-orange-500/40 bg-orange-500/10'
      : 'border-orange-300 bg-orange-50',
    'expiring-warning': darkMode
      ? 'border-yellow-500/40 bg-yellow-500/10'
      : 'border-yellow-300 bg-yellow-50',
    safe: darkMode
      ? 'border-white/10'
      : 'border-slate-100'
  };
  return colors[status];
}

/**
 * Badge configuration for expiration status indicators
 */
interface ExpirationBadge {
  text: string;
  color: string;
  bg: string;
}

/**
 * Returns badge configuration for displaying expiration status
 * @param status - The expiration status
 * @returns Object containing text, color, and background classes for the badge
 */
export function getExpirationBadge(status: ExpirationStatus): ExpirationBadge {
  const badges = {
    expired: { text: 'EXPIRED', color: 'text-red-500', bg: 'bg-red-500/10' },
    'expiring-soon': { text: 'Expires <30 days', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'expiring-warning': { text: 'Expires <60 days', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    safe: { text: '', color: '', bg: '' }
  };
  return badges[status];
}
