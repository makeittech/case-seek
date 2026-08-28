/** Top HUD (back, objective, insight meter, notebook, settings) + zoom controls. */
import { goBack } from '../../../app/flow';
import { useUi } from '../../../state/uiStore';
import { ui } from '../../strings';

interface Props {
  objective: string;
  insight: number;
  onHint(): void;
  zoomBy(factor: number): void;
}

const ZOOM_STEP = 1.35;

export function SearchHud({ objective, insight, onHint, zoomBy }: Props): JSX.Element {
  const openNotebook = useUi((s) => s.openNotebook);
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  return (
    <>
      <div className="search-hud">
        <button type="button" className="iconbtn" aria-label="Back" onClick={goBack}>
          ←
        </button>
        <div className="search-hud__objective">“{objective}”</div>
        <div className="insight-meter" aria-label={`${ui('insight')}: ${insight} of 3`}>
          <button
            type="button"
            className="insight-meter__lens"
            aria-label="Use a hint"
            data-testid="btn-hint"
            onClick={onHint}
            disabled={insight <= 0}
            style={{ minWidth: 32, minHeight: 32 }}
          >
            🔍
          </button>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`insight-pip ${i < insight ? 'insight-pip--full' : ''}`} />
          ))}
        </div>
        <button type="button" className="iconbtn" aria-label={ui('notebook')} onClick={() => openNotebook()}>
          📓
        </button>
        <button type="button" className="iconbtn" aria-label={ui('settings')} onClick={() => setSettingsOpen(true)}>
          ⚙
        </button>
      </div>

      <div className="zoom-controls">
        <button type="button" className="iconbtn" aria-label={ui('zoomIn')} onClick={() => zoomBy(ZOOM_STEP)}>
          ＋
        </button>
        <button type="button" className="iconbtn" aria-label={ui('zoomOut')} onClick={() => zoomBy(1 / ZOOM_STEP)}>
          －
        </button>
      </div>
    </>
  );
}
