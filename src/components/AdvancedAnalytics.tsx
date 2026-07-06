/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Transaction, Patient, Appointment } from '../types';
import {
  generateAnalyticsReport,
  getDateRangePresets,
  exportReportToCSV,
  type DateRange,
  type AnalyticsReport
} from '../services/analyticsService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdvancedAnalyticsProps {
  transactions: Transaction[];
  patients: Patient[];
  appointments: Appointment[];
  darkMode: boolean;
}

type PresetKey = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom';

export function AdvancedAnalytics({ transactions, patients, appointments, darkMode }: AdvancedAnalyticsProps) {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('thisMonth');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateRangePresets = useMemo(() => getDateRangePresets(), []);

  // Get current date range
  const dateRange = useMemo((): DateRange => {
    if (selectedPreset === 'custom' && customStart && customEnd) {
      return {
        start: new Date(customStart),
        end: new Date(customEnd + 'T23:59:59'),
      };
    }
    return dateRangePresets[selectedPreset] || dateRangePresets.thisMonth;
  }, [selectedPreset, customStart, customEnd, dateRangePresets]);

  // Generate report
  const report: AnalyticsReport = useMemo(() => {
    return generateAnalyticsReport(transactions, patients, appointments, dateRange);
  }, [transactions, patients, appointments, dateRange]);

  // Handle export
  const handleExport = () => {
    const csv = exportReportToCSV(report);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Chart configurations
  const revenueChartData = {
    labels: report.monthlyTrends.map(m => m.month),
    datasets: [
      {
        label: 'Revenue',
        data: report.monthlyTrends.map(m => m.revenue),
        borderColor: darkMode ? 'rgb(99, 102, 241)' : 'rgb(79, 70, 229)',
        backgroundColor: darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: report.monthlyTrends.map(m => m.expenses),
        borderColor: darkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)',
        backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Profit',
        data: report.monthlyTrends.map(m => m.profit),
        borderColor: darkMode ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)',
        backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const serviceChartData = {
    labels: report.topServices.map(s => s.serviceName),
    datasets: [{
      data: report.topServices.map(s => s.revenue),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderColor: darkMode ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' },
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
      },
      y: {
        ticks: { color: darkMode ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' },
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: darkMode ? 'rgb(226, 232, 240)' : 'rgb(51, 65, 85)',
        },
      },
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-2xl md:text-3xl font-extrabold tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
            Advanced Analytics
          </h2>
          <p className={cn("mt-1 font-medium text-sm md:text-base", darkMode ? "text-slate-400" : "text-slate-500")}>
            {report.dateRange.start.toLocaleDateString()} - {report.dateRange.end.toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleExport}
          className={cn(
            "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm",
            darkMode
              ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          )}
        >
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className={darkMode ? "text-slate-400" : "text-slate-600"} />
          <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
            Date Range
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(dateRangePresets) as PresetKey[]).map(preset => (
            <button
              key={preset}
              onClick={() => setSelectedPreset(preset)}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                selectedPreset === preset
                  ? "bg-blue-600 text-white"
                  : darkMode
                  ? "bg-white/5 text-slate-400 hover:bg-white/10"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {preset === 'last7days' ? 'Last 7 Days' :
               preset === 'last30days' ? 'Last 30 Days' :
               preset === 'thisMonth' ? 'This Month' :
               preset === 'lastMonth' ? 'Last Month' :
               preset === 'thisQuarter' ? 'This Quarter' :
               preset === 'thisYear' ? 'This Year' :
               preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setSelectedPreset('custom')}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
              selectedPreset === 'custom'
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-white/5 text-slate-400 hover:bg-white/10"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Custom
          </button>
        </div>

        {selectedPreset === 'custom' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={cn("text-sm font-semibold mb-2 block", darkMode ? "text-slate-300" : "text-slate-700")}>
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg border transition-all",
                  darkMode
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-slate-200 text-slate-900"
                )}
              />
            </div>
            <div className="flex-1">
              <label className={cn("text-sm font-semibold mb-2 block", darkMode ? "text-slate-300" : "text-slate-700")}>
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 rounded-lg border transition-all",
                  darkMode
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-slate-200 text-slate-900"
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${report.revenue.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          trend={report.growthRate}
          darkMode={darkMode}
          color="blue"
        />
        <MetricCard
          title="Net Profit"
          value={`₹${report.revenue.netProfit.toLocaleString()}`}
          subtitle={`${report.revenue.profitMargin.toFixed(1)}% margin`}
          icon={<TrendingUp size={24} />}
          darkMode={darkMode}
          color="green"
        />
        <MetricCard
          title="Total Patients"
          value={report.patients.totalPatients.toString()}
          subtitle={`${report.patients.activePatients} active`}
          icon={<Users size={24} />}
          darkMode={darkMode}
          color="purple"
        />
        <MetricCard
          title="Avg Transaction"
          value={`₹${report.revenue.averageTransactionValue.toFixed(0)}`}
          subtitle={`${report.revenue.transactionCount} transactions`}
          icon={<Activity size={24} />}
          darkMode={darkMode}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className={darkMode ? "text-slate-400" : "text-slate-600"} />
            <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
              Revenue Trends
            </h3>
          </div>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Service Distribution */}
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className={darkMode ? "text-slate-400" : "text-slate-600"} />
            <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
              Top Services
            </h3>
          </div>
          <div className="h-64">
            <Doughnut data={serviceChartData} options={doughnutOptions as any} />
          </div>
        </div>
      </div>

      {/* Service Breakdown Table */}
      <div className={cn(
        "p-6 rounded-2xl border overflow-x-auto",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <h3 className={cn("font-bold text-lg mb-4", darkMode ? "text-white" : "text-slate-900")}>
          Service Breakdown
        </h3>
        <table className="w-full">
          <thead>
            <tr className={cn("border-b", darkMode ? "border-white/10" : "border-slate-200")}>
              <th className={cn("text-left py-3 px-4 font-semibold", darkMode ? "text-slate-300" : "text-slate-700")}>Service</th>
              <th className={cn("text-right py-3 px-4 font-semibold", darkMode ? "text-slate-300" : "text-slate-700")}>Count</th>
              <th className={cn("text-right py-3 px-4 font-semibold", darkMode ? "text-slate-300" : "text-slate-700")}>Revenue</th>
              <th className={cn("text-right py-3 px-4 font-semibold", darkMode ? "text-slate-300" : "text-slate-700")}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {report.services.map((service, idx) => (
              <tr key={idx} className={cn("border-b", darkMode ? "border-white/5" : "border-slate-100")}>
                <td className={cn("py-3 px-4", darkMode ? "text-white" : "text-slate-900")}>{service.serviceName}</td>
                <td className={cn("py-3 px-4 text-right", darkMode ? "text-slate-300" : "text-slate-700")}>{service.count}</td>
                <td className={cn("py-3 px-4 text-right font-semibold", darkMode ? "text-green-400" : "text-green-600")}>
                  ₹{service.revenue.toLocaleString()}
                </td>
                <td className={cn("py-3 px-4 text-right", darkMode ? "text-slate-400" : "text-slate-600")}>
                  {service.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  darkMode: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ title, value, subtitle, icon, trend, darkMode, color }: MetricCardProps) {
  const colorClasses = {
    blue: darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
    green: darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600',
    purple: darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600',
    orange: darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={cn(
      "p-6 rounded-2xl border",
      darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            trend >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className={cn("text-sm font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
        {title}
      </p>
      <p className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
        {value}
      </p>
      {subtitle && (
        <p className={cn("text-sm mt-1", darkMode ? "text-slate-500" : "text-slate-500")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
