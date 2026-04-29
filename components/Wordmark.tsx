type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={`font-mono uppercase tracking-[0.08em] text-[14px] font-medium ${className}`}
    >
      <span className="text-accent">RED</span>
      <span className="text-fg-primary"> PLANET</span>
    </span>
  );
}
