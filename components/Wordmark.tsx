type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={`font-sans tracking-[0.02em] text-[18px] font-medium ${className}`}
    >
      <span className="text-accent">Red</span>
      <span className="text-fg-primary"> Planet</span>
    </span>
  );
}
