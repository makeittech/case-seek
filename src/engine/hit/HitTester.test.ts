import { describe, expect, it } from 'vitest';
import { circleMask, maskAt, rectMask } from './mask';
import { hitTest, propHit, type HitProp } from './HitTester';

const SIZE = 256;

function prop(id: string, x: number, y: number, z: number, over: Partial<HitProp> = {}): HitProp {
  return {
    id,
    mask: circleMask(SIZE, SIZE, 128, 128, 100),
    x,
    y,
    scale: 1,
    rotation: 0,
    flipX: false,
    z,
    ...over,
  };
}

describe('masks', () => {
  it('rectMask samples inside/outside', () => {
    const m = rectMask(SIZE, SIZE, { x: 64, y: 64, w: 128, h: 128 });
    expect(maskAt(m, 128, 128)).toBe(true);
    expect(maskAt(m, 10, 10)).toBe(false);
    expect(maskAt(m, -5, 128)).toBe(false);
    expect(maskAt(m, 300, 128)).toBe(false);
  });

  it('circleMask is round', () => {
    const m = circleMask(SIZE, SIZE, 128, 128, 60);
    expect(maskAt(m, 128, 128)).toBe(true);
    expect(maskAt(m, 128 + 59, 128)).toBe(true);
    expect(maskAt(m, 128 + 90, 128)).toBe(false);
    expect(maskAt(m, 20, 20)).toBe(false);
  });
});

describe('propHit', () => {
  it('hits inside the silhouette at the prop anchor', () => {
    const p = prop('a', 500, 400, 1);
    expect(propHit(p, { x: 500, y: 400 }, 0)).toBe(true);
    expect(propHit(p, { x: 500 + 130, y: 400 }, 0)).toBe(false);
  });

  it('dilation extends the silhouette', () => {
    const p = prop('a', 500, 400, 1);
    const justOutside = { x: 500 + 106, y: 400 };
    expect(propHit(p, justOutside, 0)).toBe(false);
    expect(propHit(p, justOutside, 12)).toBe(true);
  });

  it('respects scale', () => {
    const p = prop('a', 500, 400, 1, { scale: 0.5 });
    expect(propHit(p, { x: 500 + 45, y: 400 }, 0)).toBe(true);
    expect(propHit(p, { x: 500 + 60, y: 400 }, 0)).toBe(false);
  });

  it('respects rotation for asymmetric masks', () => {
    const bar = rectMask(SIZE, SIZE, { x: 0, y: 108, w: 256, h: 40 }); // horizontal bar
    const p = prop('a', 500, 400, 1, { mask: bar, rotation: 90 });
    // rotated 90°: the bar is now vertical
    expect(propHit(p, { x: 500, y: 400 + 100 }, 0)).toBe(true);
    expect(propHit(p, { x: 500 + 100, y: 400 }, 0)).toBe(false);
  });
});

describe('hitTest', () => {
  const activeTargetIds = new Set(['target']);
  const taggedIds = new Set(['target', 'tagged']);

  it('topmost z wins (occlusion honesty)', () => {
    const under = prop('target', 500, 400, 1);
    const over = prop('tagged', 500, 400, 5);
    const res = hitTest({
      props: [under, over],
      scenePt: { x: 500, y: 400 },
      cameraScale: 1,
      dilationPx: 6,
      activeTargetIds,
      taggedIds,
    });
    expect(res.kind).toBe('tagged-non-target');
    expect(res.propId).toBe('tagged');
  });

  it('classifies target, tagged non-target, ambience, miss', () => {
    const props = [prop('target', 300, 300, 1), prop('tagged', 800, 300, 1), prop('amb', 1300, 300, 1)];
    const opts = { props, cameraScale: 1, dilationPx: 6, activeTargetIds, taggedIds };
    expect(hitTest({ ...opts, scenePt: { x: 300, y: 300 } }).kind).toBe('target-hit');
    expect(hitTest({ ...opts, scenePt: { x: 800, y: 300 } }).kind).toBe('tagged-non-target');
    expect(hitTest({ ...opts, scenePt: { x: 1300, y: 300 } }).kind).toBe('ambience');
    expect(hitTest({ ...opts, scenePt: { x: 1700, y: 900 } }).kind).toBe('miss');
  });

  it('coat-tail rescues near-misses on targets only', () => {
    const props = [prop('target', 300, 300, 1), prop('tagged', 800, 300, 1)];
    const nearTarget = hitTest({
      props,
      scenePt: { x: 300 + 108, y: 300 }, // ~8px past the silhouette
      cameraScale: 1,
      dilationPx: 0,
      activeTargetIds,
      taggedIds,
      coatTailPx: 12,
    });
    expect(nearTarget.kind).toBe('target-hit');
    expect(nearTarget.coatTail).toBe(true);

    const nearTagged = hitTest({
      props,
      scenePt: { x: 800 + 108, y: 300 },
      cameraScale: 1,
      dilationPx: 0,
      activeTargetIds,
      taggedIds,
      coatTailPx: 12,
    });
    expect(nearTagged.kind).toBe('miss');
  });

  it('dilation is zoom-invariant (scales with 1/cameraScale)', () => {
    const props = [prop('target', 300, 300, 1)];
    const pt = { x: 300 + 104, y: 300 }; // 4 scene px outside
    // zoomed out (scale 0.5): 6 screen px = 12 scene px → hit
    expect(
      hitTest({ props, scenePt: pt, cameraScale: 0.5, dilationPx: 6, activeTargetIds, taggedIds }).kind,
    ).toBe('target-hit');
    // zoomed in (scale 3): 6 screen px = 2 scene px → miss silhouette, but coat-tail may catch;
    // disable coat-tail to isolate dilation
    expect(
      hitTest({ props, scenePt: pt, cameraScale: 3, dilationPx: 6, activeTargetIds, taggedIds, coatTailPx: 0 })
        .kind,
    ).toBe('miss');
  });
});
