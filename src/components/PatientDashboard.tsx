/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Patient, Appointment, Prescription, Transaction, PatientUser } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';
import { cn } from '../lib/utils';
import {
  User as UserIcon,
  Calendar,
  FileText,
  DollarSign,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Pill,
  Image as ImageIcon
} from 'lucide-react';

interface PatientDashboardProps {
  user: User;
  onSignOut: () => void;
  darkMode: boolean;
}

type TabType = 'overview' | 'appointments' | 'prescriptions' | 'billing' | 'images';

export function PatientDashboard({ user, onSignOut, darkMode }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [patientUser, setPatientUser] = useState<PatientUser | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      // Get patient user document
      const patientUserDoc = await getDoc(doc(db, 'patientUsers', user.uid));
      if (!patientUserDoc.exists()) {
        console.error('Patient user not found');
        return;
      }

      const patientUserData = { id: patientUserDoc.id, ...patientUserDoc.data() } as PatientUser;
      setPatientUser(patientUserData);

      // Find linked patient record by email
      const patientsQuery = query(
        collection(db, 'patients'),
        where('email', '==', patientUserData.patientEmail || user.email)
      );
      const patientsSnapshot = await getDocs(patientsQuery);

      if (!patientsSnapshot.empty) {
        const patientData = { id: patientsSnapshot.docs[0].id, ...patientsSnapshot.docs[0].data() } as Patient;
        setPatient(patientData);

        // Load appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', patientData.id),
          orderBy('date', 'desc')
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        setAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));

        // Load prescriptions
        const prescriptionsQuery = query(
          collection(db, 'prescriptions'),
          where('patientId', '==', patientData.id),
          orderBy('date', 'desc')
        );
        const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
        setPrescriptions(prescriptionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));

        // Load transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('patientId', '==', patientData.id),
          orderBy('date', 'desc')
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        setTransactions(transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: UserIcon },
    { id: 'appointments' as const, label: 'Appointments', icon: Calendar },
    { id: 'prescriptions' as const, label: 'Prescriptions', icon: FileText },
    { id: 'billing' as const, label: 'Billing', icon: DollarSign },
    { id: 'images' as const, label: 'Images', icon: ImageIcon },
  ];

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        darkMode ? "bg-slate-900" : "bg-slate-50"
      )}>
        <div className="text-center">
          <div className={cn(
            "w-16 h-16 border-4 border-t-blue-600 rounded-full animate-spin mx-auto mb-4",
            darkMode ? "border-slate-700" : "border-slate-200"
          )} />
          <p className={cn("text-lg font-semibold", darkMode ? "text-white" : "text-slate-900")}>
            Loading your records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", darkMode ? "bg-slate-900" : "bg-slate-50")}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-sm border-b",
        darkMode
          ? "bg-slate-900/90 border-white/10"
          : "bg-white/90 border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
              DentalFlow Pro
            </h1>
            <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
              Patient Portal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                {patientUser?.displayName || user.displayName}
              </p>
              <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                {user.email}
              </p>
            </div>
            <button
              onClick={onSignOut}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all",
                darkMode
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  : "bg-red-50 hover:bg-red-100 text-red-600"
              )}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* No Patient Record Warning */}
      {!patient && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className={cn(
            "rounded-2xl p-6 border-2",
            darkMode
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          )}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold mb-2">No Patient Record Found</h3>
                <p className="text-sm">
                  We couldn't find a patient record linked to your email. Please contact the clinic to ensure your email is registered correctly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {patient && (
        <>
          {/* Tabs */}
          <div className={cn(
            "border-b",
            darkMode ? "border-white/10" : "border-slate-200"
          )}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2",
                      activeTab === tab.id
                        ? darkMode
                          ? "border-blue-500 text-blue-400"
                          : "border-blue-600 text-blue-600"
                        : darkMode
                        ? "border-transparent text-slate-400 hover:text-white"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {activeTab === 'overview' && <OverviewTab patient={patient} appointments={appointments} transactions={transactions} darkMode={darkMode} />}
            {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} darkMode={darkMode} />}
            {activeTab === 'prescriptions' && <PrescriptionsTab prescriptions={prescriptions} darkMode={darkMode} />}
            {activeTab === 'billing' && <BillingTab patient={patient} transactions={transactions} darkMode={darkMode} />}
            {activeTab === 'images' && <ImagesTab patient={patient} darkMode={darkMode} />}
          </div>
        </>
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ patient, appointments, transactions, darkMode }: { patient: Patient, appointments: Appointment[], transactions: Transaction[], darkMode: boolean }) {
  const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled' && new Date(a.date) >= new Date());
  const completedAppointments = appointments.filter(a => a.status === 'Completed');
  const totalPaid = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn("font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>
              Upcoming Visits
            </h3>
            <Calendar className={cn("w-5 h-5", darkMode ? "text-blue-400" : "text-blue-600")} />
          </div>
          <p className={cn("text-3xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
            {upcomingAppointments.length}
          </p>
        </div>

        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn("font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>
              Total Visits
            </h3>
            <CheckCircle2 className={cn("w-5 h-5", darkMode ? "text-green-400" : "text-green-600")} />
          </div>
          <p className={cn("text-3xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
            {completedAppointments.length}
          </p>
        </div>

        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn("font-bold", darkMode ? "text-slate-300" : "text-slate-700")}>
              Balance Due
            </h3>
            <DollarSign className={cn("w-5 h-5", darkMode ? "text-yellow-400" : "text-yellow-600")} />
          </div>
          <p className={cn("text-3xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
            {formatCurrency(patient.amountDue - patient.amountPaid)}
          </p>
        </div>
      </div>

      {/* Patient Info */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <h2 className={cn("text-xl font-bold mb-6", darkMode ? "text-white" : "text-slate-900")}>
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className={cn("text-sm font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
              Patient ID
            </p>
            <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
              {patient.serialNo}
            </p>
          </div>
          <div>
            <p className={cn("text-sm font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
              Name
            </p>
            <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
              {patient.name}
            </p>
          </div>
          <div>
            <p className={cn("text-sm font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
              Email
            </p>
            <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
              {patient.email}
            </p>
          </div>
          <div>
            <p className={cn("text-sm font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
              Primary Service
            </p>
            <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
              {patient.serviceType}
            </p>
          </div>
        </div>

        {/* Medical Information */}
        {(patient.allergyList && patient.allergyList.length > 0) || (patient.chronicConditionList && patient.chronicConditionList.length > 0) ? (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10">
            <h3 className={cn("text-lg font-bold mb-4", darkMode ? "text-white" : "text-slate-900")}>
              Medical Information
            </h3>
            {patient.allergyList && patient.allergyList.length > 0 && (
              <div className="mb-4">
                <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
                  Allergies
                </p>
                <div className="flex flex-wrap gap-2">
                  {patient.allergyList.map((allergy) => (
                    <span
                      key={allergy.id}
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm font-semibold",
                        darkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700"
                      )}
                    >
                      {allergy.allergen} {allergy.severity && `(${allergy.severity})`}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.chronicConditionList && patient.chronicConditionList.length > 0 && (
              <div>
                <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
                  Chronic Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {patient.chronicConditionList.map((condition) => (
                    <span
                      key={condition.id}
                      className={cn(
                        "px-3 py-1 rounded-lg text-sm font-semibold",
                        darkMode ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-700"
                      )}
                    >
                      {condition.condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Appointments Tab Component
function AppointmentsTab({ appointments, darkMode }: { appointments: Appointment[], darkMode: boolean }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-semibold";
    switch (status) {
      case 'Scheduled':
        return cn(baseClasses, darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700");
      case 'Completed':
        return cn(baseClasses, darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700");
      case 'Cancelled':
        return cn(baseClasses, darkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700");
      default:
        return baseClasses;
    }
  };

  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className={cn(
          "text-center py-12 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600"
        )}>
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-semibold">No appointments found</p>
        </div>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment.id}
            className={cn(
              "p-6 rounded-2xl border transition-all hover:shadow-lg",
              darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {getStatusIcon(appointment.status)}
                <div>
                  <h3 className={cn("font-bold mb-1", darkMode ? "text-white" : "text-slate-900")}>
                    {appointment.serviceType}
                  </h3>
                  <p className={cn("text-sm mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
                    {formatDate(appointment.date)} at {appointment.time}
                  </p>
                  {appointment.cancellationReason && (
                    <p className={cn("text-sm italic", darkMode ? "text-red-400" : "text-red-600")}>
                      Cancelled: {appointment.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
              <span className={getStatusBadge(appointment.status)}>
                {appointment.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Prescriptions Tab Component
function PrescriptionsTab({ prescriptions, darkMode }: { prescriptions: Prescription[], darkMode: boolean }) {
  return (
    <div className="space-y-6">
      {prescriptions.length === 0 ? (
        <div className={cn(
          "text-center py-12 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600"
        )}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-semibold">No prescriptions found</p>
        </div>
      ) : (
        prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className={cn(
              "p-6 rounded-2xl border",
              darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={cn("font-bold mb-1", darkMode ? "text-white" : "text-slate-900")}>
                  Prescription
                </h3>
                <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                  Prescribed by {prescription.doctorName} on {formatDate(prescription.date)}
                </p>
              </div>
              <Pill className={cn("w-6 h-6", darkMode ? "text-blue-400" : "text-blue-600")} />
            </div>

            <div className="space-y-3">
              {prescription.medicines.map((medicine, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-xl border",
                    darkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <h4 className={cn("font-bold mb-2", darkMode ? "text-white" : "text-slate-900")}>
                    {medicine.name}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className={cn("font-semibold", darkMode ? "text-slate-400" : "text-slate-600")}>
                        Dosage:
                      </span>
                      <p className={cn("mt-1", darkMode ? "text-white" : "text-slate-900")}>
                        {medicine.dosage}
                      </p>
                    </div>
                    <div>
                      <span className={cn("font-semibold", darkMode ? "text-slate-400" : "text-slate-600")}>
                        Frequency:
                      </span>
                      <p className={cn("mt-1", darkMode ? "text-white" : "text-slate-900")}>
                        {medicine.frequency}
                      </p>
                    </div>
                    <div>
                      <span className={cn("font-semibold", darkMode ? "text-slate-400" : "text-slate-600")}>
                        Duration:
                      </span>
                      <p className={cn("mt-1", darkMode ? "text-white" : "text-slate-900")}>
                        {medicine.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {prescription.instructions && (
              <div className={cn(
                "mt-4 p-4 rounded-xl border",
                darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"
              )}>
                <p className={cn("text-sm font-semibold mb-1", darkMode ? "text-blue-300" : "text-blue-700")}>
                  Instructions:
                </p>
                <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>
                  {prescription.instructions}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// Billing Tab Component
function BillingTab({ patient, transactions, darkMode }: { patient: Patient, transactions: Transaction[], darkMode: boolean }) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <h2 className={cn("text-xl font-bold mb-6", darkMode ? "text-white" : "text-slate-900")}>
          Billing Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
              Total Amount Due
            </p>
            <p className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
              {formatCurrency(patient.amountDue)}
            </p>
          </div>
          <div>
            <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
              Amount Paid
            </p>
            <p className={cn("text-2xl font-bold text-green-500")}>
              {formatCurrency(patient.amountPaid)}
            </p>
          </div>
          <div>
            <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
              Balance Remaining
            </p>
            <p className={cn(
              "text-2xl font-bold",
              patient.status === 'Paid'
                ? "text-green-500"
                : darkMode ? "text-yellow-400" : "text-yellow-600"
            )}>
              {formatCurrency(patient.amountDue - patient.amountPaid)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t dark:border-white/10">
          <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
            Payment Plan
          </p>
          <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
            {patient.paymentType}
          </p>
        </div>
      </div>

      {/* Installments (if applicable) */}
      {patient.paymentType === 'Installments' && patient.installments && patient.installments.length > 0 && (
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <h3 className={cn("text-lg font-bold mb-4", darkMode ? "text-white" : "text-slate-900")}>
            Installment Schedule
          </h3>
          <div className="space-y-2">
            {patient.installments.map((installment) => (
              <div
                key={installment.week}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  darkMode ? "bg-white/5" : "bg-slate-50"
                )}
              >
                <span className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                  Week {installment.week}
                </span>
                <div className="text-right">
                  <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                    {formatCurrency(installment.amount)}
                  </p>
                  <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                    Due: {formatDate(installment.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <h3 className={cn("text-lg font-bold mb-4", darkMode ? "text-white" : "text-slate-900")}>
          Payment History
        </h3>
        {transactions.length === 0 ? (
          <p className={cn("text-center py-6", darkMode ? "text-slate-400" : "text-slate-600")}>
            No payment history found
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl",
                  darkMode ? "bg-white/5" : "bg-slate-50"
                )}
              >
                <div>
                  <p className={cn("font-semibold mb-1", darkMode ? "text-white" : "text-slate-900")}>
                    {transaction.category}
                  </p>
                  <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                    {formatDate(transaction.date)}
                  </p>
                  {transaction.description && (
                    <p className={cn("text-sm mt-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                      {transaction.description}
                    </p>
                  )}
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  transaction.type === 'Income'
                    ? "text-green-500"
                    : "text-red-500"
                )}>
                  {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Images Tab Component
function ImagesTab({ patient, darkMode }: { patient: Patient, darkMode: boolean }) {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  if (!patient.images || patient.images.length === 0) {
    return (
      <div className={cn(
        "text-center py-12 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600"
      )}>
        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-semibold">No images uploaded</p>
        <p className="text-sm mt-1">Your dental images will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patient.images.map((image) => (
          <div
            key={image.id}
            className={cn(
              "rounded-xl border overflow-hidden group hover:shadow-lg transition-all cursor-pointer",
              darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}
            onClick={() => setSelectedImage(image)}
          >
            {/* Image Preview */}
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
              {image.mimeType.startsWith('image/') ? (
                <img
                  src={image.fileUrl}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-16 h-16 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white font-semibold">Click to view</p>
              </div>
            </div>

            {/* Image Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className={cn("font-semibold text-sm truncate", darkMode ? "text-white" : "text-slate-900")}>
                  {image.fileName}
                </p>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-bold uppercase flex-shrink-0",
                  darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                )}>
                  {image.imageType}
                </span>
              </div>
              {image.description && (
                <p className={cn("text-sm mb-2", darkMode ? "text-slate-400" : "text-slate-600")}>
                  {image.description}
                </p>
              )}
              <div className={cn("text-xs space-y-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                <p>Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}</p>
                <p>By: {image.uploadedBy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedImage.mimeType.startsWith('image/') ? (
              <img
                src={selectedImage.fileUrl}
                alt={selectedImage.fileName}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <iframe
                src={selectedImage.fileUrl}
                className="w-full h-[90vh] bg-white rounded-lg"
                title={selectedImage.fileName}
              />
            )}
            <div className="mt-4 text-center">
              <p className="text-white font-semibold mb-2">{selectedImage.fileName}</p>
              {selectedImage.description && (
                <p className="text-slate-300 text-sm">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
