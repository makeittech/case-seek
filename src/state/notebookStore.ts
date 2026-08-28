/**
 * Notebook: CASE lines, PEOPLE dossiers, CLUES pins/strings, WORDS meta.
 * Data-driven from beats and finds; the player never edits it.
 */
import { create } from 'zustand';
import type { NotebookData } from '../services/StorageService';

interface NotebookState extends NotebookData {
  hydrate(data: NotebookData): void;
  reset(): void;
  addCaseLine(chapter: number, line: string): void;
  setObjective(text: string): void;
  addFact(characterId: string, fact: string, stamp?: string): void;
  pinClue(clueId: string): void;
  addBoardLink(a: string, b: string): void;
  markSolvedOffscreen(puzzleId: string): void;
}

const empty: NotebookData = {
  caseLines: [],
  people: {},
  clues: [],
  boardLinks: [],
  objective: '',
  solvedOffscreen: [],
};

export const useNotebook = create<NotebookState>((set) => ({
  ...empty,
  hydrate: (data) => set({ ...empty, ...data }),
  reset: () => set({ ...empty, caseLines: [], people: {}, clues: [], boardLinks: [], solvedOffscreen: [] }),
  addCaseLine: (chapter, line) =>
    set((s) =>
      s.caseLines.some((l) => l.line === line) ? s : { caseLines: [...s.caseLines, { chapter, line }] },
    ),
  setObjective: (text) => set({ objective: text }),
  addFact: (characterId, fact, stamp) =>
    set((s) => {
      const cur = s.people[characterId] ?? { facts: [], stamp: 'unknown', stampHistory: [] };
      if (cur.facts.includes(fact) && (!stamp || stamp === cur.stamp)) return s;
      return {
        people: {
          ...s.people,
          [characterId]: {
            facts: cur.facts.includes(fact) ? cur.facts : [...cur.facts, fact],
            stamp: stamp ?? cur.stamp,
            stampHistory: stamp && stamp !== cur.stamp ? [...cur.stampHistory, stamp] : cur.stampHistory,
          },
        },
      };
    }),
  pinClue: (clueId) =>
    set((s) => (s.clues.includes(clueId) ? s : { clues: [...s.clues, clueId] })),
  addBoardLink: (a, b) =>
    set((s) =>
      s.boardLinks.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
        ? s
        : { boardLinks: [...s.boardLinks, [a, b] as [string, string]] },
    ),
  markSolvedOffscreen: (puzzleId) =>
    set((s) => (s.solvedOffscreen.includes(puzzleId) ? s : { solvedOffscreen: [...s.solvedOffscreen, puzzleId] })),
}));

export function notebookSnapshot(): NotebookData {
  const s = useNotebook.getState();
  return {
    caseLines: s.caseLines,
    people: s.people,
    clues: s.clues,
    boardLinks: s.boardLinks,
    objective: s.objective,
    solvedOffscreen: s.solvedOffscreen,
  };
}
