/**
 * SpeechService — the pronunciation provider seam (LANG §7).
 * v1: SpeechSynthesis with the voice-selection ladder. The post-v1 recorded
 * audio provider implements the same interface; no caller may know which
 * provider is speaking.
 */

export type SpeechStatus = 'ready' | 'pending' | 'unavailable';

export interface SpeakRequest {
  text: string;
  locale: string; // "de-DE"
  rate: number; // 1.0 normal / pack slow rate
}

export interface SpeechService {
  speak(req: SpeakRequest): void;
  cancel(): void;
  status(locale: string): SpeechStatus;
  onUtterance(cb: (speaking: boolean) => void): () => void;
  preferredVoiceUri: string | null;
  setPreferredVoice(uri: string | null): void;
  listVoices(locale: string): { name: string; uri: string }[];
}

export class BrowserSpeechService implements SpeechService {
  private voicesLoaded = false;
  private listeners = new Set<(speaking: boolean) => void>();
  preferredVoiceUri: string | null = null;

  constructor() {
    if (typeof speechSynthesis !== 'undefined') {
      const load = () => {
        this.voicesLoaded = speechSynthesis.getVoices().length > 0;
      };
      load();
      try {
        speechSynthesis.addEventListener?.('voiceschanged', load);
      } catch {}
    }
  }

  setPreferredVoice(uri: string | null): void {
    this.preferredVoiceUri = uri;
  }

  listVoices(locale: string): { name: string; uri: string }[] {
    if (typeof speechSynthesis === 'undefined') return [];
    const primary = locale.split('-')[0]!;
    return speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith(primary.toLowerCase()))
      .map((v) => ({ name: v.name, uri: v.voiceURI }));
  }

  /** Voice ladder: player choice → local exact locale → default-flagged → primary subtag → none. */
  private pickVoice(locale: string): SpeechSynthesisVoice | null {
    if (typeof speechSynthesis === 'undefined') return null;
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    if (this.preferredVoiceUri) {
      const chosen = voices.find((v) => v.voiceURI === this.preferredVoiceUri);
      if (chosen) return chosen;
    }
    const exact = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === locale.toLowerCase());
    const localExact = exact.find((v) => v.localService);
    if (localExact) return localExact;
    const defaultExact = exact.find((v) => v.default);
    if (defaultExact) return defaultExact;
    if (exact.length > 0) return exact[0]!;
    const primary = locale.split('-')[0]!.toLowerCase();
    const subtag = voices.find((v) => v.lang.toLowerCase().startsWith(primary));
    return subtag ?? null;
  }

  status(locale: string): SpeechStatus {
    if (typeof speechSynthesis === 'undefined') return 'unavailable';
    if (!this.voicesLoaded && speechSynthesis.getVoices().length === 0) return 'pending';
    return this.pickVoice(locale) ? 'ready' : 'unavailable';
  }

  speak(req: SpeakRequest): void {
    if (typeof speechSynthesis === 'undefined') return;
    try {
      speechSynthesis.cancel(); // one vocabulary utterance at a time
      const u = new SpeechSynthesisUtterance(req.text);
      u.lang = req.locale;
      u.rate = req.rate;
      u.pitch = 1;
      u.volume = 1;
      const voice = this.pickVoice(req.locale);
      if (voice) u.voice = voice;
      this.emit(true);
      u.onend = () => this.emit(false);
      u.onerror = () => this.emit(false);
      speechSynthesis.speak(u);
    } catch {
      this.emit(false);
    }
  }

  cancel(): void {
    try {
      speechSynthesis?.cancel();
    } catch {}
    this.emit(false);
  }

  onUtterance(cb: (speaking: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(speaking: boolean): void {
    for (const cb of this.listeners) cb(speaking);
  }
}

/** Test fake: records requests. */
export class FakeSpeechService implements SpeechService {
  spoken: SpeakRequest[] = [];
  cancelled = 0;
  preferredVoiceUri: string | null = null;
  speak(req: SpeakRequest): void {
    this.spoken.push(req);
  }
  cancel(): void {
    this.cancelled++;
  }
  status(): SpeechStatus {
    return 'ready';
  }
  onUtterance(): () => void {
    return () => {};
  }
  setPreferredVoice(uri: string | null): void {
    this.preferredVoiceUri = uri;
  }
  listVoices(): { name: string; uri: string }[] {
    return [];
  }
}
