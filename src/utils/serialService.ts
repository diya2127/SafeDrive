import { PhysicalSensorData } from '../types/safety';

export type OnDataCallback = (data: PhysicalSensorData, rawText: string) => void;
export type OnStatusCallback = (connected: boolean, message: string, error?: string | null) => void;

class SerialConnectionManager {
  private port: any = null;
  private reader: any = null;
  private keepReading = false;
  private textDecoder = new TextDecoder();
  private buffer = '';
  private onDataCallback: OnDataCallback | null = null;
  private onStatusCallback: OnStatusCallback | null = null;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public setCallbacks(onData: OnDataCallback, onStatus: OnStatusCallback) {
    this.onDataCallback = onData;
    this.onStatusCallback = onStatus;
  }

  public async connect(baudRate: number = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      this.onStatusCallback?.(
        false,
        'Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera.',
        'WEB_SERIAL_UNSUPPORTED'
      );
      return false;
    }

    try {
      this.onStatusCallback?.(false, 'Requesting Serial Port selection...');
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });

      this.keepReading = true;
      this.onStatusCallback?.(true, `Connected to ESP32-S3 (${baudRate} baud)`);

      this.readSerialLoop();
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to open serial port';
      this.onStatusCallback?.(false, 'Connection cancelled or failed', errorMsg);
      this.disconnect();
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    this.keepReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (err) {
        // ignore
      }
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (err) {
        // ignore
      }
      this.port = null;
    }

    this.buffer = '';
    this.onStatusCallback?.(false, 'ESP32 Disconnected');
  }

  private async readSerialLoop() {
    while (this.port && this.port.readable && this.keepReading) {
      try {
        this.reader = this.port.readable.getReader();
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          if (value) {
            const chunk = this.textDecoder.decode(value, { stream: true });
            this.handleIncomingChunk(chunk);
          }
        }
      } catch (err: any) {
        if (this.keepReading) {
          console.error('Serial read error:', err);
          this.onStatusCallback?.(false, 'Serial stream read error', err?.message);
        }
        break;
      } finally {
        if (this.reader) {
          try {
            this.reader.releaseLock();
          } catch (e) {
            // ignore
          }
          this.reader = null;
        }
      }
    }

    if (this.keepReading) {
      this.disconnect();
    }
  }

  private handleIncomingChunk(chunk: string) {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    // Keep the last incomplete fragment in the buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      this.parseAndDispatchLine(trimmed);
    }
  }

  public parseAndDispatchLine(rawLine: string) {
    try {
      // Look for JSON payload in the line
      const jsonStart = rawLine.indexOf('{');
      const jsonEnd = rawLine.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = rawLine.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);

        const data: PhysicalSensorData = {
          heartRate: Number(parsed.heartRate ?? parsed.hr ?? parsed.hr_bpm ?? parsed.heart_rate ?? 0),
          pitch: Number(parsed.pitch ?? parsed.pitch_deg ?? parsed.tilt_pitch ?? 0),
          roll: Number(parsed.roll ?? parsed.roll_deg ?? parsed.tilt_roll ?? 0),
          drowsiness: Boolean(parsed.drowsiness ?? parsed.drowsy ?? parsed.drowsiness_detected ?? false),
          seatbelt: Boolean(
            parsed.seatbelt ??
              parsed.seatbelt_fastened ??
              parsed.seatbelt_latched ??
              parsed.buckle ??
              parsed.latched ??
              true
          ),
          sos: Boolean(parsed.sos ?? parsed.sos_active ?? parsed.sos_button ?? parsed.emergency ?? false),
          timestamp: parsed.timestamp || new Date().toISOString(),
          batteryLevel: parsed.batteryLevel ?? parsed.battery ?? parsed.batt_pct ?? undefined,
          rawString: rawLine,
        };

        this.onDataCallback?.(data, rawLine);
      }
    } catch (err) {
      // Invalid JSON line or partial line
      // Ignore non-json debug prints from ESP32
    }
  }
}

export const serialService = new SerialConnectionManager();
