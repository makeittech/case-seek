/**
 * Screen state machine (ARCH §6.1). Transitions are the only way to change
 * screens; the browser History API mirrors it (back = in-game back).
 */
import { create } from 'zustand';

export type Screen =
  | { kind: 'boot' }
  | { kind: 'title' }
  | { kind: 'case-files' }
  | { kind: 'lang-select' }
  | { kind: 'prof-select'; lang: 'de' | 'es' | 'it' }
  | { kind: 'map' }
  | { kind: 'beat'; beatId: string }
  | { kind: 'search'; roundId: string }
  | { kind: 'results'; roundId: string }
  | { kind: 'debrief'; roundId: string }
  | { kind: 'clue'; clueId: string; back: 'search' | 'flow' | 'notebook' }
  | { kind: 'puzzle'; puzzleId: string }
  | { kind: 'board-review'; brId: string }
  | { kind: 'recap'; chapter: number }
  | { kind: 'accusation' }
  | { kind: 'epilogue' };

export type NotebookTab = 'case' | 'people' | 'clues' | 'words';

interface UiState {
  screen: Screen;
  notebookOpen: NotebookTab | null;
  settingsOpen: boolean;
  notebookPeek: boolean; // paper-tab peek on new entry
  goto(screen: Screen): void;
  openNotebook(tab?: NotebookTab): void;
  closeNotebook(): void;
  setSettingsOpen(open: boolean): void;
  setNotebookPeek(v: boolean): void;
}

export const useUi = create<UiState>((set) => ({
  screen: { kind: 'boot' },
  notebookOpen: null,
  settingsOpen: false,
  notebookPeek: false,
  goto: (screen) => {
    set({ screen });
    pushHistory();
  },
  openNotebook: (tab = 'case') => set({ notebookOpen: tab, notebookPeek: false }),
  closeNotebook: () => set({ notebookOpen: null }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setNotebookPeek: (v) => set({ notebookPeek: v }),
}));

// ---------- browser history mirroring ----------

let historyHooked = false;
let backHandler: (() => void) | null = null;

export function setBackHandler(fn: () => void): void {
  backHandler = fn;
}

function pushHistory(): void {
  if (typeof window === 'undefined' || !historyHooked) return;
  try {
    window.history.pushState({ cs: true }, '');
  } catch {}
}

export function hookHistory(): void {
  if (typeof window === 'undefined' || historyHooked) return;
  historyHooked = true;
  try {
    window.history.replaceState({ cs: true }, '');
  } catch {}
  window.addEventListener('popstate', () => {
    // Browser back behaves as the in-game back control; re-arm the entry.
    try {
      window.history.pushState({ cs: true }, '');
    } catch {}
    const ui = useUi.getState();
    if (ui.settingsOpen) {
      ui.setSettingsOpen(false);
      return;
    }
    if (ui.notebookOpen) {
      ui.closeNotebook();
      return;
    }
    backHandler?.();
  });
}
