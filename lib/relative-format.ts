// Shared by the server render and the client hook, so it must NOT carry
// "use client". A function exported from a "use client" module and imported
// into a Server Component arrives as a client-reference proxy rather than the
// function itself, and calling it fails at prerender with "v is not a
// function" -- which is exactly what happened when app/page.tsx imported
// formatRelative straight from lib/relative.ts.

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
