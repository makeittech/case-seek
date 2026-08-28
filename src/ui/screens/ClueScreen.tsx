/** Full-screen clue close-up (puzzle rewards route here with back='flow'). */
import { useUi } from '../../state/uiStore';
import { advanceFlow } from '../../app/flow';
import { db } from '../../app/content';
import { clueCaption } from '../../app/storyFlow';
import { ui } from '../strings';

export function ClueScreen({ clueId, back }: { clueId: string; back: 'search' | 'flow' | 'notebook' }): JSX.Element {
  const goto = useUi((s) => s.goto);
  const clue = db().clues.get(clueId);

  const onContinue = (): void => {
    if (back === 'flow') advanceFlow();
    else goto({ kind: 'map' });
  };

  if (!clue) {
    onContinue();
    return <></>;
  }

  return (
    <main className="screen fade-in" data-testid="clue-screen">
      <div className="screen-inner" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="paper evidence-card">
          <div className="evidence-card__icon" aria-hidden="true">
            {clue.icon}
          </div>
          <div className="evidence-card__name">{clue.name}</div>
          {clueCaption(clue) && <div className="margin-note">{clueCaption(clue)}</div>}
          <div className="evidence-card__note margin-note">{clue.note}</div>
          <button type="button" className="btn btn--primary" data-testid="btn-clue-continue" onClick={onContinue}>
            {ui('continueStory')}
          </button>
        </div>
      </div>
    </main>
  );
}
