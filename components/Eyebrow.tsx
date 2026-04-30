import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-block text-eyebrow font-sans uppercase text-fg-muted ${className}`}
    >
      {children}
    </span>
  );
}
