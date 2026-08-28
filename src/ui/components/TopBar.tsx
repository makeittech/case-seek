/** Shared header: back, title, notebook, settings. */
import { useUi } from '../../state/uiStore';
import { goBack } from '../../app/flow';
import { ui } from '../strings';

interface Props {
  title: string;
  back?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, back = true, onBack }: Props): JSX.Element {
  const uiState = useUi();
  return (
    <header className="topbar">
      {back && (
        <button type="button" className="iconbtn" aria-label="Back" onClick={onBack ?? goBack}>
          ←
        </button>
      )}
      <div className="topbar__title">{title}</div>
      <button
        type="button"
        className="iconbtn"
        aria-label={ui('notebook')}
        data-testid="open-notebook"
        onClick={() => uiState.openNotebook()}
      >
        📓
      </button>
      <button
        type="button"
        className="iconbtn"
        aria-label={ui('settings')}
        onClick={() => uiState.setSettingsOpen(true)}
      >
        ⚙
      </button>
    </header>
  );
}
