export type OverallSafetyStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export type ActiveNavTab =
  | 'dashboard'
  | 'heart_rate'
  | 'posture'
  | 'drowsiness'
  | 'alerts'
  | 'history'
  | 'settings';

export interface PhysicalSensorData {
  heartRate: number; // BPM (MAX30102)
  pitch: number; // degrees (MPU6050)
  roll: number; // degrees (MPU6050)
  drowsiness: boolean; // Drowsiness sensor
  seatbelt: boolean; // Buckle / Hall sensor: true = Fastened, false = Unbuckled
  sos: boolean; // Physical SOS emergency button
  timestamp: string; // ISO or formatted time
  batteryLevel?: number; // % (optional)
  rawString?: string;
}

export interface ComputedSafetyState {
  status: OverallSafetyStatus;
  primaryReason: string;
  heartRateStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'NO_DATA';
  postureStatus: 'NORMAL' | 'POOR_POSTURE' | 'NO_DATA';
  drowsinessStatus: 'NOT_DETECTED' | 'DROWSINESS_DETECTED' | 'NO_DATA';
  seatbeltStatus: 'FASTENED' | 'UNBUCKLED' | 'NO_DATA';
  sosStatus: 'INACTIVE' | 'ACTIVATED';
  highestPrioritySeverity: OverallSafetyStatus;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: OverallSafetyStatus;
  message: string;
  timestamp: string;
  sensorSource: 'MAX30102' | 'MPU6050' | 'DROWSINESS_SENSOR' | 'SEATBELT_BUCKLE' | 'SOS_BUTTON' | 'SYSTEM';
  acknowledged: boolean;
}

export interface HeartRateReading {
  timestamp: string;
  timeMs: number;
  bpm: number;
}

export interface SafetyEventLog {
  id: string;
  timestamp: string;
  category: 'DROWSINESS' | 'POSTURE' | 'SEATBELT' | 'SOS' | 'HEART_RATE';
  severity: OverallSafetyStatus;
  description: string;
  details?: string;
}

export interface AppSettings {
  hrWarningThreshold: number; // e.g. 100 BPM
  hrCriticalThreshold: number; // e.g. 115 BPM
  hrLowThreshold: number; // e.g. 58 BPM
  postureAngleThreshold: number; // e.g. 20 degrees
  drowsinessDurationSec: number; // e.g. 2 seconds
  soundAlertsEnabled: boolean;
  baudRate: number; // 115200 default
  theme: 'light' | 'dark';
}

export interface SerialConnectionStatus {
  isConnected: boolean;
  portName: string;
  connectionType: 'USB Serial (Web Serial API)' | 'BLE' | 'None';
  baudRate: number;
  lastReceivedTimestamp: string | null;
  packetsReceived: number;
  error: string | null;
}
