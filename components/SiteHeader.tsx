"use client";

import { useEffect, useState } from "react";
import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

const NAV_LINKS = [
  { label: "The engine", href: "#engine" },
  { label: "What we see", href: "#what-we-see" },
  { label: "Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-16 md:h-20 transition-colors duration-200 ${
        scrolled ? "bg-bg-bone/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <Container className="flex h-full items-center justify-between">
        <a href="#top" aria-label="Red Planet Data — home">
          <Wordmark />
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans text-[14px] text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 font-sans text-[13px] font-medium text-ink-oncream transition-opacity hover:opacity-90"
        >
          Talk to us
        </a>
      </Container>
      <div
        aria-hidden="true"
        className={`absolute bottom-0 left-0 right-0 h-px bg-rule transition-opacity duration-200 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />
    </header>
  );
}
