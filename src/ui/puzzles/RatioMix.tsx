/** Pigment bench: measure the three parts to the bench's last recorded mix. */
import { useState } from 'react';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function RatioMix({ params, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const target = (params.target as Record<string, number>) ?? {};
  const labels = (params.labels as Record<string, string>) ?? {};
  const resultColor = String(params.resultColor ?? '#3f6d3a');
  const keys = Object.keys(target);
  const [amounts, setAmounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k, 0])),
  );
  const [muddy, setMuddy] = useState(false);

  const bump = (k: string, d: number): void => {
    if (solved) return;
    setAmounts((cur) => ({ ...cur, [k]: Math.max(0, Math.min(6, (cur[k] ?? 0) + d)) }));
    setMuddy(false);
  };

  const mix = (): void => {
    const ok = keys.every((k) => amounts[k] === target[k]);
    if (ok) onSolved();
    else setMuddy(true);
  };

  return (
    <>
      <div className="puzzle-note">
        The bench notes read: {keys.map((k) => `${target[k]} part${(target[k] ?? 0) > 1 ? 's' : ''} ${labels[k] ?? k}`).join(' · ')}
      </div>
      <div className="puzzle-row" data-testid="ratio-mix">
        {keys.map((k) => (
          <div key={k} className="dial">
            <span style={{ fontSize: '0.85rem' }}>{labels[k] ?? k}</span>
            <button type="button" className="iconbtn" aria-label={`more ${labels[k] ?? k}`} onClick={() => bump(k, 1)}>
              ▲
            </button>
            <div className="dial__value">{amounts[k]}</div>
            <button type="button" className="iconbtn" aria-label={`less ${labels[k] ?? k}`} onClick={() => bump(k, -1)}>
              ▼
            </button>
          </div>
        ))}
      </div>
      {!solved && (
        <button type="button" className="btn" onClick={mix} data-testid="btn-mix">
          Mix it
        </button>
      )}
      {muddy && <div className="puzzle-note">A muddy brown. That is not what the bench remembers.</div>}
      {solved && (
        <div className="puzzle-solved" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: resultColor,
              display: 'inline-block',
              border: '2px solid var(--ink)',
            }}
          />
          The green. The answer is the green.
        </div>
      )}
    </>
  );
}
