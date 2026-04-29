import { Eyebrow } from "./Eyebrow";

type Swatch = {
  name: string;
  hex: string;
  bg: string;
  fg: string;
  borderClass?: string;
};

const backgrounds: Swatch[] = [
  { name: "bg-base", hex: "#0E0C0A", bg: "#0E0C0A", fg: "#F2EEE6", borderClass: "border border-rule" },
  { name: "bg-base-alt", hex: "#0F0E0C", bg: "#0F0E0C", fg: "#F2EEE6", borderClass: "border border-rule" },
  { name: "bg-elevated", hex: "#161310", bg: "#161310", fg: "#F2EEE6" },
  { name: "bg-light", hex: "#F5F2EC", bg: "#F5F2EC", fg: "#1A1714" },
];

const foregrounds: Swatch[] = [
  { name: "fg-primary", hex: "#F2EEE6", bg: "#0E0C0A", fg: "#F2EEE6" },
  { name: "fg-secondary", hex: "#9C958A", bg: "#0E0C0A", fg: "#9C958A" },
  { name: "fg-muted", hex: "#6B655C", bg: "#0E0C0A", fg: "#6B655C" },
  { name: "fg-on-light", hex: "#1A1714", bg: "#F5F2EC", fg: "#1A1714" },
];

const accents: Swatch[] = [
  { name: "accent (target)", hex: "#C8553D", bg: "#C8553D", fg: "#F2EEE6" },
  { name: "accent alt 1", hex: "#B84A33", bg: "#B84A33", fg: "#F2EEE6" },
  { name: "accent alt 2", hex: "#D26146", bg: "#D26146", fg: "#F2EEE6" },
  { name: "accent-dim", hex: "#A86150", bg: "#A86150", fg: "#F2EEE6" },
];

const rule: Swatch = {
  name: "rule",
  hex: "#2A2520",
  bg: "#2A2520",
  fg: "#F2EEE6",
};

function Tile({ swatch }: { swatch: Swatch }) {
  return (
    <div
      className={`flex h-[120px] w-[200px] flex-col justify-between p-3 font-mono text-mono-sm ${swatch.borderClass ?? ""}`}
      style={{ backgroundColor: swatch.bg, color: swatch.fg }}
    >
      <span className="font-medium">{swatch.name}</span>
      <span className="text-fg-secondary" style={{ color: swatch.fg, opacity: 0.7 }}>
        {swatch.hex}
      </span>
    </div>
  );
}

const sample = "The intelligence engine for the built environment.";

const typeRows: Array<{ token: string; className: string }> = [
  { token: "text-display", className: "text-display max-md:text-display-mobile font-sans" },
  { token: "text-display-sm", className: "text-display-sm max-md:text-display-sm-mobile font-sans" },
  { token: "text-h2", className: "text-h2 font-sans" },
  { token: "text-h3", className: "text-h3 font-sans" },
  { token: "text-body", className: "text-body font-sans" },
  { token: "text-body-sm", className: "text-body-sm font-sans" },
  { token: "text-eyebrow", className: "text-eyebrow font-mono uppercase" },
  { token: "text-mono-sm", className: "text-mono-sm font-mono" },
];

export function SwatchGrid() {
  return (
    <div className="flex flex-col gap-16">
      <section>
        <Eyebrow>Backgrounds</Eyebrow>
        <h2 className="mt-3 mb-6 text-h2">Background tokens</h2>
        <div className="flex flex-wrap gap-4">
          {backgrounds.map((s) => (
            <Tile key={s.name} swatch={s} />
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Foregrounds (on bg-base)</Eyebrow>
        <h2 className="mt-3 mb-6 text-h2">Foreground tokens</h2>
        <div className="flex flex-wrap gap-4">
          {foregrounds.map((s) => (
            <Tile key={s.name} swatch={s} />
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Accent candidates (pick one)</Eyebrow>
        <h2 className="mt-3 mb-6 text-h2">Terracotta candidates</h2>
        <div className="flex flex-wrap gap-4">
          {accents.map((s) => (
            <Tile key={s.name} swatch={s} />
          ))}
        </div>
      </section>

      <section>
        <Eyebrow>Rule color</Eyebrow>
        <h2 className="mt-3 mb-6 text-h2">Rule / divider</h2>
        <div className="flex flex-wrap gap-4">
          <Tile swatch={rule} />
        </div>
      </section>

      <section>
        <Eyebrow>Type scale</Eyebrow>
        <h2 className="mt-3 mb-6 text-h2">Type tokens</h2>
        <div className="flex flex-col gap-8">
          {typeRows.map((row) => (
            <div key={row.token} className="flex flex-col gap-2">
              <span className="font-mono text-eyebrow uppercase text-fg-muted">
                {row.token}
              </span>
              <span className={`${row.className} text-fg-primary`}>
                {row.token === "text-eyebrow" ? sample.toUpperCase() : sample}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
