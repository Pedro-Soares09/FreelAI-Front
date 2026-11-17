export type Tema = "dark" | "light";

export const TEMA_PADRAO: Tema = "dark";
export const CHAVE_TEMA = "freelai-tema";

/** Valores de referência dos temas. As cores reais vivem em globals.css (variáveis CSS). */
export const themeTokens = {
  dark: { primary: "#a78bfa", accent: "#22d3ee", bg: "#0a0a14" },
  light: { primary: "#6d28d9", accent: "#0891b2", bg: "#f7f5ff" },
} as const;
