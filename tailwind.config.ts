import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#F5F0E8",
          elevated: "#EEE8DC",
          dark: "#1A1714",
        },
        fg: {
          primary: "#1A1714",
          secondary: "#5A554C",
          muted: "#8A8378",
          "on-dark": "#F5F0E8",
        },
        accent: {
          DEFAULT: "#C8553D",
          dim: "#A86150",
        },
        rule: "#D8D0C2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        display: [
          "96px",
          { lineHeight: "1.0", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        "display-italic": [
          "96px",
          { lineHeight: "1.0", letterSpacing: "-0.03em", fontWeight: "400" },
        ],
        section: [
          "64px",
          { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "500" },
        ],
        "section-italic": [
          "64px",
          { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "400" },
        ],
        h2: [
          "36px",
          { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "500" },
        ],
        h3: [
          "22px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        "body-lg": [
          "20px",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" },
        ],
        body: [
          "17px",
          { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" },
        ],
        "body-sm": [
          "15px",
          { lineHeight: "1.55", letterSpacing: "0", fontWeight: "400" },
        ],
        eyebrow: [
          "13px",
          { lineHeight: "1.0", letterSpacing: "0.04em", fontWeight: "500" },
        ],
        "display-mobile": [
          "56px",
          { lineHeight: "1.0", letterSpacing: "-0.03em", fontWeight: "500" },
        ],
        "display-italic-mobile": [
          "56px",
          { lineHeight: "1.0", letterSpacing: "-0.03em", fontWeight: "400" },
        ],
        "section-mobile": [
          "40px",
          { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "500" },
        ],
        "section-italic-mobile": [
          "40px",
          { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "400" },
        ],
        "h2-mobile": [
          "28px",
          { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "500" },
        ],
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
