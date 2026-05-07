// physics.ts — Drift, damping, cursor repulsion, and motion smoothing.
//
// Called once per frame before position updates.
// Mutates particle velocity in-place; does not touch position.

import type { InteractionState, Particle, ParticleTheme, RuntimePolicy } from './types';
import { INTERACTION, BASE_ICON_SIZE } from './config';

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

/** Damping factor applied each frame to bleed off accumulated velocity.
 *  0.92 → velocity decays gently toward the drift baseline over ~12 frames. */
const DAMPING = 0.92;

/** Max speed cap in logical px/frame to prevent runaway particles. */
const MAX_SPEED = 1.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function magnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

// ---------------------------------------------------------------------------
// Per-particle physics update
// ---------------------------------------------------------------------------

/**
 * Applies one frame of physics to every particle:
 *   1. Drift bias — nudges velocity toward the current theme's drift vector.
 *   2. Random variance — adds micro-jitter each frame.
 *   3. Cursor repulsion — pushes particles away from the cursor.
 *   4. Scroll impulse — temporarily boosts speed on scroll.
 *   5. Damping — bleeds off excess velocity smoothly.
 *   6. Speed cap — prevents runaway motion.
 */
export function applyPhysics(
  particles: Particle[],
  interaction: InteractionState,
  theme: ParticleTheme,
  policy: RuntimePolicy,
): void {
  const { drift, speedMultiplier, variance } = theme.motion;
  const scrollBoost = interaction.scrollImpulse * speedMultiplier;

  for (const p of particles) {
    // 1. Soft drift pull — lerp velocity toward drift direction each frame.
    //    The lerp factor (0.02) is deliberately slow for ambient feel.
    p.vx += (drift.x * speedMultiplier - p.vx) * 0.08;
    p.vy += (drift.y * speedMultiplier - p.vy) * 0.08;

    // 2. Random micro-variance for organic feel.
    if (variance > 0) {
      p.vx += (Math.random() - 0.5) * variance;
      p.vy += (Math.random() - 0.5) * variance;
    }

    // 3. Cursor repulsion.
    if (policy.enableCursorRepulsion && interaction.cursor !== null) {
      const dx = p.x - interaction.cursor.x;
      const dy = p.y - interaction.cursor.y;
      const dist = magnitude(dx, dy);

      if (dist > 0 && dist < INTERACTION.cursorRadius) {
        // Smooth quadratic falloff: force is strongest at distance 0
        // and drops to 0 at the interaction radius boundary.
        const falloff = 1 - dist / INTERACTION.cursorRadius;
        const force = INTERACTION.repulsionStrength * falloff * falloff;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }

    // 4. Apply scroll impulse.
    if (scrollBoost > 1.0) {
      p.vx *= scrollBoost;
      p.vy *= scrollBoost;
    }

    // 5. Damping — pulls velocity back toward calm baseline.
    p.vx *= DAMPING;
    p.vy *= DAMPING;

    // 6. Speed cap.
    const speed = magnitude(p.vx, p.vy);
    if (speed > MAX_SPEED) {
      const scale = MAX_SPEED / speed;
      p.vx *= scale;
      p.vy *= scale;
    }
  }
}

/**
 * Smoothly interpolates a particle's glowIntensity toward the theme target.
 * Separated from velocity physics so it can be skipped under reduced-motion.
 */
export function updateGlowIntensities(
  particles: Particle[],
  targetIntensity: number,
  lerpFactor = 0.05,
): void {
  for (const p of particles) {
    p.glowIntensity += (targetIntensity - p.glowIntensity) * lerpFactor;
    p.glowIntensity = clamp(p.glowIntensity, 0, 1);
  }
}

/**
 * Resolves particle–particle collisions with elastic impulse response.
 * Call after position updates each frame. O(n²) — fine for ≤120 particles.
 * Restitution < 1 keeps the system ambient rather than chaotic.
 */
export function resolveCollisions(particles: Particle[]): void {
  const restitution = 0.55;

  for (let i = 0; i < particles.length - 1; i++) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;
      const minSep = (a.scale + b.scale) * BASE_ICON_SIZE * 0.5;
      if (distSq >= minSep * minSep || distSq === 0) continue;

      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Relative velocity along collision normal — skip if already separating.
      const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rvn > 0) continue;

      // Equal-mass impulse
      const impulse = -(1 + restitution) * rvn * 0.5;
      a.vx -= impulse * nx;
      a.vy -= impulse * ny;
      b.vx += impulse * nx;
      b.vy += impulse * ny;

      // Positional correction — push apart by half the overlap to prevent sinking.
      const correction = (minSep - dist) * 0.5;
      a.x -= nx * correction;
      a.y -= ny * correction;
      b.x += nx * correction;
      b.y += ny * correction;
    }
  }
}

