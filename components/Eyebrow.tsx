import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
  tone?: "ink" | "muted" | "oncream";
};

export function Eyebrow({
  children,
  className = "",
  as: Tag = "span",
  tone = "muted",
}: EyebrowProps) {
  const toneClass =
    tone === "muted"
      ? "text-ink-muted"
      : tone === "oncream"
        ? "text-ink-oncream/70"
        : "text-ink";
  return (
    <Tag
      className={`font-sans text-eyebrow uppercase ${toneClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
