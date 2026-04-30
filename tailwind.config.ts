import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          bone: "#F4EFE6",
          warm: "#FAF6EC",
          depth: "#ECE6D8",
          dark: "#1A1A1A",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#6B6760",
          soft: "#4A4842",
          oncream: "#F4EFE6",
        },
        accent: {
          DEFAULT: "#B89968",
        },
        rule: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      fontSize: {
        // Display headlines
        display: [
          "64px",
          { lineHeight: "1.05", letterSpacing: "-0.015em", fontWeight: "400" },
        ],
        "display-mobile": [
          "44px",
          { lineHeight: "1.05", letterSpacing: "-0.015em", fontWeight: "400" },
        ],
        // Section H2
        h2: [
          "44px",
          { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "400" },
        ],
        "h2-mobile": [
          "32px",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        // Card / sub headlines
        h3: [
          "26px",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        // Pull quote (dark section)
        quote: [
          "40px",
          { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "400" },
        ],
        "quote-mobile": [
          "28px",
          { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        // Thesis italic bar
        thesis: [
          "24px",
          {
            lineHeight: "1.4",
            letterSpacing: "-0.005em",
            fontWeight: "400",
          },
        ],
        "thesis-mobile": [
          "20px",
          { lineHeight: "1.4", letterSpacing: "-0.005em", fontWeight: "400" },
        ],
        // Body
        "body-lg": [
          "19px",
          { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" },
        ],
        body: [
          "16px",
          { lineHeight: "1.65", letterSpacing: "0", fontWeight: "400" },
        ],
        "body-sm": [
          "14px",
          { lineHeight: "1.55", letterSpacing: "0", fontWeight: "400" },
        ],
        // Eyebrow / small caps label
        eyebrow: [
          "11px",
          { lineHeight: "1.0", letterSpacing: "0.16em", fontWeight: "500" },
        ],
      },
      maxWidth: {
        container: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
