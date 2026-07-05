/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number as currency in US Dollars (USD)
 * @param amount - The amount to format
 * @returns Formatted currency string with $ symbol
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string or Date object to localized date format
 * @param date - The date string or Date object to format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 * @example
 * formatDate("2024-01-15") // "Jan 15, 2024"
 * formatDate(new Date()) // "Jul 4, 2026"
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
