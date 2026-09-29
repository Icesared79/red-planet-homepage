"use client";

import { useEffect, useState } from "react";

/** The design's static fallback when there is no live timestamp. */
export const RELATIVE_FALLBACK = "9 hours ago";

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return RELATIVE_FALLBACK;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const min = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "hour" : "hours"} ago`;
  return `${Math.floor(hr / 24)} days ago`;
}

/**
 * "N hours ago" depends on the clock, so the server render and the hydrating
 * client render would disagree if it were computed in both. The first render
 * always shows the fallback; the real value lands after mount.
 */
export function useRelative(iso: string | null | undefined): string {
  const [label, setLabel] = useState(RELATIVE_FALLBACK);
  useEffect(() => {
    setLabel(formatRelative(iso));
  }, [iso]);
  return label;
}
