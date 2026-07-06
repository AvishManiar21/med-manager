/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Patient, Appointment, Transaction, TreatmentPlan } from '../types';
import {
  generateFinancialSummaryPDF,
  generatePatientDemographicsPDF,
  generateAppointmentAnalysisPDF,
  generateTreatmentProgressPDF,
  downloadPDFReport,
  type ReportType
} from '../services/reportService';

interface ReportsDashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  transactions: Transaction[];
  treatmentPlans: TreatmentPlan[];
  darkMode: boolean;
}

interface ReportOption {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  requiresDateRange: boolean;
}

export function ReportsDashboard({
  patients,
  appointments,
  transactions,
  treatmentPlans,
  darkMode
}: ReportsDashboardProps) {
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportOptions: ReportOption[] = [
    {
      type: 'financial-summary',
      title: 'Financial Summary',
      description: 'Revenue, expenses, and profit analysis',
      icon: <DollarSign size={24} />,
      color: 'green',
      requiresDateRange: true,
    },
    {
      type: 'patient-demographics',
      title: 'Patient Demographics',
      description: 'Patient statistics and service distribution',
      icon: <Users size={24} />,
      color: 'blue',
      requiresDateRange: false,
    },
    {
      type: 'appointment-analysis',
      title: 'Appointment Analysis',
      description: 'Appointment trends and completion rates',
      icon: <Calendar size={24} />,
      color: 'purple',
      requiresDateRange: true,
    },
    {
      type: 'treatment-progress',
      title: 'Treatment Progress',
      description: 'Active treatment plans and progress',
      icon: <Activity size={24} />,
      color: 'orange',
      requiresDateRange: false,
    },
  ];

  const handleGenerateReport = async (reportType: ReportType, requiresDateRange: boolean) => {
    if (requiresDateRange && (!startDate || !endDate)) {
      alert('Please select a date range for this report');
      return;
    }

    setGenerating(true);

    try {
      let doc;
      const start = new Date(startDate);
      const end = new Date(endDate);

      switch (reportType) {
        case 'financial-summary':
          doc = generateFinancialSummaryPDF(transactions, start, end);
          downloadPDFReport(doc, `financial-summary-${new Date().toISOString().split('T')[0]}.pdf`);
          break;

        case 'patient-demographics':
          doc = generatePatientDemographicsPDF(patients);
          downloadPDFReport(doc, `patient-demographics-${new Date().toISOString().split('T')[0]}.pdf`);
          break;

        case 'appointment-analysis':
          doc = generateAppointmentAnalysisPDF(appointments, start, end);
          downloadPDFReport(doc, `appointment-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
          break;

        case 'treatment-progress':
          doc = generateTreatmentProgressPDF(treatmentPlans);
          downloadPDFReport(doc, `treatment-progress-${new Date().toISOString().split('T')[0]}.pdf`);
          break;

        default:
          alert('Report type not implemented yet');
      }
    } catch (error: any) {
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const getColorClasses = (color: string) => {
    const classes = {
      green: darkMode ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-green-50 text-green-600 border-green-200',
      blue: darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200',
      purple: darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-600 border-purple-200',
      orange: darkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h2 className={cn("text-2xl md:text-3xl font-extrabold tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
          Reports Dashboard
        </h2>
        <p className={cn("mt-1 font-medium text-sm md:text-base", darkMode ? "text-slate-400" : "text-slate-500")}>
          Generate comprehensive PDF reports
        </p>
      </div>

      {/* Date Range Selector */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className={darkMode ? "text-slate-400" : "text-slate-600"} />
          <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
            Date Range (for time-based reports)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={cn("text-sm font-semibold mb-2 block", darkMode ? "text-slate-300" : "text-slate-700")}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(
                "w-full px-4 py-2 rounded-lg border transition-all",
                darkMode
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              )}
            />
          </div>
          <div>
            <label className={cn("text-sm font-semibold mb-2 block", darkMode ? "text-slate-300" : "text-slate-700")}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn(
                "w-full px-4 py-2 rounded-lg border transition-all",
                darkMode
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              )}
            />
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportOptions.map((report) => (
          <div
            key={report.type}
            className={cn(
              "p-6 rounded-2xl border",
              darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-3 rounded-xl border", getColorClasses(report.color))}>
                {report.icon}
              </div>
              {report.requiresDateRange && (
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded",
                  darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                )}>
                  Date Range Required
                </span>
              )}
            </div>

            <h3 className={cn("font-bold text-lg mb-2", darkMode ? "text-white" : "text-slate-900")}>
              {report.title}
            </h3>
            <p className={cn("text-sm mb-4", darkMode ? "text-slate-400" : "text-slate-600")}>
              {report.description}
            </p>

            <button
              onClick={() => handleGenerateReport(report.type, report.requiresDateRange)}
              disabled={generating}
              className={cn(
                "w-full px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                generating
                  ? darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className={cn(
        "p-4 rounded-xl border flex items-start gap-3",
        darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"
      )}>
        <FileText className={cn("flex-shrink-0 mt-0.5", darkMode ? "text-blue-400" : "text-blue-600")} size={20} />
        <div className="flex-1">
          <h3 className={cn("font-bold mb-1", darkMode ? "text-blue-300" : "text-blue-900")}>
            Report Information
          </h3>
          <p className={cn("text-sm", darkMode ? "text-blue-200" : "text-blue-800")}>
            Reports are generated as PDF files and will be downloaded automatically. They include detailed analysis,
            charts, and tables based on your clinic's data. Select a date range for time-based reports to filter the data.
          </p>
        </div>
      </div>
    </div>
  );
}
