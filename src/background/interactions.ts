// interactions.ts — Mouse and scroll event tracking.
//
// Owns one InteractionState object. The engine reads it each frame.
// All DOM listeners are registered/removed via attach/detach lifecycle calls.

import type { InteractionState } from './types';
import { INTERACTION } from './config';

// ---------------------------------------------------------------------------
// State — one shared object mutated by event handlers, read by the engine.
// ---------------------------------------------------------------------------

export function createInteractionState(): InteractionState {
  return {
    cursor: null,
    scrollImpulse: 1.0,
  };
}

// ---------------------------------------------------------------------------
// Scroll impulse decay
// ---------------------------------------------------------------------------

let _lastScrollTime = 0;

/**
 * Called every frame by the engine to decay the scroll impulse back to 1.0.
 * Uses elapsed wall-clock time so decay is frame-rate independent.
 */
export function decayScrollImpulse(state: InteractionState, now: number): void {
  if (state.scrollImpulse <= 1.0) return;

  const elapsed = now - _lastScrollTime;
  const t = Math.min(elapsed / INTERACTION.scrollDecayMs, 1);
  // Linear decay from peak back to 1.0.
  state.scrollImpulse = 1.0 + (INTERACTION.scrollImpulse - 1.0) * (1 - t);

  if (state.scrollImpulse < 1.001) {
    state.scrollImpulse = 1.0;
  }
}

// ---------------------------------------------------------------------------
// DOM event handlers
// ---------------------------------------------------------------------------

type Canvas = HTMLCanvasElement;

function onMouseMove(state: InteractionState, canvas: Canvas, e: MouseEvent): void {
  const rect = canvas.getBoundingClientRect();
  state.cursor = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function onMouseLeave(state: InteractionState): void {
  state.cursor = null;
}

function onTouchMove(state: InteractionState, canvas: Canvas, e: TouchEvent): void {
  if (e.touches.length === 0) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  state.cursor = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function onTouchEnd(state: InteractionState): void {
  state.cursor = null;
}

function onScroll(state: InteractionState): void {
  state.scrollImpulse = INTERACTION.scrollImpulse;
  _lastScrollTime = performance.now();
}

// ---------------------------------------------------------------------------
// Lifecycle — attach / detach
// ---------------------------------------------------------------------------

// Stored references so the exact same function instances can be removed.
type Cleanup = () => void;

/**
 * Attaches all interaction event listeners to the canvas and window.
 * Returns a cleanup function that removes all listeners — call it on unmount.
 */
export function attachInteractionListeners(
  canvas: Canvas,
  state: InteractionState,
): Cleanup {
  const handleMouseMove  = (e: MouseEvent)  => onMouseMove(state, canvas, e);
  const handleMouseLeave = ()               => onMouseLeave(state);
  const handleTouchMove  = (e: TouchEvent)  => onTouchMove(state, canvas, e);
  const handleTouchEnd   = ()               => onTouchEnd(state);
  const handleScroll     = ()               => onScroll(state);

  // canvas has pointer-events:none so mouse events must be tracked on window/document
  window.addEventListener('mousemove',    handleMouseMove,  { passive: true });
  document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
  canvas.addEventListener('touchmove',    handleTouchMove,  { passive: true });
  canvas.addEventListener('touchend',     handleTouchEnd,   { passive: true });
  window.addEventListener('scroll',       handleScroll,     { passive: true });

  return () => {
    window.removeEventListener('mousemove',    handleMouseMove);
    document.removeEventListener('mouseleave', handleMouseLeave);
    canvas.removeEventListener('touchmove',    handleTouchMove);
    canvas.removeEventListener('touchend',     handleTouchEnd);
    window.removeEventListener('scroll',       handleScroll);
  };
}

