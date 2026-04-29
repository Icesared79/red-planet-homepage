type RuleDividerProps = {
  className?: string;
  tone?: "default" | "on-light";
};

export function RuleDivider({
  className = "",
  tone = "default",
}: RuleDividerProps) {
  const bgClass = tone === "on-light" ? "bg-[#1A1714]" : "bg-rule";
  return <hr className={`h-px w-full border-0 ${bgClass} ${className}`} />;
}
