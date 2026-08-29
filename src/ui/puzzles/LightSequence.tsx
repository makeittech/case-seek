/** Lantern code: watch the lamps, repeat the light. Two escalating rounds. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { mulberry32 } from '../../engine/rand';
import type { PuzzleBodyProps } from '../screens/PuzzleScreen';

export function LightSequence({ params, onSolved, solved }: PuzzleBodyProps): JSX.Element {
  const lamps = Number(params.lamps ?? 4);
  const startLength = Number(params.startLength ?? 4);
  const endLength = Number(params.endLength ?? 6);
  const [roundIdx, setRoundIdx] = useState(0);
  const lengths = useMemo(() => {
    const mid = Math.round((startLength + endLength) / 2);
    return [startLength, mid];
  }, [startLength, endLength]);

  const sequence = useMemo(() => {
    const rng = mulberry32(191 + roundIdx * 37);
    return Array.from({ length: lengths[roundIdx] ?? startLength }, () => Math.floor(rng() * lamps));
  }, [roundIdx, lamps, lengths, startLength]);

  const [lit, setLit] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [entered, setEntered] = useState<number[]>([]);
  const timers = useRef<number[]>([]);

  const playback = (): void => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPlaying(true);
    setEntered([]);
    sequence.forEach((lamp, i) => {
      timers.current.push(window.setTimeout(() => setLit(lamp), 600 * i + 400));
      timers.current.push(window.setTimeout(() => setLit(null), 600 * i + 850));
    });
    timers.current.push(window.setTimeout(() => setPlaying(false), 600 * sequence.length + 500));
  };

  useEffect(() => {
    if (solved) return;
    playback();
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
    // playback is stable per sequence
  }, [sequence, solved]);

  const press = (i: number): void => {
    if (playing || solved) return;
    setLit(i);
    window.setTimeout(() => setLit(null), 220);
    const next = [...entered, i];
    if (sequence[next.length - 1] !== i) {
      setEntered([]);
      window.setTimeout(playback, 700);
      return;
    }
    setEntered(next);
    if (next.length === sequence.length) {
      if (roundIdx + 1 >= lengths.length) onSolved();
      else window.setTimeout(() => setRoundIdx(roundIdx + 1), 700);
    }
  };

  return (
    <>
      <div className="puzzle-note">
        Signal {roundIdx + 1} of {lengths.length} — {playing ? 'watch the lamps…' : 'now repeat it.'}
      </div>
      <div className="puzzle-row" data-testid="light-sequence">
        {Array.from({ length: lamps }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`lamp ${lit === i ? 'lamp--lit' : ''}`}
            aria-label={`lamp ${i + 1}`}
            onClick={() => press(i)}
          >
            🏮
          </button>
        ))}
      </div>
      {!playing && !solved && (
        <button type="button" className="btn btn--ghost" style={{ color: 'var(--ink)' }} onClick={playback}>
          Show me again
        </button>
      )}
      {solved && <div className="puzzle-solved">The hollow lantern clicks open.</div>}
    </>
  );
}
