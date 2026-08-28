/** Silhouette sort: place every object into its outline in the travel-case. */
import { useMemo, useState } from 'react';
import { db } from '../../app/content';
import { speakConcept } from '../../app/speak';
import { mulberry32, shuffle } from '../../engine/rand';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function SilhouetteSort({ params, lang, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const concepts = (params.concepts as string[]) ?? [];
  const slots = useMemo(() => shuffle(concepts, mulberry32(23)), [concepts]);
  const tokens = useMemo(() => shuffle(concepts, mulberry32(59)), [concepts]);
  const [held, setHeld] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());

  const pickToken = (c: string): void => {
    if (placed.has(c) || solved) return;
    setHeld(c);
    speakConcept(c, {});
  };

  const pickSlot = (c: string): void => {
    if (!held || placed.has(c) || solved) return;
    if (c === held) {
      const next = new Set(placed);
      next.add(c);
      setPlaced(next);
      setHeld(null);
      if (next.size === concepts.length) onSolved();
    } else {
      setHeld(null);
    }
  };

  return (
    <>
      <div className="puzzle-note">Pick an object, then its outline.</div>
      <div className="puzzle-row" aria-label="objects" data-testid="silhouette-tokens">
        {tokens.map((c) => (
          <button
            key={c}
            type="button"
            className={`puzzle-tile ${held === c ? 'puzzle-tile--selected' : ''} ${
              placed.has(c) ? 'puzzle-tile--locked' : ''
            }`}
            aria-label={db().lexemes[lang].get(c)?.word ?? c}
            onClick={() => pickToken(c)}
          >
            {db().concepts.get(c)?.icon ?? '❓'}
          </button>
        ))}
      </div>
      <div className="puzzle-row" aria-label="outlines" data-testid="silhouette-slots">
        {slots.map((c) => (
          <button
            key={c}
            type="button"
            className={`puzzle-tile ${placed.has(c) ? 'puzzle-tile--locked' : ''}`}
            aria-label={`outline of ${db().concepts.get(c)?.gloss ?? c}`}
            onClick={() => pickSlot(c)}
          >
            <span style={placed.has(c) ? undefined : { filter: 'brightness(0) opacity(0.75)' }}>
              {db().concepts.get(c)?.icon ?? '❓'}
            </span>
          </button>
        ))}
      </div>
      {solved && <div className="puzzle-solved">Velvet over brass, exactly as Casal would insist.</div>}
    </>
  );
}
