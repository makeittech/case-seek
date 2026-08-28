/** The find-moment word card: word + gloss + caution + replay audio. */
import { useEffect, type RefObject } from 'react';
import { speakConcept } from '../../../app/speak';
import { useRound } from '../../../state/roundStore';

const WORD_CARD_MS = 2600;

export function WordCardOverlay({ stageRef }: { stageRef: RefObject<HTMLDivElement> }): JSX.Element | null {
  const wordCard = useRound((s) => s.wordCard);

  // auto-dismiss
  useEffect(() => {
    if (!wordCard) return;
    const t = window.setTimeout(() => useRound.getState().setAll({ wordCard: null }), WORD_CARD_MS);
    return () => window.clearTimeout(t);
  }, [wordCard]);

  if (!wordCard) return null;
  return (
    <div
      className="word-card"
      style={{
        left: Math.max(8, Math.min(wordCard.screenX - 110, (stageRef.current?.clientWidth ?? 320) - 240)),
        top: Math.max(8, wordCard.screenY - 110),
      }}
      data-testid="word-card"
    >
      <div className="word-card__word">{wordCard.display}</div>
      <div className="word-card__gloss">{wordCard.chip.gloss}</div>
      {wordCard.chip.caution && <div className="word-card__caution">{wordCard.chip.caution}</div>}
      {wordCard.speech && (
        <button
          type="button"
          className="iconbtn"
          aria-label="Hear it again"
          style={{ marginTop: 6 }}
          onClick={() => {
            if (wordCard.chip.conceptId) speakConcept(wordCard.chip.conceptId, { plural: wordCard.chip.plural, slow: true });
          }}
        >
          🔊
        </button>
      )}
    </div>
  );
}
