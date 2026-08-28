/**
 * Dialogue beat: lines reveal one tap at a time; garnish tokens gloss on tap;
 * flavor choices (dry/warm) close some beats. Data-driven from content/dialogue.
 */
import { useEffect, useRef, useState } from 'react';
import { db } from '../../app/content';
import { useCase } from '../../state/caseStore';
import { completeBeat, logGlossTap, renderLine, type RenderedLine } from '../../app/storyFlow';
import { ui } from '../strings';
import { TopBar } from '../components/TopBar';

interface TipState {
  text: string;
  gloss: string;
  x: number;
  y: number;
}

export function BeatScreen({ beatId }: { beatId: string }): JSX.Element {
  const row = useCase((s) => s.row);
  const beat = db().beats.get(beatId);
  const [shown, setShown] = useState(1);
  const [tip, setTip] = useState<TipState | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShown(1);
    setTip(null);
  }, [beatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [shown]);

  useEffect(() => {
    if (!tip) return;
    const t = window.setTimeout(() => setTip(null), 2600);
    return () => window.clearTimeout(t);
  }, [tip]);

  if (!beat || !row) {
    return (
      <main className="screen">
        <TopBar title="…" />
      </main>
    );
  }

  const rendered: RenderedLine[] = beat.lines.map((l) => renderLine(l, row.tier));
  const allShown = shown >= rendered.length;

  const advance = (): void => {
    if (!allShown) setShown((n) => Math.min(rendered.length, n + 1));
  };

  return (
    <main className="screen fade-in" data-testid="beat-screen">
      <TopBar title={beat.title} />
      <div
        className="screen-inner"
        style={{ flex: 1, minHeight: 0 }}
        onClick={advance}
        role="presentation"
      >
        <div className="beat-lines" aria-live="polite">
          {rendered.slice(0, shown).map((line, i) => (
            <BeatLine key={i} line={line} onTip={setTip} />
          ))}
          <div ref={endRef} />
        </div>
        <div className="beat-continue">
          {!allShown && (
            <button type="button" className="btn btn--ghost" data-testid="btn-beat-next" onClick={advance}>
              {ui('continueStory')} ▸
            </button>
          )}
          {allShown && beat.flavorChoice ? (
            <>
              <button
                type="button"
                className="btn"
                data-testid="btn-beat-dry"
                onClick={(e) => {
                  e.stopPropagation();
                  completeBeat(beatId, 'dry');
                }}
              >
                {beat.flavorChoice.dry}
              </button>
              <button
                type="button"
                className="btn"
                data-testid="btn-beat-warm"
                onClick={(e) => {
                  e.stopPropagation();
                  completeBeat(beatId, 'warm');
                }}
              >
                {beat.flavorChoice.warm}
              </button>
            </>
          ) : allShown ? (
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-beat-continue"
              onClick={(e) => {
                e.stopPropagation();
                completeBeat(beatId);
              }}
            >
              {ui('continueStory')}
            </button>
          ) : null}
        </div>
      </div>
      {tip && (
        <div
          className="garnish-tip"
          style={{ left: Math.min(tip.x, window.innerWidth - 270), top: tip.y + 12 }}
          role="tooltip"
        >
          <strong>{tip.text}</strong> — {tip.gloss}
        </div>
      )}
    </main>
  );
}

function BeatLine({ line, onTip }: { line: RenderedLine; onTip(t: TipState): void }): JSX.Element {
  const cast = db().castById.get(line.speaker);
  const isNarration = line.speaker === 'narration' || line.speaker === 'letter';

  // split rendered text around «token» to make the token tappable
  const parts: (string | { tok: string })[] = [];
  if (line.token) {
    const marker = `«${line.token.text.split(' ').pop() ?? line.token.text}»`;
    const fullMarker = `«${line.token.text}»`;
    const target = line.text.includes(fullMarker) ? fullMarker : marker;
    const idx = line.text.indexOf(target);
    if (idx >= 0) {
      if (idx > 0) parts.push(line.text.slice(0, idx));
      parts.push({ tok: target });
      if (idx + target.length < line.text.length) parts.push(line.text.slice(idx + target.length));
    } else {
      parts.push(line.text);
    }
  } else {
    parts.push(line.text);
  }

  return (
    <div className={`beat-line ${isNarration ? 'beat-line--narration' : ''}`}>
      {!isNarration && (
        <div className="beat-line__portrait" aria-hidden="true">
          {cast?.icon ?? '👤'}
        </div>
      )}
      <div className="beat-line__bubble">
        {!isNarration && line.speakerName && <div className="beat-line__speaker">{line.speakerName}</div>}
        <span>
          {parts.map((p, i) =>
            typeof p === 'string' ? (
              <span key={i}>{p}</span>
            ) : (
              <button
                key={i}
                type="button"
                className="garnish"
                onClick={(e) => {
                  e.stopPropagation();
                  logGlossTap(line.token?.conceptId);
                  onTip({
                    text: line.token!.text,
                    gloss: line.token!.gloss,
                    x: e.clientX,
                    y: e.clientY,
                  });
                }}
              >
                {p.tok}
              </button>
            ),
          )}
        </span>
      </div>
    </div>
  );
}
