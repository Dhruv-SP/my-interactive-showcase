// particleSystem.ts — Particle creation, lifecycle, and viewport wrapping.
//
// Owns the particle array. Does NOT perform physics or rendering.
// Physics updates are delegated to physics.ts each frame.

import type { Particle, ParticleTheme } from './types';
import { ICON_KEYS } from './icons';
import { BASE_ICON_SIZE } from './config';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let _nextId = 0;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Pick a random icon key from the registry. */
function randomIconKey(): string {
  return ICON_KEYS[Math.floor(Math.random() * ICON_KEYS.length)];
}

// ---------------------------------------------------------------------------
// Particle factory
// ---------------------------------------------------------------------------

/**
 * Spawns a single particle at a random position within the viewport.
 * Initial velocity is seeded from the current theme drift so particles
 * immediately move in the correct ambient direction.
 */
export function createParticle(
  width: number,
  height: number,
  theme: ParticleTheme,
): Particle {
  const id = _nextId++;

  // Randomise scale slightly so particles feel hand-placed, not uniform.
  const scale = randomBetween(0.6, 1.4);

  // Seed velocity from drift + small random variance so particles aren't
  // moving in lockstep.
  const { drift, variance } = theme.motion;
  const vx = drift.x + randomBetween(-variance * 4, variance * 4);
  const vy = drift.y + randomBetween(-variance * 4, variance * 4);

  // Stagger initial opacity so particles don't all fade in at once.
  // Note: renderer multiplies by theme.opacity at draw time, so store raw ratio here.
  const opacity = randomBetween(0.3, 1.0);

  return {
    id,
    iconKey: randomIconKey(),
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    vx,
    vy,
    scale,
    opacity,
    glowIntensity: theme.glow.intensity * randomBetween(0.5, 1.0),
  };
}

// ---------------------------------------------------------------------------
// Pool management
// ---------------------------------------------------------------------------

/**
 * Initialises a fresh particle pool using a jittered grid so particles are
 * distributed evenly — no dense clusters or voids at startup.
 * Each grid cell gets exactly one particle at a random position within it.
 */
export function initParticles(
  count: number,
  width: number,
  height: number,
  theme: ParticleTheme,
): Particle[] {
  const aspect = width / height;
  const cols   = Math.max(1, Math.round(Math.sqrt(count * aspect)));
  const rows   = Math.max(1, Math.ceil(count / cols));
  const cellW  = width  / cols;
  const cellH  = height / rows;

  // Collect all cells then shuffle so icon assignment is random.
  const cells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push([c, r]);
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const { drift, variance } = theme.motion;
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const [c, r] = cells[i % cells.length];
    // Jitter 15–85% into the cell so it feels organic, not grid-like.
    const x = (c + randomBetween(0.15, 0.85)) * cellW;
    const y = (r + randomBetween(0.15, 0.85)) * cellH;

    particles.push({
      id:           _nextId++,
      iconKey:      randomIconKey(),
      x,
      y,
      vx:           drift.x + randomBetween(-variance * 4, variance * 4),
      vy:           drift.y + randomBetween(-variance * 4, variance * 4),
      scale:        randomBetween(0.6, 1.4),
      opacity:      randomBetween(0.3, 1.0),
      glowIntensity: theme.glow.intensity * randomBetween(0.5, 1.0),
    });
  }
  return particles;
}

/**
 * Ensures the particle pool stays at `targetCount`.
 * Adds or removes from the tail — never mutates existing particle data.
 */
export function reconcileParticleCount(
  particles: Particle[],
  targetCount: number,
  width: number,
  height: number,
  theme: ParticleTheme,
): void {
  while (particles.length < targetCount) {
    particles.push(createParticle(width, height, theme));
  }
  if (particles.length > targetCount) {
    particles.splice(targetCount);
  }
}

// ---------------------------------------------------------------------------
// Viewport wrapping
// ---------------------------------------------------------------------------

/**
 * Wraps a particle that has drifted outside the viewport back to the
 * opposite edge. A small margin (1× icon size) is used so the icon is
 * fully off-screen before it wraps — avoids visible popping.
 */
export function wrapParticle(
  p: Particle,
  width: number,
  height: number,
): void {
  const margin = BASE_ICON_SIZE * p.scale;

  if (p.x < -margin)        p.x = width + margin;
  else if (p.x > width + margin)  p.x = -margin;

  if (p.y < -margin)        p.y = height + margin;
  else if (p.y > height + margin) p.y = -margin;
}

// ---------------------------------------------------------------------------
// Per-frame position update (called by the engine loop)
// ---------------------------------------------------------------------------

/**
 * Advances every particle by its current velocity for this frame.
 * Also applies viewport wrapping.
 *
 * Physics (repulsion, damping, variance) is applied by physics.ts BEFORE
 * this function is called, so velocity is already correct for this frame.
 */
export function updateParticles(
  particles: Particle[],
  width: number,
  height: number,
): void {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    wrapParticle(p, width, height);
  }
}

