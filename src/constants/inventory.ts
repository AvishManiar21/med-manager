/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Inventory category constants for dental practice management
 */
export const INVENTORY_CATEGORIES = [
  "Medicine",
  "Anesthetics & Sedation",
  "Diagnostic & Examination",
  "Restorative & Fillings",
  "Endodontics (Root Canal)",
  "Periodontics (Gums)",
  "Oral Surgery & Extraction",
  "Prosthodontics (Crowns/Bridges)",
  "Orthodontics (Braces)",
  "PPE & Disposables",
  "Sterilization & Hygiene",
  "Laboratory Supplies",
  "Dental Handpieces & Burs",
  "Preventive Care"
] as const;

/**
 * Medicine type constants for pharmaceutical inventory
 */
export const MEDICINE_TYPES = [
  "Analgesics (Pain Relief)",
  "Antibiotics (Infection Control)",
  "Antifungals",
  "Antivirals",
  "Anesthetics (Local/Topical)",
  "Corticosteroids (Anti-inflammatory)",
  "Hemostatics (Clotting Agents)",
  "Sedatives & Anxiolytics",
  "Fluorides & Preventive Agents",
  "Therapeutic Mouthrinses",
  "Desensitizing Agents"
] as const;

/**
 * Inventory unit constants for quantity measurements
 */
export const INVENTORY_UNITS = [
  "pcs",
  "box",
  "bottle",
  "pack",
  "tube",
  "kit",
  "roll",
  "ml",
  "gm",
  "vial",
  "set"
] as const;

/**
 * TypeScript type for inventory categories
 */
export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];

/**
 * TypeScript type for medicine types
 */
export type MedicineType = typeof MEDICINE_TYPES[number];

/**
 * TypeScript type for inventory units
 */
export type InventoryUnit = typeof INVENTORY_UNITS[number];
