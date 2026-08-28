/** Settings bottom sheet: text, accessibility, audio, play style. */
import { useUi } from '../../state/uiStore';
import { useSettings, type SettingsState } from '../../state/settingsStore';
import { markProfileDirty } from '../../app/persist';
import { getServices } from '../../services';
import { ui } from '../strings';

export function SettingsSheet(): JSX.Element | null {
  const open = useUi((s) => s.settingsOpen);
  const setOpen = useUi((s) => s.setSettingsOpen);
  const settings = useSettings();

  if (!open) return null;

  const setKey = <K extends keyof SettingsState>(key: K, value: SettingsState[K]): void => {
    settings.set(key, value);
    if (key === 'volSfx' && typeof value === 'number') getServices().audio.setVolume(value);
    markProfileDirty();
  };

  const Toggle = ({ k, label }: { k: keyof SettingsState; label: string }): JSX.Element => (
    <div className="setting-row">
      <span>{label}</span>
      <button
        type="button"
        className={`toggle ${settings[k] ? 'toggle--on' : ''}`}
        role="switch"
        aria-checked={Boolean(settings[k])}
        aria-label={label}
        onClick={() => setKey(k, !settings[k] as never)}
      />
    </div>
  );

  return (
    <div
      className="overlay-backdrop"
      role="presentation"
      style={{ alignItems: 'flex-end' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="settings-sheet" role="dialog" aria-label={ui('settings')}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, flex: 1 }}>{ui('settings')}</h2>
          <button type="button" className="iconbtn" aria-label="Close settings" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div className="setting-row">
          <span>Text size</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {([100, 115, 130] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`btn btn--ghost ${settings.textSize === v ? 'btn--primary' : ''}`}
                style={{ minHeight: 40, padding: '4px 12px' }}
                onClick={() => setKey('textSize', v)}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        <Toggle k="dyslexiaFont" label="Dyslexia-friendly font" />
        <Toggle k="genderTint" label="Color-tint gender on word chips" />
        <Toggle k="reducedMotion" label="Reduced motion" />
        <Toggle k="purist" label="Purist mode (no automatic nudges)" />
        <Toggle k="slowAudioDefault" label="Speak words slowly by default" />
        <Toggle k="leftHandedTray" label="Left-handed tray" />

        <div className="setting-row">
          <span>Sound effects</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={settings.volSfx}
            aria-label="Sound effects volume"
            onChange={(e) => setKey('volSfx', Number(e.target.value))}
          />
        </div>
        <div className="setting-row">
          <span>Voice</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={settings.volVoice}
            aria-label="Voice volume"
            onChange={(e) => setKey('volVoice', Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
