"use client";

import { useSessao } from "@/lib/session";
import { itensDeNavegacao } from "@/lib/rotas";
import { NavLink } from "./nav-link";

export function MobileNav() {
  const { usuario } = useSessao();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-borda bg-surface px-2 py-2 md:hidden"
      aria-label="Navegação móvel"
    >
      {itensDeNavegacao(usuario).map((i) => (
        <NavLink
          key={i.href}
          href={i.href}
          className="rounded-md px-2 py-2 text-xs font-medium text-muted"
          ativoClasse="text-primary"
        >
          {i.rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
