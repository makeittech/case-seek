/** Evidence close-up: the pin ritual before the clue joins the notebook. */
import { db } from '../../../app/content';
import { pinPendingClue } from '../../../app/roundFlow';
import { clueCaption } from '../../../app/storyFlow';
import { useRound } from '../../../state/roundStore';
import { useModal } from '../../components/useModal';
import { ui } from '../../strings';
import type { Clue } from '../../../engine/content/schemas';

export function EvidenceOverlay(): JSX.Element | null {
  const pendingClue = useRound((s) => s.pendingClue);
  const clue = pendingClue ? db().clues.get(pendingClue) : null;
  if (!clue) return null;
  return <EvidenceCard clue={clue} />;
}

// separate component so useModal runs only while the card is up
function EvidenceCard({ clue }: { clue: Clue }): JSX.Element {
  // the pin is a mandatory ritual: no Escape/close path by design
  const modalRef = useModal<HTMLDivElement>({ initialFocus: '[data-testid="btn-pin-clue"]' });
  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={clue.name} ref={modalRef}>
      <div className="paper evidence-card" data-testid="evidence-card">
        <div className="evidence-card__icon" aria-hidden="true">
          {clue.icon}
        </div>
        <div className="evidence-card__name">{clue.name}</div>
        {clueCaption(clue) && <div className="margin-note">{clueCaption(clue)}</div>}
        <div className="evidence-card__note margin-note">{clue.note}</div>
        <button type="button" className="btn btn--primary" data-testid="btn-pin-clue" onClick={pinPendingClue}>
          📌 {ui('clue.pin')}
        </button>
      </div>
    </div>
  );
}
