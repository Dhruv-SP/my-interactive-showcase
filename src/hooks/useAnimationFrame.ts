// useAnimationFrame.ts — requestAnimationFrame loop with tab-visibility pause.
//
// Accepts a callback that receives (now: DOMHighResTimeStamp).
// The loop automatically pauses when the document is hidden and resumes
// when it becomes visible again — saves battery and GPU on background tabs.
//
// FPS throttling: when targetFps < 60 an elapsed-time gate skips frames
// so the callback runs at approximately the requested rate without busy-
// spinning at the full display refresh rate.

import { useEffect, useRef } from 'react';

/**
 * Runs `callback` in a requestAnimationFrame loop.
 *
 * @param callback  - Called each active frame with the rAF timestamp.
 * @param targetFps - Desired frame rate. 0 or ≥ 60 means uncapped (every frame).
 * @param active    - When false the loop is not started / is stopped.
 */
export function useAnimationFrame(
  callback: (now: number) => void,
  targetFps: number,
  active = true,
): void {
  // Store callback in a ref so we never need to restart the loop when it changes.
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; }, [callback]);

  useEffect(() => {
    if (!active) return;

    const minInterval = targetFps > 0 && targetFps < 60
      ? 1000 / targetFps
      : 0;

    let rafHandle  = 0;
    let lastTime   = 0;
    let isPaused   = false;

    function tick(now: number): void {
      if (isPaused) return;

      rafHandle = requestAnimationFrame(tick);

      // FPS throttle gate.
      if (minInterval > 0 && now - lastTime < minInterval) return;
      lastTime = now;

      callbackRef.current(now);
    }

    function onVisibilityChange(): void {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(rafHandle);
      } else {
        isPaused = false;
        lastTime = 0; // reset so the first resumed frame isn't throttled
        rafHandle = requestAnimationFrame(tick);
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    rafHandle = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafHandle);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [active, targetFps]);
}

