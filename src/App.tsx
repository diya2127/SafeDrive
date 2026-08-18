import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveNavTab,
  AlertItem,
  AppSettings,
  HeartRateReading,
  PhysicalSensorData,
  SafetyEventLog,
  SerialConnectionStatus,
} from './types/safety';
import {
  appendHeartRateReading,
  appendSafetyEvent,
  clearHeartRateHistory,
  clearSafetyEvents,
  loadAlerts,
  loadHeartRateHistory,
  loadSafetyEvents,
  loadSettings,
  saveAlerts,
  saveSettings,
} from './utils/storageService';
import { evaluateSafetyState } from './utils/safetyEvaluator';
import { serialService } from './utils/serialService';
import { audioAlert } from './utils/audioAlert';
import { Navigation } from './components/Navigation';
import { ConnectionPanel } from './components/ConnectionPanel';
import { DashboardView } from './components/DashboardView';
import { HeartRateView } from './components/HeartRateView';
import { PostureView } from './components/PostureView';
import { DrowsinessView } from './components/DrowsinessView';
import { SeatbeltView } from './components/SeatbeltView';
import { AlertCenterView } from './components/AlertCenterView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { Cable, Shield } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const isDark = settings.theme === 'dark';

  // Manage html dark mode class globally
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Live Hardware Sensor Stream State
  const [sensorData, setSensorData] = useState<PhysicalSensorData | null>(() => ({
    heartRate: 75,
    pitch: 2.1,
    roll: 0.8,
    drowsiness: false,
    seatbelt: true,
    sos: false,
    timestamp: new Date().toISOString(),
    batteryLevel: 88,
  }));
  const [lastRawPacket, setLastRawPacket] = useState<string | null>(null);

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<SerialConnectionStatus>({
    isConnected: true,
    portName: 'Simulated ESP32 Wearable Belt',
    connectionType: 'USB Serial (Web Serial API)',
    baudRate: settings.baudRate || 115200,
    lastReceivedTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    packetsReceived: 1,
    error: null,
  });

  // Simulated Data Stream for Offline/Demo use
  const [isSimulated, setIsSimulated] = useState(true);

  useEffect(() => {
    if (!isSimulated || connectionStatus.error) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setSensorData((prev) => {
        const baseHR = prev ? prev.heartRate : 74;
        const newHR = Math.max(60, Math.min(100, baseHR + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)));
        
        const basePitch = prev ? prev.pitch : 2.0;
        const newPitch = Math.max(-10, Math.min(10, basePitch + (Math.random() - 0.5) * 1.5));
        
        const baseRoll = prev ? prev.roll : 1.0;
        const newRoll = Math.max(-10, Math.min(10, baseRoll + (Math.random() - 0.5) * 1.5));

        const battery = prev?.batteryLevel ?? 88;
        const newBattery = Math.max(1, battery - (Math.random() > 0.95 ? 1 : 0));

        // Create the new packet
        const simulatedPacket: PhysicalSensorData = {
          heartRate: newHR,
          pitch: newPitch,
          roll: newRoll,
          drowsiness: false,
          seatbelt: true,
          sos: false,
          timestamp: now.toISOString(),
          batteryLevel: newBattery,
        };

        // Record Heart Rate history
        if (newHR > 0) {
          const hrReading: HeartRateReading = {
            timestamp: timeStr,
            timeMs: now.getTime(),
            bpm: newHR,
          };
          setHrHistory((prevHistory) => appendHeartRateReading(hrReading, 100));
        }

        return simulatedPacket;
      });

      setConnectionStatus((prev) => ({
        ...prev,
        isConnected: true,
        lastReceivedTimestamp: timeStr,
        packetsReceived: prev.packetsReceived + 1,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulated, connectionStatus.error]);

  // History & Alerts State
  const [hrHistory, setHrHistory] = useState<HeartRateReading[]>(() => loadHeartRateHistory());
  const [safetyEvents, setSafetyEvents] = useState<SafetyEventLog[]>(() => loadSafetyEvents());
  const [alerts, setAlerts] = useState<AlertItem[]>(() => loadAlerts());

  // Prevent duplicate alert spam refs
  const lastAlertTimestampRef = useRef<Record<string, number>>({});
  const prevSafetyStatusRef = useRef<string>('SAFE');

  // Compute Active Safety State
  const safetyState = evaluateSafetyState(sensorData, settings, connectionStatus.isConnected);

  // Audio alerts trigger on state transition
  useEffect(() => {
    if (!settings.soundAlertsEnabled || !connectionStatus.isConnected) return;

    if (safetyState.status === 'CRITICAL' && prevSafetyStatusRef.current !== 'CRITICAL') {
      audioAlert.playCriticalAlert();
    } else if (safetyState.status === 'WARNING' && prevSafetyStatusRef.current === 'SAFE') {
      audioAlert.playWarningAlert();
    }
    prevSafetyStatusRef.current = safetyState.status;
  }, [safetyState.status, settings.soundAlertsEnabled, connectionStatus.isConnected]);

  // Helper to record alerts with 5-second deduplication
  const triggerAlert = useCallback(
    (
      type: string,
      severity: 'CRITICAL' | 'WARNING' | 'SAFE',
      message: string,
      sensorSource: AlertItem['sensorSource']
    ) => {
      const now = Date.now();
      const lastTriggered = lastAlertTimestampRef.current[type] || 0;
      if (now - lastTriggered < 6000) {
        return; // debounce 6 seconds
      }
      lastAlertTimestampRef.current[type] = now;

      const dateObj = new Date();
      const timeStr = dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newAlert: AlertItem = {
        id: `alert_${now}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        severity,
        message,
        timestamp: timeStr,
        sensorSource,
        acknowledged: false,
      };

      setAlerts((prev) => {
        const updated = [newAlert, ...prev].slice(0, 50);
        saveAlerts(updated);
        return updated;
      });

      // Also record to Safety Event Log
      let category: SafetyEventLog['category'] = 'HEART_RATE';
      if (sensorSource === 'DROWSINESS_SENSOR') category = 'DROWSINESS';
      else if (sensorSource === 'MPU6050') category = 'POSTURE';
      else if (sensorSource === 'SEATBELT_BUCKLE') category = 'SEATBELT';
      else if (sensorSource === 'SOS_BUTTON') category = 'SOS';

      const newEvent: SafetyEventLog = {
        id: `event_${now}`,
        timestamp: timeStr,
        category,
        severity,
        description: message,
      };

      setSafetyEvents((prev) => appendSafetyEvent(newEvent, 150));
    },
    []
  );

  // Incoming Sensor Data Dispatcher
  const handleIncomingSensorData = useCallback(
    (data: PhysicalSensorData, rawText: string) => {
      setSensorData(data);
      setLastRawPacket(rawText);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Update connection metadata
      setConnectionStatus((prev) => ({
        ...prev,
        isConnected: true,
        lastReceivedTimestamp: timeStr,
        packetsReceived: prev.packetsReceived + 1,
      }));

      // Record Heart Rate history
      if (data.heartRate > 0) {
        const hrReading: HeartRateReading = {
          timestamp: timeStr,
          timeMs: now.getTime(),
          bpm: data.heartRate,
        };
        setHrHistory((prev) => appendHeartRateReading(hrReading, 100));

        // Evaluate Heart Rate Alerts
        if (data.heartRate >= settings.hrCriticalThreshold) {
          triggerAlert(
            'High Heart Rate',
            'CRITICAL',
            `Critical Heart Rate: ${data.heartRate} BPM (Tachycardia)`,
            'MAX30102'
          );
        } else if (data.heartRate >= settings.hrWarningThreshold) {
          triggerAlert(
            'Elevated Heart Rate',
            'WARNING',
            `Elevated Heart Rate: ${data.heartRate} BPM`,
            'MAX30102'
          );
        } else if (data.heartRate < settings.hrLowThreshold) {
          triggerAlert(
            'Low Heart Rate',
            'WARNING',
            `Low Heart Rate / Fatigue: ${data.heartRate} BPM`,
            'MAX30102'
          );
        }
      }

      // Evaluate Posture Alerts
      const isPoorPosture =
        Math.abs(data.pitch) > settings.postureAngleThreshold ||
        Math.abs(data.roll) > settings.postureAngleThreshold;
      if (isPoorPosture) {
        triggerAlert(
          'Poor Posture',
          'WARNING',
          `Poor Posture: Pitch ${data.pitch.toFixed(1)}°, Roll ${data.roll.toFixed(1)}°`,
          'MPU6050'
        );
      }

      // Evaluate Drowsiness Alerts
      if (data.drowsiness) {
        triggerAlert(
          'Drowsiness Detected',
          'CRITICAL',
          'Drowsiness Detected: Driver Attention Required',
          'DROWSINESS_SENSOR'
        );
      }

      // Evaluate Wearable Belt Alerts
      if (!data.seatbelt) {
        triggerAlert(
          'Wearable Belt Unfastened',
          'WARNING',
          'Wearable Belt Unfastened: Please Secure Smart Belt on Driver',
          'SEATBELT_BUCKLE'
        );
      }

      // Evaluate SOS Emergency Alerts
      if (data.sos) {
        triggerAlert('SOS Activated', 'CRITICAL', 'SOS Emergency Button Activated!', 'SOS_BUTTON');
      }
    },
    [settings, triggerAlert]
  );

  // Setup Serial Service Callbacks
  useEffect(() => {
    serialService.setCallbacks(
      (data, rawText) => {
        setIsSimulated(false);
        handleIncomingSensorData(data, rawText);
      },
      (connected, message, error) => {
        setIsSimulated(false);
        setConnectionStatus((prev) => ({
          ...prev,
          isConnected: connected,
          portName: connected ? 'USB Serial Port' : 'None',
          error: error || null,
        }));
      }
    );
  }, [handleIncomingSensorData]);

  // Connect Belt Action (Web Serial API)
  const handleConnectBelt = async () => {
    audioAlert.playClick();
    setIsSimulated(false);
    await serialService.connect(settings.baudRate);
  };

  // Disconnect Belt Action
  const handleDisconnectBelt = async () => {
    audioAlert.playClick();
    setIsSimulated(false);
    await serialService.disconnect();
    setSensorData(null);
    setConnectionStatus((prev) => ({
      ...prev,
      isConnected: false,
      portName: 'None',
      lastReceivedTimestamp: null,
      packetsReceived: 0,
    }));
  };

  // Diagnostic Test Frame Sender (allows sending sample payload)
  const handleSendTestFrame = (sample: PhysicalSensorData) => {
    audioAlert.playClick();
    setIsSimulated(false);
    const raw = JSON.stringify(sample);
    serialService.parseAndDispatchLine(raw);
  };

  // Acknowledge All Alerts / Reset SOS
  const handleAcknowledgeAll = () => {
    audioAlert.playClick();
    setAlerts((prev) => {
      const updated = prev.map((a) => ({ ...a, acknowledged: true }));
      saveAlerts(updated);
      return updated;
    });

    if (sensorData?.sos) {
      setSensorData((prev) => (prev ? { ...prev, sos: false } : null));
    }
  };

  // Acknowledge Individual Alert
  const handleAcknowledgeSingleAlert = (id: string) => {
    audioAlert.playClick();
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
      saveAlerts(updated);
      return updated;
    });
  };

  // Clear Alert History
  const handleClearAlerts = () => {
    audioAlert.playClick();
    setAlerts([]);
    saveAlerts([]);
  };

  // Clear History
  const handleClearHistory = () => {
    audioAlert.playClick();
    clearHeartRateHistory();
    clearSafetyEvents();
    setHrHistory([]);
    setSafetyEvents([]);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    audioAlert.playClick();
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleSaveSettings({ ...settings, theme: nextTheme });
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-[#3F6B5B]/30 selection:text-[#26312D] ${
        isDark
          ? 'dark bg-slate-950 text-slate-300'
          : 'bg-gradient-to-br from-[#FFFDF8] via-[#E7F4EF] to-[#E1F0F2] text-[#26312D]'
      }`}
      style={
        !isDark
          ? {
              background: 'linear-gradient(135deg, #FFFDF8 0%, #E7F4EF 50%, #E1F0F2 100%)',
              minHeight: '100vh',
            }
          : undefined
      }
    >
      {/* 1. Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        overallStatus={safetyState.status}
        isConnected={connectionStatus.isConnected}
        alertCount={alerts.filter((a) => !a.acknowledged).length}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* Hardware Connection Bar */}
        <ConnectionPanel
          status={connectionStatus}
          onConnect={handleConnectBelt}
          onDisconnect={handleDisconnectBelt}
          onSendTestFrame={handleSendTestFrame}
          lastRawPacket={lastRawPacket}
          theme={settings.theme}
        />

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            sensorData={sensorData}
            safetyState={safetyState}
            connectionStatus={connectionStatus}
            alerts={alerts}
            onNavigateTab={setActiveTab}
            onAcknowledgeAlerts={handleAcknowledgeAll}
            theme={settings.theme}
          />
        )}

        {activeTab === 'heart_rate' && (
          <HeartRateView
            sensorData={sensorData}
            isConnected={connectionStatus.isConnected}
            history={hrHistory}
            settings={settings}
            theme={settings.theme}
          />
        )}

        {activeTab === 'posture' && (
          <PostureView
            sensorData={sensorData}
            isConnected={connectionStatus.isConnected}
            settings={settings}
            theme={settings.theme}
          />
        )}

        {activeTab === 'drowsiness' && (
          <DrowsinessView
            sensorData={sensorData}
            isConnected={connectionStatus.isConnected}
            events={safetyEvents}
            theme={settings.theme}
          />
        )}

        {activeTab === 'seatbelt' && (
          <SeatbeltView
            sensorData={sensorData}
            isConnected={connectionStatus.isConnected}
            events={safetyEvents}
            theme={settings.theme}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertCenterView
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeSingleAlert}
            onClearAllAlerts={handleClearAlerts}
            theme={settings.theme}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            hrHistory={hrHistory}
            safetyEvents={safetyEvents}
            onClearHistory={handleClearHistory}
            theme={settings.theme}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            theme={settings.theme}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer
        className={`border-t py-3 text-xs transition-colors ${
          isDark
            ? 'bg-slate-950 border-slate-900 text-slate-400'
            : 'bg-[#E1F0F2]/90 border-[#CCE4DF] text-[#5A6B65]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono-code text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'
              }`}
            />
            {connectionStatus.isConnected ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                LIVE HARDWARE DATA — ESP32-S3 Connected
              </span>
            ) : (
              <span className="font-bold text-amber-900 dark:text-amber-300 bg-amber-500/25 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/50 shadow-xs">
                OFFLINE — NO LIVE DATA
              </span>
            )}
            <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>&bull;</span>
            <span className="hidden md:inline">MAX30102 + MPU6050 + Drowsiness + Magnetic Clasp + SOS</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#5A6B65]">
            <Shield className="w-4 h-4 text-[#3F6B5B]" />
            <span><strong className="font-rounded-brand text-xs font-bold text-[#3F6B5B]">SafeDrive</strong> &bull; Real-Time Web Monitoring System</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
