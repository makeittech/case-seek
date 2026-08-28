// Vitest global setup: minimal browser API fakes the engine/services need under jsdom.

// SpeechSynthesis fake
class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: unknown = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}
const fakeSynth = {
  speaking: false,
  pending: false,
  paused: false,
  getVoices: () => [] as SpeechSynthesisVoice[],
  speak: (u: FakeUtterance) => {
    setTimeout(() => u.onend?.(), 0);
  },
  cancel: () => {},
  pause: () => {},
  resume: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  onvoiceschanged: null,
};
Object.defineProperty(globalThis, 'speechSynthesis', { value: fakeSynth, writable: true });
Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', { value: FakeUtterance, writable: true });

// matchMedia fake
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
