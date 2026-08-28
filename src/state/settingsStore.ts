import { create } from 'zustand';

export interface SettingsState {
  textSize: 100 | 115 | 130;
  dyslexiaFont: boolean;
  genderTint: boolean;
  reducedMotion: boolean;
  purist: boolean; // disables auto-nudge
  slowAudioDefault: boolean;
  leftHandedTray: boolean;
  volMusic: number;
  volSfx: number;
  volVoice: number;
  set<K extends keyof SettingsState>(key: K, value: SettingsState[K]): void;
  hydrate(data: Partial<SettingsState>): void;
}

export const useSettings = create<SettingsState>((set) => ({
  textSize: 100,
  dyslexiaFont: false,
  genderTint: false,
  reducedMotion: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  purist: false,
  slowAudioDefault: false,
  leftHandedTray: false,
  volMusic: 0.4,
  volSfx: 0.5,
  volVoice: 1,
  set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
  hydrate: (data) => set(data),
}));

export function settingsSnapshot(): Record<string, unknown> {
  const s = useSettings.getState();
  return {
    textSize: s.textSize,
    dyslexiaFont: s.dyslexiaFont,
    genderTint: s.genderTint,
    reducedMotion: s.reducedMotion,
    purist: s.purist,
    slowAudioDefault: s.slowAudioDefault,
    leftHandedTray: s.leftHandedTray,
    volMusic: s.volMusic,
    volSfx: s.volSfx,
    volVoice: s.volVoice,
  };
}
