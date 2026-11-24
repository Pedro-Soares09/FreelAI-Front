"use client";

import { useSessao } from "@/lib/session";
import { itensDeNavegacao } from "@/lib/rotas";
import { NavLink } from "./nav-link";

export function Sidebar() {
  const { usuario } = useSessao();
  return (
    <aside
      className="hidden w-60 shrink-0 border-r border-borda bg-surface p-4 md:block"
      aria-label="Navegação principal"
    >
      <nav className="flex flex-col gap-1">
        {itensDeNavegacao(usuario).map((i) => (
          <NavLink
            key={i.href}
            href={i.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-fg"
            ativoClasse="bg-primary/15 text-primary"
          >
            {i.rotulo}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
