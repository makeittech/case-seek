/** Round results: stamps + the choice between Margo's debrief and skipping. */
import { useUi } from '../../state/uiStore';
import { useCase } from '../../state/caseStore';
import { skipDebrief } from '../../app/roundFlow';
import { db } from '../../app/content';
import { ui } from '../strings';

export function ResultsScreen({ roundId }: { roundId: string }): JSX.Element {
  const goto = useUi((s) => s.goto);
  const row = useCase((s) => s.row);
  const pending = row?.pendingDebrief;
  const template = db().rounds.get(roundId);
  const flavor = template?.debriefFlavor;

  const stamps = pending?.stamps ?? { accuracy: false, unassisted: false, streak: false };

  return (
    <main className="screen screen--scroll fade-in" data-testid="results-screen">
      <div className="screen-inner" style={{ justifyContent: 'center' }}>
        <div className="paper">
          <h2>{ui('results.title')}</h2>
          {pending && (
            <p>
              {pending.foundConcepts.length} words found
              {pending.clueId ? ` · evidence pinned: ${db().clues.get(pending.clueId)?.name ?? ''}` : ''}
            </p>
          )}
          <div className="stamps">
            <span className={`stamp ${stamps.accuracy ? 'stamp--earned' : ''}`}>Sharp eye</span>
            <span className={`stamp ${stamps.unassisted ? 'stamp--earned' : ''}`}>No lens</span>
            <span className={`stamp ${stamps.streak ? 'stamp--earned' : ''}`}>On a streak</span>
          </div>
          {flavor && <p className="margin-note">{flavor}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-debrief"
              onClick={() => goto({ kind: 'debrief', roundId })}
            >
              {ui('results.debrief')}
            </button>
            <button type="button" className="btn btn--ghost" data-testid="btn-skip-debrief" onClick={skipDebrief}>
              {ui('results.skip')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
