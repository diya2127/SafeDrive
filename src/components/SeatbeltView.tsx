import React from 'react';
import { PhysicalSensorData, SafetyEventLog } from '../types/safety';
import {
  AlertTriangle,
  CheckCircle2,
  History,
  Lock,
  LockOpen,
  Shield,
  ShieldAlert,
} from 'lucide-react';

interface SeatbeltViewProps {
  sensorData: PhysicalSensorData | null;
  isConnected: boolean;
  events: SafetyEventLog[];
  theme: 'light' | 'dark';
}

export const SeatbeltView: React.FC<SeatbeltViewProps> = ({
  sensorData,
  isConnected,
  events,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isFastened = isConnected && sensorData ? sensorData.seatbelt : true;

  const seatbeltEvents = events.filter((e) => e.category === 'SEATBELT');

  return (
    <div className="space-y-4">
      {/* Unbuckled Warning Alert Banner */}
      {!isFastened && isConnected && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-mono-code flex items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">WEARABLE BELT UNFASTENED: </span>
              <span>
                Magnetic clasp opened. Wear and fasten the wearable smart belt on driver for continuous monitoring!
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/30">
            WARNING
          </span>
        </div>
      )}

      {/* Main Wearable Belt Monitor Card */}
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
                  : isFastened
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-600 border-rose-500/40 animate-pulse'
              }`}
            >
              {isFastened ? <Lock className="w-8 h-8" /> : <LockOpen className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display tracking-tight">
                  Wearable Belt Clasp &amp; Hall Sensor
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded font-bold bg-[#F5E8C9] dark:bg-emerald-950/40 text-[#3F6B5B] dark:text-emerald-300 border border-[#D4C49E]">
                  Wearable Smart Device
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Independently worn smart belt — monitors magnetic clasp engagement &amp; driver skin contact
              </p>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl font-mono-code font-bold text-xs ${
              !isConnected
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                : isFastened
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 animate-pulse'
            }`}
          >
            STATUS: {!isConnected ? 'OFFLINE' : isFastened ? 'FASTENED & WORN' : 'UNFASTENED'}
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Wearable Clasp Condition
            </span>
            <div
              className={`text-2xl font-black font-mono-code mt-2 ${
                !isConnected
                  ? 'text-slate-400'
                  : isFastened
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isConnected ? (isFastened ? 'LATCHED' : 'UNFASTENED') : '--'}
            </div>
            <p className="text-[11px] font-mono-code text-[#7D8E87] mt-1">
              {isConnected ? (isFastened ? 'Wearable belt securely worn' : 'Belt removed from driver') : 'Offline'}
            </p>
          </div>

          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Magnetic Hall Sensor
            </span>
            <div className="text-xl font-bold font-mono-code mt-2 text-[#26312D] dark:text-slate-100">
              {isConnected ? (isFastened ? 'HIGH (Clasp Closed)' : 'LOW (Clasp Open)') : '--'}
            </div>
            <p className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              Wearable magnetic proximity state
            </p>
          </div>

          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Driver Wear State
            </span>
            <div className="text-xl font-bold font-mono-code mt-2 text-[#3F6B5B] dark:text-emerald-400">
              {isFastened ? 'WORN & ACTIVE' : 'REMOVED'}
            </div>
            <p className="text-[10px] font-mono-code text-[#7D8E87] mt-1">
              Independent wearable device status
            </p>
          </div>
        </div>

        {/* Wearable Belt Events Log */}
        <div className="mt-6">
          <h3 className="text-xs font-bold font-mono-code text-[#5A6B65] dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#3F6B5B]" />
            Wearable Belt Clasp History Log
          </h3>

          {seatbeltEvents.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono-code text-[#7D8E87] border border-dashed rounded-xl">
              No belt unfastening incidents logged. Wearable belt has remained securely latched.
            </div>
          ) : (
            <div className="space-y-2">
              {seatbeltEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-mono-code flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="font-bold text-amber-800 dark:text-amber-200">
                        {evt.description}
                      </div>
                      <div className="text-[10px] text-[#7D8E87]">{evt.timestamp}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px]">
                    WARNING
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
