// BackgroundCanvas.tsx — Single persistent fullscreen canvas host.
//
// Responsibilities (per spec):
//   • Mount one <canvas> element, styled fullscreen behind all content.
//   • Initialise the engine once on mount; clean up on unmount.
//   • Handle window resize.
//   • Drive the per-frame engine tick via useAnimationFrame.
//   • React NEVER stores particle positions or frame state.
//
// NOT responsible for: rendering logic, particle updates, physics.

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
import {
  resolveRuntimePolicy,
  DEFAULT_THEME,
  applyThemeOverrides,
  applyMotionOverrides,
  REDUCED_MOTION_OVERRIDES,
  REDUCED_MOTION_MOTION_OVERRIDES,
  MOBILE_OVERRIDES,
  SECTION_THEMES,
} from '../background/config';
import { preloadIcons } from '../background/icons';
import { initParticles, updateParticles, reconcileParticleCount } from '../background/particleSystem';
import { applyPhysics, updateGlowIntensities, resolveCollisions } from '../background/physics';
import { createInteractionState, attachInteractionListeners, decayScrollImpulse } from '../background/interactions';
import { createThemeController, transitionToSection, tickTheme } from '../background/themeController';
import { resizeCanvas, renderFrame } from '../background/renderer';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { SectionBand, SectionId } from '../background/types';

// ---------------------------------------------------------------------------
// Engine state — lives outside React (never in useState / useReducer).
// ---------------------------------------------------------------------------

interface EngineState {
  particles: ReturnType<typeof initParticles>;
  interaction: ReturnType<typeof createInteractionState>;
  themeCtrl: ReturnType<typeof createThemeController>;
  iconImages: Map<string, HTMLImageElement>;
  width: number;
  height: number;
  ready: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BackgroundCanvasProps {
  /** Active section id — passed in from the parent via useSectionTheme. */
  activeSection?: SectionId;
  /** Refs to each section's DOM wrapper, used for per-particle positional opacity. */
  sectionRefs?: Partial<Record<SectionId, React.RefObject<HTMLDivElement | null>>>;
}

export function BackgroundCanvas({ activeSection, sectionRefs }: BackgroundCanvasProps): React.ReactElement {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const engineRef      = useRef<EngineState | null>(null);
  const policyRef      = useRef(resolveRuntimePolicy());
  const cleanupRef     = useRef<(() => void) | null>(null);
  const sectionRefsRef = useRef(sectionRefs);
  useEffect(() => { sectionRefsRef.current = sectionRefs; }, [sectionRefs]);

  // Live reduced-motion preference — changes trigger a policy rebuild.
  const prefersReducedMotion = useReducedMotion();

  // targetFps as React state so useAnimationFrame restarts when it changes.
  const [targetFps, setTargetFps] = useState<number>(policyRef.current.targetFps);

  // ------------------------------------------------------------------
  // Initialise engine on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const policy = policyRef.current;

    // Size canvas to viewport before anything else.
    const { width, height } = resizeCanvas(canvas, policy.dpr);

    // Build initial theme with policy overrides applied.
    let initialTheme = DEFAULT_THEME;
    if (policy.isMobile)           initialTheme = applyThemeOverrides(initialTheme, MOBILE_OVERRIDES);
    if (policy.prefersReducedMotion) {
      initialTheme = applyThemeOverrides(initialTheme, REDUCED_MOTION_OVERRIDES);
      initialTheme = applyMotionOverrides(initialTheme, REDUCED_MOTION_MOTION_OVERRIDES);
    }

    const interaction = createInteractionState();
    const themeCtrl   = createThemeController('hero', policy);
    const particles   = initParticles(policy.maxParticles, width, height, initialTheme);

    engineRef.current = {
      particles,
      interaction,
      themeCtrl,
      iconImages: new Map(),
      width,
      height,
      ready: false,
    };

    // Attach interaction listeners; store cleanup.
    cleanupRef.current = attachInteractionListeners(canvas, interaction);

    // Preload icons — engine runs with empty images until ready, then starts drawing.
    preloadIcons().then((images) => {
      if (!engineRef.current) return;
      engineRef.current.iconImages = images;
      engineRef.current.ready = true;
    });

    // Resize handler.
    function handleResize(): void {
      const eng = engineRef.current;
      if (!eng || !canvasRef.current) return;
      const { width: w, height: h } = resizeCanvas(canvasRef.current, policyRef.current.dpr);
      eng.width  = w;
      eng.height = h;
    }

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cleanupRef.current?.();
      window.removeEventListener('resize', handleResize);
      engineRef.current = null;
    };
  }, []); // runs once

  // ------------------------------------------------------------------
  // React to runtime prefers-reduced-motion changes
  // ------------------------------------------------------------------
  useEffect(() => {
    // Rebuild the full policy with the new reduced-motion value.
    const newPolicy = resolveRuntimePolicy();
    policyRef.current = newPolicy;
    setTargetFps(newPolicy.targetFps);

    const eng = engineRef.current;
    if (!eng) return;

    // Reconcile particle count immediately (may shrink or grow the pool).
    reconcileParticleCount(
      eng.particles,
      newPolicy.maxParticles,
      eng.width,
      eng.height,
      eng.themeCtrl.activeTheme,
    );

    // Re-apply policy overrides to the current section theme.
    transitionToSection(eng.themeCtrl, eng.themeCtrl.currentSection, newPolicy);
  }, [prefersReducedMotion]);

  // ------------------------------------------------------------------
  // React to active section changes
  // ------------------------------------------------------------------
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng || !activeSection) return;
    transitionToSection(eng.themeCtrl, activeSection, policyRef.current);
  }, [activeSection]);

  // ------------------------------------------------------------------
  // Per-frame engine tick
  // ------------------------------------------------------------------
  const tick = useCallback((now: number) => {
    const eng    = engineRef.current;
    const canvas = canvasRef.current;
    if (!eng || !canvas || !eng.ready) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const policy = policyRef.current;

    // Advance theme interpolation.
    const activeTheme = tickTheme(eng.themeCtrl, now);

    // Decay scroll impulse (frame-rate independent, uses wall-clock).
    decayScrollImpulse(eng.interaction, now);

    // Physics pass — mutates particle velocities.
    applyPhysics(eng.particles, eng.interaction, activeTheme, policy);

    // Glow intensity lerp (skipped if glow disabled).
    if (policy.enableGlow) {
      updateGlowIntensities(eng.particles, activeTheme.glow.intensity);
    }

    // Position update + viewport wrapping.
    updateParticles(eng.particles, eng.width, eng.height);

    // Collision resolution — elastic bounce when icons get too close.
    resolveCollisions(eng.particles);

    // Ensure particle count stays in sync with policy (e.g. after resize).
    reconcileParticleCount(eng.particles, policy.maxParticles, eng.width, eng.height, activeTheme);

    // Build per-section viewport bands so renderer can assign opacity by particle position.
    const bands: SectionBand[] = [];
    const refs = sectionRefsRef.current;
    if (refs) {
      for (const [id, ref] of Object.entries(refs) as [SectionId, React.RefObject<HTMLDivElement | null>][]) {
        const el = ref?.current;
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        bands.push({ top: rect.top, bottom: rect.bottom, opacity: SECTION_THEMES[id].opacity });
      }
    }

    // Render pass.
    renderFrame(
      {
        ctx,
        width:        eng.width,
        height:       eng.height,
        dpr:          policy.dpr,
        activeTheme,
        particles:    eng.particles,
        iconImages:   eng.iconImages,
        sectionBands: bands.length > 0 ? bands : undefined,
      },
      policy.enableGlow,
    );
  }, []);

  useAnimationFrame(tick, targetFps);

  // ------------------------------------------------------------------
  // Render — just the canvas element, styled to sit behind all content
  // ------------------------------------------------------------------
  return (
    <canvas
      ref={canvasRef}
      style={{
        position:  'fixed',
        inset:     0,
        width:     '100%',
        height:    '100%',
        zIndex:    0,
        display:   'block',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}

