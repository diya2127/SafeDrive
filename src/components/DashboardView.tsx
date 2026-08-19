import React from 'react';
import {
  ActiveNavTab,
  AlertItem,
  ComputedSafetyState,
  OverallSafetyStatus,
  PhysicalSensorData,
  SerialConnectionStatus,
} from '../types/safety';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Heart,
  Info,
  Lock,
  LockOpen,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  sensorData: PhysicalSensorData | null;
  safetyState: ComputedSafetyState;
  connectionStatus: SerialConnectionStatus;
  alerts: AlertItem[];
  onNavigateTab: (tab: ActiveNavTab) => void;
  onAcknowledgeAlerts: () => void;
  theme: 'light' | 'dark';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sensorData,
  safetyState,
  connectionStatus,
  alerts,
  onNavigateTab,
  onAcknowledgeAlerts,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isConnected = connectionStatus.isConnected;

  // Unacknowledged count
  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* 1. Overall Safety Status Banner */}
      <div
        className={`border-2 rounded-2xl p-5 transition-all ${
          !isConnected
            ? isDark
              ? 'bg-amber-950/40 border-amber-400 text-slate-100 shadow-lg shadow-amber-950/40'
              : 'bg-amber-100/90 border-amber-500 text-slate-950 shadow-md shadow-amber-200/60'
            : safetyState.status === 'SAFE'
            ? isDark
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-100'
              : 'bg-[#F5E8C9] border-[#D4C49E] text-[#26312D]'
            : safetyState.status === 'WARNING'
            ? isDark
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-100'
              : 'bg-[#FFF8F3] border-[#D9896A]/40 text-[#26312D]'
            : isDark
            ? 'bg-rose-950/50 border-rose-700 text-rose-100 shadow-lg shadow-rose-950/30 animate-pulse'
            : 'bg-rose-50 border-rose-300 text-rose-950 shadow-md shadow-rose-100 animate-pulse'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                !isConnected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                  : safetyState.status === 'SAFE'
                  ? 'bg-[#3F6B5B] text-white border-[#3F6B5B]'
                  : safetyState.status === 'WARNING'
                  ? 'bg-[#D9896A] text-white border-[#D9896A]'
                  : 'bg-rose-600 text-white border-rose-500 animate-bounce'
              }`}
            >
              {!isConnected ? (
                <Radio className="w-6 h-6 animate-pulse text-slate-950" />
              ) : safetyState.status === 'SAFE' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : safetyState.status === 'WARNING' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <AlertOctagon className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#7D8E87] dark:text-slate-400">
                  Overall Safety Status
                </span>
                <span
                  className={`text-[10px] font-mono-code px-2.5 py-0.5 rounded-full font-black uppercase ${
                    !isConnected
                      ? 'bg-amber-500 text-slate-950 border border-amber-600 dark:border-amber-400 shadow-xs'
                      : safetyState.status === 'SAFE'
                      ? 'bg-[#3F6B5B] text-white'
                      : safetyState.status === 'WARNING'
                      ? 'bg-[#D9896A] text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {isConnected ? safetyState.status : 'OFFLINE'}
                </span>
              </div>

              <h2
                className={`text-2xl font-black font-display mt-0.5 tracking-tight ${
                  !isConnected
                    ? isDark
                      ? 'text-amber-300'
                      : 'text-amber-950'
                    : safetyState.status === 'SAFE'
                    ? isDark
                      ? 'text-emerald-300'
                      : 'text-[#3F6B5B]'
                    : safetyState.status === 'WARNING'
                    ? isDark
                      ? 'text-amber-300'
                      : 'text-[#D9896A]'
                    : isDark
                    ? 'text-rose-400'
                    : 'text-rose-700'
                }`}
              >
                {isConnected ? (
                  safetyState.status
                ) : (
                  'WEARABLE BELT OFFLINE'
                )}
              </h2>

              <p className="text-xs font-mono-code mt-1 text-slate-800 dark:text-slate-300 font-medium">
                {isConnected
                  ? safetyState.primaryReason
                  : 'Connect your physical ESP32-S3 wearable belt via USB-C or plug in the serial port to stream live driver metrics.'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            {safetyState.sosStatus === 'ACTIVATED' && (
              <button
                onClick={onAcknowledgeAlerts}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold font-mono-code flex items-center gap-2 shadow-md animate-bounce"
              >
                <RotateCcw className="w-4 h-4" /> Acknowledge SOS
              </button>
            )}

            {unackCount > 0 && safetyState.sosStatus !== 'ACTIVATED' && (
              <button
                onClick={onAcknowledgeAlerts}
                className="px-3 py-1.5 rounded-lg border border-[#EADBBE] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono-code font-semibold flex items-center gap-1.5 hover:bg-[#FFF7DD] dark:hover:bg-slate-700 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3F6B5B]" /> Clear {unackCount} Alerts
              </button>
            )}

            <div className="text-[11px] font-mono-code text-[#7D8E87] text-right">
              {isConnected ? (
                <>
                  <span>Last Stream: </span>
                  <strong className={isDark ? 'text-slate-200' : 'text-[#26312D]'}>
                    {connectionStatus.lastReceivedTimestamp || 'Active'}
                  </strong>
                </>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  Waiting for USB Connection...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Core Sensor Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. ❤️ Heart Rate (MAX30102) */}
        <div
          onClick={() => onNavigateTab('heart_rate')}
          className={`border rounded-xl p-4 transition-all cursor-pointer card-3d-interactive ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
          } ${
            safetyState.heartRateStatus === 'CRITICAL'
              ? 'border-rose-500 bg-rose-500/10 shadow-lg'
              : safetyState.heartRateStatus === 'WARNING'
              ? 'border-amber-500 bg-amber-500/10 shadow-md'
              : ''
          }`}
        >
          <div className="flex items-center justify-between card-3d-content">
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Heart Rate
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 card-3d-content">
            {/* 2D Flat Pulsing Heart */}
            <div className="flex items-center justify-center h-[70px] my-2">
              <Heart
                className={`w-12 h-12 text-rose-500 transition-transform ${
                  isConnected && sensorData && sensorData.heartRate > 0 ? 'animate-pulse' : ''
                }`}
                style={
                  isConnected && sensorData && sensorData.heartRate > 0
                    ? { animationDuration: `${(60 / sensorData.heartRate).toFixed(2)}s` }
                    : undefined
                }
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-mono-code tracking-tight">
                {isConnected && sensorData ? sensorData.heartRate : '--'}
              </span>
              <span className="text-xs font-mono-code text-[#7D8E87]">BPM</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-mono-code">
              <span className="text-[#5A6B65] dark:text-slate-400">Status:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  !isConnected
                    ? 'text-slate-400'
                    : safetyState.heartRateStatus === 'SAFE' || safetyState.heartRateStatus === 'NORMAL'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : safetyState.heartRateStatus === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-black'
                }`}
              >
                {isConnected ? safetyState.heartRateStatus : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. 🧍 Posture (MPU6050) */}
        <div
          onClick={() => onNavigateTab('posture')}
          className={`border rounded-xl p-4 transition-all cursor-pointer card-3d-interactive ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
          } ${
            safetyState.postureStatus === 'POOR_POSTURE' ? 'border-amber-500 bg-amber-500/10 shadow-md' : ''
          }`}
        >
          <div className="flex items-center justify-between card-3d-content">
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#3F6B5B]" />
              Driver Posture
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 card-3d-content">
            {/* 2D Gyroscopic Level Indicator */}
            <div className="flex items-center justify-center h-[70px] my-2">
              <div className="w-14 h-14 rounded-full border border-dashed border-[#cbd5e1] dark:border-slate-700 flex items-center justify-center relative bg-slate-50 dark:bg-slate-900/50">
                {/* Center crosshair lines */}
                <div className="h-full w-px bg-slate-200 dark:bg-slate-800/80 absolute"></div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800/80 absolute"></div>
                {/* 2D level dot */}
                <div
                  className="w-3.5 h-3.5 rounded-full absolute bg-[#3F6B5B] dark:bg-emerald-500 border border-white dark:border-slate-800 shadow-md transition-all duration-150"
                  style={{
                    transform: `translate(${
                      isConnected && sensorData
                        ? Math.max(-18, Math.min(18, sensorData.roll * 0.6)).toFixed(1)
                        : 0
                    }px, ${
                      isConnected && sensorData
                        ? Math.max(-18, Math.min(18, -sensorData.pitch * 0.6)).toFixed(1)
                        : 0
                    }px)`
                  }}
                ></div>
              </div>
            </div>
            <div className="text-xs font-mono-code space-y-0.5 text-[#5A6B65] dark:text-slate-300">
              <div className="flex justify-between">
                <span>Pitch:</span>
                <strong className={isDark ? 'text-slate-100' : 'text-[#26312D]'}>
                  {isConnected && sensorData ? `${sensorData.pitch.toFixed(1)}°` : '--°'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Roll:</span>
                <strong className={isDark ? 'text-slate-100' : 'text-[#26312D]'}>
                  {isConnected && sensorData ? `${sensorData.roll.toFixed(1)}°` : '--°'}
                </strong>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-mono-code pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-[#5A6B65] dark:text-slate-400">Alignment:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  !isConnected
                    ? 'text-slate-400'
                    : safetyState.postureStatus === 'NORMAL'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}
              >
                {isConnected
                  ? safetyState.postureStatus === 'NORMAL'
                    ? 'NORMAL'
                    : 'POOR'
                  : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Drowsiness */}
        <div
          onClick={() => onNavigateTab('drowsiness')}
          className={`border rounded-xl p-4 transition-all cursor-pointer card-3d-interactive ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
          } ${
            safetyState.drowsinessStatus === 'DROWSINESS_DETECTED'
              ? 'border-rose-500 bg-rose-500/15 shadow-lg animate-pulse'
              : ''
          }`}
        >
          <div className="flex items-center justify-between card-3d-content">
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-[#D9896A]" />
              Drowsiness
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 card-3d-content">
            {/* 2D Drowsiness / Eye Indicator */}
            <div className="flex items-center justify-center h-[70px] my-2">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                  isConnected && sensorData && sensorData.drowsiness
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isConnected && sensorData && sensorData.drowsiness ? (
                  <EyeOff className="w-8 h-8" />
                ) : (
                  <Eye className="w-8 h-8" />
                )}
              </div>
            </div>
            <div className="text-lg font-bold font-mono-code">
              {isConnected && sensorData ? (
                sensorData.drowsiness ? (
                  <span className="text-rose-600 dark:text-rose-400 animate-pulse">
                    DETECTED
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    NOT DETECTED
                  </span>
                )
              ) : (
                <span className="text-slate-400">--</span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-mono-code pt-1">
              <span className="text-[#5A6B65] dark:text-slate-400">Driver State:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  !isConnected
                    ? 'text-slate-400'
                    : !sensorData?.drowsiness
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 animate-pulse'
                }`}
              >
                {isConnected
                  ? sensorData?.drowsiness
                    ? 'ATTENTION REQ.'
                    : 'ALERT'
                  : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>


        {/* 5. SOS Emergency */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className={`border rounded-xl p-4 transition-all cursor-pointer card-3d-interactive ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
          } ${
            safetyState.sosStatus === 'ACTIVATED'
              ? 'border-rose-600 bg-rose-600/20 shadow-xl'
              : ''
          }`}
        >
          <div className="flex items-center justify-between card-3d-content">
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              SOS Emergency
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-3 card-3d-content">
            {/* 2D SOS Beacon Indicator */}
            <div className="flex items-center justify-center h-[70px] my-2">
              <div className="relative">
                {isConnected && sensorData && sensorData.sos && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                )}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-2 relative transition-all ${
                    isConnected && sensorData && sensorData.sos
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                      : 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isConnected && sensorData && sensorData.sos ? (
                    <AlertOctagon className="w-7 h-7" />
                  ) : (
                    <Shield className="w-7 h-7" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-lg font-bold font-mono-code">
              {isConnected && sensorData ? (
                sensorData.sos ? (
                  <span className="text-rose-600 dark:text-rose-400 font-black animate-ping">
                    ACTIVATED
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    INACTIVE
                  </span>
                )
              ) : (
                <span className="text-slate-400">--</span>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-mono-code pt-1">
              <span className="text-[#5A6B65] dark:text-slate-400">Belt Button:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  !isConnected
                    ? 'text-slate-400'
                    : !sensorData?.sos
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-600 text-white animate-pulse'
                }`}
              >
                {isConnected ? (sensorData?.sos ? 'CRITICAL SOS' : 'STANDBY') : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Quick Alert Center Feed */}
      <div className="w-full">
        {/* Recent Alerts Feed */}
        <div
          className={`border rounded-xl p-4 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#EADBBE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#3F6B5B]" />
              <h3 className="text-sm font-bold font-display tracking-wide">
                Live Alert Feed
              </h3>
              {unackCount > 0 && (
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                  {unackCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs font-mono-code text-[#3F6B5B] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono-code text-[#7D8E87]">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500/60" />
              No active warnings or safety alerts logged.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono-code flex items-center justify-between gap-3 transition-colors ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                      : alert.severity === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-500 animate-ping'
                          : alert.severity === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div className="truncate">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{alert.message}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 font-normal">
                          {alert.sensorSource}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7D8E87] dark:text-slate-400 mt-0.5">
                        {alert.timestamp}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-500 text-white'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {alert.severity}
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
