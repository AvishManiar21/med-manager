/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { AuditAction, AuditLog } from '../types';
import { User } from 'firebase/auth';

interface LogAuditParams {
  action: AuditAction;
  user: User;
  displayName?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an audit event to Firestore
 * @param params - Audit log parameters
 * @returns Promise that resolves when the log is saved
 */
export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    const auditLog: Omit<AuditLog, 'id'> = {
      action: params.action,
      actorId: params.user.uid,
      actorEmail: params.user.email || 'unknown',
      actorName: params.displayName || params.user.displayName || params.user.email || 'Unknown User',
      targetType: params.targetType,
      targetId: params.targetId,
      targetName: params.targetName,
      details: params.details,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
    };

    await addDoc(collection(db, 'auditLogs'), auditLog);
  } catch (error) {
    // Log to console but don't fail the operation
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Helper function to get a human-readable action description
 */
export function getActionDescription(action: AuditAction): string {
  const descriptions: Record<AuditAction, string> = {
    'user.create': 'Created user account',
    'user.update': 'Updated user account',
    'user.delete': 'Deleted user account',
    'user.disable': 'Disabled user account',
    'user.enable': 'Enabled user account',
    'patient.create': 'Registered new patient',
    'patient.update': 'Updated patient information',
    'patient.delete': 'Deleted patient record',
    'appointment.create': 'Scheduled appointment',
    'appointment.update': 'Updated appointment',
    'appointment.delete': 'Deleted appointment',
    'appointment.cancel': 'Cancelled appointment',
    'prescription.create': 'Created prescription',
    'prescription.delete': 'Deleted prescription',
    'inventory.create': 'Added inventory item',
    'inventory.update': 'Updated inventory item',
    'inventory.delete': 'Deleted inventory item',
    'inventory.restock': 'Restocked inventory item',
    'transaction.create': 'Recorded transaction',
    'transaction.delete': 'Deleted transaction',
    'database.export': 'Exported database',
    'database.wipe': 'Wiped database collection',
    'permissions.update': 'Updated user permissions',
  };

  return descriptions[action] || action;
}

/**
 * Helper function to get action category for filtering
 */
export function getActionCategory(action: AuditAction): string {
  const prefix = action.split('.')[0];
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

/**
 * Helper function to get action severity level
 */
export function getActionSeverity(action: AuditAction): 'low' | 'medium' | 'high' | 'critical' {
  if (action.includes('delete') || action.includes('wipe')) {
    return 'critical';
  }
  if (action.includes('disable') || action.includes('cancel')) {
    return 'high';
  }
  if (action.includes('update') || action.includes('enable')) {
    return 'medium';
  }
  return 'low';
}
