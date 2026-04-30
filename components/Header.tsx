"use client";

import { useEffect, useRef } from "react";

export function Header() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const lightSelector = ".thesis, .possibilities, .manifesto";
    let lightSections: HTMLElement[] = [];

    const collect = () => {
      lightSections = Array.from(
        document.querySelectorAll<HTMLElement>(lightSelector)
      );
    };

    const update = () => {
      const headerBottom = 80;
      const onLight = lightSections.some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top < headerBottom && rect.bottom > headerBottom;
      });
      header.classList.toggle("on-light", onLight);
    };

    collect();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header id="site-header" ref={headerRef}>
      <div className="header-inner">
        <a href="#" className="wordmark">
          <span className="wordmark-dot" />
          Red Planet
        </a>
        <nav>
          <a href="#thesis">About</a>
          <a href="#possibilities">Use cases</a>
          <a href="#foundation">The engine</a>
          <button
            type="button"
            className="nav-cta"
            onClick={() => window.dispatchEvent(new Event("rp:contact:open"))}
          >
            Get in touch
          </button>
        </nav>
      </div>
    </header>
  );
}
