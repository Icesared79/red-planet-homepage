"use client";

import { useEffect, useState } from "react";

/**
 * The design drives section 03 (the parcel table) and section 04 (the stage
 * loop) off one shared 2.8s tick, so the two stay in step. A per-component
 * interval would drift, so the interval lives here once and components
 * subscribe to it.
 */
const PERIOD_MS = 2800;

let count = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(n: number) => void>();

function subscribe(fn: (n: number) => void): () => void {
  listeners.add(fn);
  if (timer === null) {
    timer = setInterval(() => {
      count += 1;
      listeners.forEach((l) => l(count));
    }, PERIOD_MS);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * True when this page load should show every animation in its final state.
 *
 * Normally that is just the browser's own preference. A reviewer can override
 * it for one page load with `?motion=1` (force motion on) or `?motion=0`
 * (force it off), which the inline script in app/layout.tsx turns into
 * `data-motion` on <html> before first paint. That exists because a browser in
 * a Remote Desktop session reports `reduce` whatever the host is set to, which
 * makes an animated page look broken. With no query parameter the attribute is
 * absent and this behaves exactly as it did before.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const override = document.documentElement.dataset.motion;
  if (override === "force") return false;
  if (override === "reduce") return true;
  if (!window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Returns the shared tick counter. Starts at 0 on the server and on the first
 * client render so hydration matches. With reduced motion the counter never
 * advances and callers show their final state instead.
 */
export function useSharedTick(): { tick: number; motion: boolean } {
  const [tick, setTick] = useState(0);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMotion(false);
      return;
    }
    setTick(count);
    return subscribe(setTick);
  }, []);

  return { tick, motion };
}
