import React, { useMemo } from 'react';
import { AppSettings, HeartRateReading, PhysicalSensorData } from '../types/safety';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Flame,
  Heart,
  HeartPulse,
  Info,
  LineChart,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLine,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface HeartRateViewProps {
  sensorData: PhysicalSensorData | null;
  isConnected: boolean;
  history: HeartRateReading[];
  settings: AppSettings;
  theme: 'light' | 'dark';
}

export const HeartRateView: React.FC<HeartRateViewProps> = ({
  sensorData,
  isConnected,
  history,
  settings,
  theme,
}) => {
  const isDark = theme === 'dark';
  const currentBpm = isConnected && sensorData ? sensorData.heartRate : 0;

  // Calculate Min, Max, Avg from history
  const stats = useMemo(() => {
    const validReadings = history.filter((r) => r.bpm > 0);
    if (validReadings.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    const bpmValues = validReadings.map((r) => r.bpm);
    const min = Math.min(...bpmValues);
    const max = Math.max(...bpmValues);
    const sum = bpmValues.reduce((acc, v) => acc + v, 0);
    const avg = Math.round(sum / bpmValues.length);
    return { min, max, avg, count: validReadings.length };
  }, [history]);

  // Determine status color & label
  let statusColor = 'text-slate-400';
  let statusBg = 'bg-slate-100 dark:bg-slate-800';
  let statusText = 'OFFLINE';

  if (isConnected && currentBpm > 0) {
    if (currentBpm >= settings.hrCriticalThreshold || currentBpm < 48) {
      statusColor = 'text-rose-600 dark:text-rose-400';
      statusBg = 'bg-rose-500/20 border-rose-500/40 border';
      statusText = currentBpm < 48 ? 'CRITICAL LOW (BRADYCARDIA)' : 'CRITICAL HIGH (TACHYCARDIA)';
    } else if (currentBpm >= settings.hrWarningThreshold || currentBpm < settings.hrLowThreshold) {
      statusColor = 'text-amber-600 dark:text-amber-400';
      statusBg = 'bg-amber-500/20 border-amber-500/40 border';
      statusText = currentBpm < settings.hrLowThreshold ? 'LOW BPM / FATIGUE' : 'ELEVATED BPM';
    } else {
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      statusBg = 'bg-emerald-500/20 border-emerald-500/40 border';
      statusText = 'NORMAL';
    }
  }

  // Format history for chart
  const chartData = useMemo(() => {
    return history.map((item, idx) => ({
      index: idx,
      time: item.timestamp.split(':').slice(1).join(':') || `t-${idx}`,
      bpm: item.bpm,
    }));
  }, [history]);

  return (
    <div className="space-y-4">
      {/* Abnormal Alert Banner */}
      {isConnected && currentBpm >= settings.hrWarningThreshold && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-mono-code flex items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">HIGH HEART RATE DETECTED ({currentBpm} BPM): </span>
              <span>Driver biometric stress or cardiac elevation above nominal threshold ({settings.hrWarningThreshold} BPM).</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/30">
            WARNING
          </span>
        </div>
      )}

      {isConnected && currentBpm > 0 && currentBpm < settings.hrLowThreshold && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-mono-code flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">LOW HEART RATE DETECTED ({currentBpm} BPM): </span>
              <span>Possible fatigue onset, microsleep, or lowered arousal state.</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/30">
            FATIGUE
          </span>
        </div>
      )}

      {/* Main Heart Rate Hero Card */}
      <div
        className={`border rounded-2xl p-6 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <HeartPulse
                className={`w-8 h-8 ${
                  isConnected && currentBpm > 0 ? 'animate-pulse' : ''
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display tracking-tight">
                  MAX30102 Heart Rate Monitor
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded font-bold bg-[#F5E8C9] dark:bg-emerald-950/40 text-[#3F6B5B] dark:text-emerald-300 border border-[#D4C49E]">
                  Main Safety Metric
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Optical photoplethysmography sensor streaming from chest belt strap
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`px-3.5 py-1.5 rounded-xl font-mono-code font-bold text-xs ${statusBg} ${statusColor}`}>
              STATUS: {statusText}
            </div>
          </div>
        </div>

        {/* Big BPM Display & Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Main Large BPM Display */}
          <div
            className={`md:col-span-1 border rounded-xl p-4 text-center flex flex-col justify-center items-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Current Pulse
            </span>
            <div className="flex items-baseline justify-center gap-1.5 my-2">
              <span className="text-5xl font-black font-mono-code tracking-tight text-rose-600 dark:text-rose-400">
                {isConnected && currentBpm > 0 ? currentBpm : '--'}
              </span>
              <span className="text-sm font-mono-code text-[#7D8E87] font-semibold">BPM</span>
            </div>
            <span className="text-[11px] font-mono-code text-[#5A6B65] dark:text-slate-400">
              {isConnected ? 'Live Sensor Feed' : 'Offline'}
            </span>
          </div>

          {/* Stat: Minimum */}
          <div
            className={`border rounded-xl p-4 text-center flex flex-col justify-center items-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              <ArrowDown className="w-3.5 h-3.5 text-blue-500" />
              Minimum BPM
            </div>
            <div className="text-3xl font-bold font-mono-code mt-2 text-blue-600 dark:text-blue-400">
              {stats.min > 0 ? stats.min : '--'}
            </div>
            <span className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              Lowest recorded session BPM
            </span>
          </div>

          {/* Stat: Maximum */}
          <div
            className={`border rounded-xl p-4 text-center flex flex-col justify-center items-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              <ArrowUp className="w-3.5 h-3.5 text-rose-500" />
              Maximum BPM
            </div>
            <div className="text-3xl font-bold font-mono-code mt-2 text-rose-600 dark:text-rose-400">
              {stats.max > 0 ? stats.max : '--'}
            </div>
            <span className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              Peak recorded stress BPM
            </span>
          </div>

          {/* Stat: Average */}
          <div
            className={`border rounded-xl p-4 text-center flex flex-col justify-center items-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              <Activity className="w-3.5 h-3.5 text-[#3F6B5B]" />
              Average BPM
            </div>
            <div className="text-3xl font-bold font-mono-code mt-2 text-[#3F6B5B] dark:text-emerald-400">
              {stats.avg > 0 ? stats.avg : '--'}
            </div>
            <span className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              Session mean baseline
            </span>
          </div>
        </div>

        {/* Real-time Heart Rate Graph */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono-code text-[#5A6B65] dark:text-slate-400 flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-[#3F6B5B]" />
              Real-Time Heart Rate Waveform &amp; Trend (BPM vs. Time)
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono-code text-[#7D8E87]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-rose-500 inline-block" /> Warning ({settings.hrWarningThreshold} BPM)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-amber-500 inline-block" /> Low ({settings.hrLowThreshold} BPM)
              </span>
            </div>
          </div>

          <div
            className={`h-64 rounded-xl border p-2 transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono-code text-slate-400">
                Waiting for heart rate data from ESP32 MAX30102...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLine data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="time" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} />
                  <YAxis domain={[40, 140]} stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine
                    y={settings.hrWarningThreshold}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{ value: 'Warn', fill: '#ef4444', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={settings.hrLowThreshold}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: 'Low', fill: '#f59e0b', fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bpm"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </RechartsLine>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Heart-Rate History Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold font-mono-code text-[#5A6B65] dark:text-slate-400 mb-2">
            Recent Heart Rate Log (Last 10 Readings)
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-xs font-mono-code">
              <thead>
                <tr className={`text-left border-b ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 border-slate-800'
                    : 'bg-[#FFF7DD] text-[#5A6B65] border-slate-200'
                }`}>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Heart Rate (BPM)</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Sensor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {history.slice(-10).reverse().map((r, i) => {
                  let badge = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
                  let label = 'Normal';
                  if (r.bpm >= settings.hrCriticalThreshold || r.bpm < 48) {
                    badge = 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold';
                    label = 'Critical';
                  } else if (r.bpm >= settings.hrWarningThreshold || r.bpm < settings.hrLowThreshold) {
                    badge = 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
                    label = 'Warning';
                  }

                  return (
                    <tr key={i} className="hover:bg-[#FFF7DD]/60 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 text-[#7D8E87]">{i + 1}</td>
                      <td className="p-2.5">{r.timestamp}</td>
                      <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">{r.bpm} BPM</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${badge}`}>{label}</span>
                      </td>
                      <td className="p-2.5 text-[#7D8E87]">MAX30102</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
