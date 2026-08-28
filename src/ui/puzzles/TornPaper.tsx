/** Torn paper: reassemble the caption fragments by tap-to-swap. */
import { useMemo, useState } from 'react';
import { mulberry32 } from '../../engine/rand';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function TornPaper({ params, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const caption = String(params.caption ?? '');
  const pieceCount = Number(params.pieces ?? 6);

  const pieces = useMemo(() => {
    const words = caption.split(' ');
    const per = Math.ceil(words.length / pieceCount);
    const out: string[] = [];
    for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per).join(' '));
    return out;
  }, [caption, pieceCount]);

  const [order, setOrder] = useState<number[]>(() => {
    const rng = mulberry32(caption.length * 7 + 13);
    const idx = pieces.map((_, i) => i);
    // Fisher–Yates, deterministic; reshuffle once if it lands solved
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [idx[i], idx[j]] = [idx[j]!, idx[i]!];
    }
    if (idx.every((v, i) => v === i) && idx.length > 1) [idx[0], idx[1]] = [idx[1]!, idx[0]!];
    return idx;
  });
  const [sel, setSel] = useState<number | null>(null);

  const tap = (slot: number): void => {
    if (solved) return;
    if (sel === null) {
      setSel(slot);
      return;
    }
    const next = [...order];
    [next[sel], next[slot]] = [next[slot]!, next[sel]!];
    setOrder(next);
    setSel(null);
    if (next.every((v, i) => v === i)) onSolved();
  };

  return (
    <>
      <div className="puzzle-note">Tap two fragments to swap them until the note reads true.</div>
      <div className="puzzle-row" data-testid="torn-paper">
        {order.map((pieceIdx, slot) => (
          <button
            key={slot}
            type="button"
            className={`puzzle-tile puzzle-tile--text ${sel === slot ? 'puzzle-tile--selected' : ''} ${
              solved ? 'puzzle-tile--locked' : ''
            }`}
            onClick={() => tap(slot)}
          >
            {pieces[pieceIdx]}
          </button>
        ))}
      </div>
      {solved && <div className="puzzle-solved">“{caption}”</div>}
    </>
  );
}
