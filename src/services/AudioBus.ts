/**
 * AudioBus: tiny WebAudio SFX synth. Signature notebook/paper/stamp family +
 * the lens chime. All sounds are synthesized envelopes (no audio assets yet);
 * every playback surface renders a visual twin — audio is never a gate.
 */

export type SfxName = 'find' | 'flip' | 'stamp' | 'miss' | 'chime' | 'pin' | 'pour' | 'page' | 'steady';

export interface AudioBus {
  sfx(name: SfxName): void;
  setVolume(v: number): void;
  unlock(): void;
}

export class WebAudioBus implements AudioBus {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private volume = 0.5;

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.ctx.destination);
    } catch {}
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.gain) this.gain.gain.value = v;
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol = 0.4, delay = 0, slide = 0): void {
    if (!this.ctx || !this.gain || this.volume <= 0) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(this.gain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, vol = 0.25, delay = 0): void {
    if (!this.ctx || !this.gain || this.volume <= 0) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    g.connect(this.gain);
    src.start(t0);
  }

  sfx(name: SfxName): void {
    switch (name) {
      case 'find': // paper-snap + soft chime
        this.noise(0.06, 0.3);
        this.tone(660, 0.22, 'sine', 0.28, 0.03);
        this.tone(990, 0.3, 'sine', 0.18, 0.08);
        break;
      case 'flip': // soft page flip
        this.noise(0.09, 0.16);
        break;
      case 'page':
        this.noise(0.12, 0.12);
        break;
      case 'stamp': // rubber-stamp thunk
        this.tone(120, 0.14, 'square', 0.3, 0, -60);
        this.noise(0.05, 0.2, 0.02);
        break;
      case 'miss': // dust whisper
        this.noise(0.04, 0.06);
        break;
      case 'chime': // low warm lens chime
        this.tone(392, 0.5, 'sine', 0.24);
        this.tone(588, 0.5, 'sine', 0.12, 0.05);
        break;
      case 'pin': // string-pin
        this.tone(1400, 0.06, 'triangle', 0.25, 0, -400);
        this.tone(200, 0.1, 'square', 0.14, 0.03);
        break;
      case 'pour': // insight segment pour
        this.tone(500, 0.35, 'sine', 0.16, 0, 260);
        break;
      case 'steady':
        this.tone(300, 0.2, 'sine', 0.1);
        break;
    }
  }
}

export class FakeAudioBus implements AudioBus {
  played: SfxName[] = [];
  sfx(name: SfxName): void {
    this.played.push(name);
  }
  setVolume(): void {}
  unlock(): void {}
}
