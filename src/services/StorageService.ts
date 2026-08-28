/**
 * StorageService: IndexedDB (via idb) behind an interface with an in-memory
 * fake for tests. Layout per ARCH §9.1; case slots are islands.
 */
import { openDB, type IDBPDatabase } from 'idb';
import type { WordRecord } from '../engine/vocab/scheduler';
import { migrateBundle, SAVE_VERSION } from '../engine/save/migrations';

export interface ProfileRow {
  profileId: string;
  createdAt: number;
  settings: Record<string, unknown>;
  seenTutorials: string[];
}

export interface CaseRow {
  caseId: string;
  lang: 'de' | 'es' | 'it';
  tier: 'new' | 'basics' | 'conversational' | 'advanced';
  saveVersion: number;
  seed: number;
  createdAt: number;
  updatedAt: number;
  flowIndex: number;
  roundCounter: number;
  chapter: number;
  screen: Record<string, unknown> | null;
  completed: boolean;
  bankedInsight: number;
  missedLastDebrief: string[];
  recentTargets: string[][]; // concepts of last two rounds
  lastPlayedLabel: string;
  wordsKnown: number;
  flavor?: 'dry' | 'warm';
  pendingDebrief: {
    roundId: string;
    foundConcepts: string[];
    stamps: { accuracy: boolean; unassisted: boolean; streak: boolean };
    clueId: string | null;
    debriefDone: boolean;
  } | null;
}

export interface NotebookData {
  caseLines: { chapter: number; line: string }[];
  people: Record<string, { facts: string[]; stamp: string; stampHistory: string[] }>;
  clues: string[]; // pinned clue ids in pin order
  boardLinks: [string, string][]; // completed board-review strings
  objective: string;
  solvedOffscreen: string[]; // puzzle ids Margo took
}

export interface StorageService {
  init(): Promise<void>;
  getProfile(): Promise<ProfileRow | null>;
  putProfile(p: ProfileRow): Promise<void>;
  listCases(): Promise<CaseRow[]>;
  getCase(caseId: string): Promise<CaseRow | null>;
  putCase(row: CaseRow): Promise<void>;
  deleteCase(caseId: string): Promise<void>;
  getWords(caseId: string): Promise<Record<string, WordRecord>>;
  putWords(caseId: string, words: Record<string, WordRecord>): Promise<void>;
  getRoundState(caseId: string): Promise<Record<string, unknown> | null>;
  putRoundState(caseId: string, state: Record<string, unknown> | null): Promise<void>;
  getNotebook(caseId: string): Promise<NotebookData | null>;
  putNotebook(caseId: string, nb: NotebookData): Promise<void>;
  exportCase(caseId: string): Promise<Record<string, unknown>>;
  requestPersistence(): Promise<void>;
}

const DB_NAME = 'case-and-seek';

export class IdbStorageService implements StorageService {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore('profile');
        db.createObjectStore('cases', { keyPath: 'caseId' });
        db.createObjectStore('words');
        db.createObjectStore('roundState');
        db.createObjectStore('notebook');
      },
    });
  }

  private need(): IDBPDatabase {
    if (!this.db) throw new Error('storage not initialized');
    return this.db;
  }

  async getProfile(): Promise<ProfileRow | null> {
    return (await this.need().get('profile', 'profile')) ?? null;
  }
  async putProfile(p: ProfileRow): Promise<void> {
    await this.need().put('profile', p, 'profile');
  }
  async listCases(): Promise<CaseRow[]> {
    const rows = (await this.need().getAll('cases')) as CaseRow[];
    return rows.map((r) => this.migrate(r)).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async getCase(caseId: string): Promise<CaseRow | null> {
    const row = (await this.need().get('cases', caseId)) as CaseRow | undefined;
    return row ? this.migrate(row) : null;
  }
  private migrate(row: CaseRow): CaseRow {
    if (row.saveVersion === SAVE_VERSION) return row;
    const bundle = migrateBundle({ case: row }, row.saveVersion ?? 1);
    return bundle.case as CaseRow;
  }
  async putCase(row: CaseRow): Promise<void> {
    await this.need().put('cases', row);
  }
  async deleteCase(caseId: string): Promise<void> {
    const db = this.need();
    await db.delete('cases', caseId);
    await db.delete('words', caseId);
    await db.delete('roundState', caseId);
    await db.delete('notebook', caseId);
  }
  async getWords(caseId: string): Promise<Record<string, WordRecord>> {
    return ((await this.need().get('words', caseId)) as Record<string, WordRecord>) ?? {};
  }
  async putWords(caseId: string, words: Record<string, WordRecord>): Promise<void> {
    await this.need().put('words', words, caseId);
  }
  async getRoundState(caseId: string): Promise<Record<string, unknown> | null> {
    return ((await this.need().get('roundState', caseId)) as Record<string, unknown>) ?? null;
  }
  async putRoundState(caseId: string, state: Record<string, unknown> | null): Promise<void> {
    if (state === null) await this.need().delete('roundState', caseId);
    else await this.need().put('roundState', state, caseId);
  }
  async getNotebook(caseId: string): Promise<NotebookData | null> {
    return ((await this.need().get('notebook', caseId)) as NotebookData) ?? null;
  }
  async putNotebook(caseId: string, nb: NotebookData): Promise<void> {
    await this.need().put('notebook', nb, caseId);
  }
  async exportCase(caseId: string): Promise<Record<string, unknown>> {
    return {
      exportedAt: Date.now(),
      saveVersion: SAVE_VERSION,
      case: await this.getCase(caseId),
      words: await this.getWords(caseId),
      roundState: await this.getRoundState(caseId),
      notebook: await this.getNotebook(caseId),
    };
  }
  async requestPersistence(): Promise<void> {
    try {
      await navigator.storage?.persist?.();
    } catch {}
  }
}

/** In-memory fake for tests. */
export class MemoryStorageService implements StorageService {
  profile: ProfileRow | null = null;
  cases = new Map<string, CaseRow>();
  words = new Map<string, Record<string, WordRecord>>();
  roundStates = new Map<string, Record<string, unknown>>();
  notebooks = new Map<string, NotebookData>();

  async init(): Promise<void> {}
  async getProfile(): Promise<ProfileRow | null> {
    return this.profile;
  }
  async putProfile(p: ProfileRow): Promise<void> {
    this.profile = p;
  }
  async listCases(): Promise<CaseRow[]> {
    return [...this.cases.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async getCase(caseId: string): Promise<CaseRow | null> {
    return this.cases.get(caseId) ?? null;
  }
  async putCase(row: CaseRow): Promise<void> {
    this.cases.set(row.caseId, row);
  }
  async deleteCase(caseId: string): Promise<void> {
    this.cases.delete(caseId);
    this.words.delete(caseId);
    this.roundStates.delete(caseId);
    this.notebooks.delete(caseId);
  }
  async getWords(caseId: string): Promise<Record<string, WordRecord>> {
    return this.words.get(caseId) ?? {};
  }
  async putWords(caseId: string, words: Record<string, WordRecord>): Promise<void> {
    this.words.set(caseId, words);
  }
  async getRoundState(caseId: string): Promise<Record<string, unknown> | null> {
    return this.roundStates.get(caseId) ?? null;
  }
  async putRoundState(caseId: string, state: Record<string, unknown> | null): Promise<void> {
    if (state === null) this.roundStates.delete(caseId);
    else this.roundStates.set(caseId, state);
  }
  async getNotebook(caseId: string): Promise<NotebookData | null> {
    return this.notebooks.get(caseId) ?? null;
  }
  async putNotebook(caseId: string, nb: NotebookData): Promise<void> {
    this.notebooks.set(caseId, nb);
  }
  async exportCase(caseId: string): Promise<Record<string, unknown>> {
    return {
      case: await this.getCase(caseId),
      words: await this.getWords(caseId),
      roundState: await this.getRoundState(caseId),
      notebook: await this.getNotebook(caseId),
    };
  }
  async requestPersistence(): Promise<void> {}
}
