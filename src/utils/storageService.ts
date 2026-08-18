import { AlertItem, AppSettings, HeartRateReading, SafetyEventLog } from '../types/safety';

const SETTINGS_KEY = 'smart_belt_settings_v1';
const HR_HISTORY_KEY = 'smart_belt_hr_history_v1';
const SAFETY_EVENTS_KEY = 'smart_belt_safety_events_v1';
const ALERTS_KEY = 'smart_belt_alerts_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  hrWarningThreshold: 100,
  hrCriticalThreshold: 115,
  hrLowThreshold: 58,
  postureAngleThreshold: 20,
  drowsinessDurationSec: 2,
  soundAlertsEnabled: true,
  baudRate: 115200,
  theme: 'light',
};

// --- Settings Storage ---
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

// --- Mock Data Seeding ---
const SEEDED_KEY = 'smart_belt_seeded_v1';

function generateFakeHeartRateHistory(): HeartRateReading[] {
  const list: HeartRateReading[] = [];
  const now = Date.now();
  for (let i = 40; i >= 0; i--) {
    const timeMs = now - i * 2 * 60 * 1000;
    const date = new Date(timeMs);
    const timestamp = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    let bpm = 72 + Math.floor(Math.sin(i / 3) * 6) + Math.floor(Math.random() * 4);
    if (i === 15) bpm = 104;
    if (i === 14) bpm = 112;
    if (i === 13) bpm = 106;
    list.push({ timestamp, timeMs, bpm });
  }
  return list;
}

function generateFakeSafetyEvents(): SafetyEventLog[] {
  const now = Date.now();
  const makeTimeStr = (offsetMs: number) => {
    return new Date(now - offsetMs).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return [
    {
      id: 'event_fake_1',
      timestamp: makeTimeStr(28 * 60 * 1000),
      category: 'SEATBELT',
      severity: 'WARNING',
      description: 'Wearable Belt Unfastened: Please Secure Smart Belt on Driver',
    },
    {
      id: 'event_fake_2',
      timestamp: makeTimeStr(20 * 60 * 1000),
      category: 'POSTURE',
      severity: 'WARNING',
      description: 'Poor Posture: Pitch 24.5°, Roll 12.0°',
    },
    {
      id: 'event_fake_3',
      timestamp: makeTimeStr(28 * 60 * 1000 - 3000),
      category: 'HEART_RATE',
      severity: 'CRITICAL',
      description: 'Critical Heart Rate: 112 BPM (Tachycardia)',
    },
    {
      id: 'event_fake_4',
      timestamp: makeTimeStr(50 * 60 * 1000),
      category: 'DROWSINESS',
      severity: 'CRITICAL',
      description: 'Drowsiness Detected: Driver Attention Required',
    },
  ];
}

function generateFakeAlerts(): AlertItem[] {
  const now = Date.now();
  const makeTimeStr = (offsetMs: number) => {
    return new Date(now - offsetMs).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return [
    {
      id: 'alert_fake_1',
      type: 'Wearable Belt Unfastened',
      severity: 'WARNING',
      message: 'Wearable Belt Unfastened: Please Secure Smart Belt on Driver',
      timestamp: makeTimeStr(28 * 60 * 1000),
      sensorSource: 'SEATBELT_BUCKLE',
      acknowledged: true,
    },
    {
      id: 'alert_fake_2',
      type: 'Poor Posture',
      severity: 'WARNING',
      message: 'Poor Posture: Pitch 24.5°, Roll 12.0°',
      timestamp: makeTimeStr(20 * 60 * 1000),
      sensorSource: 'MPU6050',
      acknowledged: true,
    },
    {
      id: 'alert_fake_3',
      type: 'High Heart Rate',
      severity: 'CRITICAL',
      message: 'Critical Heart Rate: 112 BPM (Tachycardia)',
      timestamp: makeTimeStr(28 * 60 * 1000 - 3000),
      sensorSource: 'MAX30102',
      acknowledged: true,
    },
    {
      id: 'alert_fake_4',
      type: 'Drowsiness Detected',
      severity: 'CRITICAL',
      message: 'Drowsiness Detected: Driver Attention Required',
      timestamp: makeTimeStr(50 * 60 * 1000),
      sensorSource: 'DROWSINESS_SENSOR',
      acknowledged: false,
    },
  ];
}

export function seedMockDataIfNeeded(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const seeded = localStorage.getItem(SEEDED_KEY);
    if (seeded) return;

    localStorage.setItem(HR_HISTORY_KEY, JSON.stringify(generateFakeHeartRateHistory()));
    localStorage.setItem(SAFETY_EVENTS_KEY, JSON.stringify(generateFakeSafetyEvents()));
    localStorage.setItem(ALERTS_KEY, JSON.stringify(generateFakeAlerts()));
    localStorage.setItem(SEEDED_KEY, 'true');
  } catch (err) {
    console.error('Failed to seed mock data', err);
  }
}

// --- Heart Rate History Storage ---
export function loadHeartRateHistory(): HeartRateReading[] {
  seedMockDataIfNeeded();
  try {
    const raw = localStorage.getItem(HR_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function appendHeartRateReading(reading: HeartRateReading, maxEntries = 120): HeartRateReading[] {
  try {
    const current = loadHeartRateHistory();
    const updated = [...current, reading].slice(-maxEntries);
    localStorage.setItem(HR_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [reading];
  }
}

export function clearHeartRateHistory(): void {
  localStorage.removeItem(HR_HISTORY_KEY);
}

// --- Safety Events Log Storage ---
export function loadSafetyEvents(): SafetyEventLog[] {
  seedMockDataIfNeeded();
  try {
    const raw = localStorage.getItem(SAFETY_EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function appendSafetyEvent(event: SafetyEventLog, maxEntries = 200): SafetyEventLog[] {
  try {
    const current = loadSafetyEvents();
    const updated = [event, ...current].slice(0, maxEntries);
    localStorage.setItem(SAFETY_EVENTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [event];
  }
}

export function clearSafetyEvents(): void {
  localStorage.removeItem(SAFETY_EVENTS_KEY);
}

// --- Alert Center Storage ---
export function loadAlerts(): AlertItem[] {
  seedMockDataIfNeeded();
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: AlertItem[]): void {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save alerts to localStorage', err);
  }
}
