import type { Config } from "tailwindcss";

const token = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        borda: token("borda"),
        fg: token("fg"),
        muted: token("muted"),
        primary: token("primary"),
        "primary-fg": token("primary-fg"),
        accent: token("accent"),
        success: token("success"),
        warning: token("warning"),
        danger: token("danger"),
        info: token("info"),
      },
      borderRadius: { card: "0.875rem" },
      boxShadow: {
        neon: "0 0 0 1px rgb(var(--primary) / 0.5), 0 0 18px rgb(var(--primary) / 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
