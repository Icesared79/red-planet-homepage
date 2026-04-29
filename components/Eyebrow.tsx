import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "on-light";
};

export function Eyebrow({
  children,
  className = "",
  tone = "default",
}: EyebrowProps) {
  const colorClass =
    tone === "on-light" ? "text-fg-secondary-on-light" : "text-fg-muted";
  return (
    <span
      className={`inline-flex items-center text-eyebrow font-mono uppercase ${colorClass} ${className}`}
    >
      <span aria-hidden="true" className="block h-px w-[1ch] bg-accent" />
      <span className="ml-3">{children}</span>
    </span>
  );
}
