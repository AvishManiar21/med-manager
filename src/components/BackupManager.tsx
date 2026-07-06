/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import {
  Download,
  Upload,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  FileText,
  Loader2,
  History,
  Trash2,
  Info
} from 'lucide-react';
import {
  createFullBackup,
  downloadBackup,
  downloadCSVBackup,
  getBackupHistory,
  getBackupReminder,
  saveBackupMetadata,
  clearBackupHistory,
  validateBackup,
  getBackupStats,
  type BackupData,
  type BackupMetadata
} from '../services/backupService';

interface BackupManagerProps {
  user: any;
  darkMode: boolean;
}

export function BackupManager({ user, darkMode }: BackupManagerProps) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BackupMetadata[]>([]);
  const [reminder, setReminder] = useState<{ shouldBackup: boolean; daysSinceLastBackup: number } | null>(null);
  const [backupStats, setBackupStats] = useState<any>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreValidation, setRestoreValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);

  useEffect(() => {
    loadHistory();
    checkReminder();
  }, []);

  const loadHistory = () => {
    const backupHistory = getBackupHistory();
    setHistory(backupHistory);
  };

  const checkReminder = () => {
    const reminderData = getBackupReminder();
    setReminder(reminderData);
  };

  const handleCreateBackup = async (format: 'json' | 'csv') => {
    setLoading(true);
    setBackupStats(null);

    try {
      if (format === 'json') {
        const backup = await createFullBackup(user.displayName || user.email, 'DentalFlow Pro');
        const stats = getBackupStats(backup);
        setBackupStats(stats);

        // Save metadata
        saveBackupMetadata(backup);

        // Download backup
        downloadBackup(backup);

        // Refresh history
        loadHistory();
        checkReminder();
      } else {
        await downloadCSVBackup(user.displayName || user.email);
        loadHistory();
        checkReminder();
      }
    } catch (error: any) {
      alert(`Backup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRestoreFile(file);
      validateRestoreFile(file);
    }
  };

  const validateRestoreFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const validation = validateBackup(data);
      setRestoreValidation(validation);
    } catch (error) {
      setRestoreValidation({
        valid: false,
        errors: ['Invalid JSON file or corrupted backup'],
      });
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear backup history? This will not delete the backup files.')) {
      clearBackupHistory();
      loadHistory();
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-2xl md:text-3xl font-extrabold tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
            Backup & Restore
          </h2>
          <p className={cn("mt-1 font-medium text-sm md:text-base", darkMode ? "text-slate-400" : "text-slate-500")}>
            Protect your clinic data with automated backups
          </p>
        </div>
      </div>

      {/* Backup Reminder Banner */}
      {reminder && reminder.shouldBackup && (
        <div className={cn(
          "p-4 rounded-xl border flex items-start gap-3",
          darkMode ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-200"
        )}>
          <AlertTriangle className={cn("flex-shrink-0 mt-0.5", darkMode ? "text-orange-400" : "text-orange-600")} size={20} />
          <div className="flex-1">
            <h3 className={cn("font-bold mb-1", darkMode ? "text-orange-300" : "text-orange-900")}>
              Backup Recommended
            </h3>
            <p className={cn("text-sm", darkMode ? "text-orange-200" : "text-orange-800")}>
              It's been {reminder.daysSinceLastBackup} days since your last backup. We recommend backing up your data weekly.
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Backup Card */}
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-3 rounded-xl",
              darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
            )}>
              <Download size={24} />
            </div>
            <div>
              <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
                Create Backup
              </h3>
              <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                Export all clinic data
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleCreateBackup('json')}
              disabled={loading}
              className={cn(
                "w-full px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                loading
                  ? darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <FileJson size={18} />
                  Backup as JSON
                </>
              )}
            </button>

            <button
              onClick={() => handleCreateBackup('csv')}
              disabled={loading}
              className={cn(
                "w-full px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                loading
                  ? darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                  : darkMode
                  ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              )}
            >
              <FileText size={18} />
              Backup as CSV
            </button>
          </div>

          {backupStats && (
            <div className={cn(
              "mt-4 p-3 rounded-lg border",
              darkMode ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className={cn("font-bold text-sm", darkMode ? "text-green-300" : "text-green-900")}>
                  Backup Created Successfully
                </span>
              </div>
              <div className={cn("text-xs space-y-1", darkMode ? "text-green-200" : "text-green-800")}>
                <p>Time: {backupStats.timestamp}</p>
                <p>Size: {backupStats.totalSize}</p>
                <p>Collections: {backupStats.collections.map((c: any) => `${c.name} (${c.count})`).join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Restore Backup Card */}
        <div className={cn(
          "p-6 rounded-2xl border",
          darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-3 rounded-xl",
              darkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
            )}>
              <Upload size={24} />
            </div>
            <div>
              <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
                Restore Backup
              </h3>
              <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                Import data from backup
              </p>
            </div>
          </div>

          <div className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center",
            darkMode ? "border-white/10" : "border-slate-300"
          )}>
            <Database className={cn("w-12 h-12 mx-auto mb-3", darkMode ? "text-slate-500" : "text-slate-400")} />
            <p className={cn("text-sm mb-3", darkMode ? "text-slate-400" : "text-slate-600")}>
              Upload a backup file to restore
            </p>
            <label className={cn(
              "px-4 py-2 rounded-lg font-bold cursor-pointer inline-flex items-center gap-2",
              darkMode ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/30" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            )}>
              <Upload size={16} />
              Choose File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {restoreFile && (
              <div className="mt-4">
                <p className={cn("text-sm font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                  {restoreFile.name}
                </p>
                {restoreValidation && (
                  <div className={cn(
                    "mt-2 p-2 rounded text-xs",
                    restoreValidation.valid
                      ? darkMode ? "bg-green-500/10 text-green-300" : "bg-green-50 text-green-700"
                      : darkMode ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700"
                  )}>
                    {restoreValidation.valid ? (
                      <p>✓ Valid backup file</p>
                    ) : (
                      <div>
                        <p>✗ Invalid backup file:</p>
                        {restoreValidation.errors.map((err, idx) => (
                          <p key={idx}>• {err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={cn(
            "mt-4 p-3 rounded-lg border flex items-start gap-2",
            darkMode ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"
          )}>
            <Info size={16} className={cn("flex-shrink-0 mt-0.5", darkMode ? "text-yellow-400" : "text-yellow-600")} />
            <p className={cn("text-xs", darkMode ? "text-yellow-200" : "text-yellow-800")}>
              Restoring a backup will overwrite existing data. Make sure to create a current backup first.
            </p>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className={cn(
        "p-6 rounded-2xl border",
        darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className={darkMode ? "text-slate-400" : "text-slate-600"} />
            <h3 className={cn("font-bold text-lg", darkMode ? "text-white" : "text-slate-900")}>
              Backup History
            </h3>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className={cn(
                "text-sm font-semibold flex items-center gap-1",
                darkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"
              )}
            >
              <Trash2 size={14} />
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className={cn("w-12 h-12 mx-auto mb-3 opacity-50", darkMode ? "text-slate-600" : "text-slate-400")} />
            <p className={cn("text-sm", darkMode ? "text-slate-500" : "text-slate-600")}>
              No backups created yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((backup, idx) => (
              <div
                key={backup.id}
                className={cn(
                  "p-4 rounded-lg border flex items-center justify-between",
                  darkMode ? "bg-white/3 border-white/5" : "bg-slate-50 border-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    idx === 0
                      ? darkMode ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
                      : darkMode ? "bg-slate-700" : "bg-slate-200"
                  )}>
                    <Database size={16} />
                  </div>
                  <div>
                    <p className={cn("font-semibold text-sm", darkMode ? "text-white" : "text-slate-900")}>
                      {new Date(backup.timestamp).toLocaleString()}
                    </p>
                    <p className={cn("text-xs", darkMode ? "text-slate-400" : "text-slate-600")}>
                      {backup.recordCount} records • {(backup.size / 1024).toFixed(2)} KB • by {backup.createdBy}
                    </p>
                  </div>
                </div>
                {idx === 0 && (
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded",
                    darkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                  )}>
                    Latest
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
