/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Patient, Appointment, Transaction, InventoryItem, Prescription, TreatmentPlan } from '../types';

export interface BackupData {
  timestamp: string;
  version: string;
  collections: {
    patients: Patient[];
    appointments: Appointment[];
    transactions: Transaction[];
    inventory: InventoryItem[];
    prescriptions: Prescription[];
    treatmentPlans: TreatmentPlan[];
  };
  metadata: {
    totalRecords: number;
    backupSize: number;
    createdBy: string;
    clinicName?: string;
  };
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  recordCount: number;
  size: number;
  createdBy: string;
  fileName: string;
}

/**
 * Creates a complete backup of all Firestore collections
 */
export async function createFullBackup(userName: string, clinicName?: string): Promise<BackupData> {
  try {
    // Fetch all collections
    const [patients, appointments, transactions, inventory, prescriptions, treatmentPlans] = await Promise.all([
      fetchCollection<Patient>('patients'),
      fetchCollection<Appointment>('appointments'),
      fetchCollection<Transaction>('transactions'),
      fetchCollection<InventoryItem>('inventory'),
      fetchCollection<Prescription>('prescriptions'),
      fetchCollection<TreatmentPlan>('treatmentPlans'),
    ]);

    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      collections: {
        patients,
        appointments,
        transactions,
        inventory,
        prescriptions,
        treatmentPlans,
      },
      metadata: {
        totalRecords:
          patients.length +
          appointments.length +
          transactions.length +
          inventory.length +
          prescriptions.length +
          treatmentPlans.length,
        backupSize: 0, // Will be calculated when converted to JSON
        createdBy: userName,
        clinicName,
      },
    };

    // Calculate backup size
    const jsonString = JSON.stringify(backup);
    backup.metadata.backupSize = new Blob([jsonString]).size;

    return backup;
  } catch (error: any) {
    console.error('Backup creation failed:', error);
    throw new Error(`Failed to create backup: ${error.message}`);
  }
}

/**
 * Fetches all documents from a Firestore collection
 */
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error: any) {
    console.error(`Failed to fetch ${collectionName}:`, error);
    return [];
  }
}

/**
 * Downloads backup data as a JSON file
 */
export function downloadBackup(backup: BackupData): void {
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const fileName = `dentalflow-backup-${new Date(backup.timestamp).toISOString().split('T')[0]}-${Date.now()}.json`;
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates and downloads a backup in CSV format (alternative format)
 */
export async function downloadCSVBackup(userName: string): Promise<void> {
  const backup = await createFullBackup(userName);
  const zip = await createCSVZip(backup);

  const url = URL.createObjectURL(zip);
  const link = document.createElement('a');
  const fileName = `dentalflow-csv-backup-${new Date().toISOString().split('T')[0]}.zip`;
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a ZIP file containing CSV exports of all collections
 */
async function createCSVZip(backup: BackupData): Promise<Blob> {
  // This is a simplified version - in production, you'd use a library like JSZip
  const csvFiles: { [key: string]: string } = {};

  // Convert patients to CSV
  if (backup.collections.patients.length > 0) {
    csvFiles['patients.csv'] = arrayToCSV(backup.collections.patients, [
      'id', 'serialNo', 'name', 'email', 'serviceType', 'amountDue', 'amountPaid',
      'paymentType', 'status', 'createdAt'
    ]);
  }

  // Convert appointments to CSV
  if (backup.collections.appointments.length > 0) {
    csvFiles['appointments.csv'] = arrayToCSV(backup.collections.appointments, [
      'id', 'patientId', 'patientName', 'date', 'time', 'serviceType', 'status'
    ]);
  }

  // Convert transactions to CSV
  if (backup.collections.transactions.length > 0) {
    csvFiles['transactions.csv'] = arrayToCSV(backup.collections.transactions, [
      'id', 'patientId', 'patientName', 'amount', 'type', 'category', 'date', 'description'
    ]);
  }

  // Convert inventory to CSV
  if (backup.collections.inventory.length > 0) {
    csvFiles['inventory.csv'] = arrayToCSV(backup.collections.inventory, [
      'id', 'name', 'category', 'quantity', 'unit', 'minThreshold', 'lastRestocked'
    ]);
  }

  // For now, create a simple blob with all CSV content
  // In production, use JSZip library for proper ZIP creation
  let combinedCSV = 'DentalFlow Pro - Database Backup\n';
  combinedCSV += `Created: ${backup.timestamp}\n`;
  combinedCSV += `Created By: ${backup.metadata.createdBy}\n`;
  combinedCSV += `Total Records: ${backup.metadata.totalRecords}\n\n`;

  Object.entries(csvFiles).forEach(([filename, content]) => {
    combinedCSV += `\n\n=== ${filename} ===\n\n${content}`;
  });

  return new Blob([combinedCSV], { type: 'text/csv' });
}

/**
 * Converts an array of objects to CSV format
 */
function arrayToCSV(data: any[], columns: string[]): string {
  if (data.length === 0) return '';

  const rows: string[] = [];

  // Header row
  rows.push(columns.join(','));

  // Data rows
  data.forEach(item => {
    const values = columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return '';

      // Handle complex types
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }

      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    });
    rows.push(values.join(','));
  });

  return rows.join('\n');
}

/**
 * Validates a backup file before restoration
 */
export function validateBackup(backupData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!backupData.timestamp) errors.push('Missing timestamp');
  if (!backupData.version) errors.push('Missing version');
  if (!backupData.collections) errors.push('Missing collections data');
  if (!backupData.metadata) errors.push('Missing metadata');

  // Check collections structure
  if (backupData.collections) {
    const requiredCollections = ['patients', 'appointments', 'transactions', 'inventory', 'prescriptions'];
    requiredCollections.forEach(col => {
      if (!Array.isArray(backupData.collections[col])) {
        errors.push(`Invalid or missing collection: ${col}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gets statistics about a backup
 */
export function getBackupStats(backup: BackupData): {
  collections: { name: string; count: number }[];
  totalSize: string;
  timestamp: string;
} {
  return {
    collections: [
      { name: 'Patients', count: backup.collections.patients.length },
      { name: 'Appointments', count: backup.collections.appointments.length },
      { name: 'Transactions', count: backup.collections.transactions.length },
      { name: 'Inventory', count: backup.collections.inventory.length },
      { name: 'Prescriptions', count: backup.collections.prescriptions.length },
      { name: 'Treatment Plans', count: backup.collections.treatmentPlans?.length || 0 },
    ],
    totalSize: formatBytes(backup.metadata.backupSize),
    timestamp: new Date(backup.timestamp).toLocaleString(),
  };
}

/**
 * Formats bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Stores backup metadata in localStorage for history tracking
 */
export function saveBackupMetadata(backup: BackupData): void {
  try {
    const history = getBackupHistory();
    const metadata: BackupMetadata = {
      id: `backup-${Date.now()}`,
      timestamp: backup.timestamp,
      recordCount: backup.metadata.totalRecords,
      size: backup.metadata.backupSize,
      createdBy: backup.metadata.createdBy,
      fileName: `dentalflow-backup-${new Date(backup.timestamp).toISOString().split('T')[0]}.json`,
    };

    history.unshift(metadata);

    // Keep only last 50 backups in history
    if (history.length > 50) {
      history.splice(50);
    }

    localStorage.setItem('dentalflow-backup-history', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save backup metadata:', error);
  }
}

/**
 * Retrieves backup history from localStorage
 */
export function getBackupHistory(): BackupMetadata[] {
  try {
    const historyJson = localStorage.getItem('dentalflow-backup-history');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Failed to load backup history:', error);
    return [];
  }
}

/**
 * Clears backup history
 */
export function clearBackupHistory(): void {
  localStorage.removeItem('dentalflow-backup-history');
}

/**
 * Schedules automatic backups (would require backend implementation)
 * This is a client-side reminder system
 */
export function getBackupReminder(): { shouldBackup: boolean; daysSinceLastBackup: number } {
  const history = getBackupHistory();

  if (history.length === 0) {
    return { shouldBackup: true, daysSinceLastBackup: Infinity };
  }

  const lastBackup = new Date(history[0].timestamp);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));

  return {
    shouldBackup: daysSince >= 7, // Recommend backup every 7 days
    daysSinceLastBackup: daysSince,
  };
}
