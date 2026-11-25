import type { CSSProperties } from "react";

// Paleta fixa de cores de destaque do perfil do contratante. Os valores são canais RGB
// para usar com opacidade (rgb(var(--cor-perfil) / 0.2)). Cada cor tem versão para tema escuro
// e para tema claro, escolhidas para manter contraste com o texto do cartão.

export const CORES_PERFIL = ["lilas", "azul", "verde", "rosa", "laranja", "grafite"] as const;
export type CorPerfil = (typeof CORES_PERFIL)[number];

type Tom = { rotulo: string; escuro: string; claro: string };

export const TONS: Record<CorPerfil, Tom> = {
  lilas: { rotulo: "Lilás", escuro: "167 139 250", claro: "109 40 217" },
  azul: { rotulo: "Azul", escuro: "96 165 250", claro: "29 78 216" },
  verde: { rotulo: "Verde", escuro: "52 211 153", claro: "4 120 87" },
  rosa: { rotulo: "Rosa", escuro: "244 114 182", claro: "190 24 93" },
  laranja: { rotulo: "Laranja", escuro: "251 146 60", claro: "194 65 12" },
  grafite: { rotulo: "Grafite", escuro: "148 163 184", claro: "51 65 85" },
};

export function corValida(cor: string | null | undefined): CorPerfil {
  return (CORES_PERFIL as readonly string[]).includes(cor ?? "") ? (cor as CorPerfil) : "lilas";
}

/** Define --cor-perfil (escuro) e --cor-perfil-claro; o CSS escolhe conforme o tema. */
export function estiloDaCor(cor: string | null | undefined): CSSProperties {
  const tom = TONS[corValida(cor)];
  return { "--cor-perfil-escuro": tom.escuro, "--cor-perfil-claro": tom.claro } as CSSProperties;
}
