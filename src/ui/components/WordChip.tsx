/**
 * The single chip component: renders every ChipModel kind (word, word-gloss,
 * phrase, audio, silhouette, evidence). Tap = speak; flip = translation face
 * (logged separately from search hints per GDD Principle 7).
 */
import { useEffect, useState } from 'react';
import type { ChipModel } from '../../engine/rounds/present';
import { useSettings } from '../../state/settingsStore';

interface Props {
  chip: ChipModel;
  found: number;
  done: boolean;
  flipped: boolean;
  onSpeak(chip: ChipModel): void;
  onFlip(chip: ChipModel): void;
}

const FLIP_FACE_MS = 2600;

export function WordChip({ chip, found, done, flipped, onSpeak, onFlip }: Props): JSX.Element {
  const genderTint = useSettings((s) => s.genderTint);
  const [showGloss, setShowGloss] = useState(false);

  useEffect(() => {
    if (!flipped) return;
    setShowGloss(true);
    const t = window.setTimeout(() => setShowGloss(false), FLIP_FACE_MS);
    return () => window.clearTimeout(t);
  }, [flipped]);

  const tint =
    genderTint && chip.glyph
      ? chip.glyph === '▲'
        ? 'chip--tint-masc'
        : chip.glyph === '●'
          ? 'chip--tint-fem'
          : 'chip--tint-neut'
      : '';

  const classes = [
    'chip',
    tint,
    done ? 'chip--found' : '',
    chip.isEvidence ? 'chip--evidence' : '',
    chip.kind === 'silhouette' ? 'chip--silhouette' : '',
    chip.kind === 'audio' ? 'chip--audio' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const face = showGloss && !chip.isEvidence ? chip.gloss : null;

  return (
    <div className={classes} data-testid={`chip-${chip.targetId}`} data-done={done ? '1' : '0'}>
      {chip.glyph && !chip.isEvidence && chip.kind !== 'silhouette' && (
        <span className="chip__glyph" aria-hidden="true">
          {chip.glyph}
        </span>
      )}
      {chip.count > 1 && (
        <span className="chip__count">
          {found}/{chip.count}
        </span>
      )}
      <button
        type="button"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        onClick={() => onSpeak(chip)}
        aria-label={`${chip.isEvidence ? chip.gloss : chip.display}${done ? ', found' : ''}`}
        disabled={done}
      >
        {face ? (
          <span className="chip__gloss">{face}</span>
        ) : chip.kind === 'silhouette' ? (
          <span className="chip__icon" aria-hidden="true">
            {chip.icon}
          </span>
        ) : chip.kind === 'audio' ? (
          <span className="chip__display" aria-hidden="true">
            🔊
          </span>
        ) : (
          <span className="chip__display">{chip.display}</span>
        )}
        {chip.kind === 'word-gloss' && !face && <span className="chip__gloss">{chip.gloss}</span>}
      </button>
      {!chip.isEvidence && chip.kind !== 'word-gloss' && !done && (
        <button
          type="button"
          className="chip__flip"
          onClick={() => onFlip(chip)}
          aria-label={`Translate ${chip.kind === 'audio' || chip.kind === 'silhouette' ? 'this item' : chip.display}`}
        >
          ⇄
        </button>
      )}
      {done && (
        <span className="chip__check" aria-hidden="true">
          ✓
        </span>
      )}
    </div>
  );
}
