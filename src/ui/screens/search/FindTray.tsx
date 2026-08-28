/** The bottom tray: found counter + the round's word chips. */
import { useCallback } from 'react';
import { flipChip } from '../../../app/roundFlow';
import { speakConcept, speakText } from '../../../app/speak';
import { useRound } from '../../../state/roundStore';
import { useSettings } from '../../../state/settingsStore';
import { WordChip } from '../../components/WordChip';
import { ui } from '../../strings';
import type { ChipModel } from '../../../engine/rounds/present';

const FLIP_FACE_MS = 2600;

export function FindTray({ sceneName, nowTick }: { sceneName: string; nowTick: number }): JSX.Element | null {
  const chips = useRound((s) => s.chips);
  const state = useRound((s) => s.state);
  const flippedTargetId = useRound((s) => s.flippedTargetId);
  const flipAt = useRound((s) => s.flipAt);
  const leftHandedTray = useSettings((s) => s.leftHandedTray);

  const speakChip = useCallback((chip: ChipModel) => {
    if (chip.isEvidence) return;
    if (chip.conceptId) speakConcept(chip.conceptId, { plural: chip.plural });
    else speakText(chip.speech);
  }, []);

  const onFlip = useCallback((chip: ChipModel) => {
    flipChip(chip.targetId, Date.now());
  }, []);

  if (!state) return null;
  const foundCount = state.targets.filter((t) => state.progress[t.targetId]?.done).length;

  return (
    <div className="tray">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 6px 4px',
          fontSize: '0.82rem',
          color: 'rgba(242,232,212,0.7)',
        }}
      >
        <span data-testid="found-counter" aria-live="polite">
          {ui('found')} {foundCount}/{state.targets.length}
        </span>
        <span>{sceneName}</span>
      </div>
      <div
        className="tray__chips"
        style={{ flexDirection: leftHandedTray ? 'row-reverse' : 'row' }}
        role="list"
        aria-label="Find list"
      >
        {chips.map((chip) => {
          const pr = state.progress[chip.targetId];
          return (
            <WordChip
              key={chip.targetId}
              chip={chip}
              found={pr?.found ?? 0}
              done={pr?.done ?? false}
              flipped={flippedTargetId === chip.targetId && nowTick - flipAt < FLIP_FACE_MS}
              onSpeak={speakChip}
              onFlip={onFlip}
            />
          );
        })}
      </div>
    </div>
  );
}
