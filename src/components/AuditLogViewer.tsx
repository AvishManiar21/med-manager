/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { AuditLog, AuditAction } from '../types';
import { formatDate } from '../utils/formatting';
import { getActionDescription, getActionCategory, getActionSeverity } from '../utils/auditLog';
import { cn } from '../lib/utils';
import {
  Shield,
  User,
  Users,
  Calendar,
  FileText,
  Package,
  DollarSign,
  Database,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AuditLogViewerProps {
  auditLogs: AuditLog[];
  darkMode: boolean;
}

export function AuditLogViewer({ auditLogs, darkMode }: AuditLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(auditLogs.map(log => getActionCategory(log.action)));
    return ['All', ...Array.from(cats)];
  }, [auditLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch =
        searchTerm === '' ||
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getActionDescription(log.action).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        filterCategory === 'All' ||
        getActionCategory(log.action) === filterCategory;

      const matchesSeverity =
        filterSeverity === 'All' ||
        getActionSeverity(log.action) === filterSeverity.toLowerCase();

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [auditLogs, searchTerm, filterCategory, filterSeverity]);

  const getCategoryIcon = (action: AuditAction) => {
    if (action.startsWith('user.')) return <User className="w-5 h-5" />;
    if (action.startsWith('patient.')) return <Users className="w-5 h-5" />;
    if (action.startsWith('appointment.')) return <Calendar className="w-5 h-5" />;
    if (action.startsWith('prescription.')) return <FileText className="w-5 h-5" />;
    if (action.startsWith('inventory.')) return <Package className="w-5 h-5" />;
    if (action.startsWith('transaction.')) return <DollarSign className="w-5 h-5" />;
    if (action.startsWith('database.')) return <Database className="w-5 h-5" />;
    if (action.startsWith('permissions.')) return <Shield className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const baseClasses = "px-2 py-1 rounded-lg text-xs font-bold uppercase";
    switch (severity) {
      case 'critical':
        return cn(baseClasses, darkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700");
      case 'high':
        return cn(baseClasses, darkMode ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-700");
      case 'medium':
        return cn(baseClasses, darkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700");
      default:
        return cn(baseClasses, darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-slate-900")}>
            Audit Log
          </h2>
          <p className={cn("text-sm mt-1", darkMode ? "text-slate-400" : "text-slate-600")}>
            {filteredLogs.length} of {auditLogs.length} events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
            darkMode ? "text-slate-400" : "text-slate-500"
          )} />
          <input
            type="text"
            placeholder="Search by user, action, or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none",
              darkMode
                ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
            )}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
            darkMode ? "text-slate-400" : "text-slate-500"
          )} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none appearance-none",
              darkMode
                ? "bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
            )}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <AlertCircle className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
            darkMode ? "text-slate-400" : "text-slate-500"
          )} />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 outline-none appearance-none",
              darkMode
                ? "bg-white/5 border-white/10 text-white focus:border-blue-500 focus:ring-blue-500/20"
                : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20"
            )}
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className={cn(
            "text-center py-12 rounded-2xl border",
            darkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white border-slate-200 text-slate-600"
          )}>
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">No audit logs found</p>
            <p className="text-sm mt-1">
              {searchTerm || filterCategory !== 'All' || filterSeverity !== 'All'
                ? 'Try adjusting your filters'
                : 'Admin actions will appear here'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const severity = getActionSeverity(log.action);
            const isExpanded = expandedLog === log.id;

            return (
              <div
                key={log.id}
                className={cn(
                  "rounded-2xl border transition-all",
                  darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}
              >
                {/* Main Log Entry */}
                <div className="p-4 flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "p-3 rounded-xl flex-shrink-0",
                    darkMode ? "bg-white/5" : "bg-slate-50"
                  )}>
                    {getCategoryIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityIcon(severity)}
                          <h3 className={cn("font-bold", darkMode ? "text-white" : "text-slate-900")}>
                            {getActionDescription(log.action)}
                          </h3>
                        </div>
                        <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                          by <span className="font-semibold">{log.actorName}</span> ({log.actorEmail})
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={getSeverityBadge(severity)}>
                          {severity}
                        </span>
                        <button
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            darkMode ? "hover:bg-white/10" : "hover:bg-slate-100"
                          )}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className={cn("font-semibold", darkMode ? "text-slate-300" : "text-slate-700")}>
                        {formatDate(log.timestamp)}
                      </span>
                      {log.targetName && (
                        <span className={cn(darkMode ? "text-slate-400" : "text-slate-600")}>
                          Target: <span className="font-semibold">{log.targetName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (log.details || log.metadata) && (
                  <div className={cn(
                    "px-4 pb-4 pt-0 space-y-3 border-t",
                    darkMode ? "border-white/10" : "border-slate-200"
                  )}>
                    {log.details && (
                      <div className={cn(
                        "p-4 rounded-xl",
                        darkMode ? "bg-white/5" : "bg-slate-50"
                      )}>
                        <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
                          Details:
                        </p>
                        <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                          {log.details}
                        </p>
                      </div>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className={cn(
                        "p-4 rounded-xl",
                        darkMode ? "bg-white/5" : "bg-slate-50"
                      )}>
                        <p className={cn("text-sm font-semibold mb-2", darkMode ? "text-slate-300" : "text-slate-700")}>
                          Metadata:
                        </p>
                        <div className="space-y-1">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2 text-sm">
                              <span className={cn("font-semibold min-w-[120px]", darkMode ? "text-slate-400" : "text-slate-600")}>
                                {key}:
                              </span>
                              <span className={cn(darkMode ? "text-slate-300" : "text-slate-700")}>
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={cn("font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                          Actor ID:
                        </p>
                        <p className={cn("font-mono text-xs", darkMode ? "text-slate-300" : "text-slate-700")}>
                          {log.actorId}
                        </p>
                      </div>
                      {log.targetId && (
                        <div>
                          <p className={cn("font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                            Target ID:
                          </p>
                          <p className={cn("font-mono text-xs", darkMode ? "text-slate-300" : "text-slate-700")}>
                            {log.targetId}
                          </p>
                        </div>
                      )}
                      {log.targetType && (
                        <div>
                          <p className={cn("font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                            Target Type:
                          </p>
                          <p className={cn(darkMode ? "text-slate-300" : "text-slate-700")}>
                            {log.targetType}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className={cn("font-semibold mb-1", darkMode ? "text-slate-400" : "text-slate-600")}>
                          Timestamp:
                        </p>
                        <p className={cn("font-mono text-xs", darkMode ? "text-slate-300" : "text-slate-700")}>
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
