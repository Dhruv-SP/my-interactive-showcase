// config.ts — Central configuration source of truth.
// Every tunable value lives here. Engine modules must not hardcode constants.

import type {
  GlowConfig,
  MotionConfig,
  ParticleTheme,
  RuntimePolicy,
  SectionId,
  SectionTheme,
} from './types';

// ---------------------------------------------------------------------------
// Particle sizing
// ---------------------------------------------------------------------------

/** Base rendered size of each icon in logical pixels. */
export const BASE_ICON_SIZE = 32;

// ---------------------------------------------------------------------------
// Particle limits
// ---------------------------------------------------------------------------

export const PARTICLE_LIMITS = {
  desktop: 220,
  mobile: 40,
  reducedMotion: 20,
} as const;

// ---------------------------------------------------------------------------
// FPS targets
// ---------------------------------------------------------------------------

export const FPS_TARGETS = {
  desktop: 60,
  mobile: 60,
  reducedMotion: 30,
} as const;

// ---------------------------------------------------------------------------
// Interaction settings
// ---------------------------------------------------------------------------

export const INTERACTION = {
  /** Radius in logical pixels within which cursor repels particles. */
  cursorRadius: 120,
  /** Peak repulsion force at distance 0 (falls off with squared distance). */
  repulsionStrength: 0.5,
  /** Scroll velocity multiplier applied instantly on scroll. */
  scrollImpulse: 1.2,
  /** Time in ms for scroll impulse to fully decay back to 1.0. */
  scrollDecayMs: 300,
} as const;

// ---------------------------------------------------------------------------
// Transition timing
// ---------------------------------------------------------------------------

export const TRANSITION = {
  /** Default section-to-section interpolation duration in ms. */
  durationMs: 200,
  minDurationMs: 400,
  maxDurationMs: 800,
} as const;

// ---------------------------------------------------------------------------
// DPR cap (prevents excessive canvas resolution on high-DPR devices)
// ---------------------------------------------------------------------------

export const MAX_DPR = 2;

// ---------------------------------------------------------------------------
// Base motion defaults (shared starting point for all section themes)
// ---------------------------------------------------------------------------

const BASE_MOTION: MotionConfig = {
  drift: { x: -0.08, y: 0.05 },
  speedMultiplier: 1.0,
  variance: 0.012,
};

// ---------------------------------------------------------------------------
// Base glow defaults
// ---------------------------------------------------------------------------

const BASE_GLOW: GlowConfig = {
  color: 'rgba(56, 189, 170, 0.55)',
  blur: 14,
  intensity: 0.45,
};

// ---------------------------------------------------------------------------
// Section themes
// Drift vectors match the design spec examples; color/glow are tunable.
// ---------------------------------------------------------------------------

export const SECTION_THEMES: Record<SectionId, ParticleTheme> = {
  hero: {
    color: 'rgba(160, 230, 220, 0.82)',
    opacity: 0.6,
    glow: {
      color: 'rgba(56, 189, 170, 0.55)',
      blur: 16,
      intensity: 0.5,
    },
    motion: {
      drift: { x: -0.15, y: 0.08 },
      speedMultiplier: 1.15,
      variance: 0.012,
    },
  },

  certificates: {
    color: 'rgba(160, 230, 220, 0.82)',
    opacity: 0.25,
    glow: {
      color: 'rgba(56, 189, 170, 0.55)',
      blur: 12,
      intensity: 0.38,
    },
    motion: {
      drift: { x: 0.12, y: -0.06 },
      speedMultiplier: 1.1,
      variance: 0.011,
    },
  },

  projects: {
    color: 'rgba(160, 230, 220, 0.82)',
    opacity: 0.25,
    glow: {
      color: 'rgba(48, 160, 200, 0.5)',
      blur: 12,
      intensity: 0.4,
    },
    motion: {
      drift: { x: 0.08, y: 0.05 },
      speedMultiplier: 1.15,
      variance: 0.01,
    },
  },

  skills: {
    color: 'rgba(160, 230, 220, 0.82)',
    opacity: 0.25,
    glow: {
      color: 'rgba(48, 160, 200, 0.5)',
      blur: 14,
      intensity: 0.42,
    },
    motion: {
      drift: { x: -0.1, y: -0.05 },
      speedMultiplier: 1.2,
      variance: 0.013,
    },
  },

  blog: {
    color: 'rgba(160, 230, 220, 0.82)',
    opacity: 0.25,
    glow: {
      color: 'rgba(48, 160, 200, 0.5)',
      blur: 11,
      intensity: 0.38,
    },
    motion: {
      drift: { x: 0.06, y: -0.08 },
      speedMultiplier: 1.1,
      variance: 0.009,
    },
  },

  contact: {
    color: 'rgba(160, 230, 220, 0.82)',
    opacity: 0,
    glow: {
      color: 'rgba(48, 160, 200, 0.5)',
      blur: 10,
      intensity: 0.35,
    },
    motion: {
      drift: { x: -0.05, y: 0.02 },
      speedMultiplier: 1.15,
      variance: 0.008,
    },
  },
};

/** Section themes as an ordered array for use by the theme controller. */
export const SECTION_THEMES_LIST: SectionTheme[] = (
  Object.entries(SECTION_THEMES) as [SectionId, ParticleTheme][]
).map(([id, theme]) => ({ id, theme }));

/** Default theme used before any section is detected (falls back to hero). */
export const DEFAULT_THEME: ParticleTheme = SECTION_THEMES.hero;

// ---------------------------------------------------------------------------
// Reduced-motion overrides
// Applied on top of whichever section theme is active.
// ---------------------------------------------------------------------------

export const REDUCED_MOTION_OVERRIDES: Partial<ParticleTheme> = {
  opacity: 0.18,
  glow: {
    ...BASE_GLOW,
    blur: 6,
    intensity: 0.2,
  },
};

export const REDUCED_MOTION_MOTION_OVERRIDES: Partial<MotionConfig> = {
  speedMultiplier: 0.4,
  variance: 0.003,
};

// ---------------------------------------------------------------------------
// Mobile overrides
// Applied on top of the active section theme when isMobile is true.
// ---------------------------------------------------------------------------

export const MOBILE_OVERRIDES: Partial<ParticleTheme> = {
  opacity: 0.28,
  glow: {
    ...BASE_GLOW,
    blur: 8,
    intensity: 0.3,
  },
};

// ---------------------------------------------------------------------------
// Runtime policy factory
// Call once at mount time; result is stable for the engine lifetime.
// ---------------------------------------------------------------------------

export function resolveRuntimePolicy(): RuntimePolicy {
  const isMobile =
    typeof window !== 'undefined' &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dpr = Math.min(
    typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1,
    MAX_DPR,
  );

  let maxParticles: number;
  let targetFps: number;

  if (prefersReducedMotion) {
    maxParticles = PARTICLE_LIMITS.reducedMotion;
    targetFps = FPS_TARGETS.reducedMotion;
  } else if (isMobile) {
    maxParticles = PARTICLE_LIMITS.mobile;
    targetFps = FPS_TARGETS.mobile;
  } else {
    maxParticles = PARTICLE_LIMITS.desktop;
    targetFps = FPS_TARGETS.desktop;
  }

  return {
    isMobile,
    prefersReducedMotion,
    dpr,
    maxParticles,
    targetFps,
    enableCursorRepulsion: !prefersReducedMotion,
    enableGlow: !prefersReducedMotion,
  };
}

// ---------------------------------------------------------------------------
// Theme merge helpers
// Merge overrides onto a base theme without mutating the original.
// ---------------------------------------------------------------------------

export function applyMotionOverrides(
  base: ParticleTheme,
  motionOverrides: Partial<MotionConfig>,
): ParticleTheme {
  return {
    ...base,
    motion: { ...base.motion, ...motionOverrides },
  };
}

export function applyThemeOverrides(
  base: ParticleTheme,
  overrides: Partial<ParticleTheme>,
): ParticleTheme {
  return {
    ...base,
    ...overrides,
    glow: overrides.glow ? { ...base.glow, ...overrides.glow } : base.glow,
    motion: base.motion,
  };
}

// Re-export base defaults for modules that need a reference point.
export { BASE_MOTION, BASE_GLOW };

