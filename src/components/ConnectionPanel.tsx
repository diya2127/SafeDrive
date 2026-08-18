import React, { useState } from 'react';
import { PhysicalSensorData, SerialConnectionStatus } from '../types/safety';
import {
  AlertCircle,
  Cable,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Play,
  Power,
  RefreshCw,
  Terminal,
  Unplug,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface ConnectionPanelProps {
  status: SerialConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendTestFrame: (data: PhysicalSensorData) => void;
  lastRawPacket: string | null;
  theme: 'light' | 'dark';
}

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  status,
  onConnect,
  onDisconnect,
  onSendTestFrame,
  lastRawPacket,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [showDetails, setShowDetails] = useState(false);
  const [customJsonInput, setCustomJsonInput] = useState('');

  const handleInjectSample = (scenario: 'nominal' | 'high_hr' | 'drowsy' | 'posture' | 'unbuckled' | 'sos') => {
    let sample: PhysicalSensorData;
    const now = new Date().toISOString();
    switch (scenario) {
      case 'high_hr':
        sample = {
          heartRate: 112,
          pitch: 5.2,
          roll: 2.1,
          drowsiness: false,
          seatbelt: true,
          sos: false,
          timestamp: now,
        };
        break;
      case 'drowsy':
        sample = {
          heartRate: 64,
          pitch: 18.5,
          roll: 8.0,
          drowsiness: true,
          seatbelt: true,
          sos: false,
          timestamp: now,
        };
        break;
      case 'posture':
        sample = {
          heartRate: 76,
          pitch: 24.5,
          roll: 12.0,
          drowsiness: false,
          seatbelt: true,
          sos: false,
          timestamp: now,
        };
        break;
      case 'unbuckled':
        sample = {
          heartRate: 80,
          pitch: 4.0,
          roll: 1.5,
          drowsiness: false,
          seatbelt: false,
          sos: false,
          timestamp: now,
        };
        break;
      case 'sos':
        sample = {
          heartRate: 98,
          pitch: 14.0,
          roll: 5.0,
          drowsiness: false,
          seatbelt: true,
          sos: true,
          timestamp: now,
        };
        break;
      case 'nominal':
      default:
        sample = {
          heartRate: 78,
          pitch: 6.2,
          roll: 2.4,
          drowsiness: false,
          seatbelt: true,
          sos: false,
          timestamp: now,
        };
        break;
    }
    onSendTestFrame(sample);
  };

  const handleSendCustomJson = () => {
    if (!customJsonInput.trim()) return;
    try {
      const parsed = JSON.parse(customJsonInput);
      onSendTestFrame({
        heartRate: Number(parsed.heartRate ?? 75),
        pitch: Number(parsed.pitch ?? 0),
        roll: Number(parsed.roll ?? 0),
        drowsiness: Boolean(parsed.drowsiness ?? false),
        seatbelt: Boolean(parsed.seatbelt ?? true),
        sos: Boolean(parsed.sos ?? false),
        timestamp: parsed.timestamp || new Date().toISOString(),
      });
      setCustomJsonInput('');
    } catch {
      alert('Invalid JSON format. Please provide valid JSON object with sensor fields.');
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Connection Indicator & Metadata */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              status.isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            {status.isConnected ? <Cable className="w-5 h-5" /> : <Unplug className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold font-mono-code flex items-center gap-1.5 ${
                  status.isConnected
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                  }`}
                />
                {status.isConnected ? 'ESP32 CONNECTED' : 'ESP32 DISCONNECTED'}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-[11px] font-mono-code text-[#5A6B65] dark:text-slate-400">
                {status.connectionType}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] font-mono-code text-[#7D8E87]">
              <span>Baud: {status.baudRate} bps</span>
              <span>&bull;</span>
              <span>Packets: {status.packetsReceived.toLocaleString()}</span>
              <span>&bull;</span>
              <span>
                Last Update:{' '}
                <strong className={isDark ? 'text-slate-200' : 'text-[#26312D]'}>
                  {status.lastReceivedTimestamp || 'None (Offline)'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {status.isConnected ? (
            <button
              onClick={onDisconnect}
              className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold font-mono-code flex items-center gap-1.5 hover:bg-rose-100 transition-colors shadow-xs"
            >
              <Power className="w-3.5 h-3.5" /> Disconnect Belt
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="px-3.5 py-1.5 rounded-lg bg-[#3F6B5B] hover:bg-[#34584B] active:bg-[#2B4A3E] text-white text-xs font-semibold font-mono-code flex items-center gap-1.5 transition-all shadow-xs border border-[#2B4A3E] dark:border-[#528472]"
            >
              <Cable className="w-3.5 h-3.5" /> Connect Belt (USB Serial)
            </button>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono-code transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-[#FFFDF7] border-[#EADBBE] text-[#5A6B65] hover:bg-[#FFF7DD]'
            }`}
            title="Toggle Hardware Diagnostics & Serial Packet Tools"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diagnostic Frame</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Disconnected Warning Banner if Offline */}
      {!status.isConnected && (
        <div className="mt-3 p-3 rounded-xl bg-amber-400/95 dark:bg-amber-950/60 border-2 border-amber-500 dark:border-amber-400 text-slate-950 dark:text-amber-100 text-xs font-mono-code flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-600/30 dark:bg-amber-400/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5 text-amber-950 dark:text-amber-300 shrink-0" />
            </div>
            <span className="font-medium text-slate-950 dark:text-amber-100 leading-tight">
              <strong className="font-extrabold text-amber-950 dark:text-amber-200">WEARABLE BELT OFFLINE:</strong> Connect your physical ESP32-S3 wearable belt via USB-C or plug in the serial port to stream live driver metrics.
            </span>
          </div>
          <span className="text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-lg bg-slate-950 text-amber-300 dark:bg-amber-400 dark:text-slate-950 border border-amber-500/50 shrink-0 self-start sm:self-auto shadow-xs">
            OFFLINE — NO LIVE DATA
          </span>
        </div>
      )}

      {/* Collapsible Diagnostic & Serial Details */}
      {showDetails && (
        <div
          className={`mt-3 pt-3 border-t text-xs font-mono-code space-y-2 ${
            isDark ? 'border-slate-800' : 'border-[#E2EBE5]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-bold text-[#5A6B65] dark:text-slate-400">
              Hardware Serial Packet Format (JSON stream over UART 115200):
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleInjectSample('nominal')}
                className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/25"
              >
                + Nominal Packet
              </button>
              <button
                onClick={() => handleInjectSample('high_hr')}
                className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-500/25"
              >
                + High BPM Frame
              </button>
              <button
                onClick={() => handleInjectSample('drowsy')}
                className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-bold hover:bg-rose-500/25"
              >
                + Drowsy Frame
              </button>
              <button
                onClick={() => handleInjectSample('posture')}
                className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-500/25"
              >
                + Posture Frame
              </button>
              <button
                onClick={() => handleInjectSample('unbuckled')}
                className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold hover:bg-amber-500/25"
              >
                + Belt Unclasped
              </button>
              <button
                onClick={() => handleInjectSample('sos')}
                className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
              >
                + SOS Button
              </button>
            </div>
          </div>

          {/* Raw Packet Output Box */}
          <div
            className={`p-2.5 rounded-lg border font-mono text-[11px] overflow-x-auto ${
              isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-300'
            }`}
          >
            <div className="text-[10px] text-slate-500 mb-1">
              // Latest Raw Received Line from ESP32 UART:
            </div>
            <code>
              {lastRawPacket ||
                '{"heartRate": 78, "pitch": 6.2, "roll": 2.4, "drowsiness": false, "seatbelt": true, "sos": false, "timestamp": "2026-08-18T10:42:18"}'}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
