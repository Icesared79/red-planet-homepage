type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className = "" }: WordmarkProps) {
  return (
    <span
      className={`font-serif text-[20px] tracking-[-0.01em] text-ink ${className}`}
    >
      Red Planet<span className="text-accent">.</span>
    </span>
  );
}
