import React from 'react';
import { PhysicalSensorData, SafetyEventLog } from '../types/safety';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  History,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DrowsinessViewProps {
  sensorData: PhysicalSensorData | null;
  isConnected: boolean;
  events: SafetyEventLog[];
  theme: 'light' | 'dark';
}

export const DrowsinessView: React.FC<DrowsinessViewProps> = ({
  sensorData,
  isConnected,
  events,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isDrowsy = isConnected && sensorData ? sensorData.drowsiness : false;

  const drowsinessEvents = events.filter((e) => e.category === 'DROWSINESS');

  return (
    <div className="space-y-4">
      {/* Critical Drowsiness Alert Banner */}
      {isDrowsy && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white text-xs font-mono-code flex items-center justify-between gap-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-7 h-7 shrink-0 text-white" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">
                DROWSINESS DETECTED — DRIVER ATTENTION REQUIRED
              </h4>
              <p className="mt-0.5 text-rose-100">
                Driver microsleep or prolonged eye closure signal received from physical wearable belt sensor. Immediate sensory intervention required.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded bg-white text-rose-700 shrink-0">
            CRITICAL
          </span>
        </div>
      )}

      {/* Main Drowsiness Sensor Card */}
      <div
        className={`border rounded-2xl p-6 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                !isConnected
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : isDrowsy
                  ? 'bg-rose-500/20 text-rose-600 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
              }`}
            >
              {isDrowsy ? <EyeOff className="w-8 h-8" /> : <Eye className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display tracking-tight">
                  Drowsiness Sensor Monitoring
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded font-bold bg-[#F5E8C9] dark:bg-emerald-950/40 text-[#3F6B5B] dark:text-emerald-300 border border-[#D4C49E]">
                  On-Belt Sensor
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Physical sensor tracking driver alertness, blink duration &amp; microsleep events
              </p>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl font-mono-code font-bold text-xs ${
              !isConnected
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                : !isDrowsy
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-600 text-white animate-pulse'
            }`}
          >
            STATUS: {!isConnected ? 'OFFLINE' : !isDrowsy ? 'NOT DETECTED' : 'DROWSINESS DETECTED'}
          </div>
        </div>

        {/* Real-Time Drowsiness Status Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Current Alertness
            </span>
            <div
              className={`text-2xl font-black font-mono-code mt-2 ${
                !isConnected
                  ? 'text-slate-400'
                  : isDrowsy
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isConnected ? (isDrowsy ? 'DROWSY' : 'ALERT & ATTENTIVE') : '--'}
            </div>
            <p className="text-[11px] font-mono-code text-[#7D8E87] mt-1">
              {isConnected ? (isDrowsy ? 'Microsleep Flag: TRUE' : 'No fatigue flags') : 'Offline'}
            </p>
          </div>

          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Last Detection Time
            </span>
            <div className="text-xl font-bold font-mono-code mt-2 text-[#26312D] dark:text-slate-100">
              {drowsinessEvents.length > 0 ? drowsinessEvents[0].timestamp : 'None this drive'}
            </div>
            <p className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              {drowsinessEvents.length > 0 ? `${drowsinessEvents.length} total event(s)` : 'Zero fatigue events'}
            </p>
          </div>

          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Haptic Response
            </span>
            <div className="text-xl font-bold font-mono-code mt-2 text-[#3F6B5B] dark:text-emerald-400">
              {isDrowsy ? 'ACTIVE' : 'STANDBY'}
            </div>
            <p className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              Torso vibration motor on belt
            </p>
          </div>
        </div>

        {/* Recent Drowsiness Event Log */}
        <div className="mt-6">
          <h3 className="text-xs font-bold font-mono-code text-[#5A6B65] dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#3F6B5B]" />
            Recent Drowsiness Incident Log
          </h3>

          {drowsinessEvents.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono-code text-[#7D8E87] border border-dashed rounded-xl">
              No drowsiness events recorded. Driver alertness is nominal.
            </div>
          ) : (
            <div className="space-y-2">
              {drowsinessEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs font-mono-code flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <div>
                      <div className="font-bold text-rose-800 dark:text-rose-200">
                        {evt.description}
                      </div>
                      <div className="text-[10px] text-[#7D8E87]">{evt.timestamp}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]">
                    CRITICAL
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
