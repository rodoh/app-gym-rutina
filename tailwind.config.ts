import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080a0f",
        panel: "#11151d",
        panelSoft: "#171d27",
        line: "#28313f",
        accent: "#e14444",
        accentSoft: "#f47759",
        good: "#35d399"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(225, 68, 68, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
