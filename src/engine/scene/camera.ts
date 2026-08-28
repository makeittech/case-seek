/**
 * Camera: zoom 1–3× over a scene, clamped pan, fit rules per orientation.
 * Landscape 1× = contain-fit (whole scene visible, no pan).
 * Portrait 1× = fit-height, horizontal pan.
 * Pure state + math; input adapters drive it.
 */
import type { Vec2, Rect } from '../types';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

export interface CameraSnapshot {
  zoom: number;
  cx: number;
  cy: number;
}

export class Camera {
  readonly sceneW: number;
  readonly sceneH: number;
  private vw = 1;
  private vh = 1;
  zoom = 1;
  cx: number;
  cy: number;

  constructor(sceneW: number, sceneH: number) {
    this.sceneW = sceneW;
    this.sceneH = sceneH;
    this.cx = sceneW / 2;
    this.cy = sceneH / 2;
  }

  setViewport(vw: number, vh: number): void {
    this.vw = Math.max(1, vw);
    this.vh = Math.max(1, vh);
    this.clamp();
  }

  get viewportW(): number {
    return this.vw;
  }
  get viewportH(): number {
    return this.vh;
  }

  /** Scale at zoom=1 under current viewport/orientation rules. */
  baseScale(): number {
    const portrait = this.vh > this.vw;
    if (portrait) return this.vh / this.sceneH; // fit height, pan horizontally
    return Math.min(this.vw / this.sceneW, this.vh / this.sceneH); // contain
  }

  scale(): number {
    return this.baseScale() * this.zoom;
  }

  setZoom(z: number): void {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
    this.clamp();
  }

  /** Zoom keeping the given screen point fixed on the same scene point. */
  zoomAt(screenPt: Vec2, newZoom: number): void {
    const before = this.screenToScene(screenPt);
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    const after = this.screenToScene(screenPt);
    this.cx += before.x - after.x;
    this.cy += before.y - after.y;
    this.clamp();
  }

  panByScreen(dx: number, dy: number): void {
    const s = this.scale();
    this.cx -= dx / s;
    this.cy -= dy / s;
    this.clamp();
  }

  centerOn(pt: Vec2): void {
    this.cx = pt.x;
    this.cy = pt.y;
    this.clamp();
  }

  reset(): void {
    this.zoom = 1;
    this.cx = this.sceneW / 2;
    this.cy = this.sceneH / 2;
    this.clamp();
  }

  clamp(): void {
    const s = this.scale();
    const halfW = this.vw / 2 / s;
    const halfH = this.vh / 2 / s;
    if (halfW * 2 >= this.sceneW) {
      this.cx = this.sceneW / 2;
    } else {
      this.cx = Math.min(this.sceneW - halfW, Math.max(halfW, this.cx));
    }
    if (halfH * 2 >= this.sceneH) {
      this.cy = this.sceneH / 2;
    } else {
      this.cy = Math.min(this.sceneH - halfH, Math.max(halfH, this.cy));
    }
  }

  sceneToScreen(pt: Vec2): Vec2 {
    const s = this.scale();
    return { x: (pt.x - this.cx) * s + this.vw / 2, y: (pt.y - this.cy) * s + this.vh / 2 };
  }

  screenToScene(pt: Vec2): Vec2 {
    const s = this.scale();
    return { x: (pt.x - this.vw / 2) / s + this.cx, y: (pt.y - this.vh / 2) / s + this.cy };
  }

  visibleRect(): Rect {
    const s = this.scale();
    const w = this.vw / s;
    const h = this.vh / s;
    return { x: this.cx - w / 2, y: this.cy - h / 2, w, h };
  }

  snapshot(): CameraSnapshot {
    return { zoom: this.zoom, cx: this.cx, cy: this.cy };
  }

  restore(s: CameraSnapshot): void {
    this.zoom = s.zoom;
    this.cx = s.cx;
    this.cy = s.cy;
    this.clamp();
  }
}
