/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Plus,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Activity
} from 'lucide-react';
import { TreatmentPlan, TreatmentVisit, Patient, ServiceType, SERVICE_PRICES } from '../types';
import {  collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface TreatmentPlansProps {
  treatmentPlans: TreatmentPlan[];
  patients: Patient[];
  user: any;
  darkMode: boolean;
}

export function TreatmentPlans({ treatmentPlans, patients, user, darkMode }: TreatmentPlansProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TreatmentPlan['status']>('all');

  const filtered Plans = useMemo(() => {
    if (statusFilter === 'all') return treatmentPlans;
    return treatmentPlans.filter(p => p.status === statusFilter);
  }, [treatmentPlans, statusFilter]);

  const getStatusIcon = (status: TreatmentPlan['status']) => {
    switch (status) {
      case 'planned': return <Clock size={16} className="text-blue-500" />;
      case 'in-progress': return <Activity size={16} className="text-purple-500" />;
      case 'completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getPriorityColor = (priority: TreatmentPlan['priority']) => {
    switch (priority) {
      case 'low': return darkMode ? 'text-slate-400' : 'text-slate-600';
      case 'medium': return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'high': return darkMode ? 'text-orange-400' : 'text-orange-600';
      case 'urgent': return darkMode ? 'text-red-400' : 'text-red-600';
    }
  };

  const getProgressPercentage = (plan: TreatmentPlan) => {
    const totalVisits = plan.visits.length;
    const completedVisits = plan.visits.filter(v => v.status === 'completed').length;
    return totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-2xl md:text-3xl font-extrabold tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
            Treatment Plans
          </h2>
          <p className={cn("mt-1 font-medium text-sm md:text-base", darkMode ? "text-slate-400" : "text-slate-500")}>
            Manage multi-visit treatment plans
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold hover:bg-blue-700 transition-[transform,colors,opacity] flex items-center gap-2 shadow-lg shadow-blue-100/20 text-sm md:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Create Treatment Plan</span>
          <span className="sm:hidden">Create Plan</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'planned', 'in-progress', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
              statusFilter === status
                ? "bg-blue-600 text-white"
                : darkMode
                ? "bg-white/5 text-slate-400 hover:bg-white/10"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {status === 'all' ? 'All Plans' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Treatment Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className={cn(
            "text-center py-12 rounded-2xl border",
            darkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600"
          )}>
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">No treatment plans found</p>
            <p className="text-sm mt-1">Create a new treatment plan to get started</p>
          </div>
        ) : (
          filteredPlans.map(plan => (
            <TreatmentPlanCard
              key={plan.id}
              plan={plan}
              expanded={expandedPlanId === plan.id}
              onToggle={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
              onEdit={() => {
                setEditingPlan(plan);
                setShowAddModal(true);
              }}
              onDelete={async () => {
                if (confirm('Are you sure you want to delete this treatment plan?')) {
                  await deleteDoc(doc(db, 'treatmentPlans', plan.id));
                }
              }}
              darkMode={darkMode}
              getStatusIcon={getStatusIcon}
              getPriorityColor={getPriorityColor}
              getProgressPercentage={getProgressPercentage}
            />
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <TreatmentPlanModal
          plan={editingPlan}
          patients={patients}
          user={user}
          darkMode={darkMode}
          onClose={() => {
            setShowAddModal(false);
            setEditingPlan(null);
          }}
        />
      )}
    </div>
  );
}

interface TreatmentPlanCardProps {
  plan: TreatmentPlan;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  darkMode: boolean;
  getStatusIcon: (status: TreatmentPlan['status']) => React.ReactNode;
  getPriorityColor: (priority: TreatmentPlan['priority']) => string;
  getProgressPercentage: (plan: TreatmentPlan) => number;
}

function TreatmentPlanCard({
  plan,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  darkMode,
  getStatusIcon,
  getPriorityColor,
  getProgressPercentage
}: TreatmentPlanCardProps) {
  const progress = getProgressPercentage(plan);
  const completedVisits = plan.visits.filter(v => v.status === 'completed').length;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all",
      darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
    )}>
      {/* Header */}
      <div
        className={cn(
          "p-6 cursor-pointer",
          darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
        )}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button className="flex-shrink-0">
                {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              {getStatusIcon(plan.status)}
              <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
                {plan.title}
              </h3>
              <span className={cn("text-xs font-bold uppercase", getPriorityColor(plan.priority))}>
                {plan.priority}
              </span>
            </div>
            <p className={cn("text-sm ml-9", darkMode ? "text-slate-400" : "text-slate-600")}>
              Patient: {plan.patientName} | Dentist: {plan.dentistName}
            </p>
            <div className="flex items-center gap-4 mt-3 ml-9 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                <span className={darkMode ? "text-slate-400" : "text-slate-600"}>
                  {new Date(plan.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                <span className={darkMode ? "text-slate-400" : "text-slate-600"}>
                  ₹{plan.paidAmount.toLocaleString()} / ₹{plan.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={16} className={darkMode ? "text-slate-500" : "text-slate-400"} />
                <span className={darkMode ? "text-slate-400" : "text-slate-600"}>
                  {completedVisits}/{plan.visits.length} visits completed
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                darkMode ? "hover:bg-blue-900/30 text-blue-400" : "hover:bg-blue-50 text-blue-600"
              )}
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                darkMode ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-600"
              )}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 ml-9">
          <div className={cn(
            "h-2 rounded-full overflow-hidden",
            darkMode ? "bg-white/10" : "bg-slate-200"
          )}>
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={cn("text-xs mt-1", darkMode ? "text-slate-500" : "text-slate-600")}>
            {progress.toFixed(0)}% Complete
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className={cn(
          "p-6 border-t",
          darkMode ? "border-white/10 bg-white/3" : "border-slate-200 bg-slate-50"
        )}>
          <div className="space-y-4">
            <div>
              <h4 className={cn("font-bold mb-2", darkMode ? "text-white" : "text-slate-900")}>
                Diagnosis
              </h4>
              <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-700")}>
                {plan.diagnosis}
              </p>
            </div>

            <div>
              <h4 className={cn("font-bold mb-2", darkMode ? "text-white" : "text-slate-900")}>
                Treatment Description
              </h4>
              <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-700")}>
                {plan.description}
              </p>
            </div>

            <div>
              <h4 className={cn("font-bold mb-3", darkMode ? "text-white" : "text-slate-900")}>
                Planned Visits ({plan.visits.length})
              </h4>
              <div className="space-y-2">
                {plan.visits.map((visit, idx) => (
                  <div
                    key={visit.id}
                    className={cn(
                      "p-4 rounded-lg border flex items-center justify-between",
                      darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded",
                          visit.status === 'completed'
                            ? "bg-green-500/20 text-green-500"
                            : visit.status === 'scheduled'
                            ? "bg-blue-500/20 text-blue-500"
                            : darkMode ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-600"
                        )}>
                          Visit {visit.visitNumber}
                        </span>
                        <p className={cn("font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                          {visit.serviceType}
                        </p>
                      </div>
                      <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                        {visit.description}
                      </p>
                      {visit.scheduledDate && (
                        <p className={cn("text-xs mt-1", darkMode ? "text-slate-500" : "text-slate-500")}>
                          Scheduled: {new Date(visit.scheduledDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", darkMode ? "text-white" : "text-slate-900")}>
                        ₹{visit.cost.toLocaleString()}
                      </p>
                      {visit.status === 'completed' && visit.completedDate && (
                        <p className={cn("text-xs text-green-500 mt-1")}>
                          ✓ Completed
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {plan.notes && (
              <div>
                <h4 className={cn("font-bold mb-2", darkMode ? "text-white" : "text-slate-900")}>
                  Notes
                </h4>
                <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-700")}>
                  {plan.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified modal placeholder - full implementation would be extensive
function TreatmentPlanModal({ plan, patients, user, darkMode, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className={cn(
        "rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto",
        darkMode ? "glass-card" : "bg-white"
      )}>
        <div className="p-6">
          <h2 className={cn("text-2xl font-bold mb-4", darkMode ? "text-white" : "text-slate-900")}>
            {plan ? 'Edit Treatment Plan' : 'Create Treatment Plan'}
          </h2>
          <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
            Treatment plan creation form would go here with patient selection, visit scheduling, cost calculation, etc.
          </p>
          <button
            onClick={onClose}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
