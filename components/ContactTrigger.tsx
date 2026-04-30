"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function ContactTrigger({ children, className = "" }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("rp:contact:open"));
        }
      }}
    >
      {children}
    </button>
  );
}
