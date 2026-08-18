import React, { useEffect, useRef } from 'react';
import { Heart, Activity, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface HeartRateMonitorProps {
  heartRate: number;
  onHeartRateChange: (bpm: number) => void;
  theme?: 'light' | 'dark';
}

export const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({
  heartRate,
  onHeartRateChange,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Status calculation
  const isHigh = heartRate > 105;
  const isLow = heartRate < 60;
  const isNormal = !isHigh && !isLow;

  const hrStatusText = isHigh
    ? 'HIGH (TACHYCARDIA)'
    : isLow
    ? 'LOW (BRADYCARDIA)'
    : 'NORMAL';

  // Live ECG cardiac wave drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    // ECG wave generator function
    const getEcgSample = (phase: number) => {
      // phase: 0 to 1
      if (phase > 0.15 && phase < 0.25) {
        // P-wave
        return Math.sin(((phase - 0.15) / 0.1) * Math.PI) * 0.2;
      } else if (phase > 0.32 && phase < 0.35) {
        // Q-dip
        return -0.2;
      } else if (phase >= 0.35 && phase < 0.45) {
        // R-peak (large spike)
        return 1.0 * Math.sin(((phase - 0.35) / 0.1) * Math.PI);
      } else if (phase >= 0.45 && phase < 0.49) {
        // S-dip
        return -0.35;
      } else if (phase > 0.58 && phase < 0.78) {
        // T-wave
        return Math.sin(((phase - 0.58) / 0.2) * Math.PI) * 0.35;
      }
      return 0; // Baseline
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 235, 229, 0.6)';
      ctx.lineWidth = 1;
      const gridSize = 12;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw dynamic ECG trace
      const strokeColor = isHigh
        ? '#f43f5e'
        : isLow
        ? '#D9896A'
        : isDark
        ? '#34d399'
        : '#3F6B5B';

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = isHigh ? 8 : 4;

      const beatFrequency = heartRate / 60; // beats per second
      const speed = 60 * beatFrequency; // pixels per second

      offset = (offset + 1.2 * (heartRate / 75)) % width;

      for (let x = 0; x < width; x++) {
        // Calculate phase for this x
        const t = (x + offset) * 0.02 * (heartRate / 70);
        const cyclePhase = t % 1;
        const rawEcg = getEcgSample(cyclePhase);
        const y = midY - rawEcg * (height * 0.38);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw sweep scanning head dot
      const scanX = (width - offset) % width;
      const scanT = (scanX + offset) * 0.02 * (heartRate / 70);
      const scanY = midY - getEcgSample(scanT % 1) * (height * 0.38);

      ctx.beginPath();
      ctx.arc(scanX, scanY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isHigh ? '#fb7185' : '#10b981';
      ctx.shadowBlur = 10;
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, isDark, isHigh, isLow]);

  // Pulse animation duration calculated based on BPM
  const pulseDuration = `${Math.max(0.35, 60 / heartRate).toFixed(2)}s`;

  return (
    <div
      className={`border rounded-xl p-4 shadow-sm space-y-4 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2EBE5]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isHigh
                ? 'bg-rose-500/20 text-rose-600'
                : isLow
                ? 'bg-amber-500/20 text-amber-600'
                : isDark
                ? 'bg-[#3F6B5B]/30 text-emerald-300'
                : 'bg-[#E1F0F2] text-[#3F6B5B]'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider font-display ${
                isDark ? 'text-slate-200' : 'text-[#26312D]'
              }`}
            >
              Heart Rate Monitor (MAX30102 / ADC)
            </h3>
            <span
              className={`text-[10px] font-mono-code ${
                isDark ? 'text-slate-400' : 'text-[#5A6B65]'
              }`}
            >
              Biometric Pulse Sensor &bull; GPIO 1 (ADC1_CH0)
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[11px] font-mono-code px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1.5 border ${
            isHigh
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse'
              : isLow
              ? 'bg-[#FFF8F3] text-[#D9896A] border-[#D9896A]/40'
              : isDark
              ? 'bg-[#3F6B5B]/20 text-emerald-300 border-[#3F6B5B]/40'
              : 'bg-[#E1F0F2] text-[#3F6B5B] border-[#B8DDD6]'
          }`}
        >
          {isHigh ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          ) : isLow ? (
            <TrendingDown className="w-3.5 h-3.5 text-[#D9896A]" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3F6B5B]" />
          )}
          {hrStatusText}
        </span>
      </div>

      {/* Main Metric & Live ECG Graph Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        {/* Left Column: Visual Heartbeat Metric Box */}
        <div
          className={`md:col-span-5 rounded-xl p-3.5 border flex flex-col items-center justify-center text-center relative overflow-hidden transition-all ${
            isHigh
              ? isDark
                ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                : 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
              : isLow
              ? isDark
                ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                : 'bg-[#FFF8F3] border-[#D9896A]/30 text-[#26312D]'
              : isDark
              ? 'bg-slate-950/60 border-slate-800 text-slate-200'
              : 'bg-[#FFFDF8] border-[#CCE4DF] text-[#26312D]'
          }`}
        >
          {/* Pulsing Heart Animation */}
          <div className="flex items-center gap-2 mb-1">
            <Heart
              className={`w-6 h-6 transition-transform ${
                isHigh
                  ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : isLow
                  ? 'text-[#D9896A] fill-[#D9896A]'
                  : 'text-rose-500 fill-rose-500'
              }`}
              style={{
                animation: `pulse ${pulseDuration} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              }}
            />
            <span className="text-[11px] font-bold uppercase tracking-widest font-mono-code">
              PULSE RATE
            </span>
          </div>

          {/* Large BPM Number */}
          <div className="text-4xl font-extrabold font-mono-code tracking-tight my-0.5">
            {heartRate}{' '}
            <span className="text-sm font-semibold uppercase text-[#5A6B65]">BPM</span>
          </div>

          <div className="w-24 h-[1px] bg-slate-300 dark:bg-slate-700 my-1.5" />

          {/* Status Label */}
          <div className="text-xs font-semibold">
            Status:{' '}
            <span
              className={
                isHigh
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : isLow
                  ? 'text-[#D9896A] font-bold'
                  : 'text-[#3F6B5B] font-bold'
              }
            >
              {hrStatusText}
            </span>
          </div>

          {/* Threshold alert note */}
          {isHigh && (
            <div className="mt-1 text-[10px] font-mono-code text-rose-600 dark:text-rose-300 font-semibold animate-pulse">
              Warning: BPM &gt; 105 Threshold
            </div>
          )}
          {isLow && (
            <div className="mt-1 text-[10px] font-mono-code text-[#D9896A] font-semibold">
              Alert: BPM &lt; 60 Low Baseline
            </div>
          )}
        </div>

        {/* Right Column: Live Real-Time ECG Wave Canvas */}
        <div className="md:col-span-7 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono-code">
            <span className={isDark ? 'text-slate-400' : 'text-[#5A6B65]'}>
              Real-Time ECG Rhythm Graph
            </span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                isHigh ? 'text-rose-600' : 'text-[#3F6B5B]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F6B5B] animate-ping" />
              {((60 / heartRate) * 1000).toFixed(0)} ms / beat
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-lg p-1.5 border border-slate-800 shadow-inner">
            <canvas
              ref={canvasRef}
              width={340}
              height={84}
              className="w-full h-20 block rounded"
            />
          </div>
        </div>
      </div>

      {/* Interactive BPM Slider & Presets */}
      <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between font-mono-code text-xs">
          <span className={isDark ? 'text-slate-300' : 'text-[#26312D]'}>
            Adjust Heart Rate (BPM Slider):
          </span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-xs ${
              isHigh
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                : isLow
                ? 'bg-amber-500/20 text-[#D9896A]'
                : isDark
                ? 'text-emerald-300'
                : 'text-[#3F6B5B]'
            }`}
          >
            {heartRate} BPM
          </span>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="55"
          max="130"
          step="1"
          value={heartRate}
          onChange={(e) => onHeartRateChange(parseInt(e.target.value, 10))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            isHigh
              ? 'accent-rose-600 bg-rose-200 dark:bg-rose-950'
              : 'accent-[#3F6B5B] bg-[#E2EBE5] dark:bg-slate-800'
          }`}
        />

        {/* Slider Scale Indicators */}
        <div
          className={`flex justify-between text-[10px] font-mono-code ${
            isDark ? 'text-slate-400' : 'text-[#7D8E87]'
          }`}
        >
          <span>55 BPM (Min)</span>
          <span className="text-[#3F6B5B] font-semibold">60–100 (Safe Range)</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">&gt;105 (Warning Trigger)</span>
          <span>130 BPM (Max)</span>
        </div>

        {/* Quick Set Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span
            className={`text-[10px] font-mono-code ${
              isDark ? 'text-slate-400' : 'text-[#5A6B65]'
            }`}
          >
            Quick Select:
          </span>
          <button
            onClick={() => onHeartRateChange(56)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono-code border transition-colors ${
              heartRate === 56
                ? 'bg-[#D9896A] text-white border-[#D9896A]'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-[#26312D] border-[#CCE4DF] hover:bg-[#E7F4EF]'
            }`}
          >
            56 BPM (Bradycardia)
          </button>
          <button
            onClick={() => onHeartRateChange(78)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono-code border transition-colors ${
              heartRate === 78
                ? 'bg-[#3F6B5B] text-white border-[#3F6B5B]'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-[#26312D] border-[#CCE4DF] hover:bg-[#E7F4EF]'
            }`}
          >
            78 BPM (Nominal)
          </button>
          <button
            onClick={() => onHeartRateChange(112)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono-code border transition-colors ${
              heartRate === 112
                ? 'bg-rose-600 text-white border-rose-600'
                : isDark
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-white text-[#26312D] border-[#CCE4DF] hover:bg-[#E7F4EF]'
            }`}
          >
            112 BPM (Tachycardia / Warning)
          </button>
        </div>
      </div>
    </div>
  );
};
