/** "Which one is hiding?" — pick the target to spend an Insight charge on. */
import { useRound } from '../../../state/roundStore';
import { ui } from '../../strings';

interface Props {
  onPick(targetId: string): void;
  onClose(): void;
}

export function HintPicker({ onPick, onClose }: Props): JSX.Element | null {
  const chips = useRound((s) => s.chips);
  const state = useRound((s) => s.state);
  if (!state) return null;
  return (
    <div className="search-overlay" role="dialog" aria-label={ui('hintPick')}>
      <div className="paper hint-picker">
        <h3>{ui('hintPick')}</h3>
        <div className="hint-picker__chips">
          {chips
            .filter((c) => !state.progress[c.targetId]?.done)
            .map((c) => (
              <button
                key={c.targetId}
                type="button"
                className="btn btn--ghost"
                style={{ color: 'var(--ink)', borderColor: 'var(--paper-edge)' }}
                onClick={() => onPick(c.targetId)}
              >
                {c.kind === 'silhouette' ? c.icon : c.kind === 'audio' ? '🔊' : c.display}
                {(state.hintStages[c.targetId] ?? 0) > 0 ? ` (${state.hintStages[c.targetId]}/3)` : ''}
              </button>
            ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn--ghost" style={{ color: 'var(--ink)' }} onClick={onClose}>
            Never mind
          </button>
        </div>
      </div>
    </div>
  );
}
