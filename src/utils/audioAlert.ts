class AudioAlertEngine {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playTone(frequency: number, durationMs: number = 200, type: OscillatorType = 'sine') {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch {
      // ignore
    }
  }

  public playWarningAlert() {
    this.playTone(880, 250, 'triangle');
    setTimeout(() => this.playTone(1100, 300, 'triangle'), 200);
  }

  public playCriticalAlert() {
    this.playTone(1200, 180, 'sawtooth');
    setTimeout(() => this.playTone(1600, 220, 'sawtooth'), 150);
    setTimeout(() => this.playTone(2000, 300, 'sawtooth'), 320);
  }

  public playClick() {
    this.playTone(600, 40, 'sine');
  }
}

export const audioAlert = new AudioAlertEngine();
