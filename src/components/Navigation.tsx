import React from 'react';
import { ActiveNavTab, OverallSafetyStatus } from '../types/safety';
import {
  Activity,
  AlertTriangle,
  Bell,
  Compass,
  EyeOff,
  History,
  LayoutDashboard,
  Lock,
  Moon,
  Radio,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Zap,
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  overallStatus: OverallSafetyStatus;
  isConnected: boolean;
  alertCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  overallStatus,
  isConnected,
  alertCount,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const navItems: { id: ActiveNavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'heart_rate', label: 'Heart Rate', icon: Activity },
    { id: 'posture', label: 'Posture', icon: Compass },
    { id: 'drowsiness', label: 'Drowsiness', icon: EyeOff },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-[#FFFDF8]/95 border-[#CCE4DF] shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & System Identity */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Custom Designed SafeDrive Logo */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#3F6B5B] to-[#25473B] flex items-center justify-center text-white shadow-sm border border-[#528472]/40 transition-transform group-hover:scale-105">
              <svg
                viewBox="0 0 32 32"
                className="w-6 h-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Shield Outline */}
                <path
                  d="M16 3L6 7.5V14.5C6 21 10.3 26.8 16 29C21.7 26.8 26 21 26 14.5V7.5L16 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                />
                {/* Dynamic Seatbelt Sash */}
                <path
                  d="M8.5 10L23.5 22"
                  stroke="#D9896A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Biometric Pulse Core */}
                <path
                  d="M11 17H13.5L15 13.5L17 19.5L18.5 17H21"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl font-extrabold tracking-tight font-rounded-brand ${
                    isDark ? 'text-slate-100' : 'text-[#26312D]'
                  }`}
                >
                  SafeDrive
                </span>
                <span
                  className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full font-bold border flex items-center gap-1.5 transition-colors ${
                    isConnected
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <p
                className={`text-[11px] font-mono-code ${
                  isDark ? 'text-slate-400' : 'text-[#5A6B65]'
                }`}
              >
                Secure your journey every mile
              </p>
            </div>
          </div>

          {/* Mobile Settings Icon */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onSelectTab('settings')}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                activeTab === 'settings'
                  ? isDark
                    ? 'bg-[#3F6B5B] text-white border-[#528472]'
                    : 'bg-[#3F6B5B] text-white border-[#2B4A3E]'
                  : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                  : 'bg-white border-[#CCE4DF] text-[#26312D] hover:bg-[#E7F4EF] hover:border-[#B8DDD6]'
              }`}
              title="Open Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-code flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                  isActive
                    ? isDark
                      ? 'bg-[#3F6B5B] text-white border-[#528472] shadow-xs'
                      : 'bg-[#3F6B5B] text-white border-[#2B4A3E] shadow-xs'
                    : isDark
                    ? 'text-slate-300 border-slate-800 bg-slate-900/50 hover:text-white hover:border-slate-700 hover:bg-slate-800'
                    : 'text-[#5A6B65] border-[#CCE4DF] bg-white/80 hover:text-[#26312D] hover:border-[#B8DDD6] hover:bg-[#E7F4EF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.id === 'alerts' && alertCount > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
                      isActive
                        ? 'bg-rose-500 text-white border-rose-400'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Overall Status Pill */}
        <div className="hidden md:flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono-code flex items-center gap-1.5 border transition-all ${
              overallStatus === 'SAFE'
                ? isDark
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-[#E1F0F2] text-[#3F6B5B] border-[#B8DDD6]'
                : overallStatus === 'WARNING'
                ? isDark
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-[#FFF8F3] text-[#D9896A] border-[#D9896A]/40'
                : isDark
                ? 'bg-rose-950/90 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                overallStatus === 'SAFE'
                  ? 'bg-[#3F6B5B]'
                  : overallStatus === 'WARNING'
                  ? 'bg-[#D9896A]'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <span>{overallStatus}</span>
          </div>

          {/* Desktop Settings Icon */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              activeTab === 'settings'
                ? isDark
                  ? 'bg-[#3F6B5B] text-white border-[#528472]'
                  : 'bg-[#3F6B5B] text-white border-[#2B4A3E]'
                : isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                : 'bg-white border-[#CCE4DF] text-[#26312D] hover:bg-[#E7F4EF] hover:border-[#B8DDD6]'
            }`}
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
