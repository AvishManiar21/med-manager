/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number as currency in Bangladeshi Taka (BDT)
 * @param amount - The amount to format
 * @returns Formatted currency string with ৳ symbol
 * @example
 * formatCurrency(1234.56) // "৳1,234.56"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('bn-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `৳${formatted}`;
}

/**
 * Formats a date string or Date object to localized date format
 * @param date - The date string or Date object to format
 * @returns Formatted date string (e.g., "01 Jan 2024")
 * @example
 * formatDate("2024-01-15") // "15 Jan 2024"
 * formatDate(new Date()) // "04 Jul 2026"
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
