/**
 * Puzzle shell: prompt in Halloway's hand, the mechanic body, and the
 * "Let Margo handle it" skip (records the skip note in CLUES). Nine
 * mechanics — all data-driven from content/puzzles/*.json params.
 */
import { useState } from 'react';
import { db } from '../../app/content';
import { useCase } from '../../state/caseStore';
import { completePuzzle } from '../../app/storyFlow';
import { getServices } from '../../services';
import { ui } from '../strings';
import { TopBar } from '../components/TopBar';
import { TornPaper } from '../puzzles/TornPaper';
import { Combination } from '../puzzles/Combination';
import { Pairs } from '../puzzles/Pairs';
import { CipherWheel } from '../puzzles/CipherWheel';
import { SilhouetteSort } from '../puzzles/SilhouetteSort';
import { LightSequence } from '../puzzles/LightSequence';
import { RatioMix } from '../puzzles/RatioMix';
import { LogicGrid } from '../puzzles/LogicGrid';
import { ClockHands } from '../puzzles/ClockHands';

export function PuzzleScreen({ puzzleId }: { puzzleId: string }): JSX.Element {
  const puzzle = db().puzzles.get(puzzleId);
  const row = useCase((s) => s.row);
  const [solved, setSolved] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);

  if (!puzzle || !row) return <main className="screen" />;

  const onSolved = (): void => {
    if (solved) return;
    setSolved(true);
    getServices().audio.sfx('chime');
  };

  const body = (() => {
    const p = { params: puzzle.params, lang: row.lang, onSolved, solved };
    switch (puzzle.mechanic) {
      case 'torn-paper':
        return <TornPaper {...p} />;
      case 'combination':
        return <Combination {...p} />;
      case 'pairs':
        return <Pairs {...p} />;
      case 'cipher-wheel':
        return <CipherWheel {...p} />;
      case 'silhouette-sort':
        return <SilhouetteSort {...p} />;
      case 'light-sequence':
        return <LightSequence {...p} />;
      case 'ratio-mix':
        return <RatioMix {...p} />;
      case 'logic-grid':
        return <LogicGrid {...p} />;
      case 'clock-hands':
        return <ClockHands {...p} />;
    }
  })();

  return (
    <main className="screen screen--scroll fade-in" data-testid="puzzle-screen">
      <TopBar title={puzzle.title} />
      <div className="screen-inner">
        <p className="select-heading margin-note" style={{ color: 'var(--paper-dim)' }}>
          {puzzle.prompt}
        </p>
        <div className="paper puzzle-body">{body}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {solved ? (
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-puzzle-continue"
              onClick={() => completePuzzle(puzzleId, false)}
            >
              {ui('puzzle.solve')} — {ui('continueStory')}
            </button>
          ) : confirmSkip ? (
            <>
              <span style={{ alignSelf: 'center', fontStyle: 'italic', color: 'var(--paper-dim)' }}>
                Margo raises an eyebrow…
              </span>
              <button
                type="button"
                className="btn"
                data-testid="btn-puzzle-skip-confirm"
                onClick={() => completePuzzle(puzzleId, true)}
              >
                {ui('puzzle.skip')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmSkip(false)}>
                Keep trying
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn--ghost"
              data-testid="btn-puzzle-skip"
              onClick={() => setConfirmSkip(true)}
            >
              {ui('puzzle.skip')}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export interface PuzzleBodyProps {
  params: Record<string, unknown>;
  lang: 'de' | 'es' | 'it';
  solved: boolean;
  onSolved(): void;
}
