/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, Patient, Appointment, ServiceType } from '../types';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  averageTransactionValue: number;
  transactionCount: number;
}

export interface ServiceMetrics {
  serviceName: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface PatientMetrics {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  paidPatients: number;
  unpaidPatients: number;
  averageRevenuePerPatient: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  patientCount: number;
}

export interface AnalyticsReport {
  dateRange: DateRange;
  revenue: RevenueMetrics;
  services: ServiceMetrics[];
  patients: PatientMetrics;
  monthlyTrends: MonthlyTrend[];
  topServices: ServiceMetrics[];
  growthRate: number;
}

/**
 * Generates comprehensive analytics report for a date range
 */
export function generateAnalyticsReport(
  transactions: Transaction[],
  patients: Patient[],
  appointments: Appointment[],
  dateRange: DateRange
): AnalyticsReport {
  // Filter data by date range
  const filteredTransactions = filterByDateRange(transactions, dateRange);
  const filteredPatients = filterPatientsByDateRange(patients, dateRange);
  const filteredAppointments = filterAppointmentsByDateRange(appointments, dateRange);

  // Calculate revenue metrics
  const revenue = calculateRevenueMetrics(filteredTransactions);

  // Calculate service metrics
  const services = calculateServiceMetrics(filteredAppointments, filteredTransactions);

  // Calculate patient metrics
  const patientMetrics = calculatePatientMetrics(filteredPatients, filteredTransactions);

  // Calculate monthly trends
  const monthlyTrends = calculateMonthlyTrends(filteredTransactions, filteredPatients, dateRange);

  // Get top services
  const topServices = [...services].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Calculate growth rate
  const growthRate = calculateGrowthRate(monthlyTrends);

  return {
    dateRange,
    revenue,
    services,
    patients: patientMetrics,
    monthlyTrends,
    topServices,
    growthRate,
  };
}

/**
 * Filter transactions by date range
 */
function filterByDateRange(transactions: Transaction[], dateRange: DateRange): Transaction[] {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date >= dateRange.start && date <= dateRange.end;
  });
}

/**
 * Filter patients by creation date
 */
function filterPatientsByDateRange(patients: Patient[], dateRange: DateRange): Patient[] {
  return patients.filter(p => {
    const date = new Date(p.createdAt);
    return date >= dateRange.start && date <= dateRange.end;
  });
}

/**
 * Filter appointments by date
 */
function filterAppointmentsByDateRange(appointments: Appointment[], dateRange: DateRange): Appointment[] {
  return appointments.filter(a => {
    const date = new Date(a.date);
    return date >= dateRange.start && date <= dateRange.end;
  });
}

/**
 * Calculate revenue metrics
 */
function calculateRevenueMetrics(transactions: Transaction[]): RevenueMetrics {
  let totalRevenue = 0;
  let totalExpenses = 0;
  let incomeCount = 0;

  transactions.forEach(t => {
    if (t.type === 'Income') {
      totalRevenue += t.amount;
      incomeCount++;
    } else {
      totalExpenses += t.amount;
    }
  });

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const averageTransactionValue = incomeCount > 0 ? totalRevenue / incomeCount : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    averageTransactionValue,
    transactionCount: transactions.length,
  };
}

/**
 * Calculate service-wise metrics
 */
function calculateServiceMetrics(
  appointments: Appointment[],
  transactions: Transaction[]
): ServiceMetrics[] {
  const serviceMap = new Map<string, { count: number; revenue: number }>();

  // Count appointments by service
  appointments.forEach(apt => {
    const service = apt.serviceType;
    if (!serviceMap.has(service)) {
      serviceMap.set(service, { count: 0, revenue: 0 });
    }
    const metrics = serviceMap.get(service)!;
    metrics.count++;
  });

  // Calculate revenue by matching transactions to appointments
  transactions.forEach(t => {
    if (t.type === 'Income' && t.category) {
      const metrics = serviceMap.get(t.category);
      if (metrics) {
        metrics.revenue += t.amount;
      }
    }
  });

  // Calculate total revenue for percentage
  const totalRevenue = Array.from(serviceMap.values()).reduce((sum, m) => sum + m.revenue, 0);

  // Convert to array
  return Array.from(serviceMap.entries()).map(([serviceName, metrics]) => ({
    serviceName,
    count: metrics.count,
    revenue: metrics.revenue,
    percentage: totalRevenue > 0 ? (metrics.revenue / totalRevenue) * 100 : 0,
  }));
}

/**
 * Calculate patient metrics
 */
function calculatePatientMetrics(patients: Patient[], transactions: Transaction[]): PatientMetrics {
  const totalPatients = patients.length;
  const newPatients = patients.length; // All patients in this date range are "new"
  const paidPatients = patients.filter(p => p.status === 'Paid').length;
  const unpaidPatients = patients.filter(p => p.status === 'Unpaid').length;

  // Calculate total revenue from transactions
  const totalRevenue = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const averageRevenuePerPatient = totalPatients > 0 ? totalRevenue / totalPatients : 0;

  // Active patients (have appointments or transactions in this period)
  const activePatientIds = new Set([
    ...transactions.filter(t => t.patientId).map(t => t.patientId),
  ]);
  const activePatients = activePatientIds.size;

  return {
    totalPatients,
    newPatients,
    activePatients,
    paidPatients,
    unpaidPatients,
    averageRevenuePerPatient,
  };
}

/**
 * Calculate monthly trends
 */
function calculateMonthlyTrends(
  transactions: Transaction[],
  patients: Patient[],
  dateRange: DateRange
): MonthlyTrend[] {
  const months: MonthlyTrend[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get unique months in the date range
  const monthSet = new Set<string>();
  transactions.forEach(t => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthSet.add(key);
  });

  // Sort months
  const sortedMonths = Array.from(monthSet).sort();

  sortedMonths.forEach(monthKey => {
    const [year, monthIndex] = monthKey.split('-').map(Number);
    const monthName = `${monthNames[monthIndex]} ${year}`;

    // Filter transactions for this month
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === monthIndex;
    });

    const revenue = monthTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = revenue - expenses;

    // Count new patients for this month
    const patientCount = patients.filter(p => {
      const date = new Date(p.createdAt);
      return date.getFullYear() === year && date.getMonth() === monthIndex;
    }).length;

    months.push({
      month: monthName,
      revenue,
      expenses,
      profit,
      patientCount,
    });
  });

  return months;
}

/**
 * Calculate growth rate from monthly trends
 */
function calculateGrowthRate(trends: MonthlyTrend[]): number {
  if (trends.length < 2) return 0;

  const firstMonth = trends[0];
  const lastMonth = trends[trends.length - 1];

  if (firstMonth.revenue === 0) return 0;

  return ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 100;
}

/**
 * Export report to CSV format
 */
export function exportReportToCSV(report: AnalyticsReport): string {
  const lines: string[] = [];

  // Header
  lines.push('DentalFlow Pro - Analytics Report');
  lines.push(`Date Range: ${report.dateRange.start.toLocaleDateString()} to ${report.dateRange.end.toLocaleDateString()}`);
  lines.push('');

  // Revenue Summary
  lines.push('REVENUE SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Total Revenue,₹${report.revenue.totalRevenue.toLocaleString()}`);
  lines.push(`Total Expenses,₹${report.revenue.totalExpenses.toLocaleString()}`);
  lines.push(`Net Profit,₹${report.revenue.netProfit.toLocaleString()}`);
  lines.push(`Profit Margin,${report.revenue.profitMargin.toFixed(2)}%`);
  lines.push(`Average Transaction Value,₹${report.revenue.averageTransactionValue.toFixed(2)}`);
  lines.push(`Transaction Count,${report.revenue.transactionCount}`);
  lines.push('');

  // Patient Summary
  lines.push('PATIENT SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Total Patients,${report.patients.totalPatients}`);
  lines.push(`New Patients,${report.patients.newPatients}`);
  lines.push(`Active Patients,${report.patients.activePatients}`);
  lines.push(`Paid Patients,${report.patients.paidPatients}`);
  lines.push(`Unpaid Patients,${report.patients.unpaidPatients}`);
  lines.push(`Average Revenue per Patient,₹${report.patients.averageRevenuePerPatient.toFixed(2)}`);
  lines.push('');

  // Service Breakdown
  lines.push('SERVICE BREAKDOWN');
  lines.push('Service,Count,Revenue,Percentage');
  report.services.forEach(s => {
    lines.push(`${s.serviceName},${s.count},₹${s.revenue.toLocaleString()},${s.percentage.toFixed(2)}%`);
  });
  lines.push('');

  // Monthly Trends
  lines.push('MONTHLY TRENDS');
  lines.push('Month,Revenue,Expenses,Profit,New Patients');
  report.monthlyTrends.forEach(m => {
    lines.push(`${m.month},₹${m.revenue.toLocaleString()},₹${m.expenses.toLocaleString()},₹${m.profit.toLocaleString()},${m.patientCount}`);
  });
  lines.push('');

  lines.push(`Growth Rate: ${report.growthRate.toFixed(2)}%`);

  return lines.join('\n');
}

/**
 * Get predefined date range presets
 */
export function getDateRangePresets(): Record<string, DateRange> {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return {
    'today': {
      start: startOfToday,
      end: endOfToday,
    },
    'yesterday': {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59),
    },
    'last7days': {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      end: endOfToday,
    },
    'last30days': {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30),
      end: endOfToday,
    },
    'thisMonth': {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: endOfToday,
    },
    'lastMonth': {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59),
    },
    'thisQuarter': {
      start: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
      end: endOfToday,
    },
    'thisYear': {
      start: new Date(today.getFullYear(), 0, 1),
      end: endOfToday,
    },
  };
}
