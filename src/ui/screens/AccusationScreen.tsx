/**
 * The rooftop accusation: exhibits → name the Broker → confrontation →
 * the dry/warm choice → resolution. Wrong picks bounce back to the board.
 */
import { useState } from 'react';
import { db } from '../../app/content';
import { useCase } from '../../state/caseStore';
import { completeAccusation, renderLine } from '../../app/storyFlow';
import { ui } from '../strings';
import { TopBar } from '../components/TopBar';

type Phase = 'exhibits' | 'choose' | 'confrontation' | 'choice' | 'resolution';

export function AccusationScreen(): JSX.Element {
  const row = useCase((s) => s.row);
  const finale = db().finale;
  const [phase, setPhase] = useState<Phase>('exhibits');
  const [wrong, setWrong] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [flavor, setFlavor] = useState<'dry' | 'warm'>('dry');

  if (!row) return <main className="screen" />;
  const tier = row.tier;

  const pickSuspect = (id: string): void => {
    if (id === finale.culprit) {
      setWrong(false);
      setPhase('confrontation');
      setLineIdx(0);
    } else {
      setWrong(true);
    }
  };

  const lines = (phase === 'confrontation' ? finale.confrontation : finale.resolution).map((l) =>
    renderLine(l, tier),
  );

  return (
    <main className="screen screen--scroll fade-in" data-testid="accusation-screen">
      <TopBar title={ui('accuse.title')} back={false} />
      <div className="screen-inner">
        {phase === 'exhibits' && (
          <div className="paper">
            <h2>{finale.prompt}</h2>
            <p className="margin-note">The exhibits, in Halloway's hand:</p>
            <div className="exhibit-row">
              {finale.exhibits.map((cid) => {
                const clue = db().clues.get(cid);
                return (
                  <span key={cid} className="exhibit" style={{ color: 'var(--ink)' }}>
                    <span aria-hidden="true">{clue?.icon}</span> {clue?.name}
                  </span>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="btn btn--primary"
                data-testid="btn-accuse-begin"
                onClick={() => setPhase('choose')}
              >
                Name the Broker
              </button>
            </div>
          </div>
        )}

        {phase === 'choose' && (
          <>
            <p className="select-heading">{finale.prompt}</p>
            {wrong && (
              <div className="paper fade-in">
                <p className="margin-note">{finale.wrongLine}</p>
              </div>
            )}
            <div className="select-grid">
              {finale.suspects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="suspect-card"
                  data-testid={`suspect-${s.id}`}
                  onClick={() => pickSuspect(s.id)}
                >
                  <span style={{ fontSize: '1.6rem' }} aria-hidden="true">
                    {db().castById.get(s.id)?.icon ?? '❓'}
                  </span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {(phase === 'confrontation' || phase === 'resolution') && (
          <div className="beat-lines" style={{ flex: 'unset' }}>
            {lines.slice(0, lineIdx + 1).map((l, i) => (
              <div key={i} className={`beat-line ${l.speaker === 'narration' ? 'beat-line--narration' : ''}`}>
                {l.speaker !== 'narration' && (
                  <div className="beat-line__portrait" aria-hidden="true">
                    {db().castById.get(l.speaker)?.icon ?? '👤'}
                  </div>
                )}
                <div className="beat-line__bubble">
                  {l.speakerName && <div className="beat-line__speaker">{l.speakerName}</div>}
                  {l.text}
                </div>
              </div>
            ))}
            <div className="beat-continue">
              {lineIdx + 1 < lines.length ? (
                <button
                  type="button"
                  className="btn btn--ghost"
                  data-testid="btn-accuse-next"
                  onClick={() => setLineIdx(lineIdx + 1)}
                >
                  {ui('continueStory')} ▸
                </button>
              ) : phase === 'confrontation' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    className="btn"
                    data-testid="btn-finale-dry"
                    onClick={() => {
                      setFlavor('dry');
                      setPhase('resolution');
                      setLineIdx(0);
                    }}
                  >
                    {finale.flavorChoice.dry}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    data-testid="btn-finale-warm"
                    onClick={() => {
                      setFlavor('warm');
                      setPhase('resolution');
                      setLineIdx(0);
                    }}
                  >
                    {finale.flavorChoice.warm}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  data-testid="btn-accuse-finish"
                  onClick={() => completeAccusation(flavor)}
                >
                  {ui('continueStory')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
