import React, { useState } from 'react';
import { AppSettings } from '../types/safety';
import { DEFAULT_SETTINGS } from '../utils/storageService';
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  Compass,
  Cpu,
  EyeOff,
  Heart,
  RotateCcw,
  Save,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  theme: 'light' | 'dark';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSaveSettings(draft);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div
        className={`border rounded-2xl p-6 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5] shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#3F6B5B]/10 border border-[#3F6B5B]/30 flex items-center justify-center text-[#3F6B5B]">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display tracking-tight">
                <span className="font-rounded-brand font-extrabold">SafeDrive</span> Configuration
              </h2>
              <p className="text-xs font-mono-code text-[#7D8E87] dark:text-slate-400 mt-0.5">
                Customize hardware alert thresholds, sensor calibration &amp; serial parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-mono-code font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Defaults
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#3F6B5B] hover:bg-[#34584B] active:bg-[#2B4A3E] text-white text-xs font-mono-code font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {savedSuccess ? 'Saved to Browser!' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Configuration Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 1. Heart Rate Thresholds */}
          <div className="space-y-4 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 transition-colors">
            <div className="flex items-center gap-2 border-b pb-2 border-rose-200 dark:border-rose-900/30">
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold font-mono-code text-rose-700 dark:text-rose-400">
                1. MAX30102 Heart Rate Thresholds
              </h3>
            </div>

            {/* Warning High BPM */}
            <div>
              <div className="flex justify-between text-xs font-mono-code text-slate-700 dark:text-slate-300">
                <span>High BPM Warning:</span>
                <strong className="text-amber-600 dark:text-amber-400 font-bold">
                  {draft.hrWarningThreshold} BPM
                </strong>
              </div>
              <input
                type="range"
                min="85"
                max="130"
                value={draft.hrWarningThreshold}
                onChange={(e) => handleChange('hrWarningThreshold', Number(e.target.value))}
                className="w-full mt-1.5 accent-amber-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Generates a yellow WARNING status when heart rate reaches this level.
              </p>
            </div>

            {/* Critical High BPM */}
            <div>
              <div className="flex justify-between text-xs font-mono-code text-slate-700 dark:text-slate-300">
                <span>Critical High BPM:</span>
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {draft.hrCriticalThreshold} BPM
                </strong>
              </div>
              <input
                type="range"
                min="105"
                max="150"
                value={draft.hrCriticalThreshold}
                onChange={(e) => handleChange('hrCriticalThreshold', Number(e.target.value))}
                className="w-full mt-1.5 accent-rose-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Generates a red CRITICAL emergency status for tachycardia.
              </p>
            </div>

            {/* Low BPM / Fatigue */}
            <div>
              <div className="flex justify-between text-xs font-mono-code text-slate-700 dark:text-slate-300">
                <span>Low BPM Fatigue Threshold:</span>
                <strong className="text-amber-600 dark:text-amber-400 font-bold">
                  {draft.hrLowThreshold} BPM
                </strong>
              </div>
              <input
                type="range"
                min="45"
                max="65"
                value={draft.hrLowThreshold}
                onChange={(e) => handleChange('hrLowThreshold', Number(e.target.value))}
                className="w-full mt-1.5 accent-amber-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Detects bradycardia or resting fatigue below this BPM.
              </p>
            </div>
          </div>

          {/* 2. Posture & Drowsiness Sensitivity */}
          <div className="space-y-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 transition-colors">
            <div className="flex items-center gap-2 border-b pb-2 border-emerald-200 dark:border-emerald-900/30">
              <Compass className="w-4 h-4 text-[#3F6B5B] dark:text-emerald-400" />
              <h3 className="text-sm font-bold font-mono-code text-[#3F6B5B] dark:text-emerald-400">
                2. Posture &amp; Drowsiness Triggers
              </h3>
            </div>

            {/* Posture Angle Limit */}
            <div>
              <div className="flex justify-between text-xs font-mono-code text-slate-700 dark:text-slate-300">
                <span>Posture Tilt Angle Threshold:</span>
                <strong className="text-[#3F6B5B] dark:text-emerald-400 font-bold">
                  &plusmn;{draft.postureAngleThreshold}°
                </strong>
              </div>
              <input
                type="range"
                min="10"
                max="35"
                value={draft.postureAngleThreshold}
                onChange={(e) => handleChange('postureAngleThreshold', Number(e.target.value))}
                className="w-full mt-1.5 accent-[#3F6B5B]"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Maximum allowed torso pitch or lateral roll before triggering poor posture warning.
              </p>
            </div>

            {/* Drowsiness Detection Window */}
            <div>
              <div className="flex justify-between text-xs font-mono-code text-slate-700 dark:text-slate-300">
                <span>Drowsiness Window:</span>
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {draft.drowsinessDurationSec} seconds
                </strong>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={draft.drowsinessDurationSec}
                onChange={(e) => handleChange('drowsinessDurationSec', Number(e.target.value))}
                className="w-full mt-1.5 accent-rose-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Continuous closure duration required to escalate to critical alert.
              </p>
            </div>

            {/* Alert Audio Sound Toggles */}
            <div className="pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-500/10 dark:bg-amber-500/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  {draft.soundAlertsEnabled ? (
                    <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <div className="text-xs font-bold font-mono-code text-amber-900 dark:text-amber-100 font-bold">Acoustic Alert Tones</div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-300">
                      Play tone on critical warnings and SOS
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('soundAlertsEnabled', !draft.soundAlertsEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    draft.soundAlertsEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      draft.soundAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
