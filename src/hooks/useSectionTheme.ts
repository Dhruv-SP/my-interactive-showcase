// useSectionTheme.ts — Section visibility detection via IntersectionObserver.
//
// Accepts a map of { sectionId → element ref } and a callback that fires
// whenever the active section changes. Uses a hysteresis threshold (65%
// visibility) to avoid rapid oscillation near section boundaries.
//
// The callback is stable — the engine wires it into transitionToSection().

import { useEffect, useRef, type RefObject } from 'react';
import type { SectionId } from '../background/types';

type SectionRefs = Partial<Record<SectionId, RefObject<HTMLElement | null>>>;

/**
 * Observes a set of section elements and calls `onSectionChange` when
 * the dominant visible section changes.
 *
 * @param sectionRefs    - Record mapping SectionId → DOM element (or null).
 * @param onSectionChange - Callback receiving the new active SectionId.
 */
export function useSectionTheme(
  sectionRefs: SectionRefs,
  onSectionChange: (section: SectionId) => void,
): void {
  // Keep callback stable across renders.
  const callbackRef = useRef(onSectionChange);
  useEffect(() => { callbackRef.current = onSectionChange; }, [onSectionChange]);

  useEffect(() => {
    // Track intersection ratios per section so we can pick the most-visible one.
    const ratios: Partial<Record<SectionId, number>> = {};

    function pickDominant(): SectionId | null {
      let best: SectionId | null = null;
      let bestRatio = 0;
      for (const [id, ratio] of Object.entries(ratios) as [SectionId, number][]) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      }
      return best;
    }

    let currentSection: SectionId | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Find which sectionId owns this element.
          const id = (Object.entries(sectionRefs) as [SectionId, RefObject<HTMLElement | null>][])
            .find(([, ref]) => ref.current === entry.target)?.[0];
          if (!id) continue;
          ratios[id] = entry.intersectionRatio;
        }

        const dominant = pickDominant();
        if (dominant && dominant !== currentSection) {
          currentSection = dominant;
          callbackRef.current(dominant);
        }
      },
      {
        // Fire at every 5% increment so we get smooth ratio updates.
        threshold: Array.from({ length: 21 }, (_, i) => i * 0.05),
      },
    );

    // Observe all provided elements.
    for (const ref of Object.values(sectionRefs)) {
      if (ref?.current) observer.observe(ref.current);
    }

    return () => observer.disconnect();
  // Intentionally omitted sectionRefs from deps — elements are stable DOM refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

