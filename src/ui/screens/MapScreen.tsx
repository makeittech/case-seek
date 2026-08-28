/** City map: the current destination card + Marlowe Bay location strip. */
import { useState } from 'react';
import { useUi } from '../../state/uiStore';
import { useCase } from '../../state/caseStore';
import { currentNode } from '../../app/flow';
import { startRound } from '../../app/roundFlow';
import { db } from '../../app/content';
import { resolveSceneDef } from '../../engine/content/loader';
import { ui } from '../strings';
import { TopBar } from '../components/TopBar';

export function MapScreen(): JSX.Element {
  const row = useCase((s) => s.row);
  const goto = useUi((s) => s.goto);
  const [busy, setBusy] = useState(false);
  const node = row ? currentNode() : null;

  const round = node?.type === 'round' ? db().rounds.get(node.id) : null;
  const scene = round ? resolveSceneDef(db(), round.sceneId) : null;
  const chapter = db().season.chapters.find((c) => c.n === (round?.chapter ?? row?.chapter));

  const locations = [...db().scenes.values()].map((s) => ({ id: s.locationId, name: s.name }));
  const seen = new Set<string>();
  const uniqueLocations = locations.filter((l) => {
    if (seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });

  return (
    <main className="screen fade-in">
      <TopBar title={ui('map.title')} />
      <div className="screen-inner" style={{ overflowY: 'auto', justifyContent: 'center' }}>
        {round && scene ? (
          <div className="paper map-card">
            <div className="map-card__chapter">
              Chapter {round.chapter}
              {chapter ? ` — ${chapter.title}` : ''}
            </div>
            <div className="map-card__scene">{scene.name}</div>
            <div className="map-card__objective">“{round.objective}”</div>
            <button
              type="button"
              className="btn btn--primary"
              data-testid="btn-go-there"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void startRound(round.id).then(() => {
                  goto({ kind: 'search', roundId: round.id });
                });
              }}
            >
              {ui('map.go')}
            </button>
          </div>
        ) : (
          <div className="paper">
            <p>The city waits. Open the notebook, or continue the case.</p>
          </div>
        )}
        <div className="map-locations" aria-label="Marlowe Bay locations">
          {uniqueLocations.map((l) => (
            <span key={l.id} className={`map-loc ${scene?.locationId === l.id ? 'map-loc--current' : ''}`}>
              {l.name}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
