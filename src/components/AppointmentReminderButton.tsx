/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Bell, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import {
  sendAppointmentReminders,
  getUpcomingAppointmentsSummary,
  type ReminderResult
} from '../services/appointmentReminder';

interface AppointmentReminderButtonProps {
  darkMode: boolean;
}

export function AppointmentReminderButton({ darkMode }: AppointmentReminderButtonProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReminderResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch pending reminders count on mount
  useEffect(() => {
    loadPendingCount();
  }, []);

  const loadPendingCount = async () => {
    const summary = await getUpcomingAppointmentsSummary(24);
    setPendingCount(summary.count);
  };

  const handleSendReminders = async () => {
    setLoading(true);
    setShowResult(false);

    try {
      const reminderResult = await sendAppointmentReminders(24);
      setResult(reminderResult);
      setShowResult(true);

      // Refresh pending count
      await loadPendingCount();

      // Auto-hide result after 5 seconds
      setTimeout(() => {
        setShowResult(false);
      }, 5000);
    } catch (error: any) {
      setResult({
        success: false,
        sent: 0,
        failed: 0,
        errors: [error.message],
      });
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleSendReminders}
        disabled={loading || pendingCount === 0}
        className={cn(
          "px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm relative",
          loading || pendingCount === 0
            ? darkMode
              ? "bg-white/5 text-slate-500 cursor-not-allowed"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            : darkMode
            ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30"
            : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
        )}
        title={pendingCount === 0 ? "No reminders to send" : `Send ${pendingCount} reminder(s)`}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Bell size={16} />
        )}
        <span className="hidden sm:inline">
          {loading ? 'Sending...' : 'Send Reminders'}
        </span>
        {pendingCount > 0 && !loading && (
          <span className={cn(
            "absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center",
            darkMode ? "bg-purple-500 text-white" : "bg-purple-600 text-white"
          )}>
            {pendingCount}
          </span>
        )}
      </button>

      {/* Result Toast */}
      {showResult && result && (
        <div
          className={cn(
            "absolute top-full mt-2 right-0 z-50 min-w-[300px] p-4 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-2 duration-300",
            darkMode ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
          )}
        >
          <div className="flex items-start gap-3">
            {result.success && result.sent > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={cn(
                "font-bold mb-1",
                darkMode ? "text-white" : "text-slate-900"
              )}>
                {result.success && result.sent > 0
                  ? "Reminders Sent Successfully"
                  : result.sent === 0 && result.failed === 0
                  ? "No Reminders to Send"
                  : "Reminder Sending Failed"
                }
              </h4>
              {result.sent > 0 && (
                <p className={cn(
                  "text-sm mb-1",
                  darkMode ? "text-slate-300" : "text-slate-700"
                )}>
                  {result.sent} reminder{result.sent !== 1 ? 's' : ''} sent successfully
                </p>
              )}
              {result.failed > 0 && (
                <p className={cn(
                  "text-sm text-red-500",
                  darkMode ? "text-red-400" : "text-red-600"
                )}>
                  {result.failed} failed
                </p>
              )}
              {result.errors.length > 0 && (
                <div className={cn(
                  "mt-2 text-xs space-y-1 max-h-32 overflow-y-auto",
                  darkMode ? "text-slate-400" : "text-slate-600"
                )}>
                  {result.errors.slice(0, 3).map((error, idx) => (
                    <div key={idx} className="truncate">• {error}</div>
                  ))}
                  {result.errors.length > 3 && (
                    <div>+ {result.errors.length - 3} more...</div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowResult(false)}
              className={cn(
                "p-1 rounded-lg transition-colors",
                darkMode ? "hover:bg-white/10" : "hover:bg-slate-100"
              )}
            >
              <XCircle size={16} className={darkMode ? "text-slate-400" : "text-slate-500"} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
