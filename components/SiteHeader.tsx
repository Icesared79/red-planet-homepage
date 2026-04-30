"use client";

import { useEffect, useState } from "react";
import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-16 md:h-20 bg-bg-base">
      <Container className="flex h-full items-center justify-between">
        <a href="#top" aria-label="Red Planet Data home">
          <Wordmark />
        </a>
        <a
          href="#apply"
          className="font-sans text-[15px] font-medium text-fg-primary transition-colors hover:text-accent"
        >
          Apply for Access<span className="ml-1.5">&rarr;</span>
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
