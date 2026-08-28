/** Pairs: match each target-language word to its picture. */
import { useMemo, useState } from 'react';
import { db } from '../../app/content';
import { speakConcept } from '../../app/speak';
import { nounDisplay } from '../../engine/content/loader';
import { mulberry32, shuffle } from '../../engine/rand';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function Pairs({ params, lang, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const concepts = (params.concepts as string[]) ?? [];
  const words = useMemo(() => shuffle(concepts, mulberry32(41)), [concepts]);
  const icons = useMemo(() => shuffle(concepts, mulberry32(97)), [concepts]);
  const [selWord, setSelWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const pickWord = (c: string): void => {
    if (matched.has(c) || solved) return;
    setSelWord(c);
    speakConcept(c, {});
  };

  const pickIcon = (c: string): void => {
    if (!selWord || matched.has(c) || solved) return;
    if (c === selWord) {
      const next = new Set(matched);
      next.add(c);
      setMatched(next);
      setSelWord(null);
      setWrong(null);
      if (next.size === concepts.length) onSolved();
    } else {
      setWrong(c);
      setSelWord(null);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <>
      <div className="puzzle-note">Tap a word, then its cargo.</div>
      <div className="puzzle-row" data-testid="pairs-words">
        {words.map((c) => {
          const lx = db().lexemes[lang].get(c);
          return (
            <button
              key={c}
              type="button"
              className={`puzzle-tile puzzle-tile--text ${selWord === c ? 'puzzle-tile--selected' : ''} ${
                matched.has(c) ? 'puzzle-tile--locked' : ''
              }`}
              onClick={() => pickWord(c)}
            >
              {lx ? nounDisplay(lx) : c}
            </button>
          );
        })}
      </div>
      <div className="puzzle-row" data-testid="pairs-icons">
        {icons.map((c) => (
          <button
            key={c}
            type="button"
            className={`puzzle-tile ${matched.has(c) ? 'puzzle-tile--locked' : ''}`}
            style={wrong === c ? { borderColor: 'var(--red)' } : undefined}
            aria-label={db().concepts.get(c)?.gloss ?? c}
            onClick={() => pickIcon(c)}
          >
            {db().concepts.get(c)?.icon ?? '❓'}
          </button>
        ))}
      </div>
      {solved && <div className="puzzle-solved">Every declared word has its cargo — except the crate that never existed.</div>}
    </>
  );
}
