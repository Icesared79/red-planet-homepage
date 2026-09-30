"use client";

import { useCallback } from "react";

/**
 * The theme is resolved before first paint by the inline script in
 * app/layout.tsx: a stored choice wins, otherwise the browser's own
 * colour-scheme preference. This only flips it and remembers the result.
 *
 * Both marks are always rendered and CSS shows one, so the button paints
 * correctly on the server and cannot mismatch during hydration.
 */
export function ThemeToggle() {
  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    try {
      localStorage.setItem("rp-theme", next);
    } catch {
      // Private mode or blocked storage: the choice just does not persist.
    }
  }, []);

  return (
    <button
      type="button"
      className="rph-theme"
      onClick={toggle}
      aria-label="Switch between the light and dark theme"
      title="Switch between the light and dark theme"
    >
      <svg
        className="rph-theme__moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
      <svg
        className="rph-theme__sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
