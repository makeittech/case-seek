/**
 * Persistence coordinator: debounced, event-granularity autosave.
 * Every find / flip / debrief answer / beat completion calls one of these;
 * writes coalesce on a short timer and flush on pagehide.
 */
import { getServices } from '../services';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useRound } from '../state/roundStore';
import { notebookSnapshot } from '../state/notebookStore';
import { settingsSnapshot } from '../state/settingsStore';
import { useUi, type Screen } from '../state/uiStore';
import { band } from '../engine/vocab/scheduler';

const dirty = { case: false, words: false, round: false, notebook: false, profile: false };
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

export async function flush(): Promise<void> {
  const { storage } = getServices();
  const row = useCase.getState().row;
  const now = Date.now();
  try {
    if (dirty.profile) {
      dirty.profile = false;
      const prev = await storage.getProfile();
      await storage.putProfile({
        profileId: prev?.profileId ?? `p-${now.toString(36)}`,
        createdAt: prev?.createdAt ?? now,
        settings: settingsSnapshot(),
        seenTutorials: prev?.seenTutorials ?? [],
      });
    }
    if (!row) {
      dirty.case = dirty.words = dirty.round = dirty.notebook = false;
      return;
    }
    if (dirty.words) {
      dirty.words = false;
      await storage.putWords(row.caseId, useVocab.getState().words);
    }
    if (dirty.round) {
      dirty.round = false;
      const rs = useRound.getState();
      await storage.putRoundState(
        row.caseId,
        rs.state && rs.status !== 'complete'
          ? ({ state: rs.state, sceneId: rs.sceneId, roundId: rs.roundId } as unknown as Record<string, unknown>)
          : null,
      );
    }
    if (dirty.notebook) {
      dirty.notebook = false;
      await storage.putNotebook(row.caseId, notebookSnapshot());
    }
    if (dirty.case) {
      dirty.case = false;
      const screen = useUi.getState().screen;
      const words = useVocab.getState().words;
      let known = 0;
      for (const rec of Object.values(words)) if (band(rec, now) === 'known') known++;
      await storage.putCase({
        ...useCase.getState().row!,
        screen: SAVED_KINDS.has(screen.kind) ? (screen as unknown as Record<string, unknown>) : row.screen,
        wordsKnown: known,
        updatedAt: now,
      });
    }
  } catch (err) {
    console.warn('autosave failed', err);
  }
}

export function savedScreenOf(row: { screen: Record<string, unknown> | null }): Screen | null {
  const s = row.screen as unknown as Screen | null;
  if (!s || typeof s !== 'object' || !('kind' in s)) return null;
  return s;
}

export function hookLifecycleFlush(): void {
  if (typeof window === 'undefined') return;
  const onHide = () => void flush();
  window.addEventListener('pagehide', onHide);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush();
  });
}
