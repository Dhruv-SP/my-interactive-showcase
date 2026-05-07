// useReducedMotion.ts — Live prefers-reduced-motion media query observer.
//
// Returns the current preference and re-renders the consumer whenever
// the OS accessibility setting changes at runtime (e.g. user enables
// "Reduce Motion" in System Preferences while the page is open).
//
// This is the only file allowed to subscribe to this media query;
// everything else reads from RuntimePolicy via policyRef.

import { useState, useEffect } from 'react';

const MQ = '(prefers-reduced-motion: reduce)';

function readMq(): boolean {
  return typeof window !== 'undefined'
    ? window.matchMedia(MQ).matches
    : false;
}

/**
 * Returns `true` when the user has requested reduced motion.
 * Updates reactively — no polling, no remounting required.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(readMq);

  useEffect(() => {
    const mq = window.matchMedia(MQ);

    function handleChange(e: MediaQueryListEvent): void {
      setPrefersReduced(e.matches);
    }

    // Modern browsers support addEventListener on MediaQueryList.
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}
