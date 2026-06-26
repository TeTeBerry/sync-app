export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private enabled = false;

  get isEnabled(): boolean {
    return this.enabled;
  }

  async enable(): Promise<void> {
    if (this.enabled) {
      return;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    this.ctx = new AudioCtx();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;
    this.gain.connect(this.ctx.destination);

    this.oscA = this.ctx.createOscillator();
    this.oscB = this.ctx.createOscillator();
    this.oscA.type = 'sine';
    this.oscB.type = 'triangle';
    this.oscA.frequency.value = 110;
    this.oscB.frequency.value = 164.81;
    this.oscA.connect(this.gain);
    this.oscB.connect(this.gain);
    this.oscA.start();
    this.oscB.start();

    await this.ctx.resume();
    this.gain.gain.linearRampToValueAtTime(0.045, this.ctx.currentTime + 1.2);
    this.enabled = true;
  }

  disable(): void {
    if (!this.enabled || !this.ctx || !this.gain) {
      return;
    }
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(0, now + 0.4);
    window.setTimeout(() => this.teardown(), 450);
    this.enabled = false;
  }

  private teardown(): void {
    this.oscA?.stop();
    this.oscB?.stop();
    this.oscA?.disconnect();
    this.oscB?.disconnect();
    this.gain?.disconnect();
    this.ctx?.close();
    this.oscA = null;
    this.oscB = null;
    this.gain = null;
    this.ctx = null;
  }
}
