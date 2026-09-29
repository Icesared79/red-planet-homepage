"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * The design's motion spec describes each animation as starting "on mount",
 * which is right in a prototype where one screen is the whole page. On the real
 * page every section mounts at once, so the count-up, the chart draw and the
 * 127-bar run strip all finish while they are still far below the fold and
 * nobody ever sees them play. Starting them when their section scrolls into
 * view is what "on mount" means here.
 *
 * `once: false` re-arms on every entry, for the animations that read as a
 * process and are worth watching again.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { once = true, rootMargin = "0px 0px -15% 0px" } = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Without IntersectionObserver, show everything running rather than frozen.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.15, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin]);

  return inView;
}
