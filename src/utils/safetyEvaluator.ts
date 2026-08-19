import {
  AppSettings,
  ComputedSafetyState,
  OverallSafetyStatus,
  PhysicalSensorData,
} from '../types/safety';

export function evaluateSafetyState(
  sensorData: PhysicalSensorData | null,
  settings: AppSettings,
  isConnected: boolean
): ComputedSafetyState {
  if (!isConnected || !sensorData) {
    return {
      status: 'SAFE',
      primaryReason: 'OFFLINE — Waiting for ESP32 connection',
      heartRateStatus: 'NO_DATA',
      postureStatus: 'NO_DATA',
      drowsinessStatus: 'NO_DATA',
      seatbeltStatus: 'NO_DATA',
      sosStatus: 'INACTIVE',
      highestPrioritySeverity: 'SAFE',
    };
  }

  const { heartRate, pitch, roll, drowsiness, seatbelt, sos } = sensorData;

  // 1. Evaluate Heart Rate
  let hrStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (heartRate > 0) {
    if (heartRate >= settings.hrCriticalThreshold || heartRate < 48) {
      hrStatus = 'CRITICAL';
    } else if (heartRate >= settings.hrWarningThreshold || heartRate < settings.hrLowThreshold) {
      hrStatus = 'WARNING';
    }
  }

  // 2. Evaluate Posture
  const isPoorPosture =
    Math.abs(pitch) > settings.postureAngleThreshold ||
    Math.abs(roll) > settings.postureAngleThreshold;
  const postureStatus: 'NORMAL' | 'POOR_POSTURE' = isPoorPosture ? 'POOR_POSTURE' : 'NORMAL';

  // 3. Evaluate Drowsiness
  const drowsinessStatus: 'NOT_DETECTED' | 'DROWSINESS_DETECTED' = drowsiness
    ? 'DROWSINESS_DETECTED'
    : 'NOT_DETECTED';

  // 4. Evaluate Seatbelt (Feature removed, default to fastened)
  const seatbeltStatus: 'FASTENED' | 'UNBUCKLED' = 'FASTENED';

  // 5. Evaluate SOS
  const sosStatus: 'INACTIVE' | 'ACTIVATED' = sos ? 'ACTIVATED' : 'INACTIVE';

  // --- Priority Hierarchy ---
  // CRITICAL Conditions:
  if (sos) {
    return {
      status: 'CRITICAL',
      primaryReason: '🚨 SOS EMERGENCY ACTIVATED',
      heartRateStatus: hrStatus,
      postureStatus,
      drowsinessStatus,
      seatbeltStatus,
      sosStatus,
      highestPrioritySeverity: 'CRITICAL',
    };
  }

  if (drowsiness) {
    return {
      status: 'CRITICAL',
      primaryReason: '🔴 DROWSINESS DETECTED — DRIVER ATTENTION REQUIRED',
      heartRateStatus: hrStatus,
      postureStatus,
      drowsinessStatus,
      seatbeltStatus,
      sosStatus,
      highestPrioritySeverity: 'CRITICAL',
    };
  }

  if (hrStatus === 'CRITICAL') {
    return {
      status: 'CRITICAL',
      primaryReason:
        heartRate < 48
          ? `🔴 CRITICALLY LOW HEART RATE (${heartRate} BPM)`
          : `🔴 CRITICALLY HIGH HEART RATE (${heartRate} BPM)`,
      heartRateStatus: hrStatus,
      postureStatus,
      drowsinessStatus,
      seatbeltStatus,
      sosStatus,
      highestPrioritySeverity: 'CRITICAL',
    };
  }

  // WARNING Conditions:
  if (hrStatus === 'WARNING') {
    return {
      status: 'WARNING',
      primaryReason:
        heartRate < settings.hrLowThreshold
          ? `🟡 LOW HEART RATE / FATIGUE (${heartRate} BPM)`
          : `🟡 HIGH HEART RATE (${heartRate} BPM)`,
      heartRateStatus: hrStatus,
      postureStatus,
      drowsinessStatus,
      seatbeltStatus,
      sosStatus,
      highestPrioritySeverity: 'WARNING',
    };
  }

  if (isPoorPosture) {
    return {
      status: 'WARNING',
      primaryReason: `🟡 POOR POSTURE DETECTED (Pitch: ${pitch.toFixed(1)}°, Roll: ${roll.toFixed(1)}°)`,
      heartRateStatus: hrStatus,
      postureStatus,
      drowsinessStatus,
      seatbeltStatus,
      sosStatus,
      highestPrioritySeverity: 'WARNING',
    };
  }

  // SAFE
  return {
    status: 'SAFE',
    primaryReason: 'Driver condition OK',
    heartRateStatus: hrStatus,
    postureStatus,
    drowsinessStatus,
    seatbeltStatus,
    sosStatus,
    highestPrioritySeverity: 'SAFE',
  };
}
