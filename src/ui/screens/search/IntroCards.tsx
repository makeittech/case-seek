/** Pre-round "New word" intro cards for the New tier (LANG §5.1). */
import { useEffect, useState } from 'react';
import { db } from '../../../app/content';
import { speakConcept } from '../../../app/speak';
import { nounDisplay } from '../../../engine/content/loader';
import { useCase } from '../../../state/caseStore';

export function IntroCards({ queue, onDone }: { queue: string[]; onDone(): void }): JSX.Element {
  const [i, setI] = useState(0);
  const row = useCase((s) => s.row);
  const conceptId = queue[i];
  useEffect(() => {
    if (conceptId) speakConcept(conceptId, {});
  }, [conceptId]);
  if (!conceptId || !row) {
    onDone();
    return <></>;
  }
  const concept = db().concepts.get(conceptId);
  const lx = db().lexemes[row.lang].get(conceptId);
  return (
    <div className="search-overlay" role="dialog" aria-label="New words">
      <div className="paper intro-card" data-testid="intro-card">
        <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
          New word {i + 1} of {queue.length}
        </div>
        <div className="intro-card__icon" aria-hidden="true">
          {concept?.icon}
        </div>
        <div className="intro-card__word">{lx ? nounDisplay(lx) : conceptId}</div>
        <div className="intro-card__gloss">{lx?.gloss ?? concept?.gloss}</div>
        {lx?.caution && <div className="word-card__caution">{lx.caution}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            className="iconbtn"
            aria-label="Hear it again, slowly"
            onClick={() => speakConcept(conceptId, { slow: true })}
          >
            🔊
          </button>
          <button
            type="button"
            className="btn btn--primary"
            data-testid="btn-intro-next"
            onClick={() => {
              if (i + 1 >= queue.length) onDone();
              else setI(i + 1);
            }}
          >
            {i + 1 >= queue.length ? 'Start searching' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
