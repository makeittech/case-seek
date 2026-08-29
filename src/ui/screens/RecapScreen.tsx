/** Chapter recap: field-notes montage of the chapter's shakiest words. */
import { useMemo } from 'react';
import { recapWords } from '../../app/roundFlow';
import { advanceFlow } from '../../app/flow';
import { speakConcept } from '../../app/speak';
import { db } from '../../app/content';
import { ui } from '../strings';

export function RecapScreen({ chapter }: { chapter: number }): JSX.Element {
  const words = useMemo(() => recapWords(), []);
  const title = db().season.chapters.find((c) => c.n === chapter)?.title ?? '';

  return (
    <main className="screen screen--scroll fade-in" data-testid="recap-screen">
      <div className="screen-inner" style={{ justifyContent: 'center' }}>
        <div className="paper">
          <h2>
            {ui('recap.title')} — Chapter {chapter}
          </h2>
          <p className="margin-note">“{title}” — the words that wobbled. Tap to hear them once more.</p>
          <div className="recap-grid">
            {words.map((w) => (
              <button
                key={w.conceptId}
                type="button"
                className="paper recap-word"
                onClick={() => speakConcept(w.conceptId, {})}
              >
                <div className="recap-word__icon" aria-hidden="true">
                  {w.icon}
                </div>
                <div className="recap-word__display">{w.display}</div>
                <div className="recap-word__gloss">{w.gloss}</div>
              </button>
            ))}
            {words.length === 0 && <p className="margin-note">Every word held steady. Margo is suspicious.</p>}
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn btn--primary" data-testid="btn-recap-continue" onClick={advanceFlow}>
              {ui('recap.continue')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
