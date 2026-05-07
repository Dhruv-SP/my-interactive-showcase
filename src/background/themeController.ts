// themeController.ts — Section theme transitions and interpolation.
//
// Owns the active/target theme pair and the interpolation clock.
// The engine calls tickTheme() each frame; it returns the blended theme
// that renderer.ts and physics.ts should use for that frame.

import type { GlowConfig, MotionConfig, ParticleTheme, SectionId, Vec2 } from './types';
import {
  SECTION_THEMES,
  TRANSITION,
  applyThemeOverrides,
  applyMotionOverrides,
  REDUCED_MOTION_OVERRIDES,
  REDUCED_MOTION_MOTION_OVERRIDES,
  MOBILE_OVERRIDES,
} from './config';
import type { RuntimePolicy } from './types';

// ---------------------------------------------------------------------------
// Interpolation helpers — all operate on plain numbers or typed objects.
// ---------------------------------------------------------------------------

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function lerpGlow(a: GlowConfig, b: GlowConfig, t: number): GlowConfig {
  return {
    color:     t < 0.5 ? a.color : b.color,   // snap color at midpoint
    blur:      lerp(a.blur, b.blur, t),
    intensity: lerp(a.intensity, b.intensity, t),
  };
}

function lerpMotion(a: MotionConfig, b: MotionConfig, t: number): MotionConfig {
  return {
    drift:           lerpVec2(a.drift, b.drift, t),
    speedMultiplier: lerp(a.speedMultiplier, b.speedMultiplier, t),
    variance:        lerp(a.variance, b.variance, t),
  };
}

function lerpTheme(a: ParticleTheme, b: ParticleTheme, t: number): ParticleTheme {
  return {
    color:   t < 0.5 ? a.color : b.color,  // snap color at midpoint
    opacity: lerp(a.opacity, b.opacity, t),
    //opacity: b.opacity,
    glow:    lerpGlow(a.glow, b.glow, t),
    motion:  lerpMotion(a.motion, b.motion, t),
  };
}

/** Smooth-step easing: produces smoother start/end than linear. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Theme controller state
// ---------------------------------------------------------------------------

export interface ThemeController {
  /** Theme being interpolated FROM. */
  fromTheme: ParticleTheme;
  /** Theme being interpolated TO. */
  toTheme: ParticleTheme;
  /** wall-clock ms when the current transition started. */
  startTime: number;
  /** Duration of the current transition in ms. */
  duration: number;
  /** The last fully-resolved (interpolated + policy-overridden) theme. */
  activeTheme: ParticleTheme;
  /** Current section id. */
  currentSection: SectionId;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a ThemeController initialised to the given section.
 * The engine should call this once at startup.
 */
export function createThemeController(
  initialSection: SectionId,
  policy: RuntimePolicy,
): ThemeController {
  const base = SECTION_THEMES[initialSection];
  const active = applyPolicyOverrides(base, policy);
  return {
    fromTheme:      active,
    toTheme:        active,
    startTime:      performance.now(),
    duration:       TRANSITION.durationMs,
    activeTheme:    active,
    currentSection: initialSection,
  };
}

// ---------------------------------------------------------------------------
// Policy overrides (reduced-motion + mobile)
// ---------------------------------------------------------------------------

function applyPolicyOverrides(
  theme: ParticleTheme,
  policy: RuntimePolicy,
): ParticleTheme {
  let result = theme;

  if (policy.isMobile) {
    result = applyThemeOverrides(result, MOBILE_OVERRIDES);
  }
  if (policy.prefersReducedMotion) {
    result = applyThemeOverrides(result, REDUCED_MOTION_OVERRIDES);
    result = applyMotionOverrides(result, REDUCED_MOTION_MOTION_OVERRIDES);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Section change
// ---------------------------------------------------------------------------

/**
 * Triggers a smooth transition to a new section.
 * Safe to call on every scroll update — it only acts when the section changes.
 */
export function transitionToSection(
  ctrl: ThemeController,
  newSection: SectionId,
  policy: RuntimePolicy,
  now = performance.now(),
): void {
  if (newSection === ctrl.currentSection) return;

  ctrl.fromTheme      = ctrl.activeTheme;             // start from wherever we are
  ctrl.toTheme        = applyPolicyOverrides(SECTION_THEMES[newSection], policy);
  ctrl.startTime      = now;
  ctrl.duration       = TRANSITION.durationMs;
  ctrl.currentSection = newSection;
}

// ---------------------------------------------------------------------------
// Per-frame tick
// ---------------------------------------------------------------------------

/**
 * Called once per frame. Advances the transition clock, interpolates the
 * active theme, and returns it for use by the renderer and physics modules.
 */
export function tickTheme(
  ctrl: ThemeController,
  now = performance.now(),
): ParticleTheme {
  const elapsed = now - ctrl.startTime;
  const rawT    = Math.min(elapsed / ctrl.duration, 1);
  const t       = smoothstep(rawT);

  ctrl.activeTheme = lerpTheme(ctrl.fromTheme, ctrl.toTheme, t);
  return ctrl.activeTheme;
}

/**
 * Returns true if a transition is currently in progress.
 * Useful for the renderer to decide whether to skip optimisations.
 */
export function isTransitioning(ctrl: ThemeController, now = performance.now()): boolean {
  return now - ctrl.startTime < ctrl.duration;
}

