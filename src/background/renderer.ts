// renderer.ts — Canvas 2D draw pipeline.
//
// Responsibilities:
//   • Clear the canvas each frame.
//   • Apply DPR scaling once (the ctx transform is set at init, not per-frame).
//   • Draw each particle: glow pass (optional) then icon pass.
//   • Keep allocations near-zero inside the hot path — no new objects per frame.

import type { RendererState, SectionBand } from './types';
import { BASE_ICON_SIZE } from './config';
import { drawMonochromeIcon } from './icons';

// ---------------------------------------------------------------------------
// Canvas initialisation (called once at mount)
// ---------------------------------------------------------------------------

/**
 * Sizes the canvas to fill its CSS container and applies DPR scaling so
 * the backing store is sharp on high-density displays.
 *
 * Call this on mount and on every resize event.
 */
export function resizeCanvas(
  canvas: HTMLCanvasElement,
  dpr: number,
): { width: number; height: number } {
  const width  = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width  = Math.round(width  * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Scale once so all drawing code works in logical pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { width, height };
}

// ---------------------------------------------------------------------------
// Frame clear
// ---------------------------------------------------------------------------

/**
 * Clears the entire canvas to transparent black.
 * Must be called at the start of every frame before drawing particles.
 */
export function clearFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
}

// ---------------------------------------------------------------------------
// Glow pass helpers
// ---------------------------------------------------------------------------

function setGlowShadow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number,
): void {
  ctx.shadowColor = color;
  ctx.shadowBlur  = blur;
}

function clearGlowShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur  = 0;
}

// ---------------------------------------------------------------------------
// Main render pass — called once per frame
// ---------------------------------------------------------------------------

/**
 * Looks up the opacity for a particle at the given viewport Y position.
 * Falls back to the global theme opacity when no band matches.
 */
function opacityForY(y: number, bands: SectionBand[] | undefined, fallback: number): number {
  if (!bands || bands.length === 0) return fallback;
  for (const band of bands) {
    if (y >= band.top && y < band.bottom) return band.opacity;
  }
  return fallback;
}

/**
 * Draws all particles onto the canvas for this frame.
 *
 * Rendering strategy per particle:
 *   1. Glow pass (if enabled and glowIntensity > 0.01):
 *      Set ctx.shadow* then draw the icon at reduced opacity.
 *      This produces a soft halo without a separate offscreen buffer.
 *   2. Icon pass:
 *      Clear shadow, draw the icon at full particle opacity with tint.
 *
 * Two draws per particle is cheaper than a separate blur filter pass and
 * avoids creating temporary canvases inside the hot path.
 */
export function renderFrame(state: RendererState, enableGlow: boolean): void {
  const { ctx, width, height, activeTheme, particles, iconImages, sectionBands } = state;

  clearFrame(ctx, width, height);

  const tintColor = activeTheme.color;
  const glowColor = activeTheme.glow.color;
  const glowBlur  = activeTheme.glow.blur;

  for (const p of particles) {
    const img = iconImages.get(p.iconKey);
    if (!img) continue;

    const size  = BASE_ICON_SIZE * p.scale;
    const alpha = p.opacity * opacityForY(p.y, sectionBands, activeTheme.opacity);

    if (alpha < 0.005) continue;  // skip fully transparent particles

    // --- Glow pass ---
    if (enableGlow && p.glowIntensity > 0.01) {
      setGlowShadow(ctx, glowColor, glowBlur * p.glowIntensity);
      drawMonochromeIcon(ctx, img, p.x, p.y, size, tintColor, alpha * p.glowIntensity * 0.5);
      clearGlowShadow(ctx);
    }

    // --- Icon pass ---
    drawMonochromeIcon(ctx, img, p.x, p.y, size, tintColor, alpha);
  }
}

