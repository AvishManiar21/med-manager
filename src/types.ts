/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ServiceType {
  ROOT_CANAL = "Root Canal",
  EXTRACTION = "Extraction",
  FACIAL_SURGERY = "Facial Surgery",
  CLEANING = "Cleaning",
  FILLINGS = "Fillings",
  BRACES = "Braces",
  CROWNS = "Crowns",
  IMPLANTS = "Implants",
}

export const SERVICE_PRICES: Record<ServiceType, number> = {
  [ServiceType.ROOT_CANAL]: 5000,
  [ServiceType.EXTRACTION]: 1500,
  [ServiceType.FACIAL_SURGERY]: 15000,
  [ServiceType.CLEANING]: 1000,
  [ServiceType.FILLINGS]: 2000,
  [ServiceType.BRACES]: 45000,
  [ServiceType.CROWNS]: 8000,
  [ServiceType.IMPLANTS]: 25000,
};

export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosedDate?: string;
  notes?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  active: boolean;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
  diagnosedDate?: string;
}

export interface ChronicCondition {
  id: string;
  condition: string;
  diagnosedDate?: string;
  currentMedication?: string;
  controlled: boolean;
  notes?: string;
}

export interface Installment {
  week: number;
  amount: number;
  date: string;
}

export interface Patient {
  id: string;
  serialNo: string;
  name: string;
  email: string;
  serviceType: ServiceType;
  amountDue: number;
  amountPaid: number;
  paymentType: "Direct" | "Installments";
  installments: Installment[];
  status: "Paid" | "Unpaid";

  // LEGACY FIELDS (keep for backward compatibility)
  medicalHistory?: string[];
  allergies?: string[];
  chronicConditions?: string[];

  // NEW STRUCTURED FIELDS
  medicalConditions?: MedicalCondition[];
  allergyList?: Allergy[];
  chronicConditionList?: ChronicCondition[];

  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  serviceType: ServiceType;
  status: "Scheduled" | "Completed" | "Cancelled";
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  medicineType?: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: string;
  purchasePrice?: number;
  company?: string;
  expirationDate?: string;
}

export interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  date: string;
  description: string;
  inventoryItemId?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  medicines: Medicine[];
  instructions: string;
  doctorName: string;
  date: string;
}

export interface Doctor {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'doctor' | 'staff';
  disabled: boolean;
  permissions: Record<string, boolean>;
  createdAt: string;
}

export interface PatientUser {
  id: string;
  email: string;
  patientId: string;  // Links to Patient collection
  displayName: string;
  createdAt: string;
  lastLogin?: string;
}
