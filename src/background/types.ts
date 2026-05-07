// ─── Core shared TypeScript contracts for the ambient background engine ───────
// All engine modules import from this file. Do not add logic here.

// ---------------------------------------------------------------------------
// Section identifiers
// ---------------------------------------------------------------------------

export type SectionId = 'hero' | 'certificates' | 'projects' | 'skills' | 'blog' | 'contact';

// ---------------------------------------------------------------------------
// Motion / drift
// ---------------------------------------------------------------------------

export interface Vec2 {
  x: number;
  y: number;
}

export interface MotionConfig {
  /** Base drift direction applied to every particle in this section. */
  drift: Vec2;
  /** Scalar multiplier on the global base speed (1.0 = default). */
  speedMultiplier: number;
  /** Amount of random jitter added per frame (0 = none). */
  variance: number;
}

// ---------------------------------------------------------------------------
// Visual theme per section
// ---------------------------------------------------------------------------

export interface GlowConfig {
  /** CSS color string used for the shadow glow. */
  color: string;
  /** Shadow blur radius in pixels. */
  blur: number;
  /** Opacity of the glow layer (0–1). */
  intensity: number;
}

export interface ParticleTheme {
  /** Base tint color applied to the monochrome icon (CSS color string). */
  color: string;
  /** Global opacity applied to particles in this section (0–1). */
  opacity: number;
  glow: GlowConfig;
  motion: MotionConfig;
}

export interface SectionTheme {
  id: SectionId;
  theme: ParticleTheme;
}

// ---------------------------------------------------------------------------
// Section band — viewport Y range mapped to an opacity value
// ---------------------------------------------------------------------------

export interface SectionBand {
  /** Viewport Y coordinate of the section's top edge (from getBoundingClientRect). */
  top: number;
  /** Viewport Y coordinate of the section's bottom edge. */
  bottom: number;
  /** Opacity value for particles whose Y falls within this band. */
  opacity: number;
}

// ---------------------------------------------------------------------------
// Particle
// ---------------------------------------------------------------------------

export interface Particle {
  /** Unique stable id for this particle instance. */
  id: number;
  /** Icon key from the icon registry. */
  iconKey: string;
  /** Current canvas position in logical pixels. */
  x: number;
  y: number;
  /** Current velocity vector in logical px/frame. */
  vx: number;
  vy: number;
  /** Scale factor relative to base icon size. */
  scale: number;
  /** Base opacity before section-theme and glow modifiers. */
  opacity: number;
  /** Current glow intensity (0–1), interpolated per frame. */
  glowIntensity: number;
}

// ---------------------------------------------------------------------------
// Interaction state
// ---------------------------------------------------------------------------

export interface InteractionState {
  /** Cursor position in logical canvas pixels. null when outside viewport. */
  cursor: Vec2 | null;
  /**
   * Scroll impulse multiplier applied to particle speed.
   * Decays from 1.2 toward 1.0 over ~0.3 s.
   */
  scrollImpulse: number;
}

// ---------------------------------------------------------------------------
// Renderer state (passed into renderer.ts each frame)
// ---------------------------------------------------------------------------

export interface RendererState {
  /** The 2D rendering context. */
  ctx: CanvasRenderingContext2D;
  /** Canvas logical width (before DPR scaling). */
  width: number;
  /** Canvas logical height (before DPR scaling). */
  height: number;
  /** Device pixel ratio at mount time. */
  dpr: number;
  /** Current interpolated theme applied this frame. */
  activeTheme: ParticleTheme;
  /** Live particle list. */
  particles: Particle[];
  /** Resolved icon images keyed by iconKey. */
  iconImages: Map<string, HTMLImageElement>;
  /** Per-section viewport bands for positional opacity lookup. Optional — falls back to activeTheme.opacity. */
  sectionBands?: SectionBand[];
}

// ---------------------------------------------------------------------------
// Engine context (shared mutable state owned by the engine, not React)
// ---------------------------------------------------------------------------

export interface EngineContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
  particles: Particle[];
  interaction: InteractionState;
  activeTheme: ParticleTheme;
  targetTheme: ParticleTheme;
  /** Timestamp (ms) when the current section transition started. */
  transitionStart: number;
  /** Transition duration in ms (400–800). */
  transitionDuration: number;
  iconImages: Map<string, HTMLImageElement>;
  /** requestAnimationFrame handle, used for cleanup. */
  rafHandle: number;
  /** Whether the engine is currently paused (e.g. tab hidden). */
  paused: boolean;
}

// ---------------------------------------------------------------------------
// Runtime environment policy
// ---------------------------------------------------------------------------

export interface RuntimePolicy {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  dpr: number;
  maxParticles: number;
  /** Target FPS (used to throttle via elapsed-time gate in the loop). */
  targetFps: number;
  enableCursorRepulsion: boolean;
  enableGlow: boolean;
}
