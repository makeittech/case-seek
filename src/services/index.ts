/**
 * Service locator: one place wires browser implementations; tests inject fakes.
 */
import { BrowserSpeechService, FakeSpeechService, type SpeechService } from './SpeechService';
import { IdbStorageService, MemoryStorageService, type StorageService } from './StorageService';
import { WebAudioBus, FakeAudioBus, type AudioBus } from './AudioBus';

export interface Services {
  speech: SpeechService;
  storage: StorageService;
  audio: AudioBus;
}

let services: Services | null = null;

export function initBrowserServices(): Services {
  services = {
    speech: new BrowserSpeechService(),
    storage: new IdbStorageService(),
    audio: new WebAudioBus(),
  };
  return services;
}

export function initTestServices(): Services {
  services = {
    speech: new FakeSpeechService(),
    storage: new MemoryStorageService(),
    audio: new FakeAudioBus(),
  };
  return services;
}

export function getServices(): Services {
  if (!services) throw new Error('services not initialized');
  return services;
}

export function setServices(s: Services): void {
  services = s;
}
