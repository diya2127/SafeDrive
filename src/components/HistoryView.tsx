import React, { useState, useMemo } from 'react';
import { HeartRateReading, SafetyEventLog } from '../types/safety';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  Download,
  FileSpreadsheet,
  History,
  Info,
  Layers,
  Search,
  Shield,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface HistoryViewProps {
  hrHistory: HeartRateReading[];
  safetyEvents: SafetyEventLog[];
  onClearHistory: () => void;
  theme: 'light' | 'dark';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  hrHistory,
  safetyEvents,
  onClearHistory,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Stats calculation
  const hrStats = useMemo(() => {
    const valid = hrHistory.filter((h) => h.bpm > 0);
    if (valid.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
    const values = valid.map((h) => h.bpm);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { min, max, avg, count: valid.length };
  }, [hrHistory]);

  // Event category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      DROWSINESS: 0,
      POSTURE: 0,
      SEATBELT: 0,
      SOS: 0,
      HEART_RATE: 0,
    };
    for (const ev of safetyEvents) {
      if (counts[ev.category] !== undefined) {
        counts[ev.category]++;
      }
    }
    return counts;
  }, [safetyEvents]);

  // Filtered safety events
  const filteredEvents = useMemo(() => {
    return safetyEvents.filter((ev) => {
      const matchCat = categoryFilter === 'ALL' || ev.category === categoryFilter;
      const matchSearch =
        ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [safetyEvents, categoryFilter, searchTerm]);

  // Chart data for events by category
  const chartData = [
    { name: 'Drowsiness', count: categoryCounts.DROWSINESS, fill: '#ef4444' },
    { name: 'Posture', count: categoryCounts.POSTURE, fill: '#f59e0b' },
    { name: 'Wearable Belt', count: categoryCounts.SEATBELT, fill: '#3b82f6' },
    { name: 'Heart Rate', count: categoryCounts.HEART_RATE, fill: '#e11d48' },
    { name: 'SOS', count: categoryCounts.SOS, fill: '#dc2626' },
  ];

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Timestamp', 'Category', 'Severity', 'Description'],
      ...safetyEvents.map((e) => [e.timestamp, e.category, e.severity, `"${e.description}"`]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `safedrive_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const data = {
      exportTime: new Date().toISOString(),
      heartRateStats: hrStats,
      heartRateHistory: hrHistory,
      safetyEvents: safetyEvents,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `safedrive_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div
        className={`border rounded-2xl p-6 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3F6B5B]/10 border border-[#3F6B5B]/30 flex items-center justify-center text-[#3F6B5B]">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display tracking-tight">
                  Sensor Data &amp; Safety Incident History
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded font-bold bg-[#F5E8C9] dark:bg-emerald-950/40 text-[#3F6B5B] dark:text-emerald-300 border border-[#D4C49E]">
                  Local Browser Storage
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Archived heart-rate trends, posture triggers, unbuckle events &amp; SOS alarms
              </p>
            </div>
          </div>

          {/* Export & Clear Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-mono-code font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#3F6B5B]" /> Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-mono-code font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" /> Export JSON
            </button>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-mono-code font-semibold flex items-center gap-1.5 hover:bg-rose-100 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All History
            </button>
          </div>
        </div>

        {/* Heart Rate Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <div
            className={`border rounded-xl p-3 text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold text-[#7D8E87] uppercase">
              Average BPM
            </span>
            <div className="text-2xl font-bold font-mono-code mt-1 text-[#3F6B5B] dark:text-emerald-400">
              {hrStats.avg > 0 ? `${hrStats.avg} BPM` : '--'}
            </div>
          </div>

          <div
            className={`border rounded-xl p-3 text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold text-[#7D8E87] uppercase flex items-center justify-center gap-1">
              <ArrowDown className="w-3 h-3 text-blue-500" /> Min BPM
            </span>
            <div className="text-2xl font-bold font-mono-code mt-1 text-blue-600 dark:text-blue-400">
              {hrStats.min > 0 ? `${hrStats.min} BPM` : '--'}
            </div>
          </div>

          <div
            className={`border rounded-xl p-3 text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold text-[#7D8E87] uppercase flex items-center justify-center gap-1">
              <ArrowUp className="w-3 h-3 text-rose-500" /> Max BPM
            </span>
            <div className="text-2xl font-bold font-mono-code mt-1 text-rose-600 dark:text-rose-400">
              {hrStats.max > 0 ? `${hrStats.max} BPM` : '--'}
            </div>
          </div>

          <div
            className={`border rounded-xl p-3 text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold text-[#7D8E87] uppercase">
              Total Logged Incidents
            </span>
            <div className="text-2xl font-bold font-mono-code mt-1 text-[#26312D] dark:text-slate-100">
              {safetyEvents.length}
            </div>
          </div>
        </div>

        {/* Safety Incident Category Breakdown Chart */}
        <div className="mt-6">
          <h3 className="text-xs font-bold font-mono-code text-[#5A6B65] dark:text-slate-400 mb-2">
            Safety Warning Frequency by Sensor Source
          </h3>
          <div
            className={`h-48 rounded-xl border p-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search & Filter Controls for Event Table */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono-code focus:outline-hidden focus:border-[#3F6B5B]"
            />
          </div>

          <div className="flex flex-wrap gap-1 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'DROWSINESS', label: 'DROWSINESS' },
              { id: 'POSTURE', label: 'POSTURE' },
              { id: 'SEATBELT', label: 'WEARABLE BELT' },
              { id: 'HEART_RATE', label: 'HEART RATE' },
              { id: 'SOS', label: 'SOS' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono-code font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[#3F6B5B] text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-[#FFF7DD] text-[#5A6B65]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Event History Table */}
        <div className="mt-3 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs font-mono-code">
            <thead>
              <tr className={`text-left border-b ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-800'
                  : 'bg-[#FFF7DD] text-[#5A6B65] border-slate-200'
              }`}>
                <th className="p-3">Time</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    No safety incidents logged matching your search.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#FFF7DD]/60 dark:hover:bg-slate-800/50">
                    <td className="p-3 whitespace-nowrap text-[#7D8E87]">{ev.timestamp}</td>
                    <td className="p-3 font-semibold">{ev.category}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="p-3">{ev.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
