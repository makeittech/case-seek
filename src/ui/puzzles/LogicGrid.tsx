/** Logic grid: seat each auction lot against its provenance statement. */
import { useState } from 'react';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function LogicGrid({ params, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const lots = (params.lots as string[]) ?? [];
  const statements = (params.statements as string[]) ?? [];
  const solution = (params.solution as number[]) ?? [];
  const [assign, setAssign] = useState<(number | null)[]>(() => lots.map(() => null));
  const [wrong, setWrong] = useState(false);

  const cycle = (lotIdx: number): void => {
    if (solved) return;
    setWrong(false);
    setAssign((cur) => {
      const next = [...cur];
      const from = next[lotIdx] ?? null;
      const start = from === null ? 0 : from + 1;
      let pick: number | null = null;
      for (let k = 0; k <= statements.length; k++) {
        const cand = start + k;
        if (cand >= statements.length) {
          pick = null;
          break;
        }
        if (!next.some((v, i) => i !== lotIdx && v === cand)) {
          pick = cand;
          break;
        }
      }
      next[lotIdx] = pick;
      return next;
    });
  };

  const check = (): void => {
    if (assign.every((v, i) => v === solution[i])) onSolved();
    else setWrong(true);
  };

  return (
    <>
      <div className="puzzle-note">Tap a lot to cycle its provenance statement. Every statement seats once.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }} data-testid="logic-grid">
        {lots.map((lot, i) => (
          <button
            key={i}
            type="button"
            className={`puzzle-tile puzzle-tile--text ${solved ? 'puzzle-tile--locked' : ''}`}
            style={{ maxWidth: 'none', width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: 10 }}
            onClick={() => cycle(i)}
          >
            <strong style={{ whiteSpace: 'nowrap' }}>{lot}</strong>
            <span style={{ opacity: assign[i] === null ? 0.5 : 1 }}>
              → {assign[i] === null ? 'unassigned' : statements[assign[i]!]}
            </span>
          </button>
        ))}
      </div>
      {!solved && (
        <button
          type="button"
          className="btn"
          onClick={check}
          disabled={assign.some((v) => v === null)}
          data-testid="btn-grid-check"
        >
          Compare against the notebook
        </button>
      )}
      {wrong && <div className="puzzle-note">The porter cousin shakes his head. Try again.</div>}
      {solved && <div className="puzzle-solved">The Trust has consigned Vane material for years.</div>}
    </>
  );
}
