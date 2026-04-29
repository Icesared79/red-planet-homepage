import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span
      className={`inline-flex items-center text-eyebrow font-mono uppercase text-fg-muted ${className}`}
    >
      <span
        aria-hidden="true"
        className="block h-px w-[1ch] bg-accent"
      />
      <span className="ml-3">{children}</span>
    </span>
  );
}
