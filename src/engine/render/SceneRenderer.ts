/**
 * Canvas 2D scene renderer. One canvas; draw order per frame:
 * plate → light pools (under-glow) → props (z-asc, skipping found) →
 * light pass → weather FX → hint effects (Hint Gold only) → vignette.
 * React never draws props (ARCH §5.2).
 */
import type { Camera } from '../scene/camera';
import type { SceneDef, PropPlacement } from '../content/schemas';
import { SPRITE_SIZE, type SpriteEntry } from './sprites';

export interface RenderProp extends PropPlacement {
  sprite: string;
  entry: SpriteEntry;
}

export interface HintFx {
  stage: 1 | 2 | 3;
  x: number;
  y: number;
  r: number; // scene px radius (stage 1: region, 2: circle, 3: target glow)
  start: number;
  until: number;
  memoryUntil?: number;
}

export interface RenderFx {
  hint: HintFx | null;
  nudge: { x: number; y: number; r: number; start: number; until: number } | null;
  shimmer: { propId: string; start: number; until: number } | null;
  /** prop id → animation start ts, for found lift-and-fade */
  founds: Map<string, number>;
  dustPuff: { x: number; y: number; start: number } | null;
}

const LIGHT_PASS: Record<string, { color: string; alpha: number; pools: number; rain: boolean; fog: boolean }> = {
  day: { color: '#ffedcb', alpha: 0.06, pools: 0, rain: false, fog: false },
  dawn: { color: '#e0a5c0', alpha: 0.16, pools: 0.15, rain: false, fog: false },
  evening: { color: '#c46a2e', alpha: 0.22, pools: 0.3, rain: false, fog: false },
  lamplit: { color: '#3a2a14', alpha: 0.34, pools: 0.55, rain: false, fog: false },
  night: { color: '#101c38', alpha: 0.45, pools: 0.6, rain: false, fog: false },
  'night-lantern': { color: '#131b3d', alpha: 0.46, pools: 0.8, rain: false, fog: false },
  'fog-dusk': { color: '#5a6675', alpha: 0.32, pools: 0.4, rain: false, fog: true },
  storm: { color: '#28323e', alpha: 0.4, pools: 0.45, rain: true, fog: false },
  'night-storm': { color: '#0d1526', alpha: 0.52, pools: 0.65, rain: true, fog: false },
};

export class SceneRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private scene: SceneDef;
  private props: RenderProp[] = [];
  private found = new Set<string>();
  readonly fx: RenderFx = { hint: null, nudge: null, shimmer: null, founds: new Map(), dustPuff: null };
  private raf = 0;
  private dirty = true;
  private running = false;
  private dpr = 1;
  private plateImg: HTMLImageElement | null = null;
  reducedMotion = false;

  constructor(canvas: HTMLCanvasElement, camera: Camera, scene: SceneDef, props: RenderProp[]) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    this.ctx = ctx;
    this.camera = camera;
    this.scene = scene;
    this.props = props.slice().sort((a, b) => a.z - b.z);
    this.loadPlate();
  }

  /** Async upgrade: painted plate from /assets/scenes/<id>.webp (assets-manifest contract). */
  private loadPlate(): void {
    if (typeof Image === 'undefined') return;
    const img = new Image();
    img.onload = () => {
      this.plateImg = img;
      this.markDirty();
    };
    img.onerror = () => {}; // generated gradient plate remains
    img.src = this.scene.plate ?? `/assets/scenes/${this.scene.id}.webp`;
  }

  setFound(found: ReadonlySet<string>): void {
    this.found = new Set(found);
    this.markDirty();
  }

  markDirty(): void {
    this.dirty = true;
  }

  resize(w: number, h: number, dpr: number): void {
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.camera.setViewport(w, h);
    this.markDirty();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      const hasFx =
        this.fx.hint !== null ||
        this.fx.nudge !== null ||
        this.fx.shimmer !== null ||
        this.fx.founds.size > 0 ||
        this.fx.dustPuff !== null ||
        LIGHT_PASS[this.scene.lightState]?.rain === true;
      if (this.dirty || hasFx) {
        this.draw(performance.now());
        this.dirty = false;
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private draw(now: number): void {
    const { ctx, camera } = this;
    const vw = camera.viewportW;
    const vh = camera.viewportH;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);

    const s = camera.scale();
    const origin = camera.sceneToScreen({ x: 0, y: 0 });
    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.scale(s, s);

    this.drawPlate(ctx);
    this.drawPools(ctx, 'under');
    this.drawProps(ctx, now);
    this.drawLightPass(ctx, now);
    this.drawHintFx(ctx, now);
    ctx.restore();

    this.drawVignette(ctx, vw, vh);
    this.expireFx(now);
  }

  private drawPlate(ctx: CanvasRenderingContext2D): void {
    const { w, h } = this.scene.size;
    if (this.plateImg) {
      ctx.drawImage(this.plateImg, 0, 0, w, h);
      return;
    }
    const p = this.scene.palette;
    const horizon = h * 0.62;
    const wall = ctx.createLinearGradient(0, 0, 0, horizon);
    wall.addColorStop(0, p.wallTop);
    wall.addColorStop(1, p.wallBottom);
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, horizon);
    const floor = ctx.createLinearGradient(0, horizon, 0, h);
    floor.addColorStop(0, p.floor);
    floor.addColorStop(1, shade(p.floor, -24));
    ctx.fillStyle = floor;
    ctx.fillRect(0, horizon, w, h - horizon);
    // horizon skirting
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, horizon - 6, w, 12);
    for (const m of p.motifs) {
      ctx.save();
      ctx.globalAlpha = m.alpha;
      ctx.fillStyle = m.color;
      if (m.kind === 'rect' || m.kind === 'beam') {
        ctx.fillRect(m.x, m.y, m.w, m.h);
      } else if (m.kind === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(m.x + m.w / 2, m.y + m.h / 2, m.w / 2, m.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.kind === 'arch') {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y + m.h);
        ctx.lineTo(m.x, m.y + m.w / 2);
        ctx.arc(m.x + m.w / 2, m.y + m.w / 2, m.w / 2, Math.PI, 0);
        ctx.lineTo(m.x + m.w, m.y + m.h);
        ctx.closePath();
        ctx.fill();
      } else if (m.kind === 'window') {
        ctx.fillRect(m.x, m.y, m.w, m.h);
        ctx.strokeStyle = shade(m.color, -40);
        ctx.lineWidth = 6;
        ctx.strokeRect(m.x, m.y, m.w, m.h);
        ctx.beginPath();
        ctx.moveTo(m.x + m.w / 2, m.y);
        ctx.lineTo(m.x + m.w / 2, m.y + m.h);
        ctx.moveTo(m.x, m.y + m.h / 2);
        ctx.lineTo(m.x + m.w, m.y + m.h / 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawPools(ctx: CanvasRenderingContext2D, phase: 'under'): void {
    void phase;
    const cfg = LIGHT_PASS[this.scene.lightState]!;
    if (cfg.pools <= 0) return;
    for (const pool of this.scene.lightPools) {
      const g = ctx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, pool.r);
      g.addColorStop(0, `rgba(255,224,150,${0.28 * cfg.pools})`);
      g.addColorStop(1, 'rgba(255,224,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(pool.x - pool.r, pool.y - pool.r, pool.r * 2, pool.r * 2);
    }
  }

  private drawProps(ctx: CanvasRenderingContext2D, now: number): void {
    for (const prop of this.props) {
      const foundAnim = this.fx.founds.get(prop.id);
      if (this.found.has(prop.id) && foundAnim === undefined) continue;
      let alpha = 1;
      let lift = 0;
      if (foundAnim !== undefined) {
        const t = Math.min(1, (now - foundAnim) / 450);
        alpha = 1 - t;
        lift = this.reducedMotion ? 0 : t * 40;
        if (t >= 1) {
          this.fx.founds.delete(prop.id);
          continue;
        }
      }
      const size = SPRITE_SIZE * prop.scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(prop.x, prop.y - lift);
      if (prop.rotation) ctx.rotate((prop.rotation * Math.PI) / 180);
      if (prop.flipX) ctx.scale(-1, 1);
      // soft contact shadow
      ctx.save();
      ctx.globalAlpha = alpha * 0.22;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(4, size * 0.42, size * 0.34, size * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // shimmer trace for tagged non-target taps
      if (this.fx.shimmer?.propId === prop.id) {
        const t = (now - this.fx.shimmer.start) / (this.fx.shimmer.until - this.fx.shimmer.start);
        ctx.save();
        ctx.globalAlpha = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) * 0.6;
        ctx.shadowColor = '#f5f0e2';
        ctx.shadowBlur = 26;
        ctx.drawImage(prop.entry.canvas, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.drawImage(prop.entry.canvas, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    // dust puff for misses
    if (this.fx.dustPuff) {
      const t = Math.min(1, (now - this.fx.dustPuff.start) / 300);
      ctx.save();
      ctx.globalAlpha = (1 - t) * 0.4;
      ctx.fillStyle = '#d8cdb4';
      ctx.beginPath();
      ctx.arc(this.fx.dustPuff.x, this.fx.dustPuff.y, 6 + t * 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (t >= 1) this.fx.dustPuff = null;
    }
  }

  private drawLightPass(ctx: CanvasRenderingContext2D, now: number): void {
    const cfg = LIGHT_PASS[this.scene.lightState]!;
    const { w, h } = this.scene.size;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = cfg.alpha;
    ctx.fillStyle = cfg.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    if (cfg.pools > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const pool of this.scene.lightPools) {
        const g = ctx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, pool.r);
        g.addColorStop(0, `rgba(255,214,130,${0.5 * cfg.pools})`);
        g.addColorStop(1, 'rgba(255,214,130,0)');
        ctx.fillStyle = g;
        ctx.fillRect(pool.x - pool.r, pool.y - pool.r, pool.r * 2, pool.r * 2);
      }
      ctx.restore();
    }
    if (cfg.fog) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#c7cfd8';
      for (let i = 0; i < 3; i++) {
        const y = h * (0.25 + i * 0.22) + Math.sin(now / 4000 + i) * 20;
        ctx.fillRect(0, y, w, h * 0.08);
      }
      ctx.restore();
    }
    if (cfg.rain && !this.reducedMotion) {
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.strokeStyle = '#cfe0f0';
      ctx.lineWidth = 2;
      const t = (now / 2.2) % 80;
      ctx.beginPath();
      for (let x = -100; x < w + 100; x += 46) {
        const off = (x * 13) % 80;
        ctx.moveTo(x + t * 0.4, ((t + off) % 80) * (h / 80) - 40);
        ctx.lineTo(x + t * 0.4 - 14, ((t + off) % 80) * (h / 80) + 20);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawHintFx(ctx: CanvasRenderingContext2D, now: number): void {
    const gold = '255, 199, 82';
    const hint = this.fx.hint;
    if (hint) {
      const active = now < hint.until;
      const memory = !active && hint.memoryUntil !== undefined && now < hint.memoryUntil;
      if (active || memory) {
        const bloom = Math.min(1, (now - hint.start) / 400);
        const a = active ? 0.4 * bloom : 0.12;
        if (hint.stage === 3) {
          const pulse = 0.65 + 0.35 * Math.sin(now / 120);
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const g = ctx.createRadialGradient(hint.x, hint.y, 0, hint.x, hint.y, hint.r);
          g.addColorStop(0, `rgba(${gold},${0.75 * pulse})`);
          g.addColorStop(1, `rgba(${gold},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(hint.x - hint.r, hint.y - hint.r, hint.r * 2, hint.r * 2);
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const g = ctx.createRadialGradient(hint.x, hint.y, hint.r * 0.3, hint.x, hint.y, hint.r);
          g.addColorStop(0, `rgba(${gold},${a})`);
          g.addColorStop(0.8, `rgba(${gold},${a * 0.5})`);
          g.addColorStop(1, `rgba(${gold},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(hint.x - hint.r, hint.y - hint.r, hint.r * 2, hint.r * 2);
          ctx.strokeStyle = `rgba(${gold},${a + 0.15})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(hint.x, hint.y, hint.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    const nudge = this.fx.nudge;
    if (nudge && now < nudge.until) {
      const t = (now - nudge.start) / (nudge.until - nudge.start);
      const a = Math.sin(t * Math.PI) * 0.14;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(nudge.x, nudge.y, 0, nudge.x, nudge.y, nudge.r);
      g.addColorStop(0, `rgba(245,236,210,${a})`);
      g.addColorStop(1, 'rgba(245,236,210,0)');
      ctx.fillStyle = g;
      ctx.fillRect(nudge.x - nudge.r, nudge.y - nudge.r, nudge.r * 2, nudge.r * 2);
      ctx.restore();
    }
  }

  private drawVignette(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
    const g = ctx.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.42, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(12,8,4,0.34)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);
  }

  private expireFx(now: number): void {
    if (this.fx.hint && now > (this.fx.hint.memoryUntil ?? this.fx.hint.until)) this.fx.hint = null;
    if (this.fx.nudge && now > this.fx.nudge.until) this.fx.nudge = null;
    if (this.fx.shimmer && now > this.fx.shimmer.until) this.fx.shimmer = null;
  }
}

function shade(hex: string, amt: number): string {
  const n = hex.replace('#', '');
  const num = parseInt(n.length === 3 ? n.split('').map((c) => c + c).join('') : n, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}
