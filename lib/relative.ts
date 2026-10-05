"use client";

import { useEffect, useState } from "react";

/**
 * Shown only when there is genuinely no timestamp to describe. This used to be
 * the string "9 hours ago", which meant the server-rendered HTML asserted a
 * freshness nobody had measured -- and kept asserting it while the data behind
 * the card sat still. An honest placeholder cannot do that.
 */
export const RELATIVE_FALLBACK = "just now";

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return RELATIVE_FALLBACK;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const min = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hr / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

/**
 * "N hours ago" depends on the clock, so a server render and the hydrating
 * client render can disagree by a minute. The caller passes the label it
 * already computed on the server as `initial`, so the first paint is the real
 * value rather than a placeholder; the client refines it after mount and the
 * span carries suppressHydrationWarning for the one-minute seam.
 */
export function useRelative(
  iso: string | null | undefined,
  initial?: string
): string {
  const [label, setLabel] = useState(initial ?? RELATIVE_FALLBACK);
  useEffect(() => {
    setLabel(formatRelative(iso));
    // Keep the label honest while the tab stays open: the page re-renders on a
    // 5-minute timer, but a tab left open overnight would otherwise still read
    // "3 hours ago" in the morning.
    const id = setInterval(() => setLabel(formatRelative(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);
  return label;
}
