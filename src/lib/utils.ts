/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with intelligent conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export utilities for convenience and backward compatibility
export { formatCurrency, formatDate } from '../utils/formatting';
export {
  getExpirationStatus,
  getExpirationColors,
  getExpirationBadge,
  type ExpirationStatus
} from '../utils/expiration';
