/**
 * Margo's debrief: 3–5 quick items (word→picture, audio→picture, article
 * pick). Correct answers bank Insight; misses re-teach with audio.
 */
import { useEffect, useMemo, useState } from 'react';
import { answerDebrief, buildDebriefItems, finishDebrief, type DebriefItemView } from '../../app/roundFlow';
import { joinArticle } from '../../engine/content/loader';
import { speakConcept } from '../../app/speak';
import { ui } from '../strings';

export function DebriefScreen({ roundId }: { roundId: string }): JSX.Element {
  const items = useMemo(() => buildDebriefItems(roundId), [roundId]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const done = index >= items.length;
  const item = done ? null : items[index] ?? null;

  useEffect(() => {
    setPicked(null);
    if (item?.item.type === 'audio-image') speakConcept(item.item.conceptId, {});
  }, [index, item]);

  const pick = (i: number): void => {
    if (picked !== null || !item) return;
    setPicked(i);
    const correct = item.options[i]?.correct ?? false;
    answerDebrief(item.item, correct);
    window.setTimeout(() => setIndex((n) => n + 1), correct ? 700 : 1600);
  };

  return (
    <main className="screen screen--scroll fade-in" data-testid="debrief-screen">
      <div className="screen-inner" style={{ justifyContent: 'center' }}>
        <div className="paper" style={{ textAlign: 'center' }}>
          <h2>{ui('debrief.title')}</h2>
          <div className="debrief-progress">
            {items.map((_, i) => (
              <span key={i} className={`debrief-dot ${i < index ? 'debrief-dot--done' : ''}`} />
            ))}
          </div>
          {item && <DebriefItemCard key={index} view={item} picked={picked} onPick={pick} />}
          {done && (
            <>
              {items.length === 0 && <p className="margin-note">Nothing to review — the notebook approves.</p>}
              <button type="button" className="btn btn--primary" data-testid="btn-debrief-done" onClick={finishDebrief}>
                {ui('debrief.done')}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function DebriefItemCard({
  view,
  picked,
  onPick,
}: {
  view: DebriefItemView;
  picked: number | null;
  onPick(i: number): void;
}): JSX.Element {
  const t = view.item.type;
  return (
    <div>
      {t === 'article-pick' && (
        <>
          <p style={{ margin: '4px 0' }}>Which article?</p>
          <div style={{ fontSize: '2.4rem' }} aria-hidden="true">
            {view.correctIcon}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>___ {view.display}</div>
          <div className="margin-note">{view.gloss}</div>
        </>
      )}
      {t === 'word-image' && (
        <>
          <p style={{ margin: '4px 0' }}>Which picture is…</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {view.glyph && <span style={{ fontSize: '0.7rem', verticalAlign: 'top' }}>{view.glyph} </span>}
            {view.display}
          </div>
          <button
            type="button"
            className="iconbtn"
            aria-label="Hear the word"
            onClick={() => speakConcept(view.item.conceptId, {})}
          >
            🔊
          </button>
        </>
      )}
      {t === 'audio-image' && (
        <>
          <p style={{ margin: '4px 0' }}>Listen — which picture?</p>
          <button
            type="button"
            className="iconbtn"
            aria-label="Play the word"
            style={{ fontSize: '1.8rem', minWidth: 60, minHeight: 60 }}
            onClick={() => speakConcept(view.item.conceptId, {})}
          >
            🔊
          </button>
        </>
      )}
      <div className="debrief-options" data-testid="debrief-options">
        {view.options.map((opt, i) => {
          const cls =
            picked === null
              ? ''
              : opt.correct
                ? 'debrief-option--correct'
                : picked === i
                  ? 'debrief-option--wrong'
                  : '';
          return (
            <button
              key={i}
              type="button"
              className={`debrief-option ${t === 'article-pick' ? 'debrief-option--word' : ''} ${cls}`}
              data-correct={opt.correct ? '1' : '0'}
              onClick={() => onPick(i)}
              aria-label={opt.article ?? `option ${i + 1}`}
            >
              {t === 'article-pick' ? opt.article : opt.icon}
            </button>
          );
        })}
      </div>
      {picked !== null && !view.options[picked]?.correct && (
        <div className="margin-note">
          {view.item.type === 'article-pick'
            ? `It's “${joinArticle(view.options.find((o) => o.correct)?.article ?? '', view.display)}.”`
            : `That one is “${view.display}.”`}
        </div>
      )}
    </div>
  );
}
