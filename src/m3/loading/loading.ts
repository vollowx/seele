/**
 * @license
 * Copyright 2026 brahmkshatriya
 * Modifications Copyright 2026 Lucas X. Zhao
 * SPDX-License-Identifier: Apache-2.0
 */

// Origin: https://github.com/brahmkshatriya/material-osc/blob/main/assets/loading-shape-morph-demo.html

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { InternalsAttached, internals } from '../../base/mixins/internals-attached.js';
import { loadingStyles } from './loading-styles.css.js';

const STEP_MS = 650;
const FULL_ROTATION_MS = 4666;
const QUARTER_ROTATION = 90;
const TOTAL_POINTS = 240;
const CANVAS_SIZE = 640;
const RADIUS_BASE = CANVAS_SIZE / 2;
const CENTER = CANVAS_SIZE / 2;

/**
 * @tag md-loading
 *
 * TODO: shape system, https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt?q=file:androidx%2Fcompose%2Fmaterial3%2FMaterialShapes.kt%20class:androidx.compose.material3.MaterialShapes
 * NOTE: this component is not following them color system dynamically, but
 *       pulls the color once per second
 * NOTE: the pantagon is completely not following the shape system
 */
@customElement('md-loading')
export class M3Loading extends InternalsAttached(LitElement) {
  @property({ type: Boolean, reflect: true }) contained = false;
  @query('canvas') $canvas!: HTMLCanvasElement;

  static override styles = [loadingStyles];
  override render() {
    return html`<canvas
      width="${CANVAS_SIZE}"
      height="${CANVAS_SIZE}"
      aria-hidden="true"
    ></canvas>`;
  }

  #ctx!: CanvasRenderingContext2D | null;
  #animationFrame = 0;
  #startTime = 0;

  #color = '#ff0000';

  constructor() {
    super();
    this[internals].role = 'progressbar';
    this[internals].ariaValueMin = '0';
    this[internals].ariaValueMax = '1';
  }

  override firstUpdated() {
    this.#ctx = this.$canvas.getContext('2d');
    this.#cacheColors();
    setInterval(this.#cacheColors.bind(this), 1000);
    this.#animationFrame = requestAnimationFrame(this.#animate);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.#animationFrame);
  }

  #cacheColors() {
    const computed = getComputedStyle(this);
    const color = computed
      .getPropertyValue(
        this.contained
          ? '--md-sys-color-on-primary-container'
          : '--md-sys-color-primary'
      )
      .trim();

    if (color)
      this.#color = color;
  }

  #draw(
    from: SampledShape,
    to: SampledShape,
    progress: number,
    rotation: number,
    scale: number
  ) {
    if (!this.#ctx || !this.$canvas) return;
    const ctx = this.#ctx;

    ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.scale(scale, scale);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-CENTER, -CENTER);
    ctx.beginPath();

    from.points.forEach((point, i) => {
      const next = to.points[i];
      const x = lerp(point.x, next.x, progress);
      const y = lerp(point.y, next.y, progress);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.closePath();
    ctx.fillStyle = this.#color;
    ctx.fill();
    ctx.restore();
  }

  #animate = (now: DOMHighResTimeStamp) => {
    if (this.#startTime === 0) {
      this.#startTime = now;
    }

    const elapsed = now - this.#startTime;
    const step = Math.floor(elapsed / STEP_MS);
    const morphElapsed = elapsed % STEP_MS;
    const progress = springProgress(morphElapsed);
    const from = sampledSequence[step % sampledSequence.length];
    const to = sampledSequence[(step + 1) % sampledSequence.length];

    const stepRotation = step * QUARTER_ROTATION + progress * QUARTER_ROTATION;
    const globalRotation =
      ((elapsed % FULL_ROTATION_MS) / FULL_ROTATION_MS) * 360;

    this.#draw(
      from,
      to,
      progress,
      stepRotation + globalRotation,
      scalePulse(morphElapsed)
    );
    this.#animationFrame = requestAnimationFrame(this.#animate);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'md-loading': M3Loading;
  }
}

type Point = { x: number; y: number; outer?: boolean };
type ShapeDef = {
  points: number;
  outerRadius: number;
  innerRadius: number;
  outerRoundness: number;
  innerRoundness: number;
};
type SampledShape = { points: Point[] };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const norm = (x: number, y: number, fallback = { x: 1, y: 0 }) => {
  const len = Math.hypot(x, y);
  return len < 1e-6 ? fallback : { x: x / len, y: y / len };
};

const sequence: ShapeDef[] = [
  [10, 0.85, 0.67, 0.75, 0.5],
  [9, 0.85, 0.755, 0.8, 0.5],
  [5, 0.85, 0.731, 0.45, 1],
  [2, 0.85, 0.67, 0.8, 0.95],
  [8, 0.85, 0.731, 0.6, 0.45],
  [4, 0.925, 0.67, 1, 0.4],
  [2, 0.9, 0.565, 0.8, 0.6],
].map(([points, outerRadius, innerRadius, outerRoundness, innerRoundness]) => ({
  points,
  outerRadius,
  innerRadius,
  outerRoundness,
  innerRoundness,
}));

function springProgress(ms: number) {
  const t = ms / 1000;

  const stiffness = 200;

  const damping = 0.6;
  const omega0 = Math.sqrt(stiffness);
  const omegaD = omega0 * Math.sqrt(1 - damping * damping);

  const displacement =
    Math.exp(-damping * omega0 * t) *
    (-Math.cos(omegaD * t) -
      ((damping * omega0) / omegaD) * Math.sin(omegaD * t));

  return clamp(1 + displacement, 0, 1);
}

function scalePulse(ms: number) {
  const t = ms / STEP_MS;
  const smooth = (p: number) => p * p * (3 - 2 * p);
  const outCubic = (p: number) => 1 - (1 - p) ** 3;
  const segments: [number, number, number, number, (p: number) => number][] = [
    [0, 0.14, 1, 0.985, smooth],
    [0.14, 0.46, 0.985, 1.04, outCubic],
    [0.46, 0.76, 1.04, 1, smooth],
  ];
  const segment = segments.find(([start, end]) => t < end && t >= start);

  if (!segment) return 1;

  const [start, end, from, to, ease] = segment;
  return lerp(from, to, ease((t - start) / (end - start)));
}

function starGeometry(shape: ShapeDef) {
  const points = Math.max(2, Math.floor(shape.points));
  const count = points * 2;

  const anchors = Array.from({ length: count }, (_, i) => {
    const outer = i % 2 === 0;
    const radius =
      (outer ? shape.outerRadius : shape.innerRadius) * RADIUS_BASE;
    const angle = (i * Math.PI) / points;
    return {
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
      outer,
    };
  });

  const tangents = anchors.map((_, i) => {
    const prev = anchors[(i - 1 + count) % count];

    const next = anchors[(i + 1) % count];
    return norm(next.x - prev.x, next.y - prev.y);
  });

  const lengths = anchors.map((anchor, i) => {
    const prev = anchors[(i - 1 + count) % count];
    const next = anchors[(i + 1) % count];
    const roundness = anchor.outer
      ? shape.outerRoundness
      : shape.innerRoundness;

    return (
      Math.max(0, roundness) *
      Math.min(dist(anchor, prev), dist(anchor, next)) *
      0.5
    );
  });

  const handles = anchors.map((anchor, i) => {
    const tangent = tangents[i];
    const length = lengths[i];
    return {
      in: {
        x: anchor.x - tangent.x * length,
        y: anchor.y - tangent.y * length,
      },
      out: {
        x: anchor.x + tangent.x * length,
        y: anchor.y + tangent.y * length,
      },
    };
  });

  return { anchors, handles };
}

function cubic(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const inv = 1 - t;
  return {
    x:
      inv ** 3 * p0.x +
      3 * inv * inv * t * c1.x +
      3 * inv * t * t * c2.x +
      t ** 3 * p1.x,
    y:
      inv ** 3 * p0.y +
      3 * inv * inv * t * c1.y +
      3 * inv * t * t * c2.y +
      t ** 3 * p1.y,
  };
}

function resample(points: Point[]): Point[] {
  const lengths = points.map((point, i) =>
    dist(point, points[(i + 1) % points.length])
  );

  const perimeter = lengths.reduce((sum, length) => sum + length, 0);
  const sampled: Point[] = [];
  let edge = 0;
  let consumed = 0;

  for (let i = 0; i < TOTAL_POINTS; i++) {
    const target = (perimeter * i) / TOTAL_POINTS;
    while (consumed + lengths[edge] < target && edge < lengths.length - 1) {
      consumed += lengths[edge++];
    }
    const point = points[edge];
    const next = points[(edge + 1) % points.length];
    const t = (target - consumed) / (lengths[edge] || 1);
    sampled.push({ x: lerp(point.x, next.x, t), y: lerp(point.y, next.y, t) });
  }

  return sampled;
}

function sampleShape(shape: ShapeDef): SampledShape {
  const { anchors, handles } = starGeometry(shape);
  const dense: Point[] = [];

  anchors.forEach((anchor, i) => {
    const next = (i + 1) % anchors.length;
    for (let step = 0; step < 18; step++) {
      dense.push(
        cubic(
          anchor,
          handles[i].out,
          handles[next].in,
          anchors[next],
          step / 18
        )
      );
    }
  });

  return { points: resample(dense) };
}

function shifted(points: Point[], offset: number): Point[] {
  return points.map((_, i) => points[(i + offset) % points.length]);
}

function alignTo(from: SampledShape, to: SampledShape): SampledShape {
  let bestOffset = 0;
  let bestScore = Infinity;

  for (let offset = 0; offset < to.points.length; offset++) {
    let score = 0;
    for (let i = 0; i < from.points.length; i += 4) {
      const point = to.points[(i + offset) % to.points.length];

      score +=
        (from.points[i].x - point.x) ** 2 + (from.points[i].y - point.y) ** 2;
    }

    if (score < bestScore) {
      bestScore = score;
      bestOffset = offset;
    }
  }

  return { ...to, points: shifted(to.points, bestOffset) };
}

const sampledSequence = sequence
  .map(sampleShape)
  .reduce((aligned: SampledShape[], shape: SampledShape) => {
    aligned.push(aligned.length ? alignTo(aligned.at(-1)!, shape) : shape);
    return aligned;
  }, []);
