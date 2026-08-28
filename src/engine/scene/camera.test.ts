import { describe, expect, it } from 'vitest';
import { Camera, MAX_ZOOM, MIN_ZOOM } from './camera';

const W = 1920;
const H = 1080;

function landscapeCam(): Camera {
  const c = new Camera(W, H);
  c.setViewport(1280, 720);
  return c;
}

describe('Camera', () => {
  it('landscape 1× contain-fits the whole scene', () => {
    const c = landscapeCam();
    const r = c.visibleRect();
    expect(r.w).toBeGreaterThanOrEqual(W - 1);
    expect(r.h).toBeGreaterThanOrEqual(H - 1);
  });

  it('portrait 1× fits height and allows horizontal pan', () => {
    const c = new Camera(W, H);
    c.setViewport(390, 780);
    const r = c.visibleRect();
    expect(r.h).toBeCloseTo(H, 0);
    expect(r.w).toBeLessThan(W);
    const cx0 = c.cx;
    c.panByScreen(-200, 0);
    expect(c.cx).toBeGreaterThan(cx0);
  });

  it('zoom clamps to [1, 3]', () => {
    const c = landscapeCam();
    c.setZoom(99);
    expect(c.zoom).toBe(MAX_ZOOM);
    c.setZoom(0.1);
    expect(c.zoom).toBe(MIN_ZOOM);
  });

  it('zoomAt keeps the anchor scene point under the cursor', () => {
    const c = landscapeCam();
    const screenPt = { x: 900, y: 200 };
    const before = c.screenToScene(screenPt);
    c.zoomAt(screenPt, 2.4);
    const after = c.screenToScene(screenPt);
    expect(after.x).toBeCloseTo(before.x, 4);
    expect(after.y).toBeCloseTo(before.y, 4);
  });

  it('pan is clamped to scene bounds', () => {
    const c = landscapeCam();
    c.setZoom(2);
    c.panByScreen(1e6, 1e6);
    const r = c.visibleRect();
    expect(r.x).toBeGreaterThanOrEqual(-1);
    expect(r.y).toBeGreaterThanOrEqual(-1);
    c.panByScreen(-1e6, -1e6);
    const r2 = c.visibleRect();
    expect(r2.x + r2.w).toBeLessThanOrEqual(W + 1);
    expect(r2.y + r2.h).toBeLessThanOrEqual(H + 1);
  });

  it('scene↔screen round-trips', () => {
    const c = landscapeCam();
    c.setZoom(1.7);
    c.centerOn({ x: 700, y: 400 });
    const pt = { x: 623, y: 512 };
    const back = c.screenToScene(c.sceneToScreen(pt));
    expect(back.x).toBeCloseTo(pt.x, 6);
    expect(back.y).toBeCloseTo(pt.y, 6);
  });

  it('snapshot/restore preserves the view', () => {
    const c = landscapeCam();
    c.setZoom(2.2);
    c.centerOn({ x: 500, y: 800 });
    const snap = c.snapshot();
    c.reset();
    c.restore(snap);
    expect(c.zoom).toBe(2.2);
    expect(c.cx).toBeCloseTo(snap.cx, 6);
  });
});
