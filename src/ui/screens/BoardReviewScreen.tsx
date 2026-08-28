/** The evidence board: pick the two pins that connect; draw the string. */
import { useState } from 'react';
import { db } from '../../app/content';
import { completeBoardReview } from '../../app/storyFlow';
import { ui } from '../strings';
import { TopBar } from '../components/TopBar';

export function BoardReviewScreen({ brId }: { brId: string }): JSX.Element {
  const br = db().boardReviews.get(brId);
  const [selected, setSelected] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [solvedLine, setSolvedLine] = useState<string | null>(null);

  if (!br) return <main className="screen" />;

  const toggle = (id: string): void => {
    if (solvedLine) return;
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((c) => c !== id) : cur.length >= 2 ? [cur[1]!, id] : [...cur, id],
    );
  };

  const confirm = (): void => {
    if (selected.length !== 2) return;
    const [a, b] = selected as [string, string];
    const ok =
      (a === br.pair[0] && b === br.pair[1]) || (a === br.pair[1] && b === br.pair[0]);
    if (ok) {
      setSolvedLine(br.line);
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 350);
      setSelected([]);
    }
  };

  return (
    <main className="screen screen--scroll fade-in" data-testid="board-review-screen">
      <TopBar title={ui('board.title')} />
      <div className="screen-inner">
        <p className="select-heading">{br.prompt}</p>
        <div className={`board ${shake ? 'board--shake' : ''}`}>
          {br.pins.map((pinId, i) => {
            const clue = db().clues.get(pinId);
            return (
              <button
                key={pinId}
                type="button"
                className={`board-pin ${selected.includes(pinId) ? 'board-pin--selected' : ''}`}
                style={{ ['--tilt' as never]: `${((i % 3) - 1) * 2}deg` }}
                data-testid={`pin-${pinId}`}
                aria-pressed={selected.includes(pinId)}
                onClick={() => toggle(pinId)}
              >
                <div className="board-pin__icon" aria-hidden="true">
                  {clue?.icon}
                </div>
                <div className="board-pin__name">{clue?.name}</div>
                <div className="margin-note" style={{ fontSize: '0.75rem' }}>
                  {clue?.note}
                </div>
              </button>
            );
          })}
        </div>
        {solvedLine ? (
          <div className="paper fade-in">
            <p className="margin-note" style={{ fontSize: '1.05rem' }}>
              {solvedLine}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-board-continue"
              onClick={() => completeBoardReview(brId)}
            >
              {ui('continueStory')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-board-confirm"
              disabled={selected.length !== 2}
              onClick={confirm}
            >
              {ui('board.confirm')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
