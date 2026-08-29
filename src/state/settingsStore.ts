import { create } from 'zustand';
import type { SettingsData } from '../services/StorageService';

export type { SettingsData };

export interface SettingsState extends SettingsData {
  set<K extends keyof SettingsData>(key: K, value: SettingsData[K]): void;
  hydrate(data: Partial<SettingsData>): void;
}

const DEFAULTS: SettingsData = {
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
};

const SETTING_KEYS = Object.keys(DEFAULTS) as (keyof SettingsData)[];

/** Keep only known keys with plausible types — saves come from IndexedDB. */
function sanitize(data: Partial<SettingsData>): Partial<SettingsData> {
  const out: Record<string, unknown> = {};
  for (const k of SETTING_KEYS) {
    const v = data[k];
    if (v !== undefined && typeof v === typeof DEFAULTS[k]) out[k] = v;
  }
  return out as Partial<SettingsData>;
}

export const useSettings = create<SettingsState>((set) => ({
  ...DEFAULTS,
  set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
  hydrate: (data) => set(sanitize(data)),
}));

export function settingsSnapshot(): SettingsData {
  const { textSize, dyslexiaFont, genderTint, reducedMotion, purist, slowAudioDefault, leftHandedTray, volMusic, volSfx, volVoice } =
    useSettings.getState();
  return { textSize, dyslexiaFont, genderTint, reducedMotion, purist, slowAudioDefault, leftHandedTray, volMusic, volSfx, volVoice };
}
