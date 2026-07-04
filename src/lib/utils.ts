/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  const formatted = new Intl.NumberFormat('bn-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `৳${formatted}`;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export type ExpirationStatus = 'expired' | 'expiring-soon' | 'expiring-warning' | 'safe';

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

export function getExpirationColors(status: ExpirationStatus, darkMode: boolean) {
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

export function getExpirationBadge(status: ExpirationStatus) {
  const badges = {
    expired: { text: 'EXPIRED', color: 'text-red-500', bg: 'bg-red-500/10' },
    'expiring-soon': { text: 'Expires <30 days', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'expiring-warning': { text: 'Expires <60 days', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    safe: { text: '', color: '', bg: '' }
  };
  return badges[status];
}
