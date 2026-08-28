/**
 * Vocabulary speech helper: article+noun as one utterance through the
 * SpeechService seam; logs listening exposure on the word record.
 */
import { db } from './content';
import { getServices } from '../services';
import { useCase } from '../state/caseStore';
import { useVocab } from '../state/vocabStore';
import { useSettings } from '../state/settingsStore';
import { markWordsDirty } from './persist';
import type { ConceptId } from '../engine/types';

export function speakConcept(conceptId: ConceptId, opts: { plural?: boolean; slow?: boolean } = {}): void {
  const row = useCase.getState().row;
  if (!row) return;
  const pack = db().packs[row.lang];
  const lx = db().lexemes[row.lang].get(conceptId);
  if (!lx) return;
  const slowDefault = useSettings.getState().slowAudioDefault;
  const slow = opts.slow ?? slowDefault;
  const text = opts.plural
    ? (lx.ttsTextPlural ?? lx.plural ?? `${lx.article} ${lx.word}`)
    : (lx.ttsText ?? `${lx.article} ${lx.word}`);
  getServices().speech.speak({ text, locale: pack.locale, rate: slow ? pack.slowRate : 1 });
  useVocab.getState().markHeard(conceptId, slow);
  markWordsDirty();
}

export function speakText(text: string, opts: { slow?: boolean } = {}): void {
  const row = useCase.getState().row;
  if (!row) return;
  const pack = db().packs[row.lang];
  getServices().speech.speak({ text, locale: pack.locale, rate: opts.slow ? pack.slowRate : 1 });
}

export function speakGreeting(lang: 'de' | 'es' | 'it'): void {
  const pack = db().packs[lang];
  getServices().speech.speak({ text: pack.greeting, locale: pack.locale, rate: 1 });
}

export function speechAvailable(): boolean {
  const row = useCase.getState().row;
  if (!row) return true;
  return getServices().speech.status(db().packs[row.lang].locale) !== 'unavailable';
}
