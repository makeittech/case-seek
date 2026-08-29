/** Station clock: set the hands to the telegram's riddle. */
import { useState } from 'react';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function ClockHands({ params, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const targetH = Number(params.hour ?? 12);
  const targetM = Number(params.minute ?? 0);
  const riddle = String(params.riddle ?? '');
  const [h, setH] = useState(12);
  const [m, setM] = useState(0);
  const [wrong, setWrong] = useState(false);

  const check = (): void => {
    if (h === targetH && m === targetM) onSolved();
    else setWrong(true);
  };

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = m * 6;

  return (
    <>
      <div className="puzzle-note">{riddle}</div>
      <svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label={`clock showing ${h}:${String(m).padStart(2, '0')}`}>
        <circle cx="100" cy="100" r="92" fill="#f2e8d4" stroke="#4a3f30" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={100 + Math.sin(a) * 78}
              y1={100 - Math.cos(a) * 78}
              x2={100 + Math.sin(a) * 86}
              y2={100 - Math.cos(a) * 86}
              stroke="#4a3f30"
              strokeWidth="4"
            />
          );
        })}
        <line
          x1="100"
          y1="100"
          x2={100 + Math.sin((hourAngle * Math.PI) / 180) * 46}
          y2={100 - Math.cos((hourAngle * Math.PI) / 180) * 46}
          stroke="#241d14"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="100"
          x2={100 + Math.sin((minuteAngle * Math.PI) / 180) * 68}
          y2={100 - Math.cos((minuteAngle * Math.PI) / 180) * 68}
          stroke="#8c3a2e"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="6" fill="#241d14" />
      </svg>
      <div className="puzzle-row" data-testid="clock-hands">
        <div className="dial">
          <span style={{ fontSize: '0.85rem' }}>hour</span>
          <button type="button" className="iconbtn" aria-label="hour up" onClick={() => !solved && setH((v) => (v % 12) + 1)}>
            ▲
          </button>
          <div className="dial__value">{h}</div>
          <button type="button" className="iconbtn" aria-label="hour down" onClick={() => !solved && setH((v) => ((v + 10) % 12) + 1)}>
            ▼
          </button>
        </div>
        <div className="dial">
          <span style={{ fontSize: '0.85rem' }}>minute</span>
          <button type="button" className="iconbtn" aria-label="minute up" onClick={() => !solved && setM((v) => (v + 5) % 60)}>
            ▲
          </button>
          <div className="dial__value">{String(m).padStart(2, '0')}</div>
          <button type="button" className="iconbtn" aria-label="minute down" onClick={() => !solved && setM((v) => (v + 55) % 60)}>
            ▼
          </button>
        </div>
      </div>
      {!solved && (
        <button type="button" className="btn" onClick={check} data-testid="btn-clock-check">
          Set the hands
        </button>
      )}
      {wrong && <div className="puzzle-note">The clock disagrees with the telegram.</div>}
      {solved && <div className="puzzle-solved">05:40, Sunday. The ferry tables agree.</div>}
    </>
  );
}
