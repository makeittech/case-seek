/** Cipher wheel: rotate until the keyed entry speaks the bird's name. */
import { useMemo, useState } from 'react';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SHIFT = 7;

function shiftChar(ch: string, by: number): string {
  const i = ALPHA.indexOf(ch);
  if (i < 0) return ch; // accents/Ñ pass through untouched
  return ALPHA[(i + by + 26 * 4) % 26]!;
}

export function CipherWheel({ params, lang, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const solutions = (params.solutionByLang as Record<string, string>) ?? {};
  const gloss = String(params.gloss ?? '');
  const solution = (solutions[lang] ?? 'NIGHTINGALE').toUpperCase();
  const encoded = useMemo(
    () => solution.split('').map((c) => shiftChar(c, SHIFT)).join(''),
    [solution],
  );
  const [offset, setOffset] = useState(0);

  const decoded = encoded
    .split('')
    .map((c) => shiftChar(c, -offset))
    .join('');

  const turn = (d: number): void => {
    if (solved) return;
    const next = (offset + d + 26) % 26;
    setOffset(next);
    const dec = encoded
      .split('')
      .map((c) => shiftChar(c, -next))
      .join('');
    if (dec === solution) onSolved();
  };

  return (
    <>
      <div className="puzzle-note">
        The keyed entry reads <strong>{encoded}</strong>. Turn the wheel until it names the bird ({gloss}).
      </div>
      <div className="puzzle-row" data-testid="cipher-wheel">
        <button type="button" className="iconbtn" aria-label="Turn wheel back" onClick={() => turn(-1)}>
          ↺
        </button>
        <div className="dial__value" style={{ minWidth: 220, letterSpacing: '0.2em', fontSize: '1.4rem' }}>
          {decoded}
        </div>
        <button type="button" className="iconbtn" aria-label="Turn wheel forward" onClick={() => turn(1)}>
          ↻
        </button>
      </div>
      <div className="puzzle-note">Wheel offset: {offset}</div>
      {solved && <div className="puzzle-solved">The wheel clicks — {solution}. The ledger knows the name.</div>}
    </>
  );
}
