/**
 * Pointer/gesture adapter for the scene canvas: 8 px tap-vs-pan threshold,
 * one-finger pan, pinch zoom, wheel zoom at cursor, double-tap 1×↔2× toggle,
 * inertial flick. Browser gestures suppressed inside the scene element only.
 */
import type { Camera } from '../scene/camera';
import type { Vec2 } from '../types';

export interface InputCallbacks {
  onTap(scenePt: Vec2, screenPt: Vec2, pointerType: string): void;
  onCameraChange(): void;
}

const TAP_THRESHOLD = 8;
const DOUBLE_TAP_MS = 320;

export class InputController {
  private el: HTMLElement;
  private camera: Camera;
  private cb: InputCallbacks;
  private pointers = new Map<number, Vec2>();
  private downPt: Vec2 | null = null;
  private downId = -1;
  private moved = false;
  private lastPt: Vec2 | null = null;
  private lastTapTime = 0;
  private lastTapPt: Vec2 | null = null;
  private pinchDist = 0;
  private velocity: Vec2 = { x: 0, y: 0 };
  private inertiaRaf = 0;
  private lastMoveTime = 0;
  private detach: (() => void)[] = [];

  constructor(el: HTMLElement, camera: Camera, cb: InputCallbacks) {
    this.el = el;
    this.camera = camera;
    this.cb = cb;
    const opts: AddEventListenerOptions = { passive: false };

    const on = <K extends keyof HTMLElementEventMap>(
      type: K,
      fn: (ev: HTMLElementEventMap[K]) => void,
      o?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, o);
      this.detach.push(() => el.removeEventListener(type, fn as EventListener, o));
    };

    on('pointerdown', (e) => this.onDown(e), opts);
    on('pointermove', (e) => this.onMove(e), opts);
    on('pointerup', (e) => this.onUp(e), opts);
    on('pointercancel', (e) => this.onCancel(e), opts);
    on('wheel', (e) => this.onWheel(e), opts);
    on('contextmenu', (e) => e.preventDefault(), opts);
    el.style.touchAction = 'none';
  }

  destroy(): void {
    for (const d of this.detach) d();
    cancelAnimationFrame(this.inertiaRaf);
  }

  private local(e: PointerEvent | WheelEvent): Vec2 {
    const r = this.el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onDown(e: PointerEvent): void {
    e.preventDefault();
    cancelAnimationFrame(this.inertiaRaf);
    this.el.setPointerCapture?.(e.pointerId);
    const pt = this.local(e);
    this.pointers.set(e.pointerId, pt);
    if (this.pointers.size === 1) {
      this.downPt = pt;
      this.downId = e.pointerId;
      this.moved = false;
      this.lastPt = pt;
      this.velocity = { x: 0, y: 0 };
      this.lastMoveTime = performance.now();
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchDist = dist(a!, b!);
      this.downPt = null; // pinch cancels tap
    }
  }

  private onMove(e: PointerEvent): void {
    if (!this.pointers.has(e.pointerId)) return;
    const pt = this.local(e);
    this.pointers.set(e.pointerId, pt);

    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = dist(a!, b!);
      if (this.pinchDist > 0) {
        const mid = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 };
        this.camera.zoomAt(mid, this.camera.zoom * (d / this.pinchDist));
        this.cb.onCameraChange();
      }
      this.pinchDist = d;
      return;
    }

    if (e.pointerId !== this.downId || !this.lastPt) return;
    const dx = pt.x - this.lastPt.x;
    const dy = pt.y - this.lastPt.y;
    if (this.downPt && dist(pt, this.downPt) > TAP_THRESHOLD) this.moved = true;
    if (this.moved) {
      this.camera.panByScreen(dx, dy);
      const now = performance.now();
      const dt = Math.max(1, now - this.lastMoveTime);
      this.velocity = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
      this.lastMoveTime = now;
      this.cb.onCameraChange();
    }
    this.lastPt = pt;
  }

  private onUp(e: PointerEvent): void {
    const pt = this.local(e);
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 1) {
      // dropping out of pinch: reset remaining pointer as pan origin
      const [rest] = [...this.pointers.values()];
      this.lastPt = rest!;
      this.downPt = null;
      return;
    }
    if (e.pointerId !== this.downId) return;

    if (!this.moved && this.downPt) {
      const now = performance.now();
      if (
        this.lastTapPt &&
        now - this.lastTapTime < DOUBLE_TAP_MS &&
        dist(pt, this.lastTapPt) < 32
      ) {
        // double-tap: toggle 1× ↔ 2× centered on the tap point
        const target = this.camera.zoom > 1.5 ? 1 : 2;
        this.camera.zoomAt(pt, target);
        this.cb.onCameraChange();
        this.lastTapTime = 0;
        this.lastTapPt = null;
      } else {
        this.lastTapTime = now;
        this.lastTapPt = pt;
        this.cb.onTap(this.camera.screenToScene(pt), pt, e.pointerType || 'mouse');
      }
    } else if (this.moved && (Math.abs(this.velocity.x) > 2 || Math.abs(this.velocity.y) > 2)) {
      this.startInertia();
    }
    this.downPt = null;
    this.downId = -1;
    this.moved = false;
  }

  private onCancel(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
    this.downPt = null;
    this.moved = false;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const pt = this.local(e);
    const factor = Math.exp(-e.deltaY * 0.0016);
    this.camera.zoomAt(pt, this.camera.zoom * factor);
    this.cb.onCameraChange();
  }

  private startInertia(): void {
    const step = () => {
      this.velocity.x *= 0.93;
      this.velocity.y *= 0.93;
      if (Math.abs(this.velocity.x) < 0.4 && Math.abs(this.velocity.y) < 0.4) return;
      this.camera.panByScreen(this.velocity.x, this.velocity.y);
      this.cb.onCameraChange();
      this.inertiaRaf = requestAnimationFrame(step);
    };
    this.inertiaRaf = requestAnimationFrame(step);
  }
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
