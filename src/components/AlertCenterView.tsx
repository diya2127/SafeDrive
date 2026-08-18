import React, { useState } from 'react';
import { AlertItem, OverallSafetyStatus } from '../types/safety';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  Info,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

interface AlertCenterViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  theme: 'light' | 'dark';
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onClearAllAlerts,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div
        className={`border rounded-2xl p-6 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display tracking-tight">
                  <span className="font-rounded-brand font-extrabold">SafeDrive</span> Alert Center
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white">
                  {alerts.length} Total
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Real-time safety events categorized by hardware sensor source &amp; priority
              </p>
            </div>
          </div>

          {/* Clear Actions */}
          {alerts.length > 0 && (
            <button
              onClick={onClearAllAlerts}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-mono-code font-semibold flex items-center gap-1.5 text-rose-600 dark:text-rose-400 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Alert History
            </button>
          )}
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono-code font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-[#3F6B5B] text-white'
                  : isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-[#FFF7DD] text-[#5A6B65]'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono-code font-semibold transition-all ${
                filter === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : isDark
                  ? 'bg-slate-800 text-rose-400'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('WARNING')}
              className={`px-3 py-1 rounded-lg text-xs font-mono-code font-semibold transition-all ${
                filter === 'WARNING'
                  ? 'bg-[#D9896A] text-white'
                  : isDark
                  ? 'bg-slate-800 text-amber-400'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Warning ({warningCount})
            </button>
          </div>

          <div className="text-[11px] font-mono-code text-[#7D8E87]">
            Priority: <strong>CRITICAL &gt; WARNING &gt; SAFE</strong>
          </div>
        </div>

        {/* Alerts List */}
        <div className="mt-5 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono-code text-[#7D8E87] border border-dashed rounded-xl">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
              No alerts match the selected filter criteria. System status is nominal.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-code ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100 shadow-xs'
                    : alert.severity === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100 shadow-xs'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : alert.severity === 'WARNING'
                        ? 'bg-[#D9896A] text-white'
                        : 'bg-[#3F6B5B] text-white'
                    }`}
                  >
                    {alert.severity === 'CRITICAL' ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-bold text-sm ${
                        alert.severity === 'CRITICAL'
                          ? 'text-rose-950 dark:text-rose-100'
                          : alert.severity === 'WARNING'
                          ? 'text-amber-950 dark:text-amber-100'
                          : 'text-emerald-950 dark:text-emerald-100'
                      }`}>{alert.message}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-slate-900'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[#5A6B65] dark:text-slate-300">
                        Source: {alert.sensorSource}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#7D8E87] dark:text-slate-400">
                      <span>Logged at: {alert.timestamp}</span>
                      <span>&bull;</span>
                      <span>Type: {alert.type}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-[#26312D] dark:text-slate-200 transition-colors shadow-xs"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
