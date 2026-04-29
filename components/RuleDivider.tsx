type RuleDividerProps = {
  className?: string;
};

export function RuleDivider({ className = "" }: RuleDividerProps) {
  return <hr className={`h-px w-full border-0 bg-rule ${className}`} />;
}
