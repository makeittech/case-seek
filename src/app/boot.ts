/**
 * Boot: init services, load profile + case slots, wire history & lifecycle.
 * Title → Continue restores the exact prior screen from the save.
 */
import { getServices, initBrowserServices } from '../services';
import { useUi, hookHistory, setBackHandler, type Screen } from '../state/uiStore';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useNotebook } from '../state/notebookStore';
import { useSettings } from '../state/settingsStore';
import { hookLifecycleFlush, markCaseDirty, markNotebookDirty, markProfileDirty, markWordsDirty, savedScreenOf } from './persist';
import { initContent } from './content';
import { enterCurrentNode, goBack } from './flow';
import { startRound } from './roundFlow';
import type { CaseRow } from '../services/StorageService';
import type { Lang, Tier } from '../engine/types';

export async function boot(): Promise<void> {
  initBrowserServices();
  const { storage, audio } = getServices();
  // content chunk + storage open in parallel; both must finish before title
  await Promise.all([initContent(), storage.init()]);
  const profile = await storage.getProfile();
  if (profile?.settings) useSettings.getState().hydrate(profile.settings);
  hookHistory();
  setBackHandler(goBack);
  hookLifecycleFlush();
  // audio unlock piggybacks the session's first gesture
  const unlock = () => {
    audio.unlock();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  useUi.getState().goto({ kind: 'title' });
}

export async function listSaves(): Promise<CaseRow[]> {
  return getServices().storage.listCases();
}

async function hydrateCase(row: CaseRow): Promise<void> {
  const { storage } = getServices();
  useCase.getState().hydrate(row);
  const words = await storage.getWords(row.caseId);
  useVocab.getState().hydrate(words);
  const nb = await storage.getNotebook(row.caseId);
  if (nb) useNotebook.getState().hydrate(nb);
  else useNotebook.getState().reset();
}

/** Continue: restore the exact prior screen (mid-round resumes mid-round). */
export async function continueCase(row: CaseRow): Promise<void> {
  await hydrateCase(row);
  const screen = savedScreenOf(row);
  const ui = useUi.getState();
  if (!screen) {
    enterCurrentNode();
    return;
  }
  if (screen.kind === 'search') {
    try {
      await startRound(screen.roundId);
      ui.goto(screen);
      return;
    } catch {
      enterCurrentNode();
      return;
    }
  }
  if (screen.kind === 'results' || screen.kind === 'debrief') {
    if (row.pendingDebrief && !row.pendingDebrief.debriefDone) {
      ui.goto(screen);
      return;
    }
    enterCurrentNode();
    return;
  }
  const restorable: Screen['kind'][] = ['map', 'beat', 'puzzle', 'board-review', 'recap', 'accusation', 'epilogue'];
  if (restorable.includes(screen.kind)) {
    ui.goto(screen);
    return;
  }
  enterCurrentNode();
}

export async function newCase(lang: Lang, tier: Tier): Promise<void> {
  const { storage } = getServices();
  useVocab.getState().reset();
  useNotebook.getState().reset();
  const row = useCase.getState().createCase(lang, tier);
  await storage.putCase(row);
  await storage.requestPersistence();
  markCaseDirty();
  markWordsDirty();
  markNotebookDirty();
  markProfileDirty();
  enterCurrentNode(); // flow node 0 = the cold open beat
}

export async function deleteCase(caseId: string): Promise<void> {
  await getServices().storage.deleteCase(caseId);
  if (useCase.getState().row?.caseId === caseId) {
    useCase.getState().clear();
    useVocab.getState().reset();
    useNotebook.getState().reset();
  }
}

export async function exportCase(caseId: string): Promise<void> {
  const data = await getServices().storage.exportCase(caseId);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${caseId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
