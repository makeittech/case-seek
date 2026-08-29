/**
 * Persistence coordinator: debounced, event-granularity autosave.
 * Every find / flip / debrief answer / beat completion calls one of these;
 * writes coalesce on a short timer and flush on pagehide.
 */
import { getServices } from '../services';
import type { SavedRound, SavedScreen } from '../services/StorageService';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useRound } from '../state/roundStore';
import { notebookSnapshot } from '../state/notebookStore';
import { settingsSnapshot } from '../state/settingsStore';
import { useUi, type Screen } from '../state/uiStore';
import { band } from '../engine/vocab/scheduler';

type DirtyKey = 'case' | 'words' | 'round' | 'notebook' | 'profile';
const dirty: Record<DirtyKey, boolean> = { case: false, words: false, round: false, notebook: false, profile: false };
let timer: ReturnType<typeof setTimeout> | null = null;

function schedule(): void {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, 120);
}

export function markCaseDirty(): void {
  dirty.case = true;
  schedule();
}
export function markWordsDirty(): void {
  dirty.words = true;
  dirty.case = true;
  schedule();
}
export function markRoundDirty(): void {
  dirty.round = true;
  schedule();
}
export function markNotebookDirty(): void {
  dirty.notebook = true;
  schedule();
}
export function markProfileDirty(): void {
  dirty.profile = true;
  schedule();
}

const SAVED_KINDS = new Set([
  'map',
  'beat',
  'search',
  'results',
  'debrief',
  'puzzle',
  'board-review',
  'recap',
  'accusation',
  'epilogue',
  'clue',
]);

function savedRoundSnapshot(): SavedRound | null {
  const rs = useRound.getState();
  if (!rs.state || !rs.roundId || !rs.sceneId || rs.status === 'complete') return null;
  return { roundId: rs.roundId, sceneId: rs.sceneId, state: rs.state };
}

export async function flush(): Promise<void> {
  const { storage } = getServices();
  const row = useCase.getState().row;
  const now = Date.now();
  // Take a snapshot of what needs writing and clear the flags up front; on
  // failure the snapshot is merged back so the next schedule/pagehide retries
  // instead of silently dropping the write.
  const snap = { ...dirty };
  for (const k of Object.keys(dirty) as DirtyKey[]) dirty[k] = false;
  try {
    if (snap.profile) {
      const prev = await storage.getProfile();
      await storage.putProfile({
        profileId: prev?.profileId ?? `p-${now.toString(36)}`,
        createdAt: prev?.createdAt ?? now,
        settings: settingsSnapshot(),
        seenTutorials: prev?.seenTutorials ?? [],
      });
    }
    if (!row) return;
    if (snap.words) await storage.putWords(row.caseId, useVocab.getState().words);
    if (snap.round) await storage.putRoundState(row.caseId, savedRoundSnapshot());
    if (snap.notebook) await storage.putNotebook(row.caseId, notebookSnapshot());
    if (snap.case) {
      const screen = useUi.getState().screen;
      const words = useVocab.getState().words;
      let known = 0;
      for (const rec of Object.values(words)) if (band(rec, now) === 'known') known++;
      await storage.putCase({
        ...useCase.getState().row!,
        screen: SAVED_KINDS.has(screen.kind) ? screen : row.screen,
        wordsKnown: known,
        updatedAt: now,
      });
    }
  } catch (err) {
    if (snap.profile) dirty.profile = true;
    if (row) {
      for (const k of ['case', 'words', 'round', 'notebook'] as const) if (snap[k]) dirty[k] = true;
    }
    console.warn('autosave failed; will retry on next save event', err);
  }
}

/** Narrow a persisted screen back to the Screen union (storage boundary). */
export function savedScreenOf(row: { screen: SavedScreen | null }): Screen | null {
  const s = row.screen;
  if (!s || typeof s.kind !== 'string' || !SAVED_KINDS.has(s.kind)) return null;
  return s as Screen;
}

export function hookLifecycleFlush(): void {
  if (typeof window === 'undefined') return;
  const onHide = () => void flush();
  window.addEventListener('pagehide', onHide);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
}
