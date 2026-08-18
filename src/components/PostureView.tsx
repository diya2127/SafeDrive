import React from 'react';
import { AppSettings, PhysicalSensorData } from '../types/safety';
import {
  AlertTriangle,
  Compass,
  Info,
  Layers,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';

interface PostureViewProps {
  sensorData: PhysicalSensorData | null;
  isConnected: boolean;
  settings: AppSettings;
  theme: 'light' | 'dark';
}

export const PostureView: React.FC<PostureViewProps> = ({
  sensorData,
  isConnected,
  settings,
  theme,
}) => {
  const isDark = theme === 'dark';
  const pitch = isConnected && sensorData ? sensorData.pitch : 0;
  const roll = isConnected && sensorData ? sensorData.roll : 0;

  const isPoorPosture =
    Math.abs(pitch) > settings.postureAngleThreshold ||
    Math.abs(roll) > settings.postureAngleThreshold;

  const slouchDirection =
    pitch > settings.postureAngleThreshold
      ? 'Forward Slouch (Head/Torso dropped)'
      : pitch < -settings.postureAngleThreshold
      ? 'Excessive Recline (Leaning back)'
      : Math.abs(roll) > settings.postureAngleThreshold
      ? roll > 0
        ? 'Right Lateral Lean'
        : 'Left Lateral Lean'
      : 'Spinal Alignment Nominal';

  return (
    <div className="space-y-4">
      {/* Warning Notification if Posture exceeds threshold */}
      {isConnected && isPoorPosture && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs font-mono-code flex items-center justify-between gap-3 shadow-xs animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">POOR POSTURE DETECTED: </span>
              <span>
                Angle ({Math.max(Math.abs(pitch), Math.abs(roll)).toFixed(1)}°) has exceeded the safe posture limit of {settings.postureAngleThreshold}°. {slouchDirection}.
              </span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/30">
            WARNING
          </span>
        </div>
      )}

      {/* Main Posture Card */}
      <div
        className={`border rounded-2xl p-6 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#3F6B5B]/10 border border-[#3F6B5B]/30 flex items-center justify-center text-[#3F6B5B]">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display tracking-tight">
                  MPU6050 Driver Posture Monitoring
                </h2>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded font-bold bg-[#F5E8C9] dark:bg-emerald-950/40 text-[#3F6B5B] dark:text-emerald-300 border border-[#D4C49E]">
                  6-Axis IMU
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Tracks lumbar flexion, spinal pitch angle &amp; lateral lean from belt strap
              </p>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl font-mono-code font-bold text-xs ${
              !isConnected
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                : !isPoorPosture
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse'
            }`}
          >
            STATUS: {!isConnected ? 'OFFLINE' : !isPoorPosture ? 'NORMAL' : 'POOR POSTURE'}
          </div>
        </div>

        {/* Pitch, Roll & Alignment Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Pitch Stat */}
          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Pitch (Forward / Backward)
            </span>
            <div className="text-4xl font-bold font-mono-code mt-2 text-[#3F6B5B] dark:text-emerald-400">
              {isConnected ? `${pitch.toFixed(1)}°` : '--°'}
            </div>
            <div className="mt-2 text-xs font-mono-code text-[#5A6B65] dark:text-slate-400">
              Threshold: &plusmn;{settings.postureAngleThreshold}°
            </div>
            {/* Progress indicator */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  Math.abs(pitch) > settings.postureAngleThreshold ? 'bg-amber-500' : 'bg-[#3F6B5B]'
                }`}
                style={{ width: `${Math.min(100, (Math.abs(pitch) / 35) * 100)}%` }}
              />
            </div>
          </div>

          {/* Roll Stat */}
          <div
            className={`border rounded-xl p-4 text-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Roll (Left / Right Tilt)
            </span>
            <div className="text-4xl font-bold font-mono-code mt-2 text-[#3F6B5B] dark:text-emerald-400">
              {isConnected ? `${roll.toFixed(1)}°` : '--°'}
            </div>
            <div className="mt-2 text-xs font-mono-code text-[#5A6B65] dark:text-slate-400">
              Threshold: &plusmn;{settings.postureAngleThreshold}°
            </div>
            {/* Progress indicator */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  Math.abs(roll) > settings.postureAngleThreshold ? 'bg-amber-500' : 'bg-[#3F6B5B]'
                }`}
                style={{ width: `${Math.min(100, (Math.abs(roll) / 35) * 100)}%` }}
              />
            </div>
          </div>

          {/* Slouching Assessment */}
          <div
            className={`border rounded-xl p-4 text-center flex flex-col justify-center items-center transition-colors ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#FFFDF7] border-[#EADBBE]'
            }`}
          >
            <span className="text-xs font-mono-code font-bold text-[#7D8E87] uppercase">
              Slouch Assessment
            </span>
            <div
              className={`text-base font-bold font-mono-code mt-2 ${
                !isConnected
                  ? 'text-slate-400'
                  : !isPoorPosture
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isConnected ? (!isPoorPosture ? 'UPRIGHT & ATTENTIVE' : 'SLOUCH DETECTED') : '--'}
            </div>
            <p className="text-[11px] font-mono-code text-[#7D8E87] mt-1">
              {isConnected ? slouchDirection : 'Waiting for MPU6050 stream'}
            </p>
          </div>
        </div>

        {/* Visual Tilt Indicator Gauge */}
        <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FFF7DD]/70 dark:bg-slate-950">
          <h3 className="text-xs font-bold font-mono-code text-[#5A6B65] dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#3F6B5B]" />
            Driver Torso Inclination Visualizer
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* Pitch Visualizer Graphic */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center relative mx-auto bg-white dark:bg-slate-900 shadow-inner">
                {/* Horizontal reference */}
                <div className="absolute w-full h-0.5 bg-slate-200 dark:bg-slate-800" />
                {/* Torso bar tilted by pitch */}
                <div
                  className={`w-16 h-2 rounded-full transition-transform duration-200 ${
                    Math.abs(pitch) > settings.postureAngleThreshold ? 'bg-amber-500' : 'bg-[#3F6B5B]'
                  }`}
                  style={{ transform: `rotate(${-pitch}deg)` }}
                />
              </div>
              <span className="text-xs font-mono-code font-bold mt-2 block">
                Pitch: {pitch.toFixed(1)}°
              </span>
              <span className="text-[10px] text-[#7D8E87]">Sagittal View (Side)</span>
            </div>

            {/* Roll Visualizer Graphic */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center relative mx-auto bg-white dark:bg-slate-900 shadow-inner">
                {/* Horizontal reference */}
                <div className="absolute w-full h-0.5 bg-slate-200 dark:bg-slate-800" />
                {/* Torso bar tilted by roll */}
                <div
                  className={`w-16 h-2 rounded-full transition-transform duration-200 ${
                    Math.abs(roll) > settings.postureAngleThreshold ? 'bg-amber-500' : 'bg-[#3F6B5B]'
                  }`}
                  style={{ transform: `rotate(${roll}deg)` }}
                />
              </div>
              <span className="text-xs font-mono-code font-bold mt-2 block">
                Roll: {roll.toFixed(1)}°
              </span>
              <span className="text-[10px] text-[#7D8E87]">Coronal View (Front)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
