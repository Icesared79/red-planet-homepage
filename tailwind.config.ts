import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0E0C0A",
          elevated: "#161310",
          light: "#F5F2EC",
        },
        fg: {
          primary: "#F2EEE6",
          secondary: "#9C958A",
          muted: "#6B655C",
          "on-light": "#1A1714",
        },
        accent: {
          DEFAULT: "#C8553D",
          alt1: "#B84A33",
          alt2: "#D26146",
          dim: "#A86150",
        },
        rule: "#2A2520",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        display: [
          "72px",
          { lineHeight: "1.02", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "display-sm": [
          "48px",
          { lineHeight: "1.05", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        h2: [
          "32px",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        h3: [
          "20px",
          { lineHeight: "1.3", letterSpacing: "-0.005em", fontWeight: "600" },
        ],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        eyebrow: [
          "12px",
          { lineHeight: "1.0", letterSpacing: "0.08em", fontWeight: "500" },
        ],
        "mono-sm": ["13px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "400" }],
        "display-mobile": [
          "44px",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "display-sm-mobile": [
          "32px",
          { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
      },
      maxWidth: {
        container: "1280px",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
