type SectionLabelProps = {
  title: string;
  num: string;
  variant?: "light" | "dark";
};

export function SectionLabel({ title, num, variant = "light" }: SectionLabelProps) {
  return (
    <div className={`section-label${variant === "dark" ? " section-label-on-dark" : ""}`}>
      <div className="section-label-title">{title}</div>
      <div className="section-label-num">
        {num}
        <span className="dot">.</span>
      </div>
    </div>
  );
}
