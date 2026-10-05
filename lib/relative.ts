"use client";

import { useEffect, useState } from "react";
import { formatRelative, RELATIVE_FALLBACK } from "./relative-format";

// The formatter itself lives in lib/relative-format.ts because the server
// render needs it too -- see the note at the top of that file.
export { formatRelative, RELATIVE_FALLBACK };

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
