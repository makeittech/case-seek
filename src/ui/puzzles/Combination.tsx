/** Combination lock: three dials, a hint line, and a satisfying clunk. */
import { useState } from 'react';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function Combination({ params, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const digits = (params.digits as number[]) ?? [0, 0, 0];
  const hint = String(params.hint ?? '');
  const [dials, setDials] = useState<number[]>(digits.map(() => 0));
  const [missed, setMissed] = useState(false);

  const bump = (i: number, d: number): void => {
    if (solved) return;
    setDials((cur) => cur.map((v, k) => (k === i ? (v + d + 10) % 10 : v)));
    setMissed(false);
  };

  const check = (): void => {
    if (dials.every((v, i) => v === digits[i])) onSolved();
    else setMissed(true);
  };

  return (
    <>
      <div className="puzzle-note">{hint}</div>
      <div className="puzzle-row" data-testid="combination">
        {dials.map((v, i) => (
          <div key={i} className="dial">
            <button type="button" className="iconbtn" aria-label={`dial ${i + 1} up`} onClick={() => bump(i, 1)}>
              ▲
            </button>
            <div className="dial__value">{v}</div>
            <button type="button" className="iconbtn" aria-label={`dial ${i + 1} down`} onClick={() => bump(i, -1)}>
              ▼
            </button>
          </div>
        ))}
      </div>
      {!solved && (
        <button type="button" className="btn" onClick={check} data-testid="btn-combo-try">
          Try the lock
        </button>
      )}
      {missed && <div className="puzzle-note">The lock holds. Read the room again.</div>}
      {solved && <div className="puzzle-solved">Clunk. The lid lifts.</div>}
    </>
  );
}
