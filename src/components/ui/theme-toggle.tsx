"use client";

import { useEffect, useState } from "react";
import { CHAVE_TEMA, TEMA_PADRAO, type Tema } from "@/theme/tokens";
import { IconMoon, IconSun } from "./icons";

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>(TEMA_PADRAO);

  useEffect(() => {
    setTema(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function alternar() {
    const novo: Tema = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = novo;
    try {
      localStorage.setItem(CHAVE_TEMA, novo);
    } catch {
      /* armazenamento indisponível */
    }
    setTema(novo);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className="rounded-lg border border-borda p-2 text-muted hover:text-fg"
    >
      {tema === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
