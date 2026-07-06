/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Patient, Appointment, Transaction, Prescription, TreatmentPlan, ServiceType } from '../types';

export type ReportType =
  | 'financial-summary'
  | 'patient-demographics'
  | 'appointment-analysis'
  | 'treatment-progress'
  | 'revenue-forecast'
  | 'service-performance';

export interface ReportConfig {
  type: ReportType;
  title: string;
  description: string;
  dateRange?: { start: Date; end: Date };
  filters?: Record<string, any>;
}

/**
 * Generates a comprehensive financial summary report
 */
export function generateFinancialSummaryPDF(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary Report', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    105,
    28,
    { align: 'center' }
  );

  // Filter transactions by date
  const filtered = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });

  // Calculate totals
  const income = filtered.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = filtered.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = income - expenses;

  // Summary Box
  doc.setFillColor(240, 240, 245);
  doc.rect(20, 35, 170, 40, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 25, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Income:`, 25, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${income.toLocaleString()}`, 80, 50);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Expenses:`, 25, 57);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${expenses.toLocaleString()}`, 80, 57);

  doc.setFont('helvetica', 'normal');
  doc.text(`Net Profit:`, 25, 64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(netProfit >= 0 ? 0 : 255, netProfit >= 0 ? 128 : 0, 0);
  doc.text(`₹${netProfit.toLocaleString()}`, 80, 64);
  doc.setTextColor(0, 0, 0);

  doc.setFont('helvetica', 'normal');
  doc.text(`Transactions:`, 25, 71);
  doc.setFont('helvetica', 'bold');
  doc.text(`${filtered.length}`, 80, 71);

  // Income Breakdown
  const incomeByCategory: Record<string, number> = {};
  filtered
    .filter(t => t.type === 'Income')
    .forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });

  let yPos = 85;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Income by Category', 20, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  Object.entries(incomeByCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, amount]) => {
      doc.text(`${category}:`, 25, yPos);
      doc.text(`₹${amount.toLocaleString()}`, 100, yPos);
      yPos += 6;
    });

  // Expenses Breakdown
  yPos += 5;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Expenses by Category', 20, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const expensesByCategory: Record<string, number> = {};
  filtered
    .filter(t => t.type === 'Expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, amount]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${category}:`, 25, yPos);
      doc.text(`₹${amount.toLocaleString()}`, 100, yPos);
      yPos += 6;
    });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
  doc.text('DentalFlow Pro - Practice Management System', 105, 294, { align: 'center' });

  return doc;
}

/**
 * Generates patient demographics report
 */
export function generatePatientDemographicsPDF(patients: Patient[]): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Demographics Report', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

  // Summary Statistics
  const totalPatients = patients.length;
  const paidPatients = patients.filter(p => p.status === 'Paid').length;
  const unpaidPatients = patients.filter(p => p.status === 'Unpaid').length;

  doc.setFillColor(240, 240, 245);
  doc.rect(20, 35, 170, 30, 'F');

  let yPos = 42;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 25, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Patients: ${totalPatients}`, 25, yPos);
  yPos += 6;
  doc.text(`Paid: ${paidPatients} (${((paidPatients / totalPatients) * 100).toFixed(1)}%)`, 25, yPos);
  yPos += 6;
  doc.text(`Unpaid: ${unpaidPatients} (${((unpaidPatients / totalPatients) * 100).toFixed(1)}%)`, 25, yPos);

  // Service Distribution
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Patients by Service Type', 20, yPos);

  const serviceDistribution: Record<string, number> = {};
  patients.forEach(p => {
    serviceDistribution[p.serviceType] = (serviceDistribution[p.serviceType] || 0) + 1;
  });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  Object.entries(serviceDistribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([service, count]) => {
      const percentage = ((count / totalPatients) * 100).toFixed(1);
      doc.text(`${service}:`, 25, yPos);
      doc.text(`${count} patients (${percentage}%)`, 100, yPos);
      yPos += 6;
    });

  // Payment Type Distribution
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Methods', 20, yPos);

  const directPayment = patients.filter(p => p.paymentType === 'Direct').length;
  const installments = patients.filter(p => p.paymentType === 'Installments').length;

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Direct Payment: ${directPayment} (${((directPayment / totalPatients) * 100).toFixed(1)}%)`, 25, yPos);
  yPos += 6;
  doc.text(
    `Installments: ${installments} (${((installments / totalPatients) * 100).toFixed(1)}%)`,
    25,
    yPos
  );

  // Revenue Metrics
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue Metrics', 20, yPos);

  const totalDue = patients.reduce((sum, p) => sum + p.amountDue, 0);
  const totalPaid = patients.reduce((sum, p) => sum + p.amountPaid, 0);
  const avgRevenue = totalPaid / totalPatients;

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Amount Due: ₹${totalDue.toLocaleString()}`, 25, yPos);
  yPos += 6;
  doc.text(`Total Amount Paid: ₹${totalPaid.toLocaleString()}`, 25, yPos);
  yPos += 6;
  doc.text(`Average Revenue per Patient: ₹${avgRevenue.toFixed(2)}`, 25, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('DentalFlow Pro - Practice Management System', 105, 290, { align: 'center' });

  return doc;
}

/**
 * Generates appointment analysis report
 */
export function generateAppointmentAnalysisPDF(
  appointments: Appointment[],
  startDate: Date,
  endDate: Date
): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Appointment Analysis Report', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    105,
    28,
    { align: 'center' }
  );

  // Filter appointments
  const filtered = appointments.filter(a => {
    const date = new Date(a.date);
    return date >= startDate && date <= endDate;
  });

  const scheduled = filtered.filter(a => a.status === 'Scheduled').length;
  const completed = filtered.filter(a => a.status === 'Completed').length;
  const cancelled = filtered.filter(a => a.status === 'Cancelled').length;

  // Summary
  doc.setFillColor(240, 240, 245);
  doc.rect(20, 35, 170, 35, 'F');

  let yPos = 42;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Appointment Summary', 25, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Appointments: ${filtered.length}`, 25, yPos);
  yPos += 6;
  doc.text(`Scheduled: ${scheduled}`, 25, yPos);
  yPos += 6;
  doc.text(`Completed: ${completed}`, 25, yPos);
  yPos += 6;
  doc.text(`Cancelled: ${cancelled}`, 25, yPos);

  if (filtered.length > 0) {
    const completionRate = ((completed / filtered.length) * 100).toFixed(1);
    const cancellationRate = ((cancelled / filtered.length) * 100).toFixed(1);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`Completion Rate: ${completionRate}%`, 25, yPos);
    yPos += 6;
    doc.text(`Cancellation Rate: ${cancellationRate}%`, 25, yPos);
  }

  // Service Distribution
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Appointments by Service', 20, yPos);

  const serviceCount: Record<string, number> = {};
  filtered.forEach(a => {
    serviceCount[a.serviceType] = (serviceCount[a.serviceType] || 0) + 1;
  });

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  Object.entries(serviceCount)
    .sort(([, a], [, b]) => b - a)
    .forEach(([service, count]) => {
      doc.text(`${service}: ${count} appointments`, 25, yPos);
      yPos += 6;
    });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
  doc.text('DentalFlow Pro - Practice Management System', 105, 294, { align: 'center' });

  return doc;
}

/**
 * Generates treatment progress report
 */
export function generateTreatmentProgressPDF(treatmentPlans: TreatmentPlan[]): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Treatment Progress Report', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

  // Summary
  const total = treatmentPlans.length;
  const planned = treatmentPlans.filter(tp => tp.status === 'planned').length;
  const inProgress = treatmentPlans.filter(tp => tp.status === 'in-progress').length;
  const completed = treatmentPlans.filter(tp => tp.status === 'completed').length;
  const cancelled = treatmentPlans.filter(tp => tp.status === 'cancelled').length;

  doc.setFillColor(240, 240, 245);
  doc.rect(20, 35, 170, 35, 'F');

  let yPos = 42;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 25, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Treatment Plans: ${total}`, 25, yPos);
  yPos += 6;
  doc.text(`Planned: ${planned}`, 25, yPos);
  yPos += 6;
  doc.text(`In Progress: ${inProgress}`, 25, yPos);
  yPos += 6;
  doc.text(`Completed: ${completed}`, 25, yPos);
  yPos += 6;
  doc.text(`Cancelled: ${cancelled}`, 25, yPos);

  // Active Treatments
  yPos += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Active Treatments', 20, yPos);

  const active = treatmentPlans.filter(tp => tp.status === 'in-progress');

  if (active.length === 0) {
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No active treatments', 25, yPos);
  } else {
    yPos += 8;
    active.slice(0, 10).forEach(tp => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      const completedVisits = tp.visits.filter(v => v.status === 'completed').length;
      const progress = ((completedVisits / tp.visits.length) * 100).toFixed(0);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(tp.title, 25, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`Patient: ${tp.patientName} | Progress: ${progress}%`, 25, yPos);
      yPos += 5;
      doc.text(`Visits: ${completedVisits}/${tp.visits.length} completed`, 25, yPos);
      yPos += 8;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('DentalFlow Pro - Practice Management System', 105, 290, { align: 'center' });

  return doc;
}

/**
 * Downloads a generated PDF report
 */
export function downloadPDFReport(doc: jsPDF, fileName: string): void {
  doc.save(fileName);
}
